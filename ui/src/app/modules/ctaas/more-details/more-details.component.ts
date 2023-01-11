import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { ReportType } from 'src/app/helpers/report-type';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
@Component({
  selector: 'app-more-details',
  templateUrl: './more-details.component.html',
  styleUrls: ['./more-details.component.css']
})
export class MoreDetailsComponent implements OnInit {
  endpointDisplayedColumns: any = [];
  featureFunctionalityDisplayedColumns: any = [];
  downloadUrl: any;
  filename: string = '';
  tableMaxHeight: number;
  type: string = '';
  startDateStr: string = '';
  endDateStr: string = '';
  loggedInUserRoles: string[] = [];
  subaccountId: string = '';
  readonly FEATURE_FUNCTIONALITY: string = ReportType.DAILY_FEATURE_FUNCTIONALITY;
  readonly CALL_RELIABILITY: string = ReportType.DAILY_CALLING_RELIABILITY;
  hasDashboardDetails: boolean = false;
  isLoadingResults = true;
  isRequestCompleted = false;
  reportResponse: any = {};
  canDisableDownloadBtn: boolean = false;
  detailedTestReport: any = [];
  openFlag: any = false;
  obj: any = {};
  fromMediaTimeStampsList: string[] = [];
  toMediaTimeStampsList: string[] = [];
  otherPartiesMediaTimeStampsList: string[] = [];
  selectedFromMediaStats: any = {};
  selectedToMediaStats: any = {};
  otherPartiesMediaStats: any = {};
  detailedTestFeatureandCallReliability: any = [];
  mediaStatsDisplayedColumns: any = [];
  // fakeResponse: any = {
  //   "summary": {
  //     "total": 4,
  //     "startTime": "01-09-23 18:30:00 IST",
  //     "passed": 2,
  //     "failed": 2,
  //     "endTime": "01-09-23 18:30:00 IST"
  //   },
  //   "endpoints": [
  //     {
  //       "zipcode": "700085",
  //       "country": "America",
  //       "city": "Plano",
  //       "vendor": "Microsoft",
  //       "model": "MS-TEAMS",
  //       "state": "Plano",
  //       "firmwareVersion": "1.5.00.33362",
  //       "did": "9725989023"
  //     },
  //     {
  //       "zipcode": "700089",
  //       "country": "India",
  //       "city": "Hyderabad",
  //       "vendor": "Microsoft",
  //       "model": "MS-TEAMS",
  //       "state": "Telangana",
  //       "firmwareVersion": "1.5.00.33362",
  //       "did": "9725989024"
  //     }
  //   ],
  //   "featureFunctionality": [
  //     {
  //       "errorCategory": null,
  //       "errorReason": "Media actions not enabled in the property file",
  //       "startTime": "01-10-23 11:20:37",
  //       "from": {
  //         "mediaStats": [
  //           {
  //             "timestamp": "2023-01-10 17:25:06.688",
  //             "data": {
  //               "sent packets": "xxxxx",
  //               "received codec": "xxxxx",
  //               "Sent bitrate": "Tcp",
  //               "received packet loss": "Wired",
  //               "received Jitter": "xxxxx",
  //               "sent codec": "xxxxx",
  //               "round trip time": "xxxxx",
  //               "received packets": "xxxxx"
  //             }
  //           },
  //           {
  //             "timestamp": "2023-01-10 17:27:06.688",
  //             "data": {
  //               "sent packets": "xxxxx",
  //               "received codec": "xxxxx",
  //               "Sent bitrate": "Tcp",
  //               "received packet loss": "Wired2",
  //               "received Jitter": "xxxxx",
  //               "sent codec": "xxxxx",
  //               "round trip time": "xxxxx",
  //               "received packets": "xxxxx"
  //             }
  //           }
  //         ],
  //         "DID": "9725989023"
  //       },
  //       "testCaseName": "TC003- Media injection M1 call M2 _ validate media parameter in M1 M2",
  //       "endTime": "01-10-23 11:21:55",
  //       "to": {
  //         "mediaStats": [
  //           {
  //             "timestamp": "2023-01-10 17:27:06.688",
  //             "data": {
  //               "sent packets": "xxxxx",
  //               "received codec": "xxxxx",
  //               "Sent bitrate": "Tcp",
  //               "received packet loss": "Wired",
  //               "received Jitter": "xxxxx",
  //               "sent codec": "xxxxx",
  //               "round trip time": "xxxxx",
  //               "received packets": "xxxxx"
  //             }
  //           },
  //           {
  //             "timestamp": "2023-01-10 17:27:06.688",
  //             "data": {
  //               "sent packets": "xxxxx",
  //               "received codec": "xxxxx",
  //               "Sent bitrate": "Tcp",
  //               "received packet loss": "Wired",
  //               "received Jitter": "xxxxx",
  //               "sent codec": "xxxxx",
  //               "round trip time": "xxxxx",
  //               "received packets": "xxxxx"
  //             }
  //           }
  //         ],
  //         "DID": "9725989024"
  //       },
  //       "otherParties": [
  //         {
  //           "mediaStats": [
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             },
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             }
  //           ],
  //           "DID": "9725989026"
  //         },
  //         {
  //           "mediaStats": [
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             },
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             }
  //           ],
  //           "DID": "9725989027"
  //         },
  //         {
  //           "mediaStats": [
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             },
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             }
  //           ],
  //           "DID": "9725989028"
  //         }
  //       ],
  //       "status": "FAILED"
  //     },
  //     {
  //       "errorCategory": null,
  //       "errorReason": null,
  //       "startTime": "01-10-23 11:54:07",
  //       "from": {
  //         "mediaStats": [
  //           {
  //             "timestamp": "2023-01-10 17:27:06.688",
  //             "data": {
  //               "sent packets": "xxxxx",
  //               "received codec": "xxxxx",
  //               "Sent bitrate": "Tcp",
  //               "received packet loss": "Wired",
  //               "received Jitter": "xxxxx",
  //               "sent codec": "xxxxx",
  //               "round trip time": "xxxxx",
  //               "received packets": "xxxxx"
  //             }
  //           },
  //           {
  //             "timestamp": "2023-01-10 17:27:06.688",
  //             "data": {
  //               "sent packets": "xxxxx",
  //               "received codec": "xxxxx",
  //               "Sent bitrate": "Tcp",
  //               "received packet loss": "Wired",
  //               "received Jitter": "xxxxx",
  //               "sent codec": "xxxxx",
  //               "round trip time": "xxxxx",
  //               "received packets": "xxxxx"
  //             }
  //           }
  //         ],
  //         "DID": "9725989023"
  //       },
  //       "testCaseName": "TC003- Media injection M1 call M2 _ validate media parameter in M1 M2",
  //       "endTime": "01-10-23 11:56:08",
  //       "to": {
  //         "mediaStats": [
  //           {
  //             "timestamp": "2023-01-10 17:27:06.688",
  //             "data": {
  //               "sent packets": "xxxxx",
  //               "received codec": "xxxxx",
  //               "Sent bitrate": "Tcp",
  //               "received packet loss": "Wired",
  //               "received Jitter": "xxxxx",
  //               "sent codec": "xxxxx",
  //               "round trip time": "xxxxx",
  //               "received packets": "xxxxx"
  //             }
  //           },
  //           {
  //             "timestamp": "2023-01-10 17:27:06.688",
  //             "data": {
  //               "sent packets": "xxxxx",
  //               "received codec": "xxxxx",
  //               "Sent bitrate": "Tcp",
  //               "received packet loss": "Wired",
  //               "received Jitter": "xxxxx",
  //               "sent codec": "xxxxx",
  //               "round trip time": "xxxxx",
  //               "received packets": "xxxxx"
  //             }
  //           }
  //         ],
  //         "DID": "9725989024"
  //       },
  //       "otherParties": [
  //         {
  //           "mediaStats": [
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             },
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             }
  //           ],
  //           "DID": "9725989026"
  //         },
  //         {
  //           "mediaStats": [
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             },
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             }
  //           ],
  //           "DID": "9725989027"
  //         },
  //         {
  //           "mediaStats": [
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             },
  //             {
  //               "timestamp": "2023-01-10 17:27:06.688",
  //               "data": {
  //                 "sent packets": "xxxxx",
  //                 "received codec": "xxxxx",
  //                 "Sent bitrate": "Tcp",
  //                 "received packet loss": "Wired",
  //                 "received Jitter": "xxxxx",
  //                 "sent codec": "xxxxx",
  //                 "round trip time": "xxxxx",
  //                 "received packets": "xxxxx"
  //               }
  //             }
  //           ],
  //           "DID": "9725989028"
  //         }
  //       ],
  //       "status": "PASSED"
  //     }
  //   ]
  // };
  summaryDisplayedColumns: any = [];
  fromMediaStats: any;
  toMediaStats: any;
  otherpartyMediaStat: any;

  constructor(
    private msalService: MsalService,
    private ctaasDashboardService: CtaasDashboardService,
    private subaccountService: SubAccountService,
    private route: ActivatedRoute,
    private snackBarService: SnackBarService
  ) { }
  /**
   * get logged in account details
   * @returns: any | null
   */
  private getAccountDetails(): any | null {
    return this.msalService.instance.getActiveAccount() || null;
  }

  ngOnInit(): void {
    const accountDetails = this.getAccountDetails();
    const { idTokenClaims: { roles } } = accountDetails;
    this.loggedInUserRoles = roles;
    const currentSubaccountDetails = this.subaccountService.getSelectedSubAccount();
    const { id, subaccountId } = currentSubaccountDetails;
    this.subaccountId = subaccountId ? subaccountId : id;
    this.route.queryParams.subscribe((params: any) => {
      const { type, start, end } = params;
      this.type = type;
      this.startDateStr = start;
      this.endDateStr = end;
    });
    this.initColumns();
    this.calculateTableHeight();
    this.fetchDashboardReportDetails();
  }
  /**
   * fetch detailed dashboard report
   */
  public fetchDashboardReportDetails(): void {
    try {
      this.isRequestCompleted = false;
      this.hasDashboardDetails = false;
      this.isLoadingResults = true;
      this.ctaasDashboardService.getCtaasDashboardDetailedReport(this.subaccountId, this.type, this.startDateStr, this.endDateStr)
        .subscribe((res: any) => {
          this.isRequestCompleted = true;
          this.isLoadingResults = false;
          const { response: { report, reportType } } = res;
          if (report && reportType) {
            this.reportResponse = report;
            const detailedResponseObj = this.ctaasDashboardService.getDetailedReportyObject();
            detailedResponseObj[this.type] = JSON.parse(JSON.stringify(report));
            this.ctaasDashboardService.setDetailedReportObject(detailedResponseObj);
            this.filename = reportType;
            this.hasDashboardDetails = true;
            const { summary, endpoints, results, type } = this.reportResponse;
            this.detailedTestReport = (results && results.length > 0) ? results : [];
            console.log('this.detailedTestReport ', this.detailedTestReport);
            this.detailedTestReport.forEach((obj: any) => {
              obj.closeKey = false;
            });
          } else {
            this.hasDashboardDetails = false;
            this.reportResponse = {};
          }
        }, (error) => {
          this.hasDashboardDetails = false;
          this.isLoadingResults = false;
          this.isRequestCompleted = true;
        });
    } catch (error) {
      this.hasDashboardDetails = false;
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
      console.error("Error while fetching dashboard report: " + error);
    }
  }

  getSelectedFromTimeStamp(event) {
    console.log(event)
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
      this.fromMediaStats = this.detailedTestReport[rowIndex].from.mediaStats[0];
      this.getSelectedFromTimeStamp(this.fromMediaStats);
    }
    else if (key === 'to') {
      this.toMediaStats = this.detailedTestReport[rowIndex].to.mediaStats[0];
      this.getSelectedToTimeStamp(this.toMediaStats);

    }
    else {
      this.otherpartyMediaStat = this.detailedTestReport[rowIndex].otherParties[index - 3].mediaStats[0];
      this.getSelectedOtherPartyTimeStamp(this.otherpartyMediaStat)
    }

  }
  close(index) {
    this.detailedTestReport[index].closeKey = true;
    const trueKey = this.detailedTestReport.every(e => e.closeKey);
    if (trueKey) {
      this.openFlag = false;
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
      { name: 'Region', dataKey: '', position: 'center', isSortable: true },
      { name: 'State', dataKey: 'state', position: 'center', isSortable: true },
      { name: 'Country', dataKey: 'country', position: 'center', isSortable: true },
      { name: 'ZipCode', dataKey: 'zipcode', position: 'center', isSortable: true }
    ];
    this.featureFunctionalityDisplayedColumns = [
      { name: 'Test Case', dataKey: 'testCaseName', position: 'left', isSortable: true },
      // { name: 'Start Time', dataKey: 'startTime', position: 'center', isSortable: true },
      // { name: 'End Time', dataKey: 'endTime', position: 'center', isSortable: true },
      // { name: 'From', dataKey: 'from', position: 'center', isSortable: true },
      // { name: 'To', dataKey: 'to', position: 'center', isSortable: true },
      // { name: 'Other Parties', dataKey: 'otherParties', position: 'center', isSortable: true },
      { name: 'Status', dataKey: 'status', position: 'center', isSortable: true },
      { name: 'Error Category', dataKey: 'errorCategory', position: 'center', isSortable: true },
      // { name: 'Reason', dataKey: 'errorReason', position: 'center', isSortable: true },
    ];

    this.summaryDisplayedColumns = [
      { header: 'Test Cases Executed', value: 'total' },
      { header: 'Passed', value: 'passed' },
      { header: 'Failed', value: 'failed' },
      { header: 'Start Time', value: 'startTime' },
      { header: 'End Time', value: 'endTime' }
    ];

    this.detailedTestFeatureandCallReliability = [
      { header: 'Start Date', value: 'startTime' },
      { header: 'End Date', value: 'endTime' },
      { header: 'Status', value: 'status' },
      { header: 'Error Category', value: 'errorCategory' },
      { header: 'Reason', value: 'reason' }
    ];
    this.mediaStatsDisplayedColumns = [
      { header: 'Sent packets', value: 'sent packets' },
      { header: 'Received codec', value: 'received codec' },
      { header: 'Sent bitrate', value: 'Sent bitrate' },
      { header: 'Received packet loss', value: 'received packet loss' },
      { header: 'Received Jitter', value: 'received Jitter' },
      { header: 'Sent codec', value: 'sent codec' },
      { header: 'Round trip time', value: 'round trip time' },
      { header: 'Received packets', value: 'received packets' }
    ]
  }
  /**
   * download file as excel
   * @param data: any 
   */
  private downloadExcelFile(data: any): void {
    const name = this.type + '-' + Date.now().toString() + '.xlsx';
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
      const reportResponse = detailedResponseObj[this.type];
      if (reportResponse) {
        this.ctaasDashboardService.downloadCtaasDashboardDetailedReport(this.subaccountId, this.type, reportResponse)
          .subscribe((res: any) => {
            const { error } = res;
            if (!error) this.downloadExcelFile(res);
          }, (error) => {
            this.canDisableDownloadBtn = false;
            console.error('Error with download report request: ' + error);
            this.snackBarService.openSnackBar('Error loading downloading report', 'Ok');
          });
      }
    } catch (e) {
      this.canDisableDownloadBtn = false;
      console.error('Error while downloading report:' + e);
      this.snackBarService.openSnackBar('Error loading downloading report', 'Ok');
    }
  }
}
