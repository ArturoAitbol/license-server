import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { TableColumn } from 'src/app/model/table-column.model';
import { DialogService } from 'src/app/services/dialog.service';
import { LicenseConsumptionService } from 'src/app/services/license-consumption.service';
import { LicenseService } from 'src/app/services/license.service';
import { AddLicenseConsumptionComponent } from './add-license-consumption/add-license-consumption.component';
import { AddLicenseComponent } from '../licenses/add-license/add-license.component';
import { ModifyLicenseConsumptionDetailsComponent } from './modify-license-consumption-details/modify-license-consumption-details.component';
import { ProjectService } from 'src/app/services/project.service';
import { Constants } from 'src/app/helpers/constants';
import { MsalService } from '@azure/msal-angular';
import { DataTableComponent } from '../../../generics/data-table/data-table.component';
import { StaticConsumptionDetailsComponent } from './static-consumption-details/static-consumption-details.component';
import moment, { Moment } from 'moment';
import { License } from 'src/app/model/license.model';
import { Utility } from 'src/app/helpers/utils';
import { environment } from 'src/environments/environment';
import { AddNewLicenseConsumptionComponent } from './add-new-license-consumption/add-new-license-consumption.component';
import { AddOtherConsumptionComponent } from './add-other-consumption/add-other-consumption.component';
import { permissions } from 'src/app/helpers/role-permissions';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { ConsumptionDetailsComponent } from './consumption-details/consumption-details.component';

@Component({
  selector: 'app-license-consumption',
  templateUrl: './license-consumption.component.html',
  styleUrls: ['./license-consumption.component.css']
})
export class LicenseConsumptionComponent implements OnInit, OnDestroy {
  private readonly TOKEN_CONSUMPTION_DATE = new Date(environment.TOKEN_CONSUMPTION_DATE + ' 00:00:00');
  customerSubaccountDetails: any;
  @ViewChild(MatSort) sort: MatSort;
  projects: any[];
  selectedLicense: any;
  selectedDate: any;
  selectedType: string;
  selectedProject: string;
  startDate: any;
  endDate: any;
  pageSize = 6;
  aggregation = "period";
  licensesList: any = [];
  data: any = [];
  equipmentData = [];
  weeklyConsumptionData = [];
  projectConsumptionData = [];
  detailedConsumptionData = [];
  tokenConsumptionData = [];
  listDetailedConsumptionBK: any[] = [];
  weeklyConsumptionDataBK: any[] = [];
  projectConsumptionDataBK: any[] = [];
  equipmentDataBK: any[] = [];
  licenseForm = this.formBuilder.group({
    selectedLicense: ['']
  });
  range: FormGroup = this.formBuilder.group({
    start: [{ value: '', disabled: true }],
    end: [{ value: '', disabled: true }],
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

  readonly weeklyConsumptionColumns: TableColumn[] = [
    { name: 'Week', dataKey: 'weekId', position: 'left', isSortable: true },
    { name: 'tekTokens', dataKey: 'tokensConsumed', position: 'left', isSortable: true }
  ];

  readonly projectConsumptionColumns: TableColumn[] = [
    { name: 'Project Name', dataKey: 'name', position: 'left', isSortable: true },
    { name: 'Status', dataKey: 'status', position: 'left', isSortable: true },
    { name: 'tekTokens', dataKey: 'tokensConsumed', position: 'left', isSortable: true }
  ];

  public detailedConsumptionColumns: TableColumn[];
  readonly defaultDetailedConsumptionColumns: TableColumn[] = [
    { name: 'Consumption Date', dataKey: 'consumption', position: 'left', isSortable: true },
    { name: 'Project', dataKey: 'projectName', position: 'left', isSortable: true },
    { name: 'Type', dataKey: 'usageType', position: 'left', isSortable: true },
    { name: 'tekTokens Used', dataKey: 'tokensConsumed', position: 'left', isSortable: true },
    { name: 'Usage Days', dataKey: 'usageDays', position: 'left', isSortable: false },
    { name: 'Device', dataKey: 'deviceInfo', position: 'left', isSortable: true },
    { name: 'Calling Platform', dataKey: 'callingPlatformInfo', position: 'left', isSortable: true }
  ];
  readonly ADD_OTHER_CONSUMPTION = 'add-other-consumption';
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
  detailedConsumptionTableSelectable = false;
  newLicenseConsumptionLogicFlag = false;
  hasAddConsumptionPermission = false;
  readonly VIEW_DETAILS: string = 'View Details';
  readonly EDIT: string = 'Edit';
  readonly DELETE: string = 'Delete';

  readonly options = {
    VIEW_DETAILS: this.VIEW_DETAILS,
    EDIT: this.EDIT,
    DELETE: this.DELETE
  }

  licConsumptionActionMenuOptions: string[] = [];

  daysOfWeek = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat'
  };

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private projectService: ProjectService,
    private licenseService: LicenseService,
    private licenseConsumptionService: LicenseConsumptionService,
    public dialog: MatDialog,
    private msalService: MsalService,
    private subaccountService: SubAccountService
  ) { }

  ngOnInit(): void {
    this.detailedConsumptionColumns = this.defaultDetailedConsumptionColumns;
    this.getCutomerDetails()
    const roles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    const premissionsMatchIndex = roles?.findIndex((role: string) => permissions[role].elements.indexOf('addLicenseConsumption') !== -1);
    if (premissionsMatchIndex >= 0)
      this.hasAddConsumptionPermission = true;
    const projectItem: string = localStorage.getItem(Constants.PROJECT);
    const projectObject = JSON.parse(projectItem);
    if (projectItem)
      this.selectedProject = projectObject.id;
    this.customerSubaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.licenseService.getLicenseList(this.customerSubaccountDetails.id).subscribe((res: any) => {
      if (!res.error && res.licenses.length > 0) {
        this.licensesList = res.licenses;
        if (projectItem) {
          this.setSelectedLicense(res.licenses.filter(license => license.id === projectObject.licenseId)[0])
        } else {
          this.setSelectedLicense(res.licenses[0]);
        }
        this.licenseForm.patchValue({ selectedLicense: this.selectedLicense.id });
        this.isLicenseListLoaded = true;
        this.fetchDataToDisplay();
        this.fetchProjectsList();
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
  }

  getCutomerDetails() {
    this.subaccountService.subaccountData.subscribe(subaccountResp => {
      this.customerSubaccountDetails = subaccountResp
    });
  }

  private setSelectedLicense(license: License) {
    this.selectedLicense = license;
    this.startDate = new Date(this.selectedLicense.startDate + ' 00:00:00');
    this.endDate = new Date(this.selectedLicense.renewalDate + ' 00:00:00');
    this.customerSubaccountDetails.licenseId = license.id;
    if (this.startDate >= this.TOKEN_CONSUMPTION_DATE)
      this.newLicenseConsumptionLogicFlag = true;
    else
      this.newLicenseConsumptionLogicFlag = false;
    this.subaccountService.setSelectedSubAccount(this.customerSubaccountDetails);
    this.getActionMenuOptions();
    this.defineDetailedConsumptionsTableColumns();
  }

  fetchDataToDisplay() {
    this.fetchSummaryData();
    this.fetchEquipment();
    this.fetchAggregatedData();
  }

  private checkIfOnlyViewIsPresent(): boolean {
    if (this.licConsumptionActionMenuOptions.length === 1 && this.licConsumptionActionMenuOptions[0] === this.VIEW_DETAILS)
      return true;
    return false;
  }

  private defineDetailedConsumptionsTableColumns() {
    this.detailedConsumptionColumns = this.defaultDetailedConsumptionColumns;
    if (!this.checkIfOnlyViewIsPresent()) {
      if (!this.newLicenseConsumptionLogicFlag)
        this.licConsumptionActionMenuOptions.splice(1, 1);
    }
  }

  private getActionMenuOptions() {
    this.licConsumptionActionMenuOptions = [];
    const roles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    this.licConsumptionActionMenuOptions = Utility.getTableOptions(roles, this.options, "licConsumptionOptions");
    if (!this.checkIfOnlyViewIsPresent()) {
      if (this.newLicenseConsumptionLogicFlag)
        this.licConsumptionActionMenuOptions.shift();
    }
  }

  private buildRequestObject(view: string, pageNumber?: number, pageSize?: number) {
    const requestObject: any = {
      subaccount: this.customerSubaccountDetails.id,
      licenseId: this.selectedLicense.id,
      view: view,
    };
    if (this.selectedProject) { requestObject.project = this.selectedProject; }
    if (this.selectedType) { requestObject.type = this.selectedType; }
    if (pageNumber != null && pageSize != null) {
      requestObject.limit = pageSize;
      requestObject.offset = pageSize * pageNumber;
    }
    /*
      if it is the license consumption division and week filter is selected
      then send the start and end dates as the beginning and end of this week
    */
    if (view === '' && (this.aggregation === 'week' || this.aggregation === 'month')) {
      requestObject.startDate = this.range.get('start').value.format('YYYY-MM-DD');
      requestObject.endDate = this.range.get('end').value.format('YYYY-MM-DD');
    }
    return requestObject;
  }

  fetchProjectsList() {
    this.projectService.getProjectDetailsByLicense(this.customerSubaccountDetails.id, this.selectedLicense.id).subscribe((res: any) => {
      if (!res.error && res.projects) {
        this.projects = res.projects;
      }
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
    this.licenseConsumptionService.getLicenseConsumptionDetails(this.buildRequestObject('summary')).subscribe((response: any) => {
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
      console.error('Error fetching summary data: ', error);
      this.isLicenseSummaryLoadingResults = false;
      this.isLicenseSummaryRequestCompleted = true;
    });
  }

  fetchEquipment() {
    this.equipmentData = [];
    this.isEquipmentSummaryLoadingResults = true;
    this.isEquipmentSummaryRequestCompleted = false;
    this.licenseConsumptionService.getLicenseConsumptionDetails(this.buildRequestObject('equipment')).subscribe((res: any) => {
      this.equipmentData = res.equipmentSummary;
      this.isEquipmentSummaryLoadingResults = false;
      this.isEquipmentSummaryRequestCompleted = true;
      this.equipmentDataBK = [...res['equipmentSummary']];
    }, (err: any) => {
      console.error('Error fetching equipment data: ', err);
      this.isEquipmentSummaryLoadingResults = false;
      this.isEquipmentSummaryRequestCompleted = true;
    });
  }

  fetchAggregatedData(pageNumber = 0, pageSize = this.pageSize) {
    this.weeklyConsumptionData = [];
    this.projectConsumptionData = [];
    this.detailedConsumptionData = [];
    this.tokenConsumptionData = [];
    if (this.selectedLicense) {
      this.isDetailedConsumptionSupplementalLoadingResults = true;
      this.isDetailedConsumptionSupplementalRequestCompleted = false;
      this.isDetailedConsumptionLoadingResults = true;
      this.isDetailedConsumptionRequestCompleted = false;
      this.licenseConsumptionService.getLicenseConsumptionDetails(this.buildRequestObject('', pageNumber, pageSize)).subscribe((res: any) => {
        this.detailedConsumptionData = this.formatUsageData(res.usage);
        this.detailedConsumptionDataLength = res.usageTotalCount;
        this.weeklyConsumptionData = this.getWeeksDetail(res.weeklyConsumption);
        this.projectConsumptionData = res.projectConsumption;
        this.tokenConsumptionData = this.formatTokenConsumption(res.tokenConsumption);
        this.detailsConsumptionTable.setPageIndex(0);
        this.isDetailedConsumptionSupplementalLoadingResults = false;
        this.isDetailedConsumptionSupplementalRequestCompleted = true;
        this.isDetailedConsumptionLoadingResults = false;
        this.isDetailedConsumptionRequestCompleted = true;
        this.listDetailedConsumptionBK = [...res['usage']];
        this.weeklyConsumptionDataBK = [...res['weeklyConsumption']];
        this.projectConsumptionDataBK = [...res['projectConsumption']];
      }, (err: any) => {
        console.error('Error fetching detailed license consumption data: ', err);
        this.isDetailedConsumptionSupplementalLoadingResults = false;
        this.isDetailedConsumptionSupplementalRequestCompleted = true;
        this.isDetailedConsumptionLoadingResults = false;
        this.isDetailedConsumptionRequestCompleted = true;
      });
    }
  }

  private getWeeksDetail(weeklyConsumption: any[]): any[] {
    let licenseStartWeek: Moment;
    let licenseEndWeek: Moment;
    if (this.aggregation === "month" || this.aggregation === "week") {
      licenseStartWeek = moment.utc(this.range.get('start').value);
      licenseEndWeek = moment.utc(this.range.get('end').value);
    } else {
      licenseStartWeek = moment.utc(this.selectedLicense.startDate + " 00:00:00");
      const currentDate = moment.utc();
      const endLicenseDate = moment.utc(this.selectedLicense.renewalDate + " 00:00:00");
      licenseEndWeek = currentDate.isAfter(endLicenseDate) ? endLicenseDate : currentDate;
    }
    licenseStartWeek.subtract(licenseStartWeek.day(), "days");
    licenseEndWeek.subtract(licenseEndWeek.day(), "days");

    const selectedWeek = licenseEndWeek;
    const weeklyConsumptionDetail = [];

    while (selectedWeek >= licenseStartWeek) {
      const date = moment.utc(selectedWeek);
      date.add(1, 'days');
      const week = moment(date).isoWeek();

      const weekEnd = moment.utc(selectedWeek);
      weekEnd.add(6, 'days');

      weeklyConsumptionDetail.push({
        weekId: "Week " + week + " (" + selectedWeek.format("YYYY-MM-DD") + " - " + weekEnd.format("YYYY-MM-DD") + ")",
        tokensConsumed: 0
      });
      selectedWeek.subtract(7, "days");
    }

    const notFoundWeeks: any[] = [];
    weeklyConsumption.forEach(item => {
      const i = weeklyConsumptionDetail.findIndex(week => week.weekId === item.weekId);
      if (i !== -1)
        weeklyConsumptionDetail[i].tokensConsumed = item.tokensConsumed;
      else
        notFoundWeeks.push(item);
    });

    return notFoundWeeks.concat(weeklyConsumptionDetail);
  }

  fetchDetailedConsumptionData(pageNumber = 0, pageSize = 6) {
    this.detailedConsumptionData = [];
    this.isDetailedConsumptionLoadingResults = true;
    this.isDetailedConsumptionRequestCompleted = false;
    this.licenseConsumptionService.getLicenseConsumptionDetails(this.buildRequestObject('', pageNumber, pageSize)).subscribe((res: any) => {
      this.detailedConsumptionData = this.formatUsageData(res.usage);
      this.detailedConsumptionDataLength = res.usageTotalCount;
      this.isDetailedConsumptionLoadingResults = false;
      this.isDetailedConsumptionRequestCompleted = true;
    }, (err: any) => {
      console.error('Error fetching detailed license consumption data: ', err);
      this.isDetailedConsumptionLoadingResults = false;
      this.isDetailedConsumptionRequestCompleted = true;
    });
  }

  private formatUsageData(usage: any[]) {
    usage.forEach(item => {
      item.deviceInfo = `${item.device.type}: ${item.device.vendor} - ${item.device.product} ${item.device.version}`;
      item.callingPlatformInfo = !item.callingPlatform ? "" : `${item.callingPlatform.type}: ${item.callingPlatform.vendor} - ${item.callingPlatform.product} ${item.callingPlatform.version}`;
      if (!this.newLicenseConsumptionLogicFlag && (item.device.granularity.toLowerCase() === 'static' || item.usageType === 'AutomationPlatform'))
        item.usageDays = "...";
      else
        this.getNameOfDays(item.usageDays);
    });
    return usage;
  }

  private getNameOfDays(list: any[]): void {
    list.forEach((dayNumber, index) => list[index] = this.daysOfWeek[dayNumber]);
  }

  private formatTokenConsumption(tokenConsumption: any): any[] {
    let automationTokens = tokenConsumption.AutomationPlatform ?? 0;
    let configurationTokens = tokenConsumption.Configuration ?? 0;
    const totalConsumption = automationTokens + configurationTokens;

    if (this.selectedType === 'Configuration') {
      automationTokens = null;
    }
    if (this.selectedType === 'AutomationPlatform') {
      configurationTokens = null;
    }

    const consumptionDetail = {
      AutomationPlatformTokensConsumed: automationTokens,
      ConfigurationTokensConsumed: configurationTokens,
      tokensConsumed: totalConsumption,
    };

    return [consumptionDetail];
  }

  onChangeLicense(newLicenseId: string) {
    if (newLicenseId) {
      this.selectedProject = "";
      this.setSelectedLicense(this.licensesList.find(item => item.id === newLicenseId));
      this.resetPeriodFilter();
      this.fetchDataToDisplay();
      this.fetchProjectsList();
    }
  }

  onChangeToggle(event: any): void {
    switch (event.value) {
      case this.ADD_LICENSE:
        this.openDialog(AddLicenseComponent);
        break;
      case this.ADD_OTHER_CONSUMPTION:
        this.openDialog(AddOtherConsumptionComponent, this.selectedLicense);
        break;
      case this.ADD_LICENSE_CONSUMPTION:
        if (this.startDate >= this.TOKEN_CONSUMPTION_DATE)
          this.openDialog(AddNewLicenseConsumptionComponent, this.selectedLicense);
        else
          this.openDialog(AddLicenseConsumptionComponent, this.selectedLicense);
        break;
    }
  }

  onDelete(consumption: any) {
    this.dialogService.confirmDialog({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete ' + consumption.projectName + '?',
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

  openDialog(component: any, data?: any, width?: any): void {
    const dialogRef: any = this.dialog.open(component, {
      width: width ? width : 'auto',
      data: data,
      disableClose: true
    });
    const dialogEvent = dialogRef.componentInstance.updateProjects?.subscribe(() => {
      this.fetchProjectsList();
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        if (data) { // if it comes from license consumption actions
          this.fetchDataToDisplay();
        } else {
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
 * @param data: any[]
 */
  sortData(sortParameters: Sort, data: any[], listName: string): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc') {
      data = data.sort((a: any, b: any) => {
        if (typeof a[keyName] === 'number')
          return +a[keyName] > +b[keyName] ? 1 : (+a[keyName] < +b[keyName] ? -1 : 0);
        return a[keyName].localeCompare(b[keyName]);
      });
    } else if (sortParameters.direction === 'desc') {
      data = data.sort((a: any, b: any) => {
        if (typeof a[keyName] === 'number')
          return +a[keyName] < +b[keyName] ? 1 : (+a[keyName] > +b[keyName] ? -1 : 0);
        return b[keyName].localeCompare(a[keyName]);
      });
    } else {
      switch (listName) {
        case 'detailedList':
          return this.detailedConsumptionData = [...this.listDetailedConsumptionBK];
        case 'projectList':
          return this.projectConsumptionData = [...this.projectConsumptionDataBK];
        case 'weeklyList':
          return this.weeklyConsumptionData = [...this.weeklyConsumptionDataBK];
        case 'equipmentList':
          return this.equipmentData = [...this.equipmentDataBK];
        default:
          break;
      }
    }
  }
  /**
   * action row click event
   * @param object: { selectedRow: any, selectedOption: string, selectedIndex: string }
   */
  licConsumptionRowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    switch (object.selectedOption) {
      case this.VIEW_DETAILS:
        this.openDialog(ConsumptionDetailsComponent, object.selectedRow, '600px');
        break;
      case this.EDIT:
        const dataObject: any = { ...object.selectedRow, ...{ endLicensePeriod: this.selectedLicense.renewalDate } };
        if (object.selectedRow.device.granularity.toLowerCase() === "static" || object.selectedRow.usageType === "AutomationPlatform")
          this.openDialog(StaticConsumptionDetailsComponent, dataObject);
        else
          this.openDialog(ModifyLicenseConsumptionDetailsComponent, dataObject);
        break;
      case this.DELETE:
        this.onDelete(object.selectedRow);
        break;
    }
  }

  getMultipleChoiceAnswer(newValue: string) {
    this.aggregation = newValue;
    this.resetCalendar();
    if (this.aggregation === 'period') {
      this.range.disable();
      this.fetchAggregatedData();
    } else {
      this.range.enable();
    }
  }

  setMonthAndYear(newDateSelection: Moment, datepicker?: MatDateRangePicker<any>) {
    const startMonth = newDateSelection.startOf('month');
    const endMonth = newDateSelection.clone().add(1, 'month').startOf('month');
    this.range.patchValue({
      start: startMonth < this.startDate ? moment(this.startDate) : startMonth,
      end: endMonth > this.endDate ? moment(this.endDate) : endMonth
    });
    if (datepicker) datepicker.close();
    this.fetchAggregatedData();
  }

  getProject(projectId: string) {
    this.selectedProject = projectId;
    this.fetchAggregatedData();
  }

  getType(type: string) {
    this.selectedType = type;
    this.fetchAggregatedData();
  }

  getDatePickerLabel(): string {
    switch (this.aggregation) {
      case 'month':
        return 'Choose Month and Year';
      case 'week':
        return 'Choose a week';
      default:
        return 'Choose a date';
    }
  }

  setWeek() {
    if (this.aggregation === 'week') {
      this.fetchAggregatedData();
    } else {
      this.resetCalendar();
    }
  }

  resetCalendar() {
    this.range.patchValue({ start: null, end: null });
  }

  resetPeriodFilter() {
    this.aggregation = 'period';
    this.resetCalendar();
    this.range.disable();
  }

  onPageChange(event: { pageIndex, pageSize }) {
    this.pageSize = event.pageSize;
    this.fetchDetailedConsumptionData(event.pageIndex, event.pageSize);
  }

  toggleSelectableConsumptions() {
    this.detailedConsumptionTableSelectable = !this.detailedConsumptionTableSelectable;
  }

  cloneConsumptions() {
    this.openDialog(AddLicenseConsumptionComponent, { ...this.selectedLicense, selectedConsumptions: this.detailsConsumptionTable.selection.selected });
    this.toggleSelectableConsumptions();
    this.detailsConsumptionTable.selection.clear();
  }

  ngOnDestroy(): void {
    localStorage.removeItem(Constants.PROJECT);
  }
}
