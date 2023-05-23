import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import moment from 'moment';
import { ReportType } from 'src/app/helpers/report-type';
import { Utility } from 'src/app/helpers/utils';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-detailed-reports',
  templateUrl: './ctaas-detailed-reports.component.html',
  styleUrls: ['./ctaas-detailed-reports.component.css']
})
export class DetailedReportsCompoment implements OnInit {

  endpointDisplayedColumns: any = [];
  filename: string = '';
  tableMaxHeight: number;
  title: string = ReportType.FEATURE_FUNCTIONALITY_NAME + " + " + ReportType.CALLING_RELIABILITY_NAME + " + " + ReportType.VQ_NAME;
  types: string = '';
  status: string = '';
  startDateStr: string = '';
  endDateStr: string = '';
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
  obj: any = {};
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
  public readonly NO_MEDIA_STATS_MSG: string = 'No media stats to display';

  constructor(private msalService: MsalService,
    private ctaasDashboardService: CtaasDashboardService,
    private route: ActivatedRoute,
    private snackBarService: SnackBarService,
    private subaccountService: SubAccountService) {}
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
    if (this.types.includes(",")) {
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

  /**
   * fetch detailed dashboard report
   */
  public fetchDashboardReportDetails(): void {
    this.isRequestCompleted = false;
    this.hasDashboardDetails = false;
    this.isLoadingResults = true;
    const PARSED_REPORT_TYPE = this.parseTestPlanNames();
    this.ctaasDashboardService.getCtaasDashboardDetailedReport(this.subaccountDetails.id, PARSED_REPORT_TYPE, this.startDateStr, this.endDateStr, this.status)
      .subscribe((res: any) => {
        this.isRequestCompleted = true;
        this.isLoadingResults = false;
        if (res.response.report && res.response.reportType) {
          this.reportResponse = res.response.report;
          const detailedResponseObj = this.ctaasDashboardService.getDetailedReportyObject();
          detailedResponseObj[this.types] = JSON.parse(JSON.stringify(res.response.report));
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

          this.reportResponse.summary.summaryStartTime =  this.reportResponse.results[0].startTime;
          this.reportResponse.summary.summaryEndTime =  this.reportResponse.results[this.reportResponse.results.length -1].endTime;

          this.detailedTestReport = (this.reportResponse.results && this.reportResponse.results.length > 0) ? this.reportResponse.results : [];
          this.detailedTestReport.forEach((obj: any) => {
            let fromCount = 0;
            let toCount = 0;
            let fromSumarize = 0, toSumarize = 0;
            for(let i=0 ; i< obj.from.mediaStats.length; i ++) {
              if(obj.from.mediaStats[i]?.data.POLQA && obj.from.mediaStats[i]?.data.POLQA !== 0) {
                let fromPolqaSum = parseFloat(obj.from.mediaStats[i].data.POLQA);
                fromSumarize += fromPolqaSum;
                fromCount++;
              }
              if(obj.to.mediaStats[i]?.data.POLQA && obj.to.mediaStats[i]?.data.POLQA !== 0) {
                let toPolqaSum = parseFloat(obj.to.mediaStats[i].data.POLQA);
                toSumarize += toPolqaSum;
                toCount++;
              }
            }
            if(fromSumarize !== 0 && fromCount !== 0 ) {
              let fromAvg = (fromSumarize / fromCount).toFixed(2);
              obj.fromPolqaAvg = fromAvg;
            }
            if(toSumarize !== 0 && toCount !== 0) {
              let toAvg = (toSumarize / toCount).toFixed(2);
              obj.toPolqaAvg = toAvg;
            }
            obj.closeKey = false;
            obj.fromnoDataFoundFlag = false;
            obj.tonoDataFoundFlag = false;
            obj.otherPartynoDataFoundFlag = false;
            obj.panelOpenState = true;
            obj.callType = obj.otherParties.length > 0  ? null : obj.callType
            obj.from.mediaStats.sort((a, b) => {
              return a.timestamp - b.timestamp
            })
            // filter the array without media stats details 
            obj.otherParties = (obj.otherParties && obj.otherParties.length > 0) ? obj.otherParties.filter(e => e.hasOwnProperty('mediaStats')) : [];
          });
        } else {
          this.hasDashboardDetails = false;
          this.reportResponse = {};
        }
      }, (error) => {
        this.hasDashboardDetails = false;
        this.isLoadingResults = false;
        this.isRequestCompleted = true;
        console.error("Error while fetching dashboard report: " + error.error);
        this.snackBarService.openSnackBar("Error while fetching dashboard report",'');
      });
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
    this.obj['key' + rowIndex] = index;
    if (key === 'from') {
      if (this.detailedTestReport[rowIndex].from.mediaStats.length > 0) {
        this.fromMediaStats = this.detailedTestReport[rowIndex].from.mediaStats[0];
        this.detailedTestReport[rowIndex].fromnoDataFoundFlag = false;
        this.getSelectedFromTimeStamp(this.fromMediaStats);
      }
      else {
        this.detailedTestReport[rowIndex].fromnoDataFoundFlag = true;
      }

    }
    else if (key === 'to') {
      if (this.detailedTestReport[rowIndex].to.mediaStats.length > 0) {
        this.toMediaStats = this.detailedTestReport[rowIndex].to.mediaStats[0];
        this.detailedTestReport[rowIndex].tonoDataFoundFlag = false;
        this.getSelectedToTimeStamp(this.toMediaStats);
      }
      else {
        this.detailedTestReport[rowIndex].tonoDataFoundFlag = true;
      }

    }
    else {
      if (this.detailedTestReport[rowIndex].otherParties[index - 3].mediaStats.length > 0) {
        this.otherpartyMediaStat = this.detailedTestReport[rowIndex].otherParties[index - 3].mediaStats[0];
        this.detailedTestReport[rowIndex].otherPartynoDataFoundFlag = false;
        this.getSelectedOtherPartyTimeStamp(this.otherpartyMediaStat)
      }
      else {
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
    this.detailedTestReport[index].from.mediaStats = Utility.sortDatesInAscendingOrder(this.detailedTestReport[index].from.mediaStats, 'timestamp');
    this.detailedTestReport[index].to.mediaStats = Utility.sortDatesInAscendingOrder(this.detailedTestReport[index].to.mediaStats, 'timestamp');
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
    this.obj['key' + index] = '';
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
    this.endpointDisplayedColumns = [
      { name: 'Vendor', dataKey: 'vendor', position: 'left', isSortable: true },
      { name: 'Model', dataKey: 'model', position: 'center', isSortable: true },
      { name: 'DID', dataKey: 'did', position: 'center', isSortable: true },
      { name: 'Firmware', dataKey: 'firmwareVersion', position: 'center', isSortable: true },
      { name: 'Service Provider', dataKey: 'serviceProvider', position: 'center', isSortable: true },
      { name: 'Domain', dataKey: 'domain', position: 'center', isSortable: true },
      { name: 'Region', dataKey: 'region', position: 'center', isSortable: false }
    ];

    this.summaryDisplayedColumns = [
      { header: 'Test Cases Executed', value: 'total' },
      { header: 'Passed', value: 'passed' },
      { header: 'Failed', value: 'failed' },
      { header: 'Start Time', value: 'summaryStartTime' },
      { header: 'End Time', value: 'summaryEndTime' }
    ];

    this.detailedTestFeatureandCallReliability = [
      { header: 'Start Date', value: 'startTime' },
      { header: 'End Date', value: 'endTime' },
      { header: 'Status', value: 'status' },
      { header: 'Call Type', value: 'callType' },
      { header: 'Error Category', value: 'errorCategory' },
      { header: 'Reason', value: 'errorReason' }
    ];
    this.mediaStatsDisplayedColumns = [
      { header: 'Sent packets', value: 'Sent packets' },
      { header: 'Received codec', value: 'Received codec' },
      { header: 'Sent bitrate', value: 'Sent bitrate' },
      { header: 'Received packet loss', value: 'Received packet loss' },
      { header: 'Received Jitter', value: 'Received Jitter' },
      { header: 'Sent codec', value: 'Sent codec' },
      { header: 'Round trip time', value: 'Round trip time' },
      { header: 'Received packets', value: 'Received packets' }
    ]
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
    const name = `${this.types}-${month}-${date}-${year} ${hh}.${mm}.${ss}.xlsx`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    a.download = name;
    a.click();
    this.canDisableDownloadBtn = false;
  }
  /**
   * fetch detailed test report excel sheet 
   */
  public downloadDetailedTestReportByType(): void {
    try {
      this.canDisableDownloadBtn = true;
      this.snackBarService.openSnackBar('Downloading report is in progress.Please wait');
      const detailedResponseObj = this.ctaasDashboardService.getDetailedReportyObject();
      const reportResponse = detailedResponseObj[this.types];
      if (reportResponse) {
        this.ctaasDashboardService.downloadCtaasDashboardDetailedReport(reportResponse)
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
}
