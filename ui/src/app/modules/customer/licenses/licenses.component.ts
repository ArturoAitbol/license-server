import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { License } from 'src/app/model/license.model';
import { TableColumn } from 'src/app/model/table-column.model';
import { LicenseService } from 'src/app/services/license.service';
import { DialogService } from 'src/app/services/dialog.service';
import { AddLicenseComponent } from './add-license/add-license.component';
import { ModifyLicenseComponent } from './modify-license/modify-license.component';
import { MsalService } from '@azure/msal-angular';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Utility } from 'src/app/helpers/utils';
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.css']
})
export class LicensesComponent implements OnInit {
  readonly displayedColumns: TableColumn[] = [
    { name: 'Start Date', dataKey: 'startDate', position: 'left', isSortable: true },
    { name: 'Renewal Date', dataKey: 'renewalDate', position: 'left', isSortable: true },
    { name: 'Description', dataKey: 'description', position: 'left', isSortable: true },
    { name: 'Status', dataKey: 'status', position: 'left', isSortable: true, canHighlighted: true },
    { name: 'Subscription Type', dataKey: 'subscriptionType', position: 'left', isSortable: true },
    { name: 'Device Limit', dataKey: 'deviceLimit', position: 'left', isSortable: true },
    { name: 'tekTokens', dataKey: 'tokensPurchased', position: 'left', isSortable: true }
  ];
  tableMaxHeight: number;
  licenses: License[] = [];
  licensesBk: License[] = [];
  customerSubaccountDetails: any
  // flag
  isLoadingResults = true;
  isRequestCompleted = false;

  readonly MODIFY_LICENSE: string = 'Edit';
  readonly DELETE_LICENSE: string = 'Delete';

  readonly options = {
    MODIFY_LICENSE: this.MODIFY_LICENSE,
    DELETE_LICENSE: this.DELETE_LICENSE
  }

  actionMenuOptions: any = [];

  constructor(
    private licenseService: LicenseService,
    private dialogService: DialogService,
    private snackBarService: SnackBarService,
    public dialog: MatDialog,
    private msalService: MsalService,
    private subaccountService: SubAccountService
  ) { }

  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
  }

  private getActionMenuOptions(){
    const roles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    this.actionMenuOptions = Utility.getTableOptions(roles,this.options,"licenseOptions");
    if(this.customerSubaccountDetails.testCustomer === false){
      const action = (action) => action === 'Delete';
      const index = this.actionMenuOptions.findIndex(action);
      this.actionMenuOptions.splice(index,1);
    }
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
    this.getCutomerDetails();
    this.calculateTableHeight();
    this.customerSubaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.fetchLicenses();
    this.getActionMenuOptions();
  }

  getCutomerDetails() {
    this.subaccountService.subaccountData.subscribe(subaccountResp => {
      this.customerSubaccountDetails = subaccountResp
    });
  }

  openDialog(component: any, data?: any): void {
    const dialogRef = this.dialog.open(component, {
      width: 'auto',
      data: data,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      this.fetchLicenses();
    });
  }

  onNewLicense(): void {
    this.openDialog(AddLicenseComponent);
  }

  fetchLicenses(): void {
    this.isLoadingResults = true;
    this.isRequestCompleted = false;
    this.licenseService.getLicenseList(this.customerSubaccountDetails.id).subscribe(res => {
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
      this.licensesBk = this.licenses = res['licenses'];
    }, () => {
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
    });
  }
  /**
   * sort table
   * @param sortParameters: Sort 
   * @returns 
   */
  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    const arrayToSort = [...this.licenses];
    if (sortParameters.direction === 'asc') {
      this.licenses = arrayToSort.sort((a: any, b: any) => {
        if (typeof a[keyName] === 'number') {
          return +a[keyName] > +b[keyName] ? 1 : (+a[keyName] < +b[keyName] ? -1 : 0);
        }
        return a[keyName].localeCompare(b[keyName]);
      });
    } else if (sortParameters.direction === 'desc') {
      this.licenses = arrayToSort.sort((a: any, b: any) => {
        if (typeof a[keyName] === 'number') {
          return +a[keyName] < +b[keyName] ? 1 : (+a[keyName] > +b[keyName] ? -1 : 0);
        }
        return b[keyName].localeCompare(a[keyName])
      });
    } else {
      return this.licenses = this.licensesBk;
    }
  }
  /**
   * on click delete account
   * @param license: License
   */
  onDelete(license: License): void {
    this.dialogService
      .confirmDialog({
        title: 'Confirm Action',
        message: 'Are you sure you want to delete '+ license.description +'?',
        confirmCaption: 'Confirm',
        cancelCaption: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.snackBarService.openSnackBar('License deleted successfully!', '');
          this.licenseService.deleteLicense(license.id).subscribe((res: any) => {
            this.fetchLicenses();
          });
        }
      });
  }
  /**
   * action row click event
   * @param object: { selectedRow: any, selectedOption: string, selectedIndex: string }
   */
  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    switch (object.selectedOption) {
      case this.MODIFY_LICENSE:
        this.openDialog(ModifyLicenseComponent, {...object.selectedRow});
        break;
      case this.DELETE_LICENSE:
        this.onDelete(object.selectedRow);
        break;
    }
  }
}
