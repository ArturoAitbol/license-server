import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Constants } from '../helpers/constants';
import { Utility } from '../helpers/utils';
import { CustomerLicense } from '../model/customer-license';
import { License } from '../model/license.model';
import { CustomerService } from '../services/customer.service';
import { DialogService } from '../services/dialog.service';
import { LicenseService } from '../services/license.service';
import { SnackBarService } from '../services/snack-bar.service';
import { SubAccountService } from '../services/sub-account.service';
import { AddCustomerAccountModalComponent } from '../modules/dashboard-customer/add-customer-account-modal/add-customer-account-modal.component';
import { AddSubaccountModalComponent } from '../modules/dashboard-customer/add-subaccount-modal/add-subaccount-modal.component';
import { ModifyCustomerAccountComponent } from '../modules/dashboard-customer/modify-customer-account/modify-customer-account.component';
import { AdminEmailsComponent } from "../modules/dashboard-customer/admin-emails-modal/admin-emails.component";
import { SubaccountAdminEmailsComponent } from "../modules/dashboard-customer/subaccount-admin-emails-modal/subaccount-admin-emails.component";
import { MsalService } from '@azure/msal-angular';
import { SubAccount } from '../model/subaccount.model';
import { FormBuilder } from "@angular/forms";
import { debounceTime, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs/internal/Subject";
import { tekVizionServices } from '../helpers/tekvizion-services';
import { FeatureToggleService } from '../services/feature-toggle.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-dashboard',
    templateUrl: './customer-dashboard.component.html',
    styleUrls: ['./customer-dashboard.component.css']
})

export class CustomerDashboardComponent implements OnInit, OnDestroy {
    tableMaxHeight: number;
    displayedColumns: any[] = [];
    data: CustomerLicense[] = [];
    customerList: any = [];
    filteredCustomerList: any = [];
    customerFilter: any;
    typeFilter: any;
    statusFilter: any;
    currentCustomer: any;
    selectedSubaccount: any
    private customerSubaccountDetails: any;
    // flag
    isLoadingResults = true;
    isRequestCompleted = false;
    readonly VIEW_LICENSES: string = 'View TekVizion 360 Subscriptions';
    readonly VIEW_CONSUMPTION: string = 'View tekToken Consumption';
    readonly VIEW_PROJECTS: string = 'View Projects List';
    readonly VIEW_ADMIN_EMAILS: string = 'View Customer Admin Emails';
    readonly VIEW_SUBACC_ADMIN_EMAILS: string = 'View Subaccount Admin Emails';
    readonly VIEW_CTAAS_DASHBOARD: string = 'View UCaaS Continuous Testing';
    readonly MODIFY_ACCOUNT: string = 'Edit';
    readonly DELETE_ACCOUNT: string = 'Delete';
    readonly CUSTOMER_FILTER: string = 'customer';
    readonly TYPE_FILTER: string = 'type';
    readonly STATUS_FILTER: string = 'status';
    readonly NONE_TYPE: string = 'emptyType';
    readonly NONE_STATUS: string = 'emptyStatus';

    readonly options = {
        VIEW_LICENSES: this.VIEW_LICENSES,
        VIEW_CONSUMPTION: this.VIEW_CONSUMPTION,
        VIEW_PROJECTS: this.VIEW_PROJECTS,
        VIEW_ADMIN_EMAILS: this.VIEW_ADMIN_EMAILS,
        VIEW_SUBACC_ADMIN_EMAILS: this.VIEW_SUBACC_ADMIN_EMAILS,
        VIEW_CTAAS_DASHBOARD: this.VIEW_CTAAS_DASHBOARD,
        MODIFY_ACCOUNT: this.MODIFY_ACCOUNT,
        DELETE_ACCOUNT: this.DELETE_ACCOUNT
    }

    readonly subaccountTypes = ['MSP', 'Reseller'];
    readonly subscriptionStatus = ['Active', 'Inactive', 'Expired'];

    actionMenuOptions: string[] = [];

    filterForm = this.fb.group({
        customerFilterControl: [''],
        typeFilterControl: [''],
        subStatusFilterControl: ['']
    });

    private unsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private customerService: CustomerService,
        private subaccountService: SubAccountService,
        private licenseService: LicenseService,
        private dialogService: DialogService,
        public dialog: MatDialog,
        private snackBarService: SnackBarService,
        private router: Router,
        private msalService: MsalService,
        private fb: FormBuilder,
        private featureToggleService: FeatureToggleService
    ) { }

    @HostListener('window:resize')
    sizeChange() {
        this.calculateTableHeight();
    }
    
    private getActionMenuOptions() {
        const roles = this.msalService.instance.getActiveAccount().idTokenClaims['roles'];
        this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "customerOptions");
    }

    private calculateTableHeight() {
        this.tableMaxHeight = window.innerHeight // doc height
            - (window.outerHeight * 0.01 * 2) // - main-container margin
            - 60 // - route-content margin
            - 20 // - dashboard-content padding
            - 30 // - table padding
            - 32 // - title height
            - (window.outerHeight * 0.05 * 2); // - table-section margin
    }

    ngOnInit(): void {
        this.filterForm.disable();
        if(this.customerService.getSelectedCustomer) 
            this.customerService.setSelectedCustomer('');
        this.getFiltersFromSesisonStorage();
        this.currentCustomer = this.customerService.getSelectedCustomer();
        this.calculateTableHeight();
        this.initColumns();
        this.fetchDataToDisplay();
        localStorage.removeItem(Constants.PROJECT);
        this.customerSubaccountDetails = this.subaccountService.getSelectedSubAccount();
        this.getActionMenuOptions();
        this.filterForm.valueChanges.pipe(
            debounceTime(300),
            takeUntil(this.unsubscribe)).subscribe(value => {
                const filters = [];
            if (value.customerFilterControl != null) {
                filters.push(customer => customer.name.toLowerCase().includes(value.customerFilterControl.toLowerCase()) || customer.subaccountName?.toLowerCase().includes(value.customerFilterControl.toLowerCase()));
                this.setCustomerFilters("customerFilter",value.customerFilterControl);
            }
            if (value.typeFilterControl != '' && value.typeFilterControl != undefined) {
                filters.push(customer => customer.customerType === value.typeFilterControl);
                this.setCustomerFilters("typeFilter", value.typeFilterControl);
            }
            if (value.subStatusFilterControl != '' && value.subStatusFilterControl != undefined) {
                filters.push(customer => customer.status && customer.status === value.subStatusFilterControl);
                this.setCustomerFilters("statusFilter", value.subStatusFilterControl);
            } 
            this.isLoadingResults = true;
            this.filteredCustomerList = this.customerList.filter(customer => filters.every(filter => filter(customer)));
            this.isLoadingResults = false;
        })
    }
   
    setCustomerFilters(key:string, filter:any){
        sessionStorage.setItem(key,filter);
    }

    getFiltersFromSesisonStorage() {
        this.customerFilter = sessionStorage.getItem("customerFilter");
        this.typeFilter = sessionStorage.getItem("typeFilter");
        this.statusFilter = sessionStorage.getItem("statusFilter");
    }
    /**
     * initialize the columns settings
     */
    initColumns(): void {
        this.displayedColumns = [
            { name: 'Customer', dataKey: 'name', position: 'left', isSortable: true },
            { name: 'Subaccount', dataKey: 'subaccountName', position: 'left', isSortable: true, isClickable: true },
            { name: 'Type', dataKey: 'customerType', position: 'left', isSortable: true },
            { name: 'Subscription Status', dataKey: 'status', position: 'left', isSortable: true, canHighlighted: true, isClickable: true }
        ];
    }

    /**
     * fetch data to display
     */
    private fetchDataToDisplay(): void {
        this.isRequestCompleted = false;
        this.isLoadingResults = true;
        // here we are fetching all the data from the server
        forkJoin([
            this.customerService.getCustomerList(),
            this.subaccountService.getSubAccountList(),
            this.licenseService.getLicenseList()
        ]).subscribe(res => {
            this.isRequestCompleted = true;
            const newDataObject: any = res.reduce((current, next) => {
                return { ...current, ...next };
            }, {});
            this.customerList = newDataObject['customers'];
            this.assignSubAccountData(newDataObject['subaccounts'], newDataObject['licenses']);
            this.customerList.sort((a: any, b: any) => a.name.localeCompare(b.name));
            this.filteredCustomerList = this.customerList;
            this.filterForm.enable();
            this.isLoadingResults = false;
        }, err => {
            console.debug('error', err);
            this.isLoadingResults = false;
            this.isRequestCompleted = true;
        });
    }

    assignSubAccountData(subaccountsList: SubAccount[], licences: License[]): void {
        const fullCustomerList = [];
        this.customerList.forEach(customer => {
            const subaccounts = subaccountsList.filter(s => s.customerId === customer.id);
            if (subaccounts.length > 0) {
                subaccounts.forEach(subaccount => {
                    const customerWithDetails = { ...customer };
                    customerWithDetails.subaccountName = subaccount.name;
                    customerWithDetails.subaccountId = subaccount.id;
                    const subaccountLicenses = licences.filter((l: License) => (l.subaccountId === subaccount.id));
                    customerWithDetails.status = this.getCustomerLicenseStatus(subaccountLicenses);
                    customerWithDetails.services = (subaccount.services) ? subaccount.services : null;
                    fullCustomerList.push(customerWithDetails);
                })
            } else {
                fullCustomerList.push({ ...customer });
            }
        });
        this.customerList = fullCustomerList;
    }

    getCustomerLicenseStatus(subaccountLicenses: License[]): string {
        if (subaccountLicenses.length > 0) {
            const licenseDetails = subaccountLicenses.find((l: License) => (l.status === 'Active'));
            return licenseDetails ? licenseDetails.status : 'Expired';
        } else {
            return 'Inactive';
        }
    }

    getColor(value: string) {
        return Utility.getColorCode(value);
    }

    /**
     * on click delete account
     * @param id: string
     */
    onDeleteAccount(selectedItemData: any): void {
        this.openConfirmCancelDialog(selectedItemData);
    }

    /**
     * on click add account customer
     */
    addCustomerAccount(): void {
        this.openDialog('add-customer');
    }

    /**
     * on click add account customer
     */
    addSubaccount(): void {
        this.openDialog('add-subaccount');
    }

    /**
     * open dialog
     * @param type: string
     * @param selectedItemData: any
     */
    openDialog(type: string, selectedItemData?: any): void {
        let dialogRef;
        switch (type) {
            case 'add-customer':
                dialogRef = this.dialog.open(AddCustomerAccountModalComponent, {
                    width: '400px',
                    disableClose: true
                });
                break;
            case 'add-subaccount':
                dialogRef = this.dialog.open(AddSubaccountModalComponent, {
                    width: '400px',
                    disableClose: true
                });
                break;
            case 'modify':
            case this.MODIFY_ACCOUNT:
                dialogRef = this.dialog.open(ModifyCustomerAccountComponent, {
                    width: 'auto',
                    data: selectedItemData,
                    disableClose: true
                });
                break;
            case this.VIEW_ADMIN_EMAILS:
                dialogRef = this.dialog.open(AdminEmailsComponent, {
                    width: 'auto',
                    data: selectedItemData,
                    disableClose: true
                });
                break;
            case this.VIEW_SUBACC_ADMIN_EMAILS:
                dialogRef = this.dialog.open(SubaccountAdminEmailsComponent, {
                    width: 'auto',
                    data: selectedItemData,
                    disableClose: true
                });
                break;
        }
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                console.debug(`${type} dialog closed: ${res}`);
                this.fetchDataToDisplay();
            }
        });
    }

    /**
     * open confirm cancel dialog
     */
    openConfirmCancelDialog(customer?: any) {
        let messageDetail = 'customer "' + customer.name + '"';
        if (customer.testCustomer)
            messageDetail = ' subaccount "' + customer.subaccountName + '" / ' + messageDetail;
        this.dialogService
            .deleteCustomerDialog({
                title: 'Confirm Action',
                message: 'Are you sure you want to delete the ' + messageDetail + '?',
                confirmCaption: 'Delete Subaccount',
                deleteAllDataCaption: 'Delete Customer',
                cancelCaption: 'Cancel',
                canDeleteSubaccount: customer.testCustomer
            })
            .subscribe((result) => {
                if (result.confirm) {
                    console.debug('The user confirmed the action: ', customer);
                    const { subaccountId, id } = customer;
                    if (subaccountId && !result.deleteAllData) {
                        this.subaccountService.deleteSubAccount(subaccountId).subscribe((res: any) => {
                            if (!res?.error) {
                                this.snackBarService.openSnackBar('Subaccount deleted successfully!', '');
                                this.fetchDataToDisplay();
                            } else {
                                this.snackBarService.openSnackBar('Error Subaccount could not be deleted !', '');
                            }
                        });
                    } else {
                        this.customerService.deleteCustomer(id).subscribe((res: any) => {
                            if (!res?.error) {
                                this.snackBarService.openSnackBar('Customer deleted successfully!', '');
                                this.fetchDataToDisplay();
                            } else {
                                this.snackBarService.openSnackBar('Error customer could not be deleted !', '');
                            }
                        });
                    }
                }
            });
    }

    /**
     *
     * @param row: object
     */
    openLicenseDetails(row: any): void {
        this.customerService.setSelectedCustomer(row);
        sessionStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(row));
        this.router.navigate(['/customer/licenses'], {queryParams:{subaccountId: row.subaccountId}});
    }

    /**
     *
     * @param row: object
     */
    openLicenseConsumption(row: any): void {
        this.customerService.setSelectedCustomer(row);
        sessionStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(row));
        this.router.navigate(['/customer/consumption'], {queryParams:{subaccountId: row.subaccountId}});
    }

    /**
     * open project detail
     * @param row: object
     */
    openProjectDetails(row: any): void {
        this.customerService.setSelectedCustomer(row);
        sessionStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(row));
        this.router.navigate(['/customer/projects'], {queryParams:{subaccountId: row.subaccountId}});
    }

    /**
     * sort table
     * @param sortParameters: Sort
     * @returns customerList
     */
    sortData(sortParameters: Sort): any[] {
        const keyName = sortParameters.active;
        if (sortParameters.direction === 'asc') {
            this.customerList = this.customerList.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
        } else if (sortParameters.direction === 'desc') {
            this.customerList = this.customerList.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
        } else {
            return this.customerList = this.customerList;
        }
    }

    /**
     * action row click event
     * @param object: { selectedRow: any, selectedOption: string, selectedIndex: string }
     */
    rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
        if (!object.selectedRow.subaccountId) {
            this.snackBarService.openSnackBar('Subaccount is missing, create one to access this view', '');
        } else {
            this.selectedSubaccount = {
                id: object.selectedRow.subaccountId,
                name: object.selectedRow.subaccountName,
                customerId: object.selectedRow.id,
                customerName: object.selectedRow.name,
                services: object.selectedRow.services
            };
            this.subaccountService.setSelectedSubAccount(this.selectedSubaccount);
            switch (object.selectedOption) {
                case this.VIEW_LICENSES:
                    this.openLicenseDetails(object.selectedRow);
                    break;
                case this.VIEW_CONSUMPTION:
                    this.openLicenseConsumption(object.selectedRow);
                    break;
                case this.VIEW_PROJECTS:
                    this.openProjectDetails(object.selectedRow);
                    break;
                case this.VIEW_ADMIN_EMAILS:
                    this.openDialog(object.selectedOption, object.selectedRow);
                    break;
                case this.VIEW_SUBACC_ADMIN_EMAILS:
                    this.openDialog(object.selectedOption, object.selectedRow);
                    break;
                case this.VIEW_CTAAS_DASHBOARD:
                    const hasCtaasService = object.selectedRow.services && object.selectedRow.services.includes(tekVizionServices.SpotLight);
                    if (hasCtaasService) {
                        const url = `${environment.BASE_URL}/#${Constants.SPOTLIGHT_DASHBOARD_PATH}?subaccountId=${this.selectedSubaccount.id}`;
                        window.open(url);
                    } else this.snackBarService.openSnackBar('UCaaS Continuous Testing Service is not available for this Subaccount', '');
                    break;
                case this.MODIFY_ACCOUNT:
                    this.openDialog(object.selectedOption, object.selectedRow);
                    break;
                case this.DELETE_ACCOUNT:
                    this.onDeleteAccount(object.selectedRow);
                    break;
            }
        } 
    }

    /**
     * action row click event
     * @param object: { selectedRow: any, selectedIndex: string, tableColumn: string }
     */
    columnAction(object: { selectedRow: any, selectedIndex: string, columnName: string }) {
        if (!object.selectedRow.subaccountId) {
            this.snackBarService.openSnackBar('Subaccount is missing, create one to access this view', '');
        } else {
            this.selectedSubaccount = {
                id: object.selectedRow.subaccountId,
                name: object.selectedRow.subaccountName,
                customerId: object.selectedRow.id,
                customerName: object.selectedRow.name,
                services: object.selectedRow.services
            };
            this.subaccountService.setSelectedSubAccount(this.selectedSubaccount);
            switch (object.columnName) {
                case 'Subaccount':
                    this.openLicenseConsumption(object.selectedRow);
                    break;
                case 'Subscription Status':
                    this.openLicenseDetails(object.selectedRow);
                    break;
            }
        }
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }
}
