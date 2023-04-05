import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import moment from 'moment';
import { Subject } from 'rxjs';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { environment } from 'src/environments/environment';
import { Utility } from 'src/app/helpers/utils';
import { MsalService } from '@azure/msal-angular';
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { Sort } from '@angular/material/sort';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { BannerService } from "../../../services/alert-banner.service";
import { MatDialog } from '@angular/material/dialog';
import { SearchConsolidatedReportComponent } from './search-consolidated-report/search-consolidated-report.component';
import { ReportType } from 'src/app/helpers/report-type';

@Component({
  selector: 'app-ctaas-test-reports',
  templateUrl: './ctaas-test-reports.component.html',
  styleUrls: ['./ctaas-test-reports.component.css']
})
export class CtaasTestReportsComponent implements OnInit {
  public maxDate: any;
  public minEndDate: any;
  private subaccountDetails: any;
  tapURLFlag: string;
  tableMaxHeight: number;
  displayedColumns: any[] = [];
  isLoadingResults = true;
  isRequestCompleted = false;
  dateList: any = []; 
  dateListBK: any = [];
  filteredDateList: any[];
  actionMenuOptions: string[] = [];
  searchFlag: boolean = true;
  todaySearchFlag: boolean = true;
  submitDisabled = false;
  readonly CALLING: string = 'calling';
  readonly FEATURE: string = 'feature';
  fontStyleControl = new FormControl('');
  maintenanceModeEnabled = false;
  readonly VIEW_DETAILS = 'More details';

  readonly reportsTypes = ['Daily-FeatureFunctionality', 'Daily-CallingReliability'];

  filterForm = this.formBuilder.group({
    reportType: [''],
    todayReportType: ['']
  });


  private unsubscribe: Subject<void> = new Subject<void>();

  readonly options = {
    VIEW_DETAILS: this.VIEW_DETAILS
  }

  constructor(
  private subaccountService: SubAccountService,
  private formBuilder: FormBuilder,
  private msalService: MsalService,
  private ctaasSetupService: CtaasSetupService,
  private bannerService: BannerService,
  public dialog: MatDialog) { }
  
  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
  }

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
      { name: 'Title', dataKey: 'title', position: 'left', isSortable: true },
      { name: 'Start Date', dataKey: 'startDate', position: 'left', isSortable: true },
      { name: 'End Date', dataKey: 'endDate', position: 'left', isSortable: true }
    ];
  }
  
  private getActionMenuOption() {
    const roles: string[] = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
        this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "testReportsOptions")
  }

  ngOnInit(): void { 
    this.initColumns();
    this.getActionMenuOption();
    this.sizeChange();
    this.dataTable();
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.userSetupData();
    this.maxDate = moment().format("YYYY-MM-DD[T]HH:mm:ss");
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.unsubscribe)).subscribe(value => {
        let searchValidator = true;
        let todaySearchValidator = true;
        if(value.reportType !== '' && value.startDate !== '' && value.endDate !== '')
          searchValidator= false;
        if(value.todayReportType !== '' && value.todayReportType !== undefined)
          todaySearchValidator = false;
        this.searchFlag = searchValidator;
        this.todaySearchFlag = todaySearchValidator;
      })
  }

  dataTable() {
    this.isLoadingResults = true;
    const dateList = [];
    for (let i = 0; i < 15; i++) {
      const date = moment.utc().subtract(i + 1, 'days').format('MM-DD-YYYY');

      dateList.push({
        title: 'CR'+ moment.utc().subtract(i + 1,'days').format("_MM_DD"),
        startDate: date + ' ' + '00:00:00 UTC',
        endDate: date + ' ' + '23:59:59 UTC',
        report: 'calling',
      });

      dateList.push({
        title: 'FF' + moment.utc().subtract(i + 1,'days').format("_MM_DD"),
        startDate: date + ' ' + '00:00:00 UTC',
        endDate: date + ' ' + '23:59:59 UTC',
        report: 'feature',
      });
    }
    this.dateList = dateList;
    this.dateListBK = this.dateList.filter(res => res.report === 'calling')
    this.isLoadingResults = false;
  }

  toggleDateValue(date: any) {
    this.minEndDate = date;
  }
  
  userSetupData() {
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountDetails.id).subscribe(res => {
      if(res.ctaasSetups[0]){
        if(res.ctaasSetups[0].tapUrl !== '' && res.ctaasSetups[0].tapUrl !== undefined) 
          this.tapURLFlag = 'withTapURL';
        else 
          this.tapURLFlag = 'withoutTapURL';
        if (res.ctaasSetups[0].maintenance) {
          this.bannerService.open("ALERT",
              "The Spotlight service is currently experiencing limited functionality due to ongoing maintenance. " +
              "However, users can still view historical reports on the dashboard. " +
              "Please note that during this maintenance period, access to notes and test reports is not available.", this.unsubscribe);
          this.maintenanceModeEnabled = true;
        }
      } else {
        this.tapURLFlag = 'withoutData';
      }
    });
  }

  sortData(sortParameters: Sort): any[]{
    const keyName = sortParameters.active
    if(sortParameters.direction !== '') {
      this.dateListBK =  Utility.sortingDataTable(this.dateListBK, keyName, sortParameters.direction);
    } else {
      return this.dateListBK;
    }
  }

  todayReport() {
    const todayDetails = this.filterForm.value
    const startDate = moment.utc().format('YYYY-MM-DD 00:00:00');
    const endDate = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    const featureParsedStartTime = Utility.parseReportDate(new Date(startDate));
    const featureParsedEndTime = Utility.parseReportDate(new Date(endDate));
    const featureUrl = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${todayDetails.todayReportType}&start=${featureParsedStartTime}&end=${featureParsedEndTime}`;
    window.open(featureUrl);
    window.close();
  }

  searchConsolidatedReport() {
    let dialogRef = this.dialog.open(SearchConsolidatedReportComponent, {
      width:'450px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        console.debug(`dialog closed: ${res}`);
      }
    });
  }

  onClickMoreDetails(selectedReport: any): void {
    const startDate = selectedReport.startDate.split('UTC')[0];
    const endDate = selectedReport.endDate.split('UTC')[0];
    const startTime = Utility.parseReportDate(new Date(startDate));
    const endTime = Utility.parseReportDate(new Date(endDate));
    const type = (selectedReport.report === 'feature') ? ReportType.DAILY_FEATURE_FUNCTIONALITY : (selectedReport.report === 'calling') ? ReportType.DAILY_CALLING_RELIABILITY : '';
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${type}&start=${startTime}&end=${endTime}`;
    window.open(url);
    window.close();
}

  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    const { selectedRow, selectedOption, selectedIndex } = object;
    console.log(selectedRow);
    switch (selectedOption) {
      case this.VIEW_DETAILS:
          this.onClickMoreDetails(selectedRow);
          break;
    }
  } 

  onChangeButtonToggle() {
    const { value } = this.fontStyleControl;
    if(value === 'calling')
      this.dateListBK = this.dateList.filter(res => res.report === 'calling');
    else if (value === 'feature')
      this.dateListBK = this.dateList.filter(res => res.report === 'feature');
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
