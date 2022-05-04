import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Constants } from '../helpers/constants';
import { Utility } from '../helpers/Utility';
import { CustomerLicense } from '../model/customer-license';
import { Customer } from '../model/customer.model';
import { License } from '../model/license.model';
import { CustomerService } from '../services/customer.service';
import { DialogService } from '../services/dialog.service';
import { LicenseService } from '../services/license.service';
import { SnackBarService } from '../services/snack-bar.service';
import { SubAccountService } from '../services/sub-account.service';
import { AddCustomerAccountModalComponent } from './add-customer-account-modal/add-customer-account-modal.component';
import { AddSubaccountModalComponent } from './add-subaccount-modal/add-subaccount-modal.component';
import { ModifyCustomerAccountComponent } from './modify-customer-account/modify-customer-account.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tableMaxHeight: number;
  displayedColumns: any[] = [];
  data: CustomerLicense[] = [];
  subaccountList: any = [];
  // flag
  isLoadingResults: boolean = true;
  isRequestCompleted: boolean = false;
  readonly VIEW_LICENSE: string = 'License Details';
  readonly VIEW_PROJECTS: string = 'Projects';
  readonly MODIFY_LICENSE: string = 'Modify';
  readonly DELETE_ACCOUNT: string = 'Delete Account';

  actionMenuOptions: any = [
    this.VIEW_LICENSE,
    this.VIEW_PROJECTS,
    this.MODIFY_LICENSE,
    this.DELETE_ACCOUNT
  ];
  constructor(
    private customerService: CustomerService,
    private subaccountService: SubAccountService,
    private licenseService: LicenseService,
    private dialogService: DialogService,
    public dialog: MatDialog,
    private snackBarService: SnackBarService,
    private router: Router
  ) { }
  
  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
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
  }
  /**
   * initailize the columns settings
   */
  initColumns(): void {
    this.displayedColumns = [
      { name: 'Customer', dataKey: 'customerName', position: 'left', isSortable: true },
      { name: 'Subaccount', dataKey: 'name', position: 'left', isSortable: true },
      { name: 'Type', dataKey: 'customerType', position: 'left', isSortable: true },
      { name: 'Status', dataKey: 'status', position: 'left', isSortable: true, canHighlighted: true }
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
        this.subaccountList = newDataObject['subaccounts'];
        this.subaccountList.forEach((subaccount: any) => {
          const customerDetails = newDataObject['customers'].find((e: Customer) => e.id === subaccount.customerId);
          const licenseDetails = newDataObject['licenses'].find((l: License) => (l.subaccountId === subaccount.id && l.status === "Active"));
          subaccount.customerName = customerDetails.name;
          subaccount.customerType = customerDetails.customerType;
          if (licenseDetails)
            subaccount.status = licenseDetails.status;
          else
            subaccount.status = "Inactive";
        });
        this.subaccountList.sort((a: any, b: any) => a.customerName.localeCompare(b.customerName));
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
      case this.MODIFY_LICENSE:
        dialogRef = this.dialog.open(ModifyCustomerAccountComponent, {
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
      .confirmDialog({
        title: 'Confirm Action',
        message: 'Do you want to confirm this action?',
        confirmCaption: 'Confirm',
        cancelCaption: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          console.debug('The user confirmed the action: ', this.data[index]);
          const { id } = this.data[index];
          this.customerService.deleteCustomer(id).subscribe((res: any) => {
            if (res) {
              console.log('deleted customer', res);
              this.snackBarService.openSnackBar('Customer deleted successfully!', '');
            }
          });
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
    this.router.navigate(['/customer']);
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
      this.data = this.data.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
    } else if (sortParameters.direction === 'desc') {
      this.data = this.data.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
    } else {
      return this.data = this.data;
    }
  }
  /**
   * action row click event
   * @param object: { selectedRow: any, selectedOption: string, selectedIndex: string }
   */
  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    switch (object.selectedOption) {
      case this.VIEW_LICENSE:
        this.openLicenseDetails(object.selectedRow);
        break;
      case this.VIEW_PROJECTS:
        this.openProjectDetails(object.selectedRow);
        break;
      case this.MODIFY_LICENSE:
        this.openDialog(object.selectedOption, object.selectedRow);
        break;
      case this.DELETE_ACCOUNT:
        this.onDeleteAccount(object.selectedIndex);
        break;
    }
  }
}
