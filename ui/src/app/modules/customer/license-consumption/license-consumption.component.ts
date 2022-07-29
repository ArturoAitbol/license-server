import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDateRangePicker } from '@angular/material/datepicker';
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
import { ProjectService } from 'src/app/services/project.service';
import { Constants } from 'src/app/helpers/constants';
import { MsalService } from '@azure/msal-angular';
import { permissions } from 'src/app/helpers/role-permissions';
import { DataTableComponent } from "../../../generics/data-table/data-table.component";
import { StaticConsumptionDetailsComponent } from './static-consumption-details/static-consumption-details.component';
import moment from 'moment';

@Component({
  selector: 'app-license-consumption',
  templateUrl: './license-consumption.component.html',
  styleUrls: ['./license-consumption.component.css']
})
export class LicenseConsumptionComponent implements OnInit,OnDestroy {
  currentCustomer: any;
  @ViewChild(MatSort) sort: MatSort;
  projects: any[];
  selectedLicense: any;
  selectedDate: any;
  selectedType: string;
  selectedProject: string;
  startDate: any;
  endDate: any;
  aggregation = "period";
  month: number;
  year: number;
  licensesList: any = [];
  data: any = [];
  equipmentData = [];
  weeklyConsumptionData = [];
  detailedConsumptionData = [];
  tokenConsumptionData = [];
  licenseForm: any = this.formBuilder.group({
    licenseId: ['']
  });
  range: FormGroup = this.formBuilder.group({
    start: [{value:'',disabled:true}],
    end:[{value:'',disabled:true}],
  });
  detailedConsumptionDataLength = 0;

  @ViewChild('detailsConsumptionTable') detailsConsumptionTable: DataTableComponent;

  tekTokensSummaryColumns: TableColumn[] = [
    { name: 'tekTokens', dataKey: 'tokensPurchased', position: 'left', isSortable: true },
    { name: 'Consumed', dataKey: 'tokensConsumed', position: 'left', isSortable: true, canHighlighted: false },
    { name: 'Available', dataKey: 'tokensAvailable', position: 'left', isSortable: true, canHighlighted: false }
  ];

  readonly automationSummaryColumns: TableColumn[] = [
    { name: 'Device Access Limit', dataKey: 'deviceLimit', position: 'left', isSortable: true, },
    { name: 'Devices Connected', dataKey: 'devicesConnected', position: 'left', isSortable: true }
  ];

  readonly equipmentSummaryColumns: TableColumn[] = [
    { name: 'Vendor', dataKey: 'vendor', position: 'left', isSortable: true },
    { name: 'Model', dataKey: 'product', position: 'left', isSortable: true },
    { name: 'Version', dataKey: 'version', position: 'left', isSortable: true }
  ];

  readonly tekTokenConsumptionColumns: TableColumn[] = [
    { name: 'Automation tekTokens Consumed', dataKey: 'AutomationPlatformTokensConsumed', position: 'left', isSortable: true },
    { name: 'Configuration tekTokens Consumed', dataKey: 'ConfigurationTokensConsumed', position: 'left', isSortable: true, },
    { name: 'Total Consumption', dataKey: 'tokensConsumed', position: 'left', isSortable: true }
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
    { name: 'tekTokens Used', dataKey: 'tokensConsumed', position: 'left', isSortable: true },
    { name: 'Usage Days', dataKey:'usageDays',position:'left',isSortable: false}
  ];
  readonly ADD_LICENSE_CONSUMPTION = 'add-license-consumption';
  readonly ADD_LICENSE = 'add-new-license';

  // flag
  isLicenseSummaryLoadingResults = true;
  isLicenseSummaryRequestCompleted = false;
  isEquipmentSummaryLoadingResults = true;
  isEquipmentSummaryRequestCompleted = false;
  isDetailedConsumptionSupplementalLoadingResults = true;
  isDetailedConsumptionSupplementalRequestCompleted = false;
  isDetailedConsumptionLoadingResults = true;
  isDetailedConsumptionRequestCompleted = false;
  isLicenseListLoaded = false;
  readonly EDIT: string = 'Edit';
  readonly DELETE: string = 'Delete';

  licConsumptionActionMenuOptions: any = [];

  daysOfWeek = {
    0:'Sun',
    1:'Mon',
    2:'Tue',
    3:'Wed',
    4:'Thu',
    5:'Fri',
    6:'Sat'
  }

  constructor(
    private formBuilder: FormBuilder,
    private customerSerivce: CustomerService,
    private dialogService: DialogService,
    private projectService: ProjectService,
    private licenseService: LicenseService,
    private licenseConsumptionService: LicenseConsumptionService,
    private router: Router,
    public dialog: MatDialog,
    private msalService:MsalService
  ) { }

  ngOnInit(): void {
    const projectItem: string = localStorage.getItem(Constants.PROJECT);
    if(projectItem) this.selectedProject = JSON.parse(projectItem).id;
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();
    this.licenseService.getLicenseList(this.currentCustomer.subaccountId).subscribe((res: any) => {
      if (!res.error && res.licenses.length > 0) {
        this.licensesList = res.licenses;
        this.selectedLicense = res.licenses[0];
        this.licenseForm.patchValue({ licenseId: this.selectedLicense.id });
        this.startDate = new Date(this.selectedLicense.startDate + " 00:00:00");
        this.endDate = new Date(this.selectedLicense.renewalDate + " 00:00:00");
        this.isLicenseListLoaded = true;
        this.fetchDataToDisplay();
      } else {
        this.isLicenseSummaryLoadingResults = false;
        this.isLicenseSummaryRequestCompleted = true;
        this.isEquipmentSummaryLoadingResults = false;
        this.isEquipmentSummaryRequestCompleted = true;
        this.isDetailedConsumptionSupplementalLoadingResults = false;
        this.isDetailedConsumptionSupplementalRequestCompleted = true;
        this.isDetailedConsumptionLoadingResults = false;
        this.isDetailedConsumptionRequestCompleted = true;
      }
    });
    this.fetchProjectsList();
    this.getActionMenuOptions();
  }

  fetchDataToDisplay() {
    this.fetchSummaryData();
    this.fetchEquipment();
    this.fetchAggregatedData();
  }

  private getActionMenuOptions(){
    this.licConsumptionActionMenuOptions = [];
    const accountRoles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    accountRoles.forEach(accountRole =>{
      permissions[accountRole].tables.licConsumptionOptions?.forEach(item=>this.licConsumptionActionMenuOptions.push(this[item]));
    })
  }

  private buildRequestObject(view: string, pageNumber?: number, pageSize?:number) {
    const requestObject: any = {
      subaccount: this.currentCustomer.subaccountId,
      view: view,
      month: this.aggregation == 'month' ? this.month : null,
      year: this.aggregation == 'month' ? this.year : null,
    };
    if (this.selectedProject) requestObject.project = this.selectedProject;
    if (this.selectedType) requestObject.type = this.selectedType;
    if (pageNumber != null && pageSize != null) {
      requestObject.limit = pageSize;
      requestObject.offset = pageSize * pageNumber;
    }
    /*
      if it is the license consumption division and week filter is selected
      then send the start and end dates as the beginning and end of this week
    */
    if (view === "" && this.aggregation === "week") {
      requestObject.startDate = this.range.get('start').value.toISOString().split("T")[0];
      requestObject.endDate = this.range.get('end').value.toISOString().split("T")[0];
    } else { 
      requestObject.startDate = this.selectedLicense.startDate;
      requestObject.endDate = this.selectedLicense.renewalDate;
    }
    return requestObject;
  }

  fetchProjectsList(){
    this.projectService.getProjectDetailsBySubAccount(this.currentCustomer.subaccountId).subscribe((res: any) => {
      if (!res.error && res.projects)
        this.projects = res.projects;
    });
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
    this.data = [];
    this.isLicenseSummaryLoadingResults = true;
    this.isLicenseSummaryRequestCompleted = false;
    this.licenseConsumptionService.getLicenseConsumptionDetails(this.buildRequestObject("summary")).subscribe((response: any) => {
      this.isLicenseSummaryLoadingResults = false;
      this.isLicenseSummaryRequestCompleted = true;
      const mergedObj = { ...requiredObject, ...response };
      if (mergedObj.tokensConsumed >= mergedObj.tokensPurchased) {
        this.tekTokensSummaryColumns[1].canHighlighted = true;
        this.tekTokensSummaryColumns[2].canHighlighted = true;
        mergedObj.tokensAvailable = 0;
      } else {
        this.tekTokensSummaryColumns[1].canHighlighted = false;
        this.tekTokensSummaryColumns[2].canHighlighted = false;
        mergedObj.tokensAvailable = mergedObj.tokensPurchased - mergedObj.tokensConsumed;
      }
      this.data = [mergedObj];
    }, (error) => {
      console.error("Error fetching summary data: ", error);
      this.isLicenseSummaryLoadingResults = false;
      this.isLicenseSummaryRequestCompleted = true;
    });
  }

  fetchEquipment() {
    this.equipmentData = [];
    this.isEquipmentSummaryLoadingResults = true;
    this.isEquipmentSummaryRequestCompleted = false;
    this.licenseConsumptionService.getLicenseConsumptionDetails(this.buildRequestObject("equipment")).subscribe((res: any) => {
      this.equipmentData = res.equipmentSummary;
      this.isEquipmentSummaryLoadingResults = false;
      this.isEquipmentSummaryRequestCompleted = true;
    }, (err: any) => {
      console.error("Error fetching equipment data: ", err);
      this.isEquipmentSummaryLoadingResults = false;
      this.isEquipmentSummaryRequestCompleted = true;
    });
  }

  fetchAggregatedData(pageNumber = 0, pageSize = 6) {
    this.weeklyConsumptionData = [];
    this.detailedConsumptionData = [];
    this.tokenConsumptionData = [];
    this.isDetailedConsumptionSupplementalLoadingResults = true;
    this.isDetailedConsumptionSupplementalRequestCompleted = false;
    this.isDetailedConsumptionLoadingResults = true;
    this.isDetailedConsumptionRequestCompleted = false;
    this.licenseConsumptionService.getLicenseConsumptionDetails(this.buildRequestObject("", pageNumber, pageSize)).subscribe((res: any) => {
      res.usage.forEach(item => {
        if (item.granularity.toLowerCase() === "static" || item.usageType === "AutomationPlatform")
          item.usageDays = item.usageDays.length;
        else
          this.getNameOfDays(item.usageDays);
      });
      this.detailedConsumptionData = res.usage;
      this.detailedConsumptionDataLength = res.usageTotalCount;
      this.weeklyConsumptionData = this.getWeeksDetail(res.configurationTokens);
      this.tokenConsumptionData = this.formatTokenConsumption(res.tokenConsumption);
      this.detailsConsumptionTable.setPageIndex(0);
      this.isDetailedConsumptionSupplementalLoadingResults = false;
      this.isDetailedConsumptionSupplementalRequestCompleted = true;
      this.isDetailedConsumptionLoadingResults = false;
      this.isDetailedConsumptionRequestCompleted = true;
    }, (err: any) => {
      console.error("Error fetching detailed license consumption data: ", err);
      this.isDetailedConsumptionSupplementalLoadingResults = false;
      this.isDetailedConsumptionSupplementalRequestCompleted = true;
      this.isDetailedConsumptionLoadingResults = false;
      this.isDetailedConsumptionRequestCompleted = true;
    });
  }

  getWeeksDetail(configurationTokens:any[]):any[]{

    let startDate: string | Date;
    let endDate: string | Date;
    if (this.aggregation === "month" || this.aggregation === "week") {
      startDate = this.range.get('start').value;
      endDate = this.range.get('end').value;
    }else{
      startDate = this.selectedLicense.startDate + " 00:00:00";
      endDate = this.selectedLicense.renewalDate + " 00:00:00";
    }
    const licenseStartWeek = new Date(startDate);
    licenseStartWeek.setDate(licenseStartWeek.getDate()-licenseStartWeek.getDay());
    const licenseEndWeek = new Date (endDate);
    licenseEndWeek.setDate(licenseEndWeek.getDate()-licenseEndWeek.getDay());

    const weekStart = licenseStartWeek;
    const weeklyConsumptionDetail = [];

    while(weekStart<=licenseEndWeek) {
      const date = new Date(weekStart);
      date.setDate(date.getDate()+1);
      const week = moment(date).isoWeek();
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate()+6);

      weeklyConsumptionDetail.push({
        weekId:"Week "+ week + " (" + weekStart.toISOString().split("T")[0] + " - " + weekEnd.toISOString().split("T")[0] + ")",
        tokensConsumed:0
      });
      weekStart.setDate(weekStart.getDate()+7);
    }

    configurationTokens.forEach(item =>{
      const i = weeklyConsumptionDetail.findIndex(week => week.weekId === item.weekId);
      if(i!==-1)
        weeklyConsumptionDetail[i].tokensConsumed = item.tokensConsumed;
    })

    return weeklyConsumptionDetail;
  }

  fetchDetailedConsumptionData(pageNumber = 0, pageSize = 6) {
    this.detailedConsumptionData = [];
    this.isDetailedConsumptionLoadingResults = true;
    this.isDetailedConsumptionRequestCompleted = false;
    this.licenseConsumptionService.getLicenseConsumptionDetails(this.buildRequestObject("", pageNumber, pageSize)).subscribe((res: any) => {
      res.usage.forEach(item => {
        this.getNameOfDays(item.usageDays);
      });
      this.detailedConsumptionData = res.usage;
      this.detailedConsumptionDataLength = res.usageTotalCount;
      this.isDetailedConsumptionLoadingResults = false;
      this.isDetailedConsumptionRequestCompleted = true;
    }, (err: any) => {
      console.error("Error fetching detailed license consumption data: ", err);
      this.isDetailedConsumptionLoadingResults = false;
      this.isDetailedConsumptionRequestCompleted = true;
    });
  }

  private getNameOfDays(list:any[]):void{
      list.forEach((dayNumber,index) => list[index] = this.daysOfWeek[dayNumber]);
  }

  private formatTokenConsumption(tokenConsumption: any):any[]{
    let AutomationTokens = tokenConsumption.AutomationPlatform ?? 0;
    let  ConfigurationTokens = tokenConsumption.Configuration ?? 0;
    const totalConsumption =  AutomationTokens + ConfigurationTokens;

    if (this.selectedType === "Configuration")
      AutomationTokens = null;
    if (this.selectedType === "AutomationPlatform")
      ConfigurationTokens = null;

    const consumptionDetail = {
      AutomationPlatformTokensConsumed: AutomationTokens,
      ConfigurationTokensConsumed: ConfigurationTokens,
      tokensConsumed: totalConsumption,
    };

    return [consumptionDetail];
  }

  onChangeLicense(newLicense: any) {
    if (newLicense) {
      this.selectedLicense = this.licensesList.find(item => item.id == newLicense);
      this.startDate = new Date(this.selectedLicense.startDate + " 00:00:00");
      this.endDate = new Date(this.selectedLicense.renewalDate + " 00:00:00");
      this.resetPeriodFilter();
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

  onDelete(consumption: any) {
    this.dialogService.confirmDialog({
      title: 'Confirm Action',
      message: 'Do you want to confirm this action?',
      confirmCaption: 'Confirm',
      cancelCaption: 'Cancel',
    }).subscribe((confirmed) => {
      if (confirmed) {
        this.licenseConsumptionService.deleteLicenseConsumptionDetails(consumption.id).subscribe((res) => {
          this.fetchDataToDisplay();
        });
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  openDialog(component: any, data?: any): void {
    const dialogRef:any = this.dialog.open(component, {
      width: 'auto',
      data: data,
      disableClose: true
    });
    const dialogEvent = dialogRef.componentInstance.updateProjects?.subscribe(()=>{
      this.fetchProjectsList();
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        if (data) // if it comes from license consumption actions
          this.fetchDataToDisplay();
        else{
          this.resetPeriodFilter();
          this.ngOnInit();
        }
      }
      dialogEvent?.unsubscribe();
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
        const dataObject: any = { ...object.selectedRow, ...{endLicensePeriod: this.selectedLicense.renewalDate} };
        if (object.selectedRow.granularity.toLowerCase() === "static" || object.selectedRow.usageType === "AutomationPlatform")
          this.openDialog(StaticConsumptionDetailsComponent, dataObject);
        else
          this.openDialog(ModifyLicenseConsumptionDetailsComponent, dataObject);
        break;
      case this.DELETE:
        this.onDelete(object.selectedRow);
        break;
    }
  }

  getMultipleChoiceAnswer(newValue: any) {
    this.aggregation = newValue.value;
    this.resetCalendar();
    if (this.aggregation === "period"){
      this.range.disable();
      this.fetchAggregatedData();
    }else{
      this.range.enable();
    }
  }

  setMonthAndYear(newDateSelection: Date, datepicker: MatDateRangePicker<any>) {
    this.month = newDateSelection.getMonth() + 1;
    this.year = newDateSelection.getFullYear();
    this.setMonthRange(newDateSelection);
    datepicker.close();
    this.fetchAggregatedData();
  }

  setMonthRange(date: Date){
    const startMonth = date;
    const endMonth = new Date(date.getFullYear(),date.getMonth()+1,0);
    this.range.patchValue({
      start:startMonth,
      end: endMonth
    });
    this.range.patchValue({
      start:startMonth<this.startDate? this.startDate: startMonth,
      end: endMonth>this.endDate? this.endDate : endMonth
    });
  }

  getProject(newValue: any) {
    this.selectedProject = newValue;
    this.fetchAggregatedData();
  }

  getType(newValue: any) {
    this.selectedType = newValue;
    this.fetchAggregatedData();
  }

  getDatePickerPlaceHolder(): string {
    switch (this.aggregation) {
      case 'month':
        return 'Choose Month and Year';
      case 'week':
        return 'Choose a week';
      default:
        return 'Choose a date';
    }
  }

  setWeek(){
    if(this.aggregation=="week")
      this.fetchAggregatedData();
    else
      this.resetCalendar();
  }

  resetCalendar(){
    this.range.patchValue({start:null,end:null});
    this.month = null;
    this.year = null;
  }

  resetPeriodFilter(){
    this.aggregation='period';
    this.resetCalendar();
    this.range.disable();
  }

  onPageChange(event: {pageIndex, pageSize}) {
    this.fetchDetailedConsumptionData(event.pageIndex, event.pageSize)
  }

  ngOnDestroy(): void {
    localStorage.removeItem(Constants.PROJECT);
  }
}
