import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { ReportName } from 'src/app/helpers/report-type';
import { Utility } from 'src/app/helpers/utils';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { Sort } from '@angular/material/sort';
import moment, { Moment } from 'moment';
import { DialogService } from 'src/app/services/dialog.service';
import { ConfirmDialogConst, EndpointColumnsConst, SummaryColumnsConst, TestFeatureandCallReliability, StatsColumnsConst } from 'src/app/helpers/ctaas-detailed-reports';
@Component({
  selector: 'app-detailed-reports',
  templateUrl: './ctaas-detailed-reports.component.html',
  styleUrls: ['./ctaas-detailed-reports.component.css']
})
export class DetailedReportsComponent implements OnInit {

  endpointDisplayedColumns: any = [];
  filename: string = '';
  tableMaxHeight: number;
  title: string = ReportName.FEATURE_FUNCTIONALITY_NAME + " + " + ReportName.CALLING_RELIABILITY_NAME + " + " + ReportName.VQ_NAME;
  types: string = '';
  testPlanNames: string = '';
  status: string = '';
  startDateStr: string = '';
  endDateStr: string = '';
  regionsStr: string = '';
  usersStr:string = '';
  polqaCalls: boolean = false;
  loggedInUserRoles: string[] = [];
  private subaccountDetails: any;
  hasDashboardDetails: boolean = false;
  isLoadingResults = true;
  isRequestCompleted = false;
  reportResponse: any = {};
  canDisableDownloadBtn: boolean = false;
  detailedTestReport: any = [];
  openFlag: any = false;
  lowerDate: any;
  expansionObj: any = {};
  fromMediaTimeStampsList: string[] = [];
  toMediaTimeStampsList: string[] = [];
  otherPartiesMediaTimeStampsList: string[] = [];
  selectedFromMediaStats: any = {};
  selectedToMediaStats: any = {};
  otherPartiesMediaStats: any = {};
  detailedTestFeatureandCallReliability: any = [];
  mediaStatsDisplayedColumns: any = [];
  summaryDisplayedColumns: any = [];
  fromMediaStats: any;
  toMediaStats: any;
  otherpartyMediaStat: any;
  sortAscending: boolean = true;
  sortColumn: string = '';
  clickCount: number = 0;
  originalDetailedTestReport: any[] = [];
  urlStartValue: string;
  urlEndValue: string;
  urlStartValueParsed;
  urlEndValueParsed;
  responseAll: any = null;
  responseFailed: any = null;
  failedIsChecked = false;
  metricsObjTemplate = { 
    polqa: {count: 0, sum: 0},
    jitter: {count: 0, sum: 0},
    roundTrip: {count: 0, sum: 0},
    packetLoss: {count: 0, sum: 0},
    bitrate: {count: 0, sum: 0},
  };
  public readonly NO_MEDIA_STATS_MSG: string = 'No media stats to display';

  constructor
  (
    private msalService: MsalService,
    private ctaasDashboardService: CtaasDashboardService,
    private route: ActivatedRoute,
    private snackBarService: SnackBarService,
    private subaccountService: SubAccountService,
    private dialogService: DialogService,
  ) {}
  /**
   * get logged in account details
   * @returns: any | null
   */
  private getAccountDetails(): any | null {
    return this.msalService.instance.getActiveAccount() || null;
  }

  ngOnInit(): void {
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount()
    const accountDetails = this.getAccountDetails();
    const { idTokenClaims: { roles } } = accountDetails;
    this.loggedInUserRoles = roles;
    this.route.queryParams.subscribe((params: any) => {
      this.subaccountDetails.id = params.subaccountId;
      if (params.type) this.types = params.type;
      if (params.status) this.status = params.status;
      if (params.regions && params.regions != '') this.regionsStr = params.regions;
      if (params.users && params.users != '') this.usersStr = params.users;
      if (params.polqaCalls && params.polqaCalls != '') this.polqaCalls = true;
      this.failedIsChecked = params.status ? true : false;
      this.startDateStr = params.start;
      this.endDateStr = params.end;
      this.parseTitle();
      this.fetchDashboardReportDetails();
    });
    this.initColumns();
    this.calculateTableHeight();
  }
  
  /**
   * fetch detailed dashboard report
   */
  private parseTitle(): void {
    if (this.types == "")
      return;
    if (this.types.includes(",")) {
      const typesArray = this.types.split(",");
      this.title = Utility.getReportNameByReportTypeOrTestPlan(typesArray[0]);
      for (let i = 1; i < typesArray.length; i++) {
        const type = typesArray[i].trim();
        if (type != "")
          this.title += " + " + Utility.getReportNameByReportTypeOrTestPlan(type);
      }
    } else
      this.title = Utility.getReportNameByReportTypeOrTestPlan(this.types);
  }
  
  /**
   * fetch detailed dashboard report
   */
  private parseTestPlanNames(): string {
    if (this.types && this.types.includes(",")) {
      let testPlanNames = "";
      const typesArray = this.types.split(",");
      testPlanNames = Utility.getTAPTestPlaNameByReportTypeOrName(typesArray[0]);
      for (let i = 1; i < typesArray.length; i++) {
        const type = typesArray[i].trim();
        if (type != "")
          testPlanNames += "," + Utility.getTAPTestPlaNameByReportTypeOrName(type);
      }
      return testPlanNames;
    } else
      return Utility.getTAPTestPlaNameByReportTypeOrName(this.types);
  }

  getAll() {
    this.status = '';
    this.failedIsChecked = false;
    this.responseAll ? this.renderData(this.responseAll) : this.fetchDashboardReportDetails();
  }
  getFailed() {
    this.status = 'FAILED';
    this.failedIsChecked = true;
    this.responseFailed ? this.renderData(this.responseFailed) : this.fetchDashboardReportDetails();
  }
  /**
   * fetch detailed dashboard report
   */
  public fetchDashboardReportDetails(): void {
    this.isRequestCompleted = false;
    this.hasDashboardDetails = false;
    this.isLoadingResults = true;
    this.testPlanNames = this.parseTestPlanNames();

    if (!this.status) {
      this.getFailedData();
    }
    this.ctaasDashboardService.getCtaasDashboardDetailedReport(this.subaccountDetails.id, this.testPlanNames, this.startDateStr, this.endDateStr, this.status,
      this.regionsStr, this.usersStr, this.polqaCalls).subscribe((res: any) => {
        this.status ? this.responseFailed = res : this.responseAll = res;
        this.renderData(res);
      }, (error) => {
        this.hasDashboardDetails = false;
        this.isLoadingResults = false;
        this.isRequestCompleted = true;
        console.error("Error while fetching dashboard report: " + error.error);
        this.snackBarService.openSnackBar("Error while fetching dashboard report",'');
      });
  }

  private getFailedData () {
    this.ctaasDashboardService.getCtaasDashboardDetailedReport(this.subaccountDetails.id, this.testPlanNames, this.startDateStr, this.endDateStr, 'FAILED',
        this.regionsStr, this.usersStr, this.polqaCalls).subscribe((res: any) => {
          this.responseFailed = res;
        }, (error) => {
          this.hasDashboardDetails = false;
          this.isLoadingResults = false;
          this.isRequestCompleted = true;
          console.error("Error while fetching dashboard report: " + error.error);
          this.snackBarService.openSnackBar("Error while fetching dashboard report",'');
        });
  }

  private renderData(res: any) {
    this.isRequestCompleted = true;
    this.isLoadingResults = false;
    if (res.response.report && res.response.reportType) {
      this.reportResponse = res.response.report;
      const detailedResponseObj = JSON.parse(JSON.stringify(res.response.report));
      this.ctaasDashboardService.setDetailedReportObject(detailedResponseObj);
      this.filename = res.response.reportType;
      this.hasDashboardDetails = true;
      if (this.reportResponse.endpoints && this.reportResponse.endpoints.length > 0) {
        this.reportResponse.endpoints = this.reportResponse.endpoints.map((e: any) => {
          if (e.city && e.country && e.state && e.zipcode) {
            e.region = `${e.city}, ${e.state}, ${e.country}, ${e.zipcode}`;
          } else {
            e.region = "";
          }
          return e;
        });
      } else {
        this.reportResponse.endpoints = [];
      }
      let minorTime: Moment;
      let majorTime: Moment;
      minorTime = moment(this.reportResponse.results[0].startTime, "MM-DD-YYYY HH:mm:ss");
      majorTime = moment(this.reportResponse.results[this.reportResponse.results.length -1].endTime, "MM-DD-YYYY HH:mm:ss");

      this.detailedTestReport = (this.reportResponse.results && this.reportResponse.results.length > 0) ? this.reportResponse.results : [];
      this.detailedTestReport.forEach((testResult: any, index) => {
        let fromObj = JSON.parse(JSON.stringify(this.metricsObjTemplate));
        let toObj = JSON.parse(JSON.stringify(this.metricsObjTemplate));
        let parsedJitter = 0;
        let parsedRoundTrip = 0;
        let parsedPacketLoss = 0;
        let parsedBitrate = 0;
        if (testResult.from?.mediaStats?.length > 0) {
          testResult.from.mediaStats.forEach((mediaStatsObj: any) => {
            if (!mediaStatsObj.data)
              return;
            if (this.validMetric(mediaStatsObj.data, "Received Jitter")) {
              parsedJitter = Utility.parseMetric(mediaStatsObj.data, "Received Jitter");
              testResult.maxJitterFrom = this.maxValue(parsedJitter, testResult.maxJitterFrom);
              this.updateMetricSum(parsedJitter, fromObj, "jitter");
            }
            if (this.validMetric(mediaStatsObj.data, "Round trip time")) {
              parsedRoundTrip = Utility.parseMetric(mediaStatsObj.data, "Round trip time");
              testResult.maxRoundTripFrom = this.maxValue(parsedRoundTrip, testResult.maxRoundTripFrom);
              this.updateMetricSum(parsedRoundTrip, fromObj, "roundTrip");
            }
            if (this.validMetric(mediaStatsObj.data, "Received packet loss")) {
              parsedPacketLoss = Utility.parseMetric(mediaStatsObj.data, "Received packet loss");
              testResult.maxPacketLossFrom = this.maxValue(parsedPacketLoss, testResult.maxPacketLossFrom);
              this.updateMetricSum(parsedPacketLoss, fromObj, "packetLoss");
            }
            if (this.validMetric(mediaStatsObj.data, "Sent bitrate")) {
              parsedBitrate = Utility.parseMetric(mediaStatsObj.data, "Sent bitrate");
              this.updateMetricSum(parsedBitrate, fromObj, "bitrate");
            }

            if (this.validMetric(mediaStatsObj.data, "POLQA")) {
              let parsedPolqa = Utility.parseMetric(mediaStatsObj.data, "POLQA");
              testResult.fromPolqaMin = this.minValue(parsedPolqa, testResult.fromPolqaMin);
              this.updateMetricSum(parsedPolqa, fromObj, "polqa");
            }
          });
          testResult.from.mediaStats.sort((a, b) => {
            return a.timestamp - b.timestamp
          });

          testResult.fromPolqaAvg = this.average(fromObj.polqa.sum, fromObj.polqa.count);
          testResult.fromAvgJitter = this.average(fromObj.jitter.sum, fromObj.jitter.count);
          testResult.fromAvgRoundTrip = this.average(fromObj.roundTrip.sum, fromObj.roundTrip.count);
          testResult.fromAvgPacketLoss = this.average(fromObj.packetLoss.sum, fromObj.packetLoss.count);
          testResult.fromAvgBitrate = this.average(fromObj.bitrate.sum, fromObj.bitrate.count);

          testResult.fromJitter = this.dataToString(testResult.maxJitterFrom, testResult.fromAvgJitter, "Received Jitter");
          testResult.fromRoundTrip = this.dataToString(testResult.maxRoundTripFrom, testResult.fromAvgRoundTrip, "Round trip time");
          testResult.fromPacketLoss = this.dataToString(testResult.maxPacketLossFrom, testResult.fromAvgPacketLoss, "Received packet loss");
          testResult.fromAvgBitrate = this.dataToString(0, testResult.fromAvgBitrate, "Sent bitrate");

          testResult.fromnoDataFoundFlag = false;
        }
        else
          testResult.fromnoDataFoundFlag = true;

        if (testResult.to?.mediaStats?.length > 0) {
          testResult.to.mediaStats.forEach((mediaStatsObj: any) => {
            if (!mediaStatsObj.data)
              return;
            if (this.validMetric(mediaStatsObj.data, "Received Jitter")) {
              parsedJitter = Utility.parseMetric(mediaStatsObj.data, "Received Jitter");
              testResult.maxJitterTo = this.maxValue(parsedJitter, testResult.maxJitterTo);
              this.updateMetricSum(parsedJitter, toObj, "jitter");
            }
            if (this.validMetric(mediaStatsObj.data, "Round trip time")) {
              parsedRoundTrip = Utility.parseMetric(mediaStatsObj.data, "Round trip time");
              testResult.maxRoundTripTo = this.maxValue(parsedRoundTrip, testResult.maxRoundTripTo);
              this.updateMetricSum(parsedRoundTrip, toObj, "roundTrip");
            }
            if (this.validMetric(mediaStatsObj.data, "Received packet loss")) {
              parsedPacketLoss = Utility.parseMetric(mediaStatsObj.data, "Received packet loss");
              testResult.maxPacketLossTo = this.maxValue(parsedPacketLoss, testResult.maxPacketLossTo);
              this.updateMetricSum(parsedPacketLoss, toObj, "packetLoss");
            }
            if (this.validMetric(mediaStatsObj.data, "Sent bitrate")) {
              parsedBitrate = Utility.parseMetric(mediaStatsObj.data, "Sent bitrate");
              this.updateMetricSum(parsedBitrate, toObj, "bitrate");
            }

            if (this.validMetric(mediaStatsObj.data, "POLQA")) {
              let parsedPolqa = Utility.parseMetric(mediaStatsObj.data, "POLQA");
              testResult.toPolqaMin = this.minValue(parsedPolqa, testResult.toPolqaMin);
              this.updateMetricSum(parsedPolqa, toObj, "polqa");
            }
          });
          testResult.to.mediaStats.sort((a, b) => {
            return a.timestamp - b.timestamp;
          });

          testResult.toPolqaAvg = this.average(toObj.polqa.sum, toObj.polqa.count);
          testResult.toAvgJitter = this.average(toObj.jitter.sum, toObj.jitter.count);
          testResult.toAvgRoundTrip = this.average(toObj.roundTrip.sum, toObj.roundTrip.count);
          testResult.toAvgPacketLoss = this.average(toObj.packetLoss.sum, toObj.packetLoss.count);
          testResult.toAvgBitrate = this.average(toObj.bitrate.sum, toObj.bitrate.count);

          testResult.toJitter = this.dataToString(testResult.maxJitterTo, testResult.toAvgJitter, "Received Jitter");
          testResult.toRoundTrip = this.dataToString(testResult.maxRoundTripTo, testResult.toAvgRoundTrip, "Round trip time");
          testResult.toPacketLoss = this.dataToString(testResult.maxPacketLossTo, testResult.toAvgPacketLoss, "Received packet loss");
          testResult.toAvgBitrate = this.dataToString(0, testResult.toAvgBitrate, "Sent bitrate");

          testResult.tonoDataFoundFlag = false;
        }
        else
          testResult.tonoDataFoundFlag = true;

        const startTime = moment(testResult.startTime, "MM-DD-YYYY HH:mm:ss");
        const endTime = moment(testResult.endTime, "MM-DD-YYYY HH:mm:ss");
        testResult.startTime = startTime.format("MM/DD/YYYY HH:mm:ss");
        testResult.endTime = endTime.format("MM/DD/YYYY HH:mm:ss");
        if (startTime < minorTime)
          minorTime = startTime;
        if (endTime >= majorTime)
          majorTime = endTime;
        testResult.closeKey = false;
        testResult.otherPartynoDataFoundFlag = false;
        testResult.panelOpenState = true;
        testResult.otherParties = (testResult.otherParties && testResult.otherParties.length > 0) ? testResult.otherParties.filter(e => e.hasOwnProperty('mediaStats')) : [];
      });
      this.reportResponse.summary.summaryStartTime = minorTime.format("MM/DD/YYYY HH:mm:ss");
      this.reportResponse.summary.summaryEndTime = majorTime.format("MM/DD/YYYY HH:mm:ss");
    } else {
      this.hasDashboardDetails = false;
      this.reportResponse = {};
    }
  }

  getSelectedFromTimeStamp(event) {
    this.selectedFromMediaStats = event.data;
  }
  getSelectedToTimeStamp(event) {
    this.selectedToMediaStats = event.data;
  }
  getSelectedOtherPartyTimeStamp(event) {
    this.otherPartiesMediaStats = event.data;
  }

  setStep(key: any, index: number, rowIndex) {
    this.openFlag = true;
    this.expansionObj['key' + rowIndex] = index;
    if (key === 'from') {
      if (this.detailedTestReport[rowIndex].from?.mediaStats?.length > 0) {
        this.fromMediaStats = this.detailedTestReport[rowIndex].from.mediaStats[0];
        this.detailedTestReport[rowIndex].fromnoDataFoundFlag = false;
        this.getSelectedFromTimeStamp(this.fromMediaStats);
      } else {
        this.detailedTestReport[rowIndex].fromnoDataFoundFlag = true;
      }
    } else if (key === 'to') {
      if (this.detailedTestReport[rowIndex].to?.mediaStats?.length > 0) {
        this.toMediaStats = this.detailedTestReport[rowIndex].to.mediaStats[0];
        this.detailedTestReport[rowIndex].tonoDataFoundFlag = false;
        this.getSelectedToTimeStamp(this.toMediaStats);
      } else {
        this.detailedTestReport[rowIndex].tonoDataFoundFlag = true;
      }
    } else {
      if (this.detailedTestReport[rowIndex].otherParties[index - 3].mediaStats.length > 0) {
        this.otherpartyMediaStat = this.detailedTestReport[rowIndex].otherParties[index - 3].mediaStats[0];
        this.detailedTestReport[rowIndex].otherPartynoDataFoundFlag = false;
        this.getSelectedOtherPartyTimeStamp(this.otherpartyMediaStat)
      } else {
        this.detailedTestReport[rowIndex].otherPartynoDataFoundFlag = true;
      }
    }
  }

  /**
   * This method got triggered if mat expansion panel is opened
   * @param index: number 
   */
  open(index: number): void {
    setTimeout(() => {
      this.detailedTestReport[index].panelOpenState = false;
    }, 0);

    this.detailedTestReport[index].frompanelOpenState = true;
    this.detailedTestReport[index].topanelOpenState = true;
    this.detailedTestReport[index].from.mediaStats = Utility.sortListInAscendingOrder(this.detailedTestReport[index].from.mediaStats, 'timeStampIndex', true);
    this.detailedTestReport[index].to.mediaStats = Utility.sortListInAscendingOrder(this.detailedTestReport[index].to.mediaStats, 'timeStampIndex', true);
    if (this.detailedTestReport[index].otherParties) // check for null / undefined values
      this.setOtherPartiesPanelStatus(this.detailedTestReport[index].otherParties);
  }
  /**
   * set other parties panel status as true
   * @param data: any[]
   */
  setOtherPartiesPanelStatus(data: any[]): void {
    data.forEach((otherParties) => {
      otherParties.mediaStats = Utility.sortDatesInAscendingOrder(otherParties.mediaStats, 'timestamp')
      otherParties.otherPartyPanelStatus = true;
    });
  }
  /**
   * This method got triggered if mat expansion panel is closed
   * @param index: number 
   */
  close(index: number): void {
    this.detailedTestReport[index].closeKey = true;
    const trueKey = this.detailedTestReport.every(e => e.closeKey);
    if (trueKey) {
      this.openFlag = false;
    }
    this.expansionObj['key' + index] = '';
    this.detailedTestReport[index].panelOpenState = true;
    this.detailedTestReport[index].topanelOpenState = true;
    this.detailedTestReport[index].frompanelOpenState = true
  }

  subpanelOpenState(key: string, index: number, otherIndex?: number) {
    if (index !== undefined && index !== null) {
      const { frompanelOpenState, topanelOpenState, otherParties } = this.detailedTestReport[index];
      switch (key) {
        case 'from':
          this.detailedTestReport[index].frompanelOpenState = !frompanelOpenState;
          this.detailedTestReport[index].topanelOpenState = true;
          break;
        case 'to':
          this.detailedTestReport[index].topanelOpenState = !topanelOpenState;
          this.detailedTestReport[index].frompanelOpenState = true;
          break;
        case 'other':
          this.detailedTestReport[index].otherParties[otherIndex].otherPartyPanelStatus = !otherParties[otherIndex].otherPartyPanelStatus;
          this.detailedTestReport[index].topanelOpenState = true;
          this.detailedTestReport[index].frompanelOpenState = true;
          break;
      }
    }
  }
  /**
   * calculate table height based on the window height
   */
  private calculateTableHeight() {
    this.tableMaxHeight = window.innerHeight // doc height
      - (window.outerHeight * 0.01 * 2) // - main-container margin
      - 60 // - route-content margin
      - 20 // - dashboard-content padding
      - 30 // - table padding
      - 32 // - title height
      - (window.outerHeight * 0.05 * 2); // - table-section margin
  }

  /**
   * initialize the columns settings
   */
  initColumns(): void {
    this.endpointDisplayedColumns = EndpointColumnsConst;
    this.summaryDisplayedColumns = SummaryColumnsConst;
    this.detailedTestFeatureandCallReliability = TestFeatureandCallReliability;
    this.mediaStatsDisplayedColumns = StatsColumnsConst;
  }
  /**
   * download file as excel
   * @param data: any 
   */
  private downloadExcelFile(data: any): void {
    const currentDate = new Date();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const date = currentDate.getDate().toString().padStart(2, '0');
    const year = currentDate.getFullYear().toString();
    const hh = currentDate.getHours();
    const mm = currentDate.getMinutes();
    const ss = currentDate.getSeconds();
    const name = `${this.title}-${month}-${date}-${year} ${hh}.${mm}.${ss}.xlsx`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    a.download = name;
    a.click();
    this.canDisableDownloadBtn = false;
  }

  public isConfirmationRequired() {
    this.status ? this.downloadDetailedTestReportByType() : this.showConfirmDialog();
  }

  private showConfirmDialog() {
    this.dialogService.confirmDialog(ConfirmDialogConst).subscribe((confirmed) => {
      this.downloadDetailedTestReportByType(confirmed);
    });
  }
  /**
   * fetch detailed test report excel sheet 
   */
  public downloadDetailedTestReportByType(confirm = true): void {
    try {
      this.canDisableDownloadBtn = true;
      this.snackBarService.openSnackBar('Downloading report is in progress.Please wait');
      let detailedResponseObj = this.ctaasDashboardService.getDetailedReportyObject();
      if (!confirm) {
        detailedResponseObj = this.responseFailed.response.report;
      }
      
      detailedResponseObj.summary.startTime = this.reportResponse.summary.summaryStartTime;
      detailedResponseObj.summary.endTime = this.reportResponse.summary.summaryEndTime;
      detailedResponseObj.type = this.testPlanNames;
      if (detailedResponseObj) {
        this.ctaasDashboardService.downloadCtaasDashboardDetailedReport(detailedResponseObj)
          .subscribe((res: any) => {
            if (!res.error) this.downloadExcelFile(res);
          }, (error) => {
            this.canDisableDownloadBtn = false;
            console.error('Error with download report request: ' + error.error);
            this.snackBarService.openSnackBar('Error loading downloading report', 'Ok');
          });
      }
    } catch (e) {
      this.canDisableDownloadBtn = false;
      console.error('Error while downloading report:' + e);
      this.snackBarService.openSnackBar('Error loading downloading report', 'Ok');
    }
  }
  /**
   * get mat expansion panel icon by type
   * @param type: boolean
   * @returns: string
   */
  getIconByType(flag: boolean): string { return (flag) ? 'keyboard_arrow_down' : 'keyboard_arrow_up'; }
  
  sortData(sortParameters: Sort): any[]{
    const keyName = sortParameters.active
    if (sortParameters.direction !== '')
      this.reportResponse.endpoints =  Utility.sortingDataTable(this.reportResponse.endpoints, keyName, sortParameters.direction);
    else
      return this.reportResponse.endpoints;
  }

  handleSort(column: string) {
    if (this.originalDetailedTestReport.length === 0) {
      this.originalDetailedTestReport = [...this.detailedTestReport];
    }
    if (this.sortColumn === column) {
      this.clickCount++;
      if (this.clickCount > 2) {
        this.sortColumn = '';
        this.sortAscending = true;
        this.clickCount = 0;
        this.detailedTestReport = [...this.originalDetailedTestReport];
        return;
      } else {
        this.sortAscending = !this.sortAscending;
      }
    } else {
      this.clickCount = 1;
      this.sortAscending = true;
      this.sortColumn = column;
    }
    const sortedList = [...this.detailedTestReport];
      sortedList.sort((a, b) => {
      if (column === 'to') {
        const numA = parseInt(a['to']['DID']);
        const numB = parseInt(b['to']['DID']);

        if (numA < numB) return this.sortAscending ? -1 : 1;
        if (numA > numB) return this.sortAscending ? 1 : -1;
        return 0;
      } else if (column === 'from') {
        const numA = parseInt(a['from']['DID']);
        const numB = parseInt(b['from']['DID']);

        if (numA < numB) return this.sortAscending ? -1 : 1;
        if (numA > numB) return this.sortAscending ? 1 : -1;
        return 0;
      } else {
        if (a[column] === undefined || a[column] === null) return this.sortAscending ? 1 : -1;
        if (b[column] === undefined || b[column] === null) return this.sortAscending ? -1 : 1;
        if (a[column] < b[column]) return this.sortAscending ? -1 : 1;
        if (a[column] > b[column]) return this.sortAscending ? 1 : -1;
        return 0;
      }
    });
      this.detailedTestReport = sortedList;
  }

  private validMetric(metricsObj: any, metric: string): boolean {
      return metricsObj[metric] !== undefined && metricsObj[metric] !== null && metricsObj[metric] !== '--' && metricsObj[metric] !== '';
  }

  private average(sum: number, count: number): string {
    if (sum !== undefined && count > 0) {
      let average = (sum / count);
      return average.toFixed(2);
    }
    return null;
  }

  private dataToString(maxValue: number, avg: string, metric: string) {
    let avgString: any;
    if (avg === null)
      avgString = "N/A";
    else avgString = parseFloat(avg);
    if (metric === "Sent bitrate")
      return "Avg: " + avgString;
    let maxValueString: any;
    if (maxValue === undefined)
      maxValueString = "N/A";
    else maxValueString = parseFloat(maxValue.toString());
    return "Max: " + maxValueString + ", " + "Avg: " + avgString;
  }
  
  private maxValue(number1: number, number2: number) {
    if (number2 === undefined)
      return number1;
    if (number1 > number2) 
        return number1;
    return number2;
  }

  private minValue(number1: number, number2: number) {
    if (number2 === undefined)
      return number1;
    if (number1 < number2) 
        return number1;
    return number2;
  }

  private updateMetricSum(parsedValue: number, objLocation: any, metric: string) {
    objLocation[metric].sum += parsedValue;
    objLocation[metric].count++;
  }
}
