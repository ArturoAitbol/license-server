import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TableColumn } from 'src/app/model/table-column.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LicenseConsumptionService } from 'src/app/services/license-consumption.service';
import { LicenseService } from 'src/app/services/license.service';
import { AddLicenseConsumptionComponent } from './add-license-consumption/add-license-consumption.component';
import { AddLicenseComponent } from '../licenses/add-license/add-license.component';
import { ModifyLicenseConsumptionDetailsComponent } from './modify-license-consumption-details/modify-license-consumption-details.component';

@Component({
  selector: 'app-license-consumption',
  templateUrl: './license-consumption.component.html',
  styleUrls: ['./license-consumption.component.css']
})
export class LicenseConsumption implements OnInit {
  currentCustomer: any;
  @ViewChild(MatSort) sort: MatSort;
  selectedLicense: any;
  selectedDate: any;
  startDate: any;
  endDate: any;
  aggregation: string = "period";
  month: any;
  year: any;
  licensesList: any = [];
  data: any = [];
  equipmentData = [];
  weeklyConsumptionData = [];
  detailedConsumptionData = [];
  licenseForm: any = this.formBuilder.group({
    licenseId: ['']
  });

  readonly licenseSummaryColumns: TableColumn[] = [
    { name: 'Device Access Limit', dataKey: 'deviceLimit', position: 'left', isSortable: true, },
    { name: 'Devices Connected', dataKey: 'devicesConnected', position: 'left', isSortable: true },
    { name: 'tekTokens Purchased', dataKey: 'tokensPurchased', position: 'left', isSortable: true },
    { name: 'Automation tekTokens Consumed', dataKey: 'AutomationPlatformTokensConsumed', position: 'left', isSortable: true, canHighlighted: false },
    { name: 'Configuration tekTokens Consumed', dataKey: 'ConfigurationTokensConsumed', position: 'left', isSortable: true, canHighlighted: false }
  ];

  readonly equipmentSummaryColumns: TableColumn[] = [
    { name: 'Vendor', dataKey: 'vendor', position: 'left', isSortable: true },
    { name: 'Model', dataKey: 'product', position: 'left', isSortable: true },
    { name: 'Version', dataKey: 'version', position: 'left', isSortable: true }
  ];

  readonly detailedConsumptionColumns: TableColumn[] = [
    { name: 'Week', dataKey: 'weekId', position: 'left', isSortable: true },
    { name: 'tekTokens', dataKey: 'tokensConsumed', position: 'left', isSortable: true }
  ];

  readonly detailedConsumptionSummaryColumns: TableColumn[] = [
    { name: 'Consumption Date', dataKey: 'consumption', position: 'left', isSortable: true },
    { name: 'Vendor', dataKey: 'vendor', position: 'left', isSortable: true },
    { name: 'Model', dataKey: 'product', position: 'left', isSortable: true },
    { name: 'Version', dataKey: 'version', position: 'left', isSortable: true },
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
    private formBuilder: FormBuilder,
    private customerSerivce: CustomerService,
    private dialogService: DialogService,
    private licenseService: LicenseService,
    private licenseConsumptionService: LicenseConsumptionService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();
    this.licenseService.getLicenseList(this.currentCustomer.id).subscribe((res: any) => {
      if (!res.error && res.licenses.length > 0) {
        this.licensesList = res.licenses;
        this.selectedLicense = res.licenses[0];
        this.licenseForm.patchValue({ licenseId: this.selectedLicense.id });
        this.startDate = new Date(this.selectedLicense.startDate + " 00:00:00");
        this.endDate = new Date(this.selectedLicense.renewalDate + " 00:00:00");
        this.fetchDataToDisplay();
      } else {
        this.isLicenseSummaryLoadingResults = false;
        this.isLicenseSummaryRequestCompleted = true;
        this.isEquipmentSummaryLoadingResults = false;
        this.isEquipmentSummaryRequestCompleted = true;
        this.isDetailedConsumptionLoadingResults = false;
        this.isDetailedConsumptionRequestCompleted = true;
      }
    });
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
    this.fetchAggregatedData();
  }

  private buildRequestObject(view: string) {
    const requestObject = {
      subaccount: this.currentCustomer.id,
      view: view,
      month: this.aggregation == 'month'? this.month : null,
      year:  this.aggregation == 'month'? this.year : null,
      startDate: this.selectedLicense.startDate,
      endDate: this.selectedLicense.renewalDate
    };
    return requestObject;
  }

  fetchSummaryData() {
    const requiredObject = {
      tokensPurchased: this.selectedLicense.tokensPurchased,
      deviceLimit: this.selectedLicense.deviceLimit,
      AutomationPlatformTokensConsumed: 0,
      ConfigurationTokensConsumed: 0,
      tokensConsumed: 0,
      devicesConnected: 0
    };
    this.licenseConsumptionService.getLicenseDetails(this.buildRequestObject("summary")).subscribe((response: any) => {
      this.isLicenseSummaryLoadingResults = false;
      this.isLicenseSummaryRequestCompleted = true;
      const mergedObj = { ...requiredObject, ...response };
      mergedObj.tokensConsumed = mergedObj.AutomationPlatformTokensConsumed + mergedObj.ConfigurationTokensConsumed;
      if (mergedObj.tokensConsumed >= mergedObj.tokensPurchased) {
        this.licenseSummaryColumns[3].canHighlighted = true;
        this.licenseSummaryColumns[4].canHighlighted = true;
      } else {
        this.licenseSummaryColumns[3].canHighlighted = false;
        this.licenseSummaryColumns[4].canHighlighted = false;
      }
      this.data = [mergedObj];
    }, (error) => {
      console.error("Error fetching summary data: ", error);
      this.isLicenseSummaryLoadingResults = false;
      this.isLicenseSummaryRequestCompleted = true;
    });
  }

  fetchEquipment() {
    this.licenseConsumptionService.getLicenseDetails(this.buildRequestObject("equipment")).subscribe((res: any) => {
      this.equipmentData = res.equipmentSummary;
      this.isEquipmentSummaryLoadingResults = false;
      this.isEquipmentSummaryRequestCompleted = true;
    }, (err: any) => {
      console.error("Error fetching equipment data: ", err);
      this.isEquipmentSummaryLoadingResults = false;
      this.isEquipmentSummaryRequestCompleted = true;
    });
  }

  fetchAggregatedData() {
    this.licenseConsumptionService.getLicenseDetails(this.buildRequestObject("")).subscribe((res: any) => {
      this.detailedConsumptionData = res.usage;
      this.weeklyConsumptionData = res.configurationTokens;
      this.isDetailedConsumptionLoadingResults = false;
      this.isDetailedConsumptionRequestCompleted = true;
    }, (err: any) => {
      console.error("Error fetching detailed license consumption data: ", err);
      this.isDetailedConsumptionLoadingResults = false;
      this.isDetailedConsumptionRequestCompleted = true;
    });
  }

  onChangeLicense(newLicense: any){
    if (newLicense) {
      this.selectedLicense = this.licensesList.find(item => item.id == newLicense);
      this.startDate = new Date(this.selectedLicense.startDate + " 00:00:00");
      this.endDate = new Date(this.selectedLicense.renewalDate + " 00:00:00");
      this.fetchDataToDisplay();
    }
  }

  onChangeToggle(event: any): void {
    switch (event.value) {
      case this.ADD_LICENSE:
        this.openDialog(AddLicenseComponent);
        break;
      case this.ADD_LICENSE_CONSUMPTION:
        this.openDialog(AddLicenseConsumptionComponent, this.selectedLicense);
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
      if (res) {
        if (data) // if it comes from license consumption actions
          this.fetchDataToDisplay();
        else
          this.ngOnInit();
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
        let dataObject: any = {... object.selectedRow};
        this.startDate = new Date(this.data.startDate + " 00:00:00");
        this.endDate = new Date(this.data.renewalDate + " 00:00:00");
        this.openDialog(ModifyLicenseConsumptionDetailsComponent, dataObject);
        break;
      case this.DELETE:
        this.onDelete(+object.selectedIndex);
        break;
    }
  }

  getMultipleChoiceAnswer(newValue: any) {
    this.aggregation = newValue.value;
  }

  setMonthAndYear(newDateSelection: Date, datepicker: MatDatepicker<any>) {
    this.month = newDateSelection.getMonth() + 1;
    this.year = newDateSelection.getFullYear();
    this.selectedDate = newDateSelection;
    datepicker.close();
    this.fetchAggregatedData();
  }
}
