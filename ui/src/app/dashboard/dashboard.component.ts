import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Constants } from '../helpers/constants';
import { SessionStorageUtil } from '../helpers/session-storage';
import { Utility } from '../helpers/Utility';
import { CustomerLicense } from '../model/customer-license';
import { AuthenticationService } from '../services/authentication.service';
import { CustomerService } from '../services/customer.service';
import { DashboardService } from '../services/dashboard.service';
import { DialogService } from '../services/dialog.service';
import { AddCustomerAccountModalComponent } from './add-customer-account-modal/add-customer-account-modal.component';
import { ModifyCustomerAccountComponent } from './modify-customer-account/modify-customer-account.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly displayedColumns: string[] = [
    'customerAccounts',
    'customerSubAccounts',
    'purchaseDate',
    'packageType',
    'renewalDate',
    'status',
    'action'];
  readonly columnHeader =
    {
      'customerAccounts': 'Customer Account',
      'customerSubAccounts': 'Customer Sub Account',
      'purchaseDate': 'Purchase Date',
      'packageType': 'Package Type',
      'renewalDate': 'Renewal Date',
      'status': 'Status',
      'action': 'Action'
    }

  canShow: boolean;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any = [];
  data: CustomerLicense[] = [];
  constructor(
    private dashboardService: DashboardService,
    private customerService: CustomerService,
    private authService: AuthenticationService,
    private dialogService: DialogService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    const ACCESS_TOKEN = SessionStorageUtil.get(Constants.ACCESS_TOKEN);
    this.authService.setCurrentUserValue(ACCESS_TOKEN);
    this.data = this.dashboardService.getCustomerLicense();
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  getColor(value: string) {
    return Utility.getColorCode(value);
  }

  onHoverTable(index: number) {
    // this.data[index].action = !this.data[index].action;
    // this.dataSource = new MatTableDataSource([this.data]);
    console.log('index: ', index);
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
    console.log(`on delete account index: ${index}`);
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
      console.log(`${type} customer dialog closed: ${res}`);
    });
  }
  /**
   * 
   * @param index: string 
   */
  onClickAccount(index: string): void {
    console.log(`on click account index: ${index}`);
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
        if (confirmed) console.log('The user confirmed the action');
      });
  }

  ngOnDestroy(): void {

  }
}
