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
  loggedInUserRoles: string[] = [];
  subaccountId: string = '';
  readonly FEATURE_FUNCTIONALITY: string = ReportType.DAILY_FEATURE_FUNCTIONALITY;
  readonly CALL_RELIABILITY: string = ReportType.DAILY_CALLING_RELIABILITY;
  hasDashboardDetails: boolean = false;
  isLoadingResults = true;
  sampleJsonData: any = {};
  canDisableDownloadBtn: boolean = false;
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
    this.route.queryParams.subscribe(params => {
      this.type = params['type'];
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
      this.hasDashboardDetails = false;
      this.isLoadingResults = true;
      this.ctaasDashboardService.getCtaasDashboardDetailedReport(this.subaccountId, this.type)
        .subscribe((res: any) => {
          console.log('res', res)
          this.isLoadingResults = false;
          const { response: { report, reportType } } = res;
          report.callReliability.nestedKey = 'callReliability';
          report.endpoints.nestedKey = 'endpoints'
          if (report && reportType) {
            this.sampleJsonData = report;
            this.filename = reportType;
            this.hasDashboardDetails = true;
          } else {
            this.hasDashboardDetails = false;
            this.sampleJsonData = {};
          }
        }, (error) => {
          this.hasDashboardDetails = false;
          this.isLoadingResults = false;
        });
    } catch (error) {
      console.error("Error while fetching dashboard report: " + error);
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
      { name: 'Address', dataKey: 'city', position: 'center', isSortable: true },
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
      this.ctaasDashboardService.downloadCtaasDashboardDetailedReport(this.subaccountId, this.type).subscribe((res) => {
        const { error } = res;
        if (!error) this.downloadExcelFile(res);

      }, (error) => {
        this.canDisableDownloadBtn = false;
        this.snackBarService.openSnackBar('Error loading downloading report', 'Ok');
      })
    } catch (e) {
      console.error('Error while downloading report:' + e);
      this.snackBarService.openSnackBar('Error loading downloading report', 'Ok');
    }
  }
}
