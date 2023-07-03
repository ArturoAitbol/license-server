import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { SubscriptionOverview } from "../../model/subscription-overview.model";
import { SubscriptionsOverviewService } from "../../services/subscriptions-overview.service";
import { Utility } from "../../helpers/utils";
import { MsalService } from "@azure/msal-angular";
import { Sort } from "@angular/material/sort";
import { Constants } from "../../helpers/constants";
import { CustomerService } from "../../services/customer.service";
import { Router } from "@angular/router";
import { SnackBarService } from "../../services/snack-bar.service";
import { debounceTime, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs/internal/Subject";
import moment from "moment";
import { SubAccountService } from "src/app/services/sub-account.service";


@Component({
    selector: 'app-subscriptions-overview',
    templateUrl: './subscriptions-overview.component.html',
    styleUrls: ['./subscriptions-overview.component.css']
})

export class SubscriptionsOverviewComponent implements OnInit, OnDestroy {

    readonly VIEW_LICENSES: string = 'View TekVizion 360 Subscriptions';
    readonly VIEW_CONSUMPTION: string = 'View tekToken Consumption';

    readonly options = {
        VIEW_LICENSES: this.VIEW_LICENSES,
        VIEW_CONSUMPTION: this.VIEW_CONSUMPTION,
    };

    readonly subscriptionStatus = ['Active', 'Inactive', 'Expired'];

    filterForm = this.fb.group({
        customerFilterControl: [''],
        subStatusFilterControl: [''],
        startDateFilterControl: [''],
        endDateFilterControl: [''],
    });

    dataSubscriptionsBK: any[] = [];
    dataWithFiltersBK: any[] = [];
    allSubscriptions: SubscriptionOverview[] = [];
    filteredSubscriptions: SubscriptionOverview[] = [];
    tableMaxHeight: number;
    displayedColumns: any[] = [];
    isLoadingResults = true;
    isRequestCompleted = false;
    actionMenuOptions: string[] = [];
    selectedSubaccount: any;
    customerFilter: any;
    statusFilter: any;
    startDateFilter: any;
    endDateFilter: any;
    private customerSubaccountDetails: any;

    private unsubscribe: Subject<void> = new Subject<void>();

    constructor(private fb: FormBuilder,
                private msalService: MsalService,
                private router: Router,
                private snackBarService: SnackBarService,
                private customerService: CustomerService,
                private subscriptionsOverviewService: SubscriptionsOverviewService,
                private subaccountService: SubAccountService) {
        this.getFiltersFromSesisonStorage();
    }

    ngOnInit(): void {
        this.getDateFilters(sessionStorage.getItem("startDateFilter"), "startDateFilterControl");
        this.getDateFilters(sessionStorage.getItem("endDateFilter"), "endDateFilterControl");
        this.filterForm.disable();
        this.initTable();
        this.loadSubscriptions();
        this.customerSubaccountDetails = this.subaccountService.getSelectedSubAccount();
        this.filterForm.valueChanges.pipe(
            debounceTime(300),
            takeUntil(this.unsubscribe)).subscribe(value => {
            const filters = [];
            if (value.customerFilterControl != '' && value.customerFilterControl != null){
                filters.push(subscription => subscription.customerName.toLowerCase().includes(value.customerFilterControl.toLowerCase()) || 
                subscription.subaccountName?.toLowerCase().includes(value.customerFilterControl.toLowerCase()));
                this.setCustomerOverviewFilters("customerOverviewFilter",value.customerFilterControl);
            }
            if (value.subStatusFilterControl != '' && value.subStatusFilterControl != null) {
                filters.push(subscription => subscription.licenseStatus && subscription.licenseStatus === value.subStatusFilterControl);
                this.setCustomerOverviewFilters("statusOverviewFilter", value.subStatusFilterControl);
            }
            if (value.startDateFilterControl != '' && value.startDateFilterControl != null) {
                filters.push(subscription => subscription.licenseStartDate != null && moment(subscription.licenseStartDate, 'YYYY-MM-DD').isSameOrAfter(value.startDateFilterControl));
                let date = moment(value.startDateFilterControl).format('YYYY-DD-MM');
                this.setCustomerOverviewFilters("startDateFilter", date);
            }
            if (value.endDateFilterControl != '' && value.endDateFilterControl != null) {
                filters.push(subscription => subscription.licenseRenewalDate != null && moment(subscription.licenseStartDate, 'YYYY-MM-DD').isSameOrBefore(value.endDateFilterControl));
                let date = moment(value.endDateFilterControl).format('YYYY-DD-MM');
                this.setCustomerOverviewFilters("endDateFilter", date);
            }
            this.isLoadingResults = true;
            this.dataWithFiltersBK = [...this.allSubscriptions.filter(customer => filters.every(filter => filter(customer)))]
            this.filteredSubscriptions = this.allSubscriptions.filter(customer => filters.every(filter => filter(customer)));
            this.isLoadingResults = false;
        })
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    setCustomerOverviewFilters(key:string, filter:any){
        sessionStorage.setItem(key,filter);
    }

    getDateFilters(filter: any, control:any) {
        if(filter !== ''){
            this.filterForm.controls[control].setValue(filter);
        } else {
            this.setCustomerOverviewFilters(filter,'')
        }
    }

    getFiltersFromSesisonStorage() {
        this.customerFilter = sessionStorage.getItem("customerOverviewFilter");
        this.statusFilter = sessionStorage.getItem("statusOverviewFilter");
        this.startDateFilter = sessionStorage.getItem("startDateFilter");
        this.endDateFilter = sessionStorage.getItem("endDateFilter");
    }

    /**
     * Listen to window:resize event to recalculate the table height
     */
    @HostListener('window:resize')
    sizeChange(): void {
        this.calculateTableHeight();
    }

    /**
     * Initialize the table parameters
     */
    initTable(): void {
        // Set table height
        this.calculateTableHeight();

        // Initialize table columns
        this.displayedColumns = [
            { name: 'Customer', dataKey: 'customerName', position: 'left', isSortable: true },
            { name: 'Subaccount', dataKey: 'subaccountName', position: 'left', isSortable: true},
            { name: 'Subscription', dataKey: 'licenseDescription', position: 'left', isSortable: true },
            { name: 'Status', dataKey: 'licenseStatus', position: 'left', isSortable: true, canHighlighted: true, isClickable: true },
            { name: 'Subscription Type', dataKey: 'licensePackageType', position: 'left', isSortable: true },
            { name: 'Start Date', dataKey: 'licenseStartDate', position: 'left', isSortable: true },
            { name: 'Renewal Date', dataKey: 'licenseRenewalDate', position: 'left', isSortable: true },
            { name: 'Tokens Purchased', dataKey: 'licenseTokens', position: 'left', isSortable: true },
            { name: 'Tokens Consumed', dataKey: 'licenseTokensConsumed', position: 'left', isSortable: true, isClickable: true }
        ];

        //Retrieve possible actions for each row
        const roles = this.msalService.instance.getActiveAccount().idTokenClaims['roles'];
        this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "subscriptionsOverviewOptions");
    }

    /**
     * Load the subscription list from the backend
     */
    loadSubscriptions(): void {
        // Load subscriptions, set the result to allSubs and filteredSubs
        this.isLoadingResults = true;
        this.isRequestCompleted = false;
        this.subscriptionsOverviewService.getSubscriptionsList().subscribe((res: any) => {
            res.subscriptions.forEach(sub => {
                if (sub.licenseStatus == null && sub.subaccountId != null) sub.licenseStatus = 'Inactive';
            });
            this.dataSubscriptionsBK = [...res.subscriptions]
            this.allSubscriptions = res.subscriptions;
            this.filteredSubscriptions = res.subscriptions;
            this.isLoadingResults = false;
            this.isRequestCompleted = true;
            this.filterForm.enable();
        }, error => {
            this.isLoadingResults = false;
            this.isRequestCompleted = true;
            console.error("Error while retrieving subscriptions: ", error)
        })
    }

    /**
     * sort table
     * @param sortParameters: Sort
     * @returns customerList
     */
    sortData(sortParameters: Sort): any[] {
        const keyName = sortParameters.active;
        if(sortParameters.direction !== ''){
            this.filteredSubscriptions = Utility.sortingDataTable(this.filteredSubscriptions, keyName, sortParameters.direction);
        } else {
            if(this.customerFilter != '' || this.statusFilter != '' || this.startDateFilter != '' || this.endDateFilter != '')
                return this.filteredSubscriptions = [...this.dataWithFiltersBK];
            else 
                return this.filteredSubscriptions = [...this.dataSubscriptionsBK];
        }
    }

    /**
     * rowAction handler
     * @param object containing the row object
     */
    rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
        if (!object.selectedRow.subaccountId) {
            this.snackBarService.openSnackBar('Subaccount is missing, create one to access this view', '');
        }  else {
            this.selectedSubaccount = {
                id: object.selectedRow.subaccountId,
                name: object.selectedRow.subaccountName,
                customerId: object.selectedRow.id,
                customerName: object.selectedRow.customerName,
                services: object.selectedRow.services
            }
            this.subaccountService.setSelectedSubAccount(this.selectedSubaccount);
            switch (object.selectedOption) {
                case this.VIEW_LICENSES:
                    this.openLicenseDetails(object.selectedRow);
                    break;
                case this.VIEW_CONSUMPTION:
                    this.openLicenseConsumption(object.selectedRow);
                    break;
            }
        } 
    }

    /**
     * Redirect user to /customer/licenses
     * @param row: object
     */
    openLicenseDetails(row: any): void {
        this.customerService.setSelectedCustomer(row);
        sessionStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(row));
        this.router.navigate(['/customer/licenses'],{queryParams:{subaccountId:row.subaccountId}});
    }

    /**
     * Redirect user to /customer/consumption
     * @param row: object
     */
    openLicenseConsumption(row: any): void {
        this.customerService.setSelectedCustomer(row);
        sessionStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(row));
        this.router.navigate(['/customer/consumption'],{queryParams:{subaccountId:row.subaccountId}});
    }

    /**
     * action row click event
     * @param object: { selectedRow: any, selectedIndex: string, tableColumn: string }
     */
    columnAction(object: { selectedRow: any, selectedIndex: string, columnName: string }) {
        switch (object.columnName) {
            case 'Tokens Consumed':
                if (object.selectedRow.subaccountId !== undefined)
                    this.openLicenseConsumption(this.getCustomerFromRow(object.selectedRow));
                else
                    this.snackBarService.openSnackBar('Subaccount is missing, create one to access tekToken Consumption view', '');
                break;
            case 'Status':
                if (object.selectedRow.licenseStatus !== undefined)
                    this.openLicenseDetails(this.getCustomerFromRow(object.selectedRow));
                else
                    this.snackBarService.openSnackBar('Subaccount is missing, create one to access tekVizion360 Subscriptions view', '');
                break;
        }
    }

    /**
     * Calculate the table height based on the window height
     * @private
     */
    private calculateTableHeight(): void {
        this.tableMaxHeight = window.innerHeight // doc height
            - (window.outerHeight * 0.01 * 2) // - main-container margin
            - 60 // - route-content margin
            - 20 // - dashboard-content padding
            - 30 // - table padding
            - 32 // - title height
            - (window.outerHeight * 0.05 * 2); // - table-section margin
    }

    private getCustomerFromRow(row): any {
        const { customerId, customerName, subaccountId, subaccountName } = row;
        return {id: customerId, name: customerName, subaccountId: subaccountId, subaccountName: subaccountName}
    }

}
