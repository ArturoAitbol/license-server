import { Component, OnInit, ViewChild } from '@angular/core';
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
import { AddCustomerAccountModalComponent } from './add-customer-account-modal/add-customer-account-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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

  onModifyLicense(index: number): void {
    console.log(`on modify license index: ${index}`);

  }

  onDeleteAccount(index: number): void {
    console.log(`on delete account index: ${index}`);
  }

  addCustomerAccount(): void {
    this.openDialog();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddCustomerAccountModalComponent, {
      width: 'auto',
      data: { name: '', color: 'this.color ' }
    });
    dialogRef.afterClosed().subscribe(res => {
      console.log('add customer dialog closed');
      // this.color = res;
    });
  }

  onClickAccount(index: number): void {
    console.log(`on click account index: ${index}`);
    this.customerService.setSelectedCustomer(this.data[index]);
    localStorage.setItem(Constants.SELECTED_CUSTOMER, JSON.stringify(this.data[index]));
    this.router.navigate(['/customer']);
  }
}
