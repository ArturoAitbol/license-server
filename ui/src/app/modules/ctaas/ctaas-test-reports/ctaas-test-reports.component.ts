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
import { DialogService } from 'src/app/services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchConsolidateDateComponent } from './search-consolidate-date/search-consolidate-date.component';

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

  readonly reportsTypes = ['Daily-FeatureFunctionality', 'Daily-CallingReliability'];
  readonly DAILY_FEATURE_FUNCTIONALITY: string = 'Daily-FeatureFunctionality';
  readonly DAILY_CALLING_RELIABILITY: string = 'Daily-CallingReliability';

  filterForm = this.formBuilder.group({
    reportType: [''],
    todayReportType: ['']
  });


  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(
  private subaccountService: SubAccountService,
  private formBuilder: FormBuilder,
  private ctaasSetupService: CtaasSetupService,
  private bannerService: BannerService,
  private dialogService: DialogService,
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

  readonly options = {
    DAILY_FEATURE_FUNCTIONALITY:'Daily-FeatureFunctionality',
    DAILY_CALLING_RELIABILITY:'Daily-CallingReliability'
  }

  ngOnInit(): void { 
    this.initColumns();
    this.sizeChange();
    this.dateTable();
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

  dateTable() {
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
          this.bannerService.open("WARNING", "Spotlight service is under maintenance, this function is disabled until the service resumes. ", this.unsubscribe);
          this.filterForm.disable();
          this.submitDisabled = true;
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
      return this.dateListBK = [...this.dateListBK];
    }
  }

  // rowAction(object:{ selectedRow: any, selectedOption: any, selectedIndex: string}){
  //   switch(object.selectedOption) {
  //     case this.DAILY_FEATURE_FUNCTIONALITY: 
  //       this.redirectFunction('Daily-FeatureFunctionality', object);
  //     case this.DAILY_CALLING_RELIABILITY:
  //       this.redirectFunction('Daily-CallingReliability', object);
  //   }
  // }

  // redirectFunction(reportType: string, selectedObject: any){
  //   const callingDetails = selectedObject.selectedRow;
  //   const utcCallingStartDate = callingDetails.startDate.split('UTC')[0];
  //   const utcCallingEndDate = callingDetails.endDate.split('UTC')[0];
  //   const callingParsedStartTime = Utility.parseReportDate(new Date(utcCallingStartDate));
  //   const callingParsedEndTime = Utility.parseReportDate(new Date(utcCallingEndDate));
  //   const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${reportType}&start=${callingParsedStartTime}&end=${callingParsedEndTime}`;
  //   window.open(url);
  //   window.close();
  // } 

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
    let dialogRef
    dialogRef = this.dialog.open(SearchConsolidateDateComponent, {
      width:'450px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        console.debug(`dialog closed: ${res}`);
      }
    });
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
