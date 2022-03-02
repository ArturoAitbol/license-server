import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Constants } from '../helpers/constants';
import { Utility } from '../helpers/Utility';
import { CustomerLicense } from '../model/customer-license';
import { Customer } from '../model/customer.model';
import { License } from '../model/license.model';
import { SubAccount } from '../model/subaccount.model';
import { CustomerService } from '../services/customer.service';
import { DialogService } from '../services/dialog.service';
import { LicenseService } from '../services/license.service';
import { SnackBarService } from '../services/snack-bar.service';
import { SubAccountService } from '../services/sub-account.service';
import { AddCustomerAccountModalComponent } from './add-customer-account-modal/add-customer-account-modal.component';
import { ModifyCustomerAccountComponent } from './modify-customer-account/modify-customer-account.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  displayedColumns: any[] = [];
  data: CustomerLicense[] = [];
  customersList: any = [];
  subaccountList: any = [];
  licenseList: any = [];
  // flag
  isLoadingResults: boolean = true;
  isRequestCompleted: boolean = false;
  readonly VIEW_PROJECTS: string = 'View Project Detail';
  readonly MODIFY_LICENSE: string = 'Modify License';
  readonly DELETE_ACCOUNT: string = 'Delete Account';

  actionMenuOptions: any = [
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

  ngOnInit(): void {
    this.initColumns();
    this.fetchDataToDisplay();
  }
  /**
   * initailize the columns settings
   */
  initColumns(): void {
    this.displayedColumns = [
      {
        name: 'Customer Account',
        dataKey: 'customerName',
        position: 'left',
        isSortable: true,
        isClickable: true,
      },
      {
        name: 'Customer Sub Account',
        dataKey: 'subaccountName',
        position: 'left',
        isSortable: true
      },
      {
        name: 'Type',
        dataKey: 'customerType',
        position: 'left',
        isSortable: true
      },
      {
        name: 'Purchase Date',
        dataKey: 'purchaseDate',
        position: 'left',
        isSortable: true
      },
      {
        name: 'Package Type',
        dataKey: 'packageType',
        position: 'left',
        isSortable: true
      },
      {
        name: 'Renewal Date',
        dataKey: 'renewalDate',
        position: 'left',
        isSortable: true
      },
      {
        name: 'Status',
        dataKey: 'status',
        position: 'left',
        isSortable: true,
        canHighlighted: true
      }
    ];
  }
  /**
   * fetch data to display
   */
  private fetchDataToDisplay(): void {
    this.isRequestCompleted = false;
    // here we are fetching all the data from the server
    forkJoin(
      [this.customerService.getCustomerList(),
      this.subaccountService.getSubAccountList(),
      this.licenseService.getLicenseList()
      ])
      .subscribe(res => {
        this.isLoadingResults = false;
        this.isRequestCompleted = true;
        const newDataObject: any = res.reduce((current, next) => {
          return { ...current, ...next };
        }, {});
        this.licenseList = newDataObject['licenses'];
        this.subaccountList = newDataObject['subaccounts'];
        this.customersList = newDataObject['customers'];
        // here we map the customer name and subaccount name to the customer license list
        this.licenseList.forEach((license: License) => {
          const subaccountDetails: SubAccount = this.subaccountList.find((e: SubAccount) => e.id == license.subaccountId);
          if (subaccountDetails) {
            license.subaccountName = subaccountDetails.name;
            const customerDetails = this.customersList.find((e: Customer) => e.id === subaccountDetails.customerId);
            if (customerDetails) {
              license.customerName = customerDetails.name;
              license.customerType = customerDetails.customerType;
            }
          }
        });

        this.data = [...this.licenseList];
      }, err => {
        console.debug('error', err);
        this.isLoadingResults = false;
        this.isRequestCompleted = true;
      });
  }


  getColor(value: string) {
    return Utility.getColorCode(value);
  }

  onHoverTable(index: number) {
    // this.data[index].action = !this.data[index].action;
    // this.dataSource = new MatTableDataSource([this.data]); 
  }
  /**
   * on click modify license
   * @param index: string
   */
  onModifyLicense(index: string): void {
    // const item = this.dataSource.filteredData[index];
    // this.openDialog('modify', item);
  }
  /**
   * on click delete account
   * @param index: string
   */
  onDeleteAccount(index: string): void {
    this.openConfirmaCancelDialog();
  }
  /**
   * on click add account customer
   */
  addCustomerAccount(): void {
    this.openDialog('add');
  }
  /**
   * open dialog
   * @param type: string 
   */
  openDialog(type: string, selectedItemData?: any): void {
    let dialogRef;
    switch (type) {
      case 'add':
        dialogRef = this.dialog.open(AddCustomerAccountModalComponent, {
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
        console.debug(`${type} customer dialog closed: ${res}`);
        if (res) {
          this.snackBarService.openSnackBar('Customer created successfully!', 'close');
          this.fetchDataToDisplay();
        }
      } catch (error) {
        console.log('error while creating customer', error);
      }
    });
  }
  /**
   * 
   * @param index: string 
   */
  onClickAccount(object: { selectedRow: any, selectedIndex: number }): void {
    this.customerService.setSelectedCustomer(object.selectedRow);
    localStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(object.selectedRow));
    this.router.navigate(['/customer']);
  }
  /**
   * open confirm cancel dialog
   */
  openConfirmaCancelDialog() {
    this.dialogService
      .confirmDialog({
        title: 'Confirm Action',
        message: 'Do you want to confirm this action?',
        confirmCaption: 'Confirm',
        cancelCaption: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (confirmed) console.debug('The user confirmed the action');
      });
  }
  /**
   * open project detail
   * @param index: string 
   */
  openProjectDetails(index: string): void {
    this.customerService.setSelectedCustomer(this.data[index]);
    localStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(this.data[index]));
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
      case this.VIEW_PROJECTS:
        this.openProjectDetails(object.selectedIndex);
        break;
      case this.MODIFY_LICENSE:
        this.openDialog(object.selectedOption, object.selectedRow);
        break;
      case this.DELETE_ACCOUNT:
        this.onDeleteAccount(object.selectedIndex);
        break;
    }
  }

  ngOnDestroy(): void {

  }
}
