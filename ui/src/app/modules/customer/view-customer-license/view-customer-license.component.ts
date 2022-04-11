import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TableColumn } from 'src/app/model/table-column.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LicenseUsageService } from 'src/app/services/license-usage.service';
import { LicenseService } from 'src/app/services/license.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AddLicenseConsumptionComponent } from './add-license-consumption/add-license-consumption.component';
import { AddLicenseComponent } from './add-license/add-license.component';
import { ModifyLicenseConsumptionDetailsComponent } from './modify-license-consumption-details/modify-license-consumption-details.component';

@Component({
  selector: 'app-view-customer-license',
  templateUrl: './view-customer-license.component.html',
  styleUrls: ['./view-customer-license.component.css']
})
export class ViewCustomerLicenseComponent implements OnInit {
  currentCustomer: any;
  @ViewChild(MatSort) sort: MatSort;
  selectedDate: any;
  month: any;
  year: any;
  data: any = [];
  equipmentData = [];
  weeklyConsumptionData = [];
  detailedConsumptionData = [];
  readonly displayedColumns: string[] = [
    'deviceLimit',
    'devicesConnected',
    'tokensPurchased',
    'AutomationPlatformTokensConsumed',
    'configurationTokens',
    'configAvgerage'
  ];
  readonly equipmentDisplayColumns: string[] = [
    'vendor',
    'product',
    'version',
    'macAddress'
  ];
  readonly detailedDisplayColumns: string[] = [
    'weekId',
    'tokensConsumed'
  ];
  readonly detailedConsumptionDisplayColumns: string[] = [
    'usageDate',
    'vendor',
    'product',
    'version',
    'macAddress',
    'type',
    'consumption',
    'tokensConsumed',
    'action'
  ];

  readonly licenseSummaryColumns: TableColumn[] = [
    { name: 'Device Access Limit', dataKey: 'deviceLimit', position: 'left', isSortable: true, },
    { name: 'Devices Connected', dataKey: 'devicesConnected', position: 'left', isSortable: true },
    { name: 'tekTokens Purchased', dataKey: 'tokensPurchased', position: 'left', isSortable: true },
    { name: 'Automation tekTokens Consumed', dataKey: 'AutomationPlatformTokensConsumed', position: 'left', isSortable: true },
    { name: 'Configuration tekTokens Consumed', dataKey: 'ConfigurationTokensConsumed', position: 'left', isSortable: true },
    { name: 'Configuration Average', dataKey: 'configAvgerage', position: 'left', isSortable: true }
  ];

  readonly equipmentSummaryColumns: TableColumn[] = [
    { name: 'Vendor', dataKey: 'vendor', position: 'left', isSortable: true },
    { name: 'Model', dataKey: 'product', position: 'left', isSortable: true },
    { name: 'Version', dataKey: 'version', position: 'left', isSortable: true },
    { name: 'MAC Address', dataKey: 'macAddress', position: 'left', isSortable: true }
  ];

  readonly detailedConsumptionColumns: TableColumn[] = [
    { name: 'Week', dataKey: 'weekId', position: 'left', isSortable: true },
    { name: 'Configuration tekTokens Consumed', dataKey: 'tokensConsumed', position: 'left', isSortable: true }
  ];

  readonly detailedConsumptionSummaryColumns: TableColumn[] = [
    { name: 'Date Of Usage', dataKey: 'usageDate', position: 'left', isSortable: true },
    { name: 'Vendor', dataKey: 'vendor', position: 'left', isSortable: true },
    { name: 'Model', dataKey: 'product', position: 'left', isSortable: true },
    { name: 'Version', dataKey: 'version', position: 'left', isSortable: true },
    { name: 'MAC Address', dataKey: 'macAddress', position: 'left', isSortable: true },
    { name: 'Consumption', dataKey: 'consumption', position: 'left', isSortable: true },
    { name: 'tekTokens Used', dataKey: 'tokensConsumed', position: 'left', isSortable: true }
  ];
  readonly ADD_LICENSE_CONSUMPTION = 'add-license-consumption';
  readonly ADD_LICENSE = 'add-new-license';

  // flag
  isLicenseSummaryLoadingResults: boolean = true;
  isLicenseSummaryRequestCompleted: boolean = false;
  isEquipmentSummaryLoadingResults: boolean = true;
  isEquipmentSummaryRequestCompleted: boolean = false;
  isDetailedConsumptionLoadingResults: boolean = true;
  isDetailedConsumptionRequestCompleted: boolean = false;
  readonly EDIT: string = 'Edit';
  readonly DELETE: string = 'Delete';

  licConsumptionActionMenuOptions: any = [
    this.EDIT,
    this.DELETE
  ];

  constructor(
    private customerSerivce: CustomerService,
    private dialogService: DialogService,
    private licenseSerivce: LicenseService,
    private licenseUsageService: LicenseUsageService,
    private snackBarService: SnackBarService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();
    this.fetchDataToDisplay();
  }

  initFlags() {
    this.data = [];
    this.equipmentData = [];
    this.weeklyConsumptionData = [];
    this.detailedConsumptionData = [];
    this.isLicenseSummaryLoadingResults = true;
    this.isLicenseSummaryRequestCompleted = false;
    this.isEquipmentSummaryLoadingResults = true;
    this.isEquipmentSummaryRequestCompleted = false;
    this.isDetailedConsumptionLoadingResults = true;
    this.isDetailedConsumptionRequestCompleted = false;
  }
  
  fetchDataToDisplay() {
    this.initFlags();
    this.fetchSummaryData();
    this.fetchEquipment();
    this.fetchLicenseConsumptionList();
  }

  fetchSummaryData() {
    const requiredObject = {
      tokensPurchased: 0,
      deviceLimit: 0,
      tokensRemaining: 0,
      AutomationPlatformTokensConsumed: 0,
      configurationTokensConsumed: 0,
      devicesConnected: 0,
      tokensConsumed: 0,
      configAvgerage: 0
    };
    const requestObject: { subaccount: string, view: string, month?: string, year?: string } = {
      subaccount: this.currentCustomer.subaccountId,
      view: 'weekly',
      month: this.month,
      year: this.year
    };
    forkJoin([
      this.licenseUsageService.getLicenseDetails(requestObject),
      this.licenseSerivce.getLicenseList(this.currentCustomer.subaccountId)
    ]).subscribe((response: any) => {
      this.isLicenseSummaryLoadingResults = false;
      this.isLicenseSummaryRequestCompleted = true;
      let resultant: any = {};
      response.reduce((acc, curr) => resultant = { ...acc, ...curr });
      const licensesList = resultant['licenses'];
      licensesList.forEach(element => {
        requiredObject.tokensPurchased += +element.tokensPurchased;
        requiredObject.deviceLimit += +element.deviceLimit;
      });
      const mergedObj = { ...requiredObject, ...resultant };
      this.weeklyConsumptionData = resultant.configurationTokens;
      this.data = [mergedObj];
    }, (error) => {
      console.error("Error fetching summary data: ", error);
      this.isLicenseSummaryLoadingResults = false;
      this.isLicenseSummaryRequestCompleted = true;
    });
  }

  fetchEquipment() {
    const requestObject: { subaccount: string, view: string, month?: string, year?: string } = {
      subaccount: this.currentCustomer.subaccountId,
      view: 'equipmentsummary',
      month: this.month,
      year: this.year
    };
    this.licenseUsageService.getLicenseDetails(requestObject).subscribe((res: any) => {
      this.equipmentData = res.equipmentSummary;
      this.isEquipmentSummaryLoadingResults = false;
      this.isEquipmentSummaryRequestCompleted = true;
    }, (err: any) => {
      console.error("Error fetching equipment data: ", err);
      this.isEquipmentSummaryLoadingResults = false;
      this.isEquipmentSummaryRequestCompleted = true;
    });
  }

  fetchLicenseConsumptionList() {
    const requestObject: { subaccount: string, view: string, month?: string, year?: string } = {
      subaccount: this.currentCustomer.subaccountId,
      view: '',
      month: this.month,
      year: this.year
    };
    this.licenseUsageService.getLicenseDetails(requestObject).subscribe((res: any) => {
      this.detailedConsumptionData = res.usage;
      this.isDetailedConsumptionLoadingResults = false;
      this.isDetailedConsumptionRequestCompleted = true;
    }, (err: any) => {
      console.error("Error fetching detailed license consumption data: ", err);
      this.isDetailedConsumptionLoadingResults = false;
      this.isDetailedConsumptionRequestCompleted = true;
    });
  }

  onChangeToggle(event: any): void {
    console.log('event', event.value);
    switch (event.value) {
      case this.ADD_LICENSE:
        this.openDialog(AddLicenseComponent);
        break;
      case this.ADD_LICENSE_CONSUMPTION:
        this.openDialog(AddLicenseConsumptionComponent);
        break;
    }
  }

  onDelete(index: number) {
    this.dialogService.confirmDialog({
        title: 'Confirm Action',
        message: 'Do you want to confirm this action?',
        confirmCaption: 'Confirm',
        cancelCaption: 'Cancel',
      }).subscribe((confirmed) => {
        if (confirmed) {
          console.log('The user confirmed the action');
          if (index){
            console.log('Delete element with index: ' + index);
          }
        }        
      });
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
      console.log('add customer dialog closed', res);
      if (res) {
        this.snackBarService.openSnackBar('License processed successfully!', '');
        this.fetchDataToDisplay();
      }
    });
  }

  /**
 * sort table
 * @param sortParameters: Sort 
 * @returns 
 */
   sortDataEquipment(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc') {
      this.equipmentData = this.equipmentData.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
    } else if (sortParameters.direction === 'desc') {
      this.equipmentData = this.equipmentData.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
    } else {
      return this.equipmentData = this.equipmentData;
    }
  }

  /**
 * sort table
 * @param sortParameters: Sort 
 * @returns 
 */
  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc') {
      this.detailedConsumptionData = this.detailedConsumptionData.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
    } else if (sortParameters.direction === 'desc') {
      this.detailedConsumptionData = this.detailedConsumptionData.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
    } else {
      return this.detailedConsumptionData = this.detailedConsumptionData;
    }
  }
  /**
   * action row click event
   * @param object: { selectedRow: any, selectedOption: string, selectedIndex: string }
   */
  licConsumptionRowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    switch (object.selectedOption) {
      case this.EDIT:
        this.openDialog(ModifyLicenseConsumptionDetailsComponent, object.selectedRow);
        break;
      case this.DELETE:
        this.onDelete(+object.selectedIndex);
        break;
    }
  }

  setMonthAndYear(newDateSelection: Date, datepicker: MatDatepicker<any>) {
    this.month = newDateSelection.getMonth() + 1;
    this.year = newDateSelection.getFullYear();
    this.selectedDate = newDateSelection;
    datepicker.close();
    this.fetchDataToDisplay();
  }
}
