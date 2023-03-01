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
import { SubAccountService } from 'src/app/services/sub-account.service';
import { TestReportsService } from 'src/app/services/test-reports.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ctaas-test-reports',
  templateUrl: './ctaas-test-reports.component.html',
  styleUrls: ['./ctaas-test-reports.component.css']
})
export class CtaasTestReportsComponent implements OnInit {
  currentCustomer: any;
  selectedTypeFilter: any = '';
  // selectedDateFilter: any = '';
  public startDate: Date;
  public endDate: Date;
  public maxDate: any;
  public minEndDate: any;
  private subaccountDetails: any;
  readonly VIEW_REPORT = 'View Report';

  readonly options = {
    VIEW_REPORT: this.VIEW_REPORT
  }

  readonly reportsTypes = ['None', 'Daily-FeatureFunctionality', 'Daily-CallingReliability'];

  filterForm = this.fb.group({
    typeFilterControl: [''],
    dateFilterControl: ['']
  });

  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private msalService: MsalService,
    public dialog: MatDialog,
    private subaccountService: SubAccountService,
    private testReportsService: TestReportsService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.maxDate = moment().toDate()
  }

  // rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
  //   const { selectedRow, selectedOption, selectedIndex } = object;
  //   switch (selectedOption) {
  //     case this.VIEW_REPORT:
  //       this.onClickMoreDetails(selectedIndex);
  //       break;
  //   }
  // }

  toggleOptionValue(type: any) {
    switch (type) {
      case 'Daily-FeatureFunctionality':
        this.selectedTypeFilter = 'feature';
        break;
      case 'Daily-CallingReliability':
        this.selectedTypeFilter = 'calling';
        break;
      case 'None':
        this.selectedTypeFilter = ''
        break;
      default:
        break;
    }
  }

  onClickMoreDetails(): void {

    // const type = (reportType === 'Daily-FeatureFunctionality') ? ReportType.DAILY_FEATURE_FUNCTIONALITY : (reportType === 'Daily-CallingReliability') ? ReportType.DAILY_CALLING_RELIABILITY : '';
    const type = ReportType.DAILY_FEATURE_FUNCTIONALITY;
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${type}&start=${this.startDate}&end=${this.endDate}`;
    window.open(url);
    window.close();
  }

  toggleDateValue(date: any) {
    console.log(date);
    console.log(this.startDate);
    // this.minEndDate = '';
    // this.endDate = null;
  }

  clearDateFilter(selector: string) {
    if (selector === 'start') {
      this.startDate = null;
      // if (this.endDate < this.minEndDate)
      //   this.endDate = null;
      // this.minEndDate = '';
    } else
      this.endDate = null;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
