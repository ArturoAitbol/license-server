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
  sampleJsonData: any = {};
  canDisableDownloadBtn: boolean = false;
  callReliabilityDetails: any = [];
  openFlag: any = false;
  obj: any = {};
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
            this.sampleJsonData = report;
            const detailedResponseObj = this.ctaasDashboardService.getDetailedReportyObject();
            detailedResponseObj[this.type] = JSON.parse(JSON.stringify(report));
            this.ctaasDashboardService.setDetailedReportObject(detailedResponseObj);
            this.filename = reportType;
            this.hasDashboardDetails = true;
            this.callReliabilityDetails = this.sampleJsonData.callReliability;
            this.callReliabilityDetails.forEach(subdata => {
              subdata.from = {
                "DID": "9725989023",
                "mediaStats": [
                  {
                    "avgAudioDegradation": "xxxxx",
                    "streamDirection": "xxxxx",
                    "audioCodec": "xxxxx",
                    "avgJitter": "xxxxx",
                    "connectionType": "Wired",
                    "networkTransportProtocol": "Tcp"
                  }
                ],
              },
                subdata.duts =
                { "from": subdata.from, "to": subdata.to, "otherParties": subdata.otherParties }
              subdata.nestedData =
              {
                "endTime": subdata.endTime, "startTime": subdata.startTime, "status": subdata.status,
                "reason": subdata.errorReason, "errorCategory": subdata.errorCategory
              }
              subdata.closeKey = false;
            })
          } else {
            this.hasDashboardDetails = false;
            this.sampleJsonData = {};
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

  setStep(index: number, rowIndex) {
    this.openFlag = true
    this.obj['key' + rowIndex] = index;
  }
  close(index) {
    this.callReliabilityDetails[index].closeKey = true;
    const trueKey = this.callReliabilityDetails.every(e => e.closeKey);
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
      // { name: 'State', dataKey: 'state', position: 'center', isSortable: true },
      // { name: 'Country', dataKey: 'country', position: 'center', isSortable: true },
      // { name: 'ZipCode', dataKey: 'zipcode', position: 'center', isSortable: true },
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
