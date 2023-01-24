import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import moment from 'moment';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReportType } from 'src/app/helpers/report-type';
import { Utility } from 'src/app/helpers/utils';
import { ITestReports } from 'src/app/model/test-reports.model';
import { DialogService } from 'src/app/services/dialog.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { TestReportsService } from 'src/app/services/test-reports.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ctaas-test-reports',
  templateUrl: './ctaas-test-reports.component.html',
  styleUrls: ['./ctaas-test-reports.component.css']
})
export class CtaasTestReportsComponent implements OnInit {
  tableMaxHeight: number;
  displayedColumns: any[] = [];
  actionMenuOptions: any = [];
  toggleStatus= false;
  isLoadingResults = false;
  isRequestCompleted = false;
  testReportsData: any = [];
  testReportsDataBK: any = [];
  currentCustomer: any;
  selectedTypeFilter: any = '';
  selectedDateFilter: any = '';
  public date: Date;
  public maxDate: any;
  readonly VIEW_REPORT = 'View Report';

  readonly options = {
    VIEW_REPORT:this.VIEW_REPORT
  }

  readonly reportsTypes = ['None','Daily-FeatureFunctionality', 'Daily-CallingReliability'];

  filterForm = this.fb.group({
    typeFilterControl: [''],
    dateFilterControl: ['']
  });

  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private msalService: MsalService,
    public dialog: MatDialog,
    private snackBarService: SnackBarService,
    private dialogService: DialogService,
    private testReportsService: TestReportsService,
    private fb: FormBuilder,
    private subAccountService: SubAccountService
  ) { }

  private calculateTableHeight() {
    this.tableMaxHeight = window.innerHeight // doc height
      - (window.outerHeight * 0.01 * 2) // - main-container margin
      - 60 // - route-content margin
      - 20 // - dashboard-content padding
      - 30 // - table padding
      - 32 // - title height
      - (window.outerHeight * 0.05 * 2); // - table-section margin
  }

  initColumns(): void {
    this.displayedColumns = [
      { name: 'Report Type', dataKey: 'reportType', position: 'left', isSortable: true },
      { name: 'Start Time', dataKey: 'startDate', position: 'left', isSortable: true },
      { name: 'End Time', dataKey: 'endDate', position: 'left', isSortable: true }
    ];
  }

  private getActionMenuOptions() {
    const roles: string[] = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "testReportsOptions")
  }

  ngOnInit(): void {
    this.maxDate = moment().toDate()
    this.calculateTableHeight();
    this.getActionMenuOptions();
    this.initColumns();
    this.fetchTestReports();
  }

  private fetchTestReports(): void {
    this.isRequestCompleted = false;
    this.isLoadingResults = true;
    let reportListWithDates = []
    this.testReportsService.getTestReportsList(this.subAccountService.getSelectedSubAccount().id,this.selectedTypeFilter, this.selectedDateFilter)
    .pipe(
      map(((r:any):{reports : ITestReports[]} => {
        const {reports} = r
        try {
          reports.forEach((report: ITestReports, index) => {
            let parsedStartTime = moment(report.startTime, "YYMMDD HH:mm:ss UTC").format("MM-DD-YYYY HH:mm:ss UTC");
            let parsedEndTime = moment(report.endTime, "YYMMDD HH:mm:ss UTC").format("MM-DD-YYYY HH:mm:ss UTC");
            reportListWithDates[index] = {...report, endDate:parsedEndTime, startDate:parsedStartTime}
          });
          return r;
        }catch(exception){
          console.error('error while fetching data', exception);
        }
       })
      )
    ).subscribe(() => {
      this.isRequestCompleted = true; 
      this.isLoadingResults = false;
      this.testReportsDataBK = this.testReportsData = reportListWithDates;
    }, error => {
      console.debug('error', error);
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
  });
  }


  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc') {
      this.testReportsData = this.testReportsData.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
    } else if (sortParameters.direction === 'desc') {
      this.testReportsData = this.testReportsData.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
    } else {
      return this.testReportsData = this.testReportsData;
    }
  }

  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    const { selectedRow, selectedOption, selectedIndex } = object;
    switch (selectedOption) {
    case this.VIEW_REPORT:
      this.onClickMoreDetails(selectedIndex);
      break;
    }
  }

  toggleOptionValue(type:any){
    switch(type){
      case 'Daily-FeatureFunctionality':
        this.selectedTypeFilter = 'feature';
        this.testReportsData = [];
        this.fetchTestReports();
        break;
      case 'Daily-CallingReliability':
        this.selectedTypeFilter = 'calling';
        this.testReportsData = [];
        this.fetchTestReports();
        break;
      case 'None':
        this.selectedTypeFilter = '';
        this.testReportsData = [];
        this.fetchTestReports();
        break;
      default:
        break;
    }
  }

  onClickMoreDetails(index: string): void {
    const { reportType, startTime, endTime } = this.testReportsData[index];
    const type = (reportType === 'Daily-FeatureFunctionality') ? ReportType.DAILY_FEATURE_FUNCTIONALITY : (reportType === 'Daily-CallingReliability') ? ReportType.DAILY_CALLING_RELIABILITY : '';
    const url = `${environment.BASE_URL}/#/spotlight/details?type=${type}&start=${startTime}&end=${endTime}`;
    window.open(url);
    window.close();
  }

  toggleDateValue(date:any){
    this.selectedDateFilter = date.value.toJSON();
    this.testReportsData = [];
    this.fetchTestReports();
  }

  clearDateFilter() {
    this.date = null;
    this.selectedDateFilter = '';
    this.testReportsData = [];
    this.fetchTestReports();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  restoreTable(event:any) {
    if(event.data === null){
      this.selectedDateFilter = '';
      this.testReportsData = [];
      this.fetchTestReports();
    }
  }
}
