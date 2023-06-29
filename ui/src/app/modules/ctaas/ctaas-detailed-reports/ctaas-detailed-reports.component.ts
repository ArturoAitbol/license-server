import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { ReportName } from 'src/app/helpers/report-type';
import { Utility } from 'src/app/helpers/utils';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { Sort } from '@angular/material/sort';
import { objKeys } from '@microsoft/applicationinsights-core-js';
import moment from 'moment';
@Component({
  selector: 'app-detailed-reports',
  templateUrl: './ctaas-detailed-reports.component.html',
  styleUrls: ['./ctaas-detailed-reports.component.css']
})
export class DetailedReportsCompoment implements OnInit {

  endpointDisplayedColumns: any = [];
  filename: string = '';
  tableMaxHeight: number;
  title: string = ReportName.FEATURE_FUNCTIONALITY_NAME + " + " + ReportName.CALLING_RELIABILITY_NAME + " + " + ReportName.VQ_NAME;
  types: string = '';
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
  sortAscending: boolean = true;
  sortColumn: string = '';
  clickCount: number = 0;
  originalDetailedTestReport: any[] = [];
  metricsObj: any;
  urlStartValue: string;
  urlEndValue: string;
  urlStartValueParsed;
  urlEndValueParsed;
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
      if (params.regions && params.regions != '') this.regionsStr = params.regions;
      if (params.users && params.users != '') this.usersStr = params.users;
      if (params.polqaCalls && params.polqaCalls != '') this.polqaCalls = true;
      this.startDateStr = params.start;
      this.endDateStr = params.end;
      this.parseTitle();
      this.fetchDashboardReportDetails();
    });
    this.initColumns();
    this.calculateTableHeight();
    // this.urlStartValue = this.route.snapshot.queryParamMap.get('start');
    // this.urlEndValue = this.route.snapshot.queryParamMap.get('end');
    // this.urlEndValueParsed = new Date(this.urlEndValue);
    // const utcDate = new Date(this.urlEndValueParsed.getTime() + this.urlEndValueParsed.getTimezoneOffset() * 60000);
    // console.log("end value "+utcDate.toISOString());
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

  /**
   * fetch detailed dashboard report
   */
  public fetchDashboardReportDetails(): void {
    this.isRequestCompleted = false;
    this.hasDashboardDetails = false;
    let minorTime;
    let minorTimestamp;
    let minorTimeIndex = 0;
    let majorTime;
    let majorTimestamp;
    let majorTimeIndex = 0;
    this.isLoadingResults = true;
    const PARSED_REPORT_TYPE = this.parseTestPlanNames();
    this.ctaasDashboardService.getCtaasDashboardDetailedReport(this.subaccountDetails.id, PARSED_REPORT_TYPE, this.startDateStr, this.endDateStr, this.status,
      this.regionsStr, this.usersStr, this.polqaCalls).subscribe((res: any) => {
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
          minorTime =  this.reportResponse.results[0].startTime;
          minorTimestamp = new Date(minorTime).getTime();
          majorTime = this.reportResponse.results[this.reportResponse.results.length -1].endTime;
          majorTimestamp = new Date(majorTime).getTime();

          this.detailedTestReport = (this.reportResponse.results && this.reportResponse.results.length > 0) ? this.reportResponse.results : [];
          this.detailedTestReport.forEach((obj: any, index) => {
            this.metricsObj = obj;
            let fromCount = 0;
            let toCount = 0;
            let fromSumarize = 0, toSumarize = 0;
            let minFromPOLQA = 100;
            let minToPOLQA = 100;
            let parsedJitter = 0;
            let fromMaxJitter = 0;
            let toMaxJitter = 0;
            let parsedRoundTrip = 0;
            let fromMaxRoundTrip = 0;
            let toMaxRoundTrip = 0;
            let parsedPacketLoss = 0;
            let fromMaxPacketLoss = 0;
            let toMaxPacketLoss = 0;
            let fromBitrateSum = 0;
            let fromAvgBitrate = 0;
            let fromBitrateCount = 0;
            let toBitrateSum = 0;
            let toAvgBitrate = 0;
            let toBitrateCount = 0;
            let parsedBitrate = 0;
            let fromJitterSum = 0;
            let fromJitterCount = 0;
            let fromRoundTripSum = 0;
            let fromRoundTripCount = 0;
            let fromPacketLossSum = 0;
            let fromPacketLossCount = 0;
            let toJitterSum = 0;
            let toJitterCount = 0;
            let toRoundTripSum = 0;
            let toRoundTripCount = 0;
            let toPacketLossSum = 0;
            let toPacketLossCount = 0;
            if(obj.from?.mediaStats){
              for(let i=0 ; i< obj.from.mediaStats.length; i ++) {
                if(this.validMetric("from" ,i, "Received Jitter")){
                  parsedJitter = this.parseMertic("from", i, "Received Jitter" );
                  if (parsedJitter > fromMaxJitter) {
                    fromMaxJitter = parsedJitter;
                    obj.maxJitterFrom = fromMaxJitter;
                  }
                  fromJitterSum += parsedJitter;
                  fromJitterCount++;
                }
                if(this.validMetric("from", i, "Round trip time")){
                  parsedRoundTrip = this.parseMertic("from", i, "Round trip time" );
                  if (parsedRoundTrip > fromMaxRoundTrip) {
                    fromMaxRoundTrip = parsedRoundTrip;
                    obj.maxRoundTripFrom = fromMaxRoundTrip;
                  }
                  fromRoundTripSum += parsedRoundTrip;
                  fromRoundTripCount++;
                }
                if(this.validMetric("from", i, "Received packet loss")){
                  parsedPacketLoss = this.parseMertic("from", i, "Received packet loss");
                  if (parsedPacketLoss >= fromMaxPacketLoss) {
                    fromMaxPacketLoss = parsedPacketLoss;
                    obj.maxPacketLossFrom = fromMaxPacketLoss;
                  }
                  fromPacketLossSum += parsedPacketLoss;
                  fromPacketLossCount++;
                }
                if(this.validMetric("from", i, "Sent bitrate")){
                  parsedBitrate = this.parseMertic("from", i, "Sent bitrate");
                  fromBitrateSum += parsedBitrate;
                  fromBitrateCount++;
                }
        
                if(obj.from?.mediaStats[i]?.data?.POLQA !== undefined && obj.from?.mediaStats[i]?.data?.POLQA !== null ){
                  if (obj.from?.mediaStats[i]?.data?.POLQA < minFromPOLQA  && obj.from?.mediaStats[i]?.data?.POLQA !== 0 ) {
                    minFromPOLQA = obj.from?.mediaStats[i]?.data?.POLQA;
                    obj.fromPolqaMin = minFromPOLQA;
                  }
                }
                if(obj.to?.mediaStats[i]?.data?.POLQA !== undefined && obj.to?.mediaStats[i]?.data?.POLQA !== null ){
                  if (obj.to?.mediaStats[i]?.data?.POLQA < minToPOLQA  && obj.to?.mediaStats[i]?.data?.POLQA !== 0 ) {
                    minToPOLQA = obj.to?.mediaStats[i]?.data?.POLQA;
                    obj.toPolqaMin = minToPOLQA;
                  }
                }
                if(obj.from?.mediaStats[i]?.data?.POLQA && obj.from?.mediaStats[i]?.data?.POLQA !== 0 ) {
                  let fromPolqaSum = parseFloat(obj.from.mediaStats[i].data.POLQA);
                  fromSumarize += fromPolqaSum;
                  fromCount++;
                }
              }
              obj.from.mediaStats.sort((a, b) => {
                return a.timestamp - b.timestamp
              })
            }
            if(obj.to?.mediaStats){
              for(let i=0 ; i< obj.to.mediaStats.length; i ++) {
                if(obj.to?.mediaStats[i]?.data?.POLQA && obj.to?.mediaStats[i]?.data?.POLQA !== 0) {
                  let toPolqaSum = parseFloat(obj.to.mediaStats[i].data.POLQA);
                  toSumarize += toPolqaSum;
                  toCount++;
                }
                if(this.validMetric("to" ,i, "Received Jitter")){
                  parsedJitter = this.parseMertic("to", i, "Received Jitter" );
                  if (parsedJitter > toMaxJitter) {
                    toMaxJitter = parsedJitter;
                    obj.maxJitterTo = toMaxJitter;
                  }
                  toJitterSum += parsedJitter;
                  toJitterCount++;
                }
                if(this.validMetric("to", i, "Round trip time")){
                  parsedRoundTrip = this.parseMertic("to", i, "Round trip time" );
                  if (parsedRoundTrip > toMaxRoundTrip) {
                    toMaxRoundTrip = parsedRoundTrip;
                    obj.maxRoundTripTo = toMaxRoundTrip;
                  }
                  toRoundTripSum += parsedRoundTrip;
                  toRoundTripCount++;
                }
                if(this.validMetric("to", i, "Received packet loss")){
                  parsedPacketLoss = this.parseMertic("to", i, "Received packet loss");
                  if (parsedPacketLoss >= toMaxPacketLoss) {
                    toMaxPacketLoss = parsedPacketLoss;
                    obj.maxPacketLossTo = toMaxPacketLoss;
                  }
                  toPacketLossSum += parsedPacketLoss;
                  toPacketLossCount++;
                }
                if(this.validMetric("to", i, "Sent bitrate")){
                  parsedBitrate = this.parseMertic("to", i, "Sent bitrate");
                  toBitrateSum += parsedBitrate;
                  toBitrateCount++;
                }
              }
              obj.to.mediaStats.sort((a, b) => {
                return a.timestamp - b.timestamp
              })
            }
            if(fromSumarize !== 0 && fromCount !== 0 ) {
              let fromAvg = (fromSumarize / fromCount).toFixed(2);
              obj.fromPolqaAvg = fromAvg;
            }
            if(toSumarize !== 0 && toCount !== 0) {
              let toAvg = (toSumarize / toCount).toFixed(2);
              obj.toPolqaAvg = toAvg;
            }
            if(fromBitrateSum !== 0 && fromBitrateCount !== 0 ) {
              let fromAvgBitrate = (fromBitrateSum / fromBitrateCount).toFixed(2);
              obj.fromAvgBitrate = fromAvgBitrate;
            }
            if(toBitrateSum !== 0 && toBitrateCount !== 0 ) {
              let toAvgBitrate = (toBitrateSum / toBitrateCount).toFixed(2);
              obj.toAvgBitrate = toAvgBitrate;
            }
            obj.fromAvgJitter =this.average(fromJitterSum, fromJitterCount);
            obj.fromAvgRoundTrip =this.average(fromRoundTripSum, fromRoundTripCount);
            obj.fromAvgPacketLoss =this.average(fromPacketLossSum, fromPacketLossCount);
            obj.toAvgJitter =this.average(toJitterSum, toJitterCount);
            obj.toAvgRoundTrip =this.average(toRoundTripSum, toRoundTripCount);
            obj.toAvgPacketLoss =this.average(toPacketLossSum, toPacketLossCount);

            obj.fromJitter = this.dataToString(obj.maxJitterFrom, obj.fromAvgJitter, "Received Jitter");
            obj.toJitter = this.dataToString(obj.maxJitterTo, obj.toAvgJitter, "Received Jitter");
            obj.fromRoundTrip = this.dataToString(obj.maxRoundTripFrom, obj.fromAvgRoundTrip, "Round trip time");
            obj.toRoundTrip = this.dataToString(obj.maxRoundTripTo, obj.toAvgRoundTrip, "Round trip time");
            obj.fromPacketLoss = this.dataToString(obj.maxPacketLossFrom, obj.fromAvgPacketLoss, "Received packet loss");
            obj.toPacketLoss = this.dataToString(obj.maxPacketLossFrom, obj.fromAvgPacketLoss, "Received packet loss");
            obj.fromAvgBitrate = this.dataToString(0, obj.fromAvgBitrate, "Sent bitrate");
            obj.toAvgBitrate = this.dataToString(0, obj.toAvgBitrate, "Sent bitrate");

            let startTimeTimeStamp = new Date(obj.startTime).getTime();
            let endTimeTimeStamp = new Date(obj.endTime).getTime();
            obj.startTime = moment.utc(obj.startTime).format("MM/DD/YYYY HH:mm:ss");
            obj.endTime = moment.utc(obj.endTime).format("MM/DD/YYYY HH:mm:ss");
            if(startTimeTimeStamp < minorTimestamp){
              minorTimestamp = startTimeTimeStamp;
              minorTimeIndex = index;
            }
            if(endTimeTimeStamp >= majorTimestamp){
              majorTimestamp = endTimeTimeStamp;
              majorTimeIndex = index;
            }
            obj.closeKey = false;
            obj.fromnoDataFoundFlag = false;
            obj.tonoDataFoundFlag = false;
            obj.otherPartynoDataFoundFlag = false;
            obj.panelOpenState = true;
            obj.otherParties = (obj.otherParties && obj.otherParties.length > 0) ? obj.otherParties.filter(e => e.hasOwnProperty('mediaStats')) : [];
          });
          this.reportResponse.summary.summaryStartTime = this.reportResponse.results[minorTimeIndex].startTime; //
          this.reportResponse.summary.summaryEndTime =  this.reportResponse.results[majorTimeIndex].endTime;
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
      { header: 'Reason', value: 'errorReason' },
      { header: 'From Jitter (ms)', value: 'fromJitter' },
      { header: 'To Jitter (ms)', value: 'toJitter' },
      { header: 'From Round trip time (ms)', value: 'fromRoundTrip' },
      { header: 'To Round trip time (ms)', value: 'toRoundTrip' },
      { header: 'From Packet Loss (%)', value: 'fromPacketLoss' },
      { header: 'To Packet Loss (%)', value: 'toPacketLoss' },
      { header: 'From Bitrate (kbps)', value: 'fromAvgBitrate' },
      { header: 'To Bitrate (kbps)', value: 'toAvgBitrate' },
    ];
    this.mediaStatsDisplayedColumns = [
      { header: 'Sent packets', value: 'Sent packets' },
      { header: 'Received codec', value: 'Received codec' },
      { header: 'Sent bitrate', value: 'Sent bitrate' },
      { header: 'Received packet loss', value: 'Received packet loss' },
      { header: 'Received Jitter', value: 'Received Jitter' },
      { header: 'Sent codec', value: 'Sent codec' },
      { header: 'Round trip time', value: 'Round trip time' },
      { header: 'Received packets', value: 'Received packets' },
      { header: 'POLQA', value: 'POLQA'}
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
      reportResponse.summary.startTime = this.reportResponse.summary.summaryStartTime;
      reportResponse.summary.endTime = this.reportResponse.summary.summaryEndTime;
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
  
  sortData(sortParameters: Sort): any[]{
    const keyName = sortParameters.active
    if(sortParameters.direction !== '') {
      this.reportResponse.endpoints =  Utility.sortingDataTable(this.reportResponse.endpoints, keyName, sortParameters.direction);
    } else {
      return this.reportResponse.endpoints;
    }
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
      }else if (column === 'from') {
        const numA = parseInt(a['from']['DID']);
        const numB = parseInt(b['from']['DID']);

        if (numA < numB) return this.sortAscending ? -1 : 1;
        if (numA > numB) return this.sortAscending ? 1 : -1;
        return 0;
      }else {
        if (a[column] === undefined || a[column] === null) return this.sortAscending ? 1 : -1;
        if (b[column] === undefined || b[column] === null) return this.sortAscending ? -1 : 1;
        if (a[column] < b[column]) return this.sortAscending ? -1 : 1;
        if (a[column] > b[column]) return this.sortAscending ? 1 : -1;
        return 0;
      }
    });
      this.detailedTestReport = sortedList;
  }

  private validMetric(location: string ,index: number, metric: string): boolean {
    if(location === "from")
      return this.metricsObj[location]?.mediaStats[index]?.data?.[metric] !== undefined && this.metricsObj.from?.mediaStats[index]?.data?.[metric] !== null && this.metricsObj.from?.mediaStats[index]?.data?.[metric] !== '--';
    else
      return this.metricsObj[location]?.mediaStats[index]?.data?.[metric] !== undefined && this.metricsObj.to?.mediaStats[index]?.data?.[metric] !== null && this.metricsObj.to?.mediaStats[index]?.data?.[metric] !== '--';
  }

  private parseMertic(location: string, index: number, metric: string) {
    if(metric === "Received Jitter" || metric === "Round trip time"){
      return parseFloat(this.metricsObj[location]?.mediaStats[index]?.data?.[metric]);
    }
    if(metric === "Received packet loss"){
      const percentageString = this.metricsObj[location]?.mediaStats[index]?.data?.[metric];
      const packetLossString =  percentageString.replace("%", "");
      return parseFloat(packetLossString);
    }
    if(metric === "Sent bitrate"){
      const bitrateString = this.metricsObj[location]?.mediaStats[index]?.data?.[metric];
      const values = bitrateString.split(' ');
      const numericString = values[0];
      return parseFloat(numericString);
    }
  }

  private average(sum: number, count: number){
    if(sum !== 0 && count !== 0 ) {
      let average = (sum / count).toFixed(2);
      return average;
    }
  }

  private dataToString(maxValue: number, avg: number, metric: string){
    let maxValueString = maxValue + "";
    let avgString = avg + "";
    if(maxValue === undefined)
      maxValueString = "N/A";
    if(avg === undefined)
      avgString = "N/A"
    if(metric === "Sent bitrate"){
      return "Avg: "+avgString;
    }
    else{
      if(maxValue === 0 && avg === undefined)
        avgString = "0";
      return "Max: "+maxValueString+", "+"Avg: "+avgString;
    }
  }
}
