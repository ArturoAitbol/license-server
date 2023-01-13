import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Utility } from 'src/app/helpers/utils';
import { Note } from 'src/app/model/note.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { TestReportsService } from 'src/app/services/test-reports.service';
import { CtaasHistoricalDashboardComponent } from '../ctaas-historical-dashboard/ctaas-historical-dashboard.component';

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
  filteredReports: any = [];
  selectedFilter: any;
  selectedDate: any;
  private readonly VIEW_REPORT = 'View Report';
  private readonly VIEW_CHARTS = 'View Chart';

  readonly options = {
    VIEW_REPORT:this.VIEW_REPORT,
    VIEW_CHARTS: this.VIEW_CHARTS
  }

  readonly reportsTypes = ['Daily-FeatureFunctionality', 'Daily-CallingReliability'];

  filterForm = this.fb.group({
    typeFilterControl: [''],
    startTimeControl: [''],
    endTimeControl: ['']
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
      { name: 'Start Time', dataKey: 'startTime', position: 'left', isSortable: true },
      { name: 'End Time', dataKey: 'endTime', position: 'left', isSortable: true }
      // { name: 'Status', dataKey: 'status', position: 'left', isSortable: true }

    ];
  }

  private getActionMenuOptions() {
    const roles: string[] = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "testReportsOptions")
  }

  ngOnInit(): void {
    this.calculateTableHeight();
    this.getActionMenuOptions();
    this.initColumns();
    this.fetchTestReports();
  }

  fetchTestReports() {
    this.isRequestCompleted = false;
    this.isLoadingResults = true;
    this.testReportsService.getTestReportsList(this.subAccountService.getSelectedSubAccount().id,this.selectedFilter, this.selectedDate).subscribe((res: any) => {
      this.isRequestCompleted = true; 
      this.isLoadingResults = false;
      this.testReportsDataBK = this.testReportsData = res['reports'];
      this.filteredReports = this.testReportsData;
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

  onChangeToggle(flag: boolean): void {
    this.toggleStatus = flag;
    if (flag) {
        console.log(this.actionMenuOptions);
        let failedTestReportIndex = this.actionMenuOptions.indexOf('failed');
        if (failedTestReportIndex != -1)
          this.actionMenuOptions.splice(failedTestReportIndex, 1);
        this.testReportsData = this.testReportsDataBK.filter(x => x.status === 'Failed');
    } else {
      this.getActionMenuOptions();
      this.testReportsData = this.testReportsDataBK.filter(x => x.status === 'Successful');
    }
  }
  

  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    const { selectedRow, selectedOption, selectedIndex } = object;
    switch (selectedOption) {
        case this.VIEW_REPORT:
            //this.onCloseNote(selectedRow);
            break;
        case this.VIEW_CHARTS:
            this.viewDashboard(selectedRow);
            break;
    }
  }

  viewDashboard(note: Note): void{
    this.openDialog(this.VIEW_CHARTS,note);
  }

  openDialog(type: string, selectedItemData?: any){
    let dialogRef;
    switch (type) {
        case this.VIEW_REPORT:
            // dialogRef = this.dialog.open(AddNotesComponent, {
            //     width: '400px',
            //     disableClose: false
            // });
            break;
        case this.VIEW_CHARTS:
            dialogRef = this.dialog.open(CtaasHistoricalDashboardComponent, {
                data: selectedItemData,
                width: '100vw',
                height: '99vh',
                maxWidth: '100vw',
                disableClose: false
            });
            break;
    }
    dialogRef.afterClosed().subscribe((res: any) => {
        if (res) {
            this.testReportsDataBK = this.testReportsData = [];
            this.fetchTestReports();
        }
    });
  }


  toggleOptionValue(value:any){
    if(value === 'Daily-FeatureFunctionality'){
      this.selectedFilter = 'feature';
      this.testReportsData = [];
      this.fetchTestReports();
    } else if(value ==='Daily-CallingReliability'){
      this.selectedFilter = 'calling';
      this.testReportsData = [];
      this.fetchTestReports();
    }
  }

  toggleDateValue(value:any){
    console.log("342",value.value.toJSON());
    this.selectedDate = value.value.toJSON();
    this.fetchTestReports();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
