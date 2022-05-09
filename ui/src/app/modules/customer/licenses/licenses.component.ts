import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { License } from 'src/app/model/license.model';
import { TableColumn } from 'src/app/model/table-column.model';
import { CustomerService } from 'src/app/services/customer.service';
import { LicenseService } from 'src/app/services/license.service';
import { DialogService } from 'src/app/services/dialog.service';
import { AddLicenseComponent } from './add-license/add-license.component';
import { ModifyLicenseComponent } from './modify-license/modify-license.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.css']
})
export class LicensesComponent implements OnInit {
  readonly displayedColumns: TableColumn[] = [
    { name: 'Start Date', dataKey: 'startDate', position: 'left', isSortable: true },
    { name: 'Renewal Date', dataKey: 'renewalDate', position: 'left', isSortable: true },
    { name: 'Status', dataKey: 'status', position: 'left', isSortable: true, canHighlighted: true },
    { name: 'Package Type', dataKey: 'packageType', position: 'left', isSortable: true },
    { name: 'Device Limit', dataKey: 'deviceLimit', position: 'left', isSortable: true },
    { name: 'tekTokens', dataKey: 'tokensPurchased', position: 'left', isSortable: true }
  ];
  tableMaxHeight: number;
  currentCustomer: any;
  licenses: License[] = [];
  licensesBk: License[] = [];
  // flag
  isLoadingResults: boolean = true;
  isRequestCompleted: boolean = false;

  readonly MODIFY_LICENSE: string = 'Edit';
  readonly DELETE_LICENSE: string = 'Delete';
  actionMenuOptions: any = [
    this.MODIFY_LICENSE,
    this.DELETE_LICENSE
  ];

  constructor(
    private customerSerivce: CustomerService,
    private licenseService: LicenseService,
    private dialogService: DialogService,
    private snackBarService: SnackBarService,
    private router: Router,
    public dialog: MatDialog
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
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();
    this.fetchLicenses();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  openDialog(component: any, data?: any): void {
    const dialogRef = this.dialog.open(component, {
      width: 'auto',
      data: data,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.fetchLicenses();
      }
    });
  }

  onNewLicense(): void {
    this.openDialog(AddLicenseComponent);
  }

  fetchLicenses(): void {
    this.isLoadingResults = true;
    this.isRequestCompleted = false;
    this.licenseService.getLicenseList(this.currentCustomer.id).subscribe(res => {
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
    if (sortParameters.direction === 'asc') {
      this.licenses = this.licenses.sort((a: any, b: any) => {
        if (keyName === 'number') {
          return +a[keyName] > +b[keyName] ? 1 : (+a[keyName] < +b[keyName] ? -1 : 0);
        }
        return a[keyName].localeCompare(b[keyName]);
      });
    } else if (sortParameters.direction === 'desc') {
      this.licenses = this.licenses.sort((a: any, b: any) => {
        if (keyName === 'number') {
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
        message: 'Do you want to confirm this action?',
        confirmCaption: 'Confirm',
        cancelCaption: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
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
        this.openDialog(ModifyLicenseComponent, object.selectedRow);
        break;
      case this.DELETE_LICENSE:
        this.onDelete(object.selectedRow);
        break;
    }
  }
}
