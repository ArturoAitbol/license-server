import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Constants } from 'src/app/helpers/constants';
import { ReportType } from 'src/app/helpers/report-type';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
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
  constructor(
    private msalService: MsalService,
    private ctaasDashboardService: CtaasDashboardService,
    private subaccountService: SubAccountService,
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
    this.type = localStorage.getItem(Constants.SELECTED_REPORT_TYPE);
    this.fetchDashboardReportDetails();
    this.initColumns();
    this.calculateTableHeight();
  }
  /**
   * fetch detailed dashboard report
   */
  public fetchDashboardReportDetails(): void {
    this.hasDashboardDetails = false;
    this.isLoadingResults = true;
    this.ctaasDashboardService.getCtaasDashboardDetailedReport(this.subaccountId, this.type).subscribe((response: any) => {
      const { response: { report, reportType } } = response;
      this.sampleJsonData = report;
      this.filename = reportType;
      this.hasDashboardDetails = true;
      this.isLoadingResults = true;
    }, (error) => {
      this.hasDashboardDetails = true;
      this.isLoadingResults = false;
    })
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
    ];
    this.featureFunctionalityDisplayedColumns = [
      { name: 'Test Case', dataKey: 'testCaseName', position: 'left', isSortable: true },
      { name: 'Start Time', dataKey: 'startTime', position: 'center', isSortable: true },
      { name: 'End Time', dataKey: 'endTime', position: 'center', isSortable: true },
      { name: 'From', dataKey: 'from', position: 'center', isSortable: true },
      { name: 'To', dataKey: 'to', position: 'center', isSortable: true },
      { name: 'Other Parties', dataKey: 'otherParties', position: 'center', isSortable: true },
      { name: 'Status', dataKey: 'status', position: 'center', isSortable: true },
      { name: 'Error Category', dataKey: 'errorCategory', position: 'center', isSortable: true },
      { name: 'Reason', dataKey: 'errorReason', position: 'center', isSortable: true },
    ];
  }

  downloadResponseAsJson() {
    const data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.sampleJsonData));
    const a = document.createElement('a');
    a.href = 'data:' + data;
    a.download = 'data.json';
    a.innerHTML = 'download JSON';
    const container = document.getElementById('container');
    container.appendChild(a);
  }

  downloadTextFile() {
    const name = this.filename + '-' + Date.now().toString() + '.xlsx';
    const data = JSON.stringify(this.sampleJsonData);
    const a = document.createElement('a');
    const type = name.split(".").pop();
    a.href = URL.createObjectURL(new Blob([data], { type }));
    a.download = name;
    a.click();
  }
}
