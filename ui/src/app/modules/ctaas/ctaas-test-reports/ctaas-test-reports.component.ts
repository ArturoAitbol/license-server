import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { Subject } from 'rxjs';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { environment } from 'src/environments/environment';
import { Utility } from 'src/app/helpers/utils';
import { MsalService } from '@azure/msal-angular';
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { Sort } from '@angular/material/sort';
import { debounceTime, takeUntil } from 'rxjs/operators';

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
  readonly reportsTypes = ['Daily-FeatureFunctionality', 'Daily-CallingReliability'];
  readonly DAILY_FEATURE_FUNCTIONALITY: string = 'Daily-FeatureFunctionality';
  readonly DAILY_CALLING_RELIABILITY: string = 'Daily-CallingReliability';

  filterForm = this.formBuilder.group({
    reportType: [''],
    startDate: [''],
    endDate: [''],
    todayReportType: ['']
  });


  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(
  private msalService: MsalService,
  private subaccountService: SubAccountService,
  private formBuilder: FormBuilder,
  private ctaasSetupService: CtaasSetupService) { }

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
      { name: 'Start Date', dataKey: 'startDate', position: 'left', isSortable: true },
      { name: 'End Date', dataKey: 'endDate', position: 'left', isSortable: true }
    ];
  }

  readonly options = {
    DAILY_FEATURE_FUNCTIONALITY:'Daily-FeatureFunctionality',
    DAILY_CALLING_RELIABILITY:'Daily-CallingReliability'
  }


  private getActionMenuOptions() {
    const roles = this.msalService.instance.getActiveAccount().idTokenClaims['roles'];
    this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "testReportsOptions");
  }

  ngOnInit(): void { 
    this.initColumns();
    this.sizeChange();
    this.getActionMenuOptions();
    this.dateTable();
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.userSetupData();
    this.maxDate = moment().format("YYYY-MM-DD[T]HH:mm:ss");
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.unsubscribe)).subscribe(value => {
        let searchValidator = true;
        let todaSearchValidator = true;
        if(value.reportType !== '' && value.startDate !== '' && value.endDate !== ''){
          console.log(value.startDate)
          searchValidator= false;
        }
        if(value.todayReportType !== '' && value.todayReportType !== undefined)
          todaSearchValidator = false;
        this.searchFlag = searchValidator;
        this.todaySearchFlag = todaSearchValidator;
      })
  }


  filterReport(): void {
    const details = this.filterForm.value;
    const parsedStartTime = Utility.parseReportDate(new Date(details.startDate));
    const parsedEndTime = Utility.parseReportDate(new Date(details.endDate));
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${details.reportType}&start=${parsedStartTime}&end=${parsedEndTime}`;
    window.open(url);
    window.close();
  }

  dateTable() {
    this.isLoadingResults = true;
    for(let i = 0 ; i < 15 ; i++ ){
      this.dateList[i] = {startDate:moment.utc().subtract(i + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), endDate:moment.utc().subtract(i + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")};
    }
    this.dateListBK = [...this.dateList];
    this.isLoadingResults = false;
  }

  toggleDateValue(date: any) {
    this.minEndDate = date;
  }

  clearDateFilter(selector: string) {
    if (selector === 'start') {
      this.filterForm.get('startDate').setValue('');
      this.filterForm.get('endDate').setValue('');
      this.minEndDate = null;
    } else
      this.filterForm.get('endDate').setValue('');
      this.minEndDate = null;
  }
  
  userSetupData() {
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountDetails.id).subscribe(res => {
      if(res.ctaasSetups[0]){
        if(res.ctaasSetups[0].tapUrl !== '' && res.ctaasSetups[0].tapUrl !== undefined) 
          this.tapURLFlag = 'withTapURL';
        else 
          this.tapURLFlag = 'withoutTapURL';
      } else {
        this.tapURLFlag = 'withoutData';
      }
    });
  }

  sortData(sortParameters: Sort): any[]{
    const keyName = sortParameters.active
    if(sortParameters.direction !== '') {
      this.dateList =  Utility.sortingDataTable(this.dateList, keyName, sortParameters.direction);
    } else {
      return this.dateList = [...this.dateListBK];
    }
  }

  rowAction(object:{ selectedRow: any, selectedOption: any, selectedIndex: string}){
    switch(object.selectedOption) {
      case this.DAILY_FEATURE_FUNCTIONALITY: 
        this.redirectFunction('Daily-FeatureFunctionality', object);
      case this.DAILY_CALLING_RELIABILITY:
        this.redirectFunction('Daily-CallingReliability', object);
    }
  }

  redirectFunction(reportType: string, selectedObject: any){
    const callingDetails = selectedObject.selectedRow;
    const utcCallingStartDate = callingDetails.startDate.split('UTC')[0];
    const utcCallingEndDate = callingDetails.endDate.split('UTC')[0];
    const callingParsedStartTime = Utility.parseReportDate(new Date(utcCallingStartDate));
    const callingParsedEndTime = Utility.parseReportDate(new Date(utcCallingEndDate));
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${reportType}&start=${callingParsedStartTime}&end=${callingParsedEndTime}`;
    window.open(url);
    window.close();
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

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
