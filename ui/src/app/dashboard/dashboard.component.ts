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
import { SubAccountService } from '../services/sub-account.service';
import { AddCustomerAccountModalComponent } from './add-customer-account-modal/add-customer-account-modal.component';
import { ModifyCustomerAccountComponent } from './modify-customer-account/modify-customer-account.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly displayedColumns: string[] = [
    'customerName',
    'subaccountName',
    'customerType',
    'purchaseDate',
    'packageType',
    'renewalDate',
    'status',
    'action'];
  readonly columnHeader =
    {
      'customerName': 'Customer Account',
      'subaccountName': 'Customer Sub Account',
      'customerType': 'Type',
      'purchaseDate': 'Purchase Date',
      'packageType': 'Package Type',
      'renewalDate': 'Renewal Date',
      'status': 'Status',
      'action': 'Action'
    }
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any = [];
  data: CustomerLicense[] = [];
  customersList: any = [];
  subaccountList: any = [];
  licenseList: any = [];
  // flag
  isLoadingResults: boolean = true;
  isRequestCompleted: boolean = false;
  constructor(
    private customerService: CustomerService,
    private subaccountService: SubAccountService,
    private licenseService: LicenseService,
    private dialogService: DialogService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.data);
    this.fetchDataToDisplay();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

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
        console.debug('fork join res ', res);
        const newDataObject: any = res.reduce((current, next) => {
          return { ...current, ...next };
        }, {});
        console.debug('data object ', newDataObject);
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
              license.customerType = customerDetails.type;
            }
          }
        });

        this.data = [...this.licenseList];
        this.dataSource = new MatTableDataSource(this.data);
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
    console.debug('index: ', index);
  }
  /**
   * on click modify license
   * @param index: string
   */
  onModifyLicense(index: string): void {
    const item = this.dataSource.filteredData[index];
    this.openDialog('modify', item);
  }
  /**
   * on click delete account
   * @param index: string
   */
  onDeleteAccount(index: string): void {
    console.debug(`on delete account index: ${index}`);
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
          width: 'auto'
        });
        break;
      case 'modify':
        dialogRef = this.dialog.open(ModifyCustomerAccountComponent, {
          width: 'auto',
          data: selectedItemData
        });
        break;
    }
    dialogRef.afterClosed().subscribe(res => {
      console.debug(`${type} customer dialog closed: ${res}`);
    });
  }
  /**
   * 
   * @param index: string 
   */
  onClickAccount(index: string): void {
    console.debug(`on click account index: ${index}`);
    this.customerService.setSelectedCustomer(this.data[index]);
    localStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(this.data[index]));
    this.router.navigate(['/customer']);
  }

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

  ngOnDestroy(): void {

  }
}
