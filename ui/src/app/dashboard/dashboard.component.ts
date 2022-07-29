import { Component, HostListener, OnInit } from '@angular/core';
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
import { AddCustomerAccountModalComponent } from './add-customer-account-modal/add-customer-account-modal.component';
import { AddSubaccountModalComponent } from './add-subaccount-modal/add-subaccount-modal.component';
import { ModifyCustomerAccountComponent } from './modify-customer-account/modify-customer-account.component';
import { AdminEmailsComponent } from "./admin-emails-modal/admin-emails.component";
import { SubaccountAdminEmailsComponent } from "./subaccount-admin-emails-modal/subaccount-admin-emails.component";
import { MsalService } from '@azure/msal-angular';
import { permissions } from '../helpers/role-permissions';
import { SubAccount } from '../model/subaccount.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tableMaxHeight: number;
  displayedColumns: any[] = [];
  data: CustomerLicense[] = [];
  customerList: any = [];
  // flag
  isLoadingResults = true;
  isRequestCompleted = false;
  readonly VIEW_LICENSES: string = 'View tekVizion 360 Packages';
  readonly VIEW_CONSUMPTION: string = 'View tekToken Consumption';
  readonly VIEW_PROJECTS: string = 'View Projects List';
  readonly VIEW_ADMIN_EMAILS: string = 'View Customer Admin Emails';
  readonly VIEW_SUBACC_ADMIN_EMAILS: string = 'View Subaccount Admin Emails';
  readonly MODIFY_ACCOUNT: string = 'Edit';
  readonly DELETE_ACCOUNT: string = 'Delete';

  actionMenuOptions: any = [];
  constructor(
    private customerService: CustomerService,
    private subaccountService: SubAccountService,
    private licenseService: LicenseService,
    private dialogService: DialogService,
    public dialog: MatDialog,
    private snackBarService: SnackBarService,
    private router: Router,
    private msalService: MsalService
  ) { }

  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
  }

  private getActionMenuOptions(){
    const accountRoles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    accountRoles.forEach(accountRole =>{
      permissions[accountRole].tables.customerOptions?.forEach(item=>this.actionMenuOptions.push(this[item]));
    })
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
    this.calculateTableHeight();
    this.initColumns();
    this.fetchDataToDisplay();
    localStorage.removeItem(Constants.PROJECT);
    this.getActionMenuOptions();
  }
  /**
   * initailize the columns settings
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
    // here we are fetching all the data from the server
    forkJoin([
      this.customerService.getCustomerList(),
      this.subaccountService.getSubAccountList(),
      this.licenseService.getLicenseList()
    ]).subscribe(res => {
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
      const newDataObject: any = res.reduce((current, next) => {
        return { ...current, ...next };
      }, {});
      this.customerList = newDataObject['customers'];
      this.customerList.forEach((account: any) => {
        const subaccountDetails = newDataObject['subaccounts'].find((s: SubAccount) => s.customerId === account.id);
        if( subaccountDetails !== undefined ){
          account.subaccountName = subaccountDetails.name;
          account.subaccountId = subaccountDetails.id;
          const subaccountLicenses = newDataObject['licenses'].filter((l: License) => (l.subaccountId === subaccountDetails.id));
          if(subaccountLicenses.length>0){
            const licenseDetails = subaccountLicenses.find((l: License) => (l.status === "Active"));
            account.status = licenseDetails ? licenseDetails.status: "Expired";
          }else{
            account.status = "Inactive"; 
          }
        }
      });
      this.customerList.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }, err => {
      console.debug('error', err);
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
    });
  }


  getColor(value: string) {
    return Utility.getColorCode(value);
  }
  /**
   * on click delete account
   * @param index: string
   */
  onDeleteAccount(index: string): void {
    this.openConfirmaCancelDialog(index);
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
      try {
        console.debug(`${type} dialog closed: ${res}`);
        if (res)
          this.fetchDataToDisplay();
      } catch (error) {
        console.log('error while in action ' + type, error);
      }
    });
  }
  /**
   * open confirm cancel dialog
   */
  openConfirmaCancelDialog(index?: number | string) {
    this.dialogService
      .deleteCustomerDialog({
        title: 'Confirm Action',
        message: 'Do you want to confirm this action?',
        confirmCaption: 'Delete Subaccount',
        deleteAllDataCaption: 'Delete Customer',
        cancelCaption: 'Cancel',
        canDeleteSubaccount: this.customerList[index]?.testCustomer
      })
      .subscribe((result) => {
        if (result.confirm) {
          console.debug('The user confirmed the action: ', this.customerList[index]);
          const { subaccountId , id } = this.customerList[index];
          if ( subaccountId && !result.deleteAllData) {
            this.subaccountService.deleteSubAccount(subaccountId).subscribe((res: any) => {
              if (!res?.error) {
                this.snackBarService.openSnackBar('Subaccount deleted successfully!', '');
                this.fetchDataToDisplay();
              } else {
                this.snackBarService.openSnackBar('Error Subaccount could not be deleted !', '');
              }
            })
          } else {
            this.customerService.deleteCustomer(id).subscribe((res: any) => {
              if (!res?.error) {
                this.snackBarService.openSnackBar('Customer deleted successfully!', '');
                this.fetchDataToDisplay();
              } else {
                this.snackBarService.openSnackBar('Error customer could not be deleted !', '');
              }
            })
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
    localStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(row));
    this.router.navigate(['/customer/licenses']);
  }
  /**
   * 
   * @param row: object 
   */
  openLicenseConsumption(row: any): void {
    this.customerService.setSelectedCustomer(row);
    localStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(row));
    this.router.navigate(['/customer/consumption']);
  }
  /**
   * open project detail
   * @param row: object 
   */
  openProjectDetails(row: any): void {
    this.customerService.setSelectedCustomer(row);
    localStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(row));
    this.router.navigate(['/customer/projects']);
  }
  /**
   * sort table
   * @param sortParameters: Sort 
   * @returns 
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
    switch (object.selectedOption) {
      case this.VIEW_LICENSES:
        if(object.selectedRow.subaccountId !== undefined){
          this.openLicenseDetails(object.selectedRow);
          break;
        }else {
          this.snackBarService.openSnackBar('Subaccount is missing, create one to access tekVizion360 Packages view', '');
          break;
        } 
      case this.VIEW_CONSUMPTION:
        if(object.selectedRow.subaccountId !== undefined){
          this.openLicenseConsumption(object.selectedRow);
          break;
        }else {
          this.snackBarService.openSnackBar('Subaccount is missing, create one to access tekToken Consumption view', '');
          break;
        }
      case this.VIEW_PROJECTS:
        if(object.selectedRow.subaccountId !== undefined){
          this.openProjectDetails(object.selectedRow);
          break;
        }else {
          this.snackBarService.openSnackBar('Subaccount is missing, create one to access Projects view', '');
          break;
        } 
      case this.VIEW_ADMIN_EMAILS:
        this.openDialog(object.selectedOption, object.selectedRow);
        break;
      case this.VIEW_SUBACC_ADMIN_EMAILS:
        this.openDialog(object.selectedOption, object.selectedRow);
        break;
      case this.MODIFY_ACCOUNT:
        this.openDialog(object.selectedOption, object.selectedRow);
        break;
      case this.DELETE_ACCOUNT:
        this.onDeleteAccount(object.selectedIndex);
        break;
    }
  }

  /**
  * action row click event
  * @param object: { selectedRow: any, selectedIndex: string, tableColumn: string }
  */
  columnAction(object: { selectedRow: any, selectedIndex: string, columnName: string }){
      switch(object.columnName){
        case 'Subaccount':
          if(object.selectedRow.subaccountId !== undefined){
            this.customerService.setSelectedCustomer(object.selectedRow);
            localStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(object.selectedRow));
            this.router.navigate(['/customer/consumption']);
            break;
          }else {
            this.snackBarService.openSnackBar('Subaccount is missing, create one to access tekToken Consumption view', '');
            break;
          }
        case 'Subscription Status':
          if(object.selectedRow.status !== undefined){
            this.customerService.setSelectedCustomer(object.selectedRow);
            localStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(object.selectedRow));
            this.router.navigate(['/customer/licenses']);
            break;
          }else {
            this.snackBarService.openSnackBar('Subaccount is missing, create one to access tekVizion360 Packages view', '');
            break;
          }
      }
  } 
}
