import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { Subject } from 'rxjs';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { environment } from 'src/environments/environment';
import { Utility } from 'src/app/helpers/utils';
import { MsalService } from '@azure/msal-angular';
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { BannerService } from "../../../services/alert-banner.service";

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
  submitDisabled = false;

  readonly reportsTypes = ['Daily-FeatureFunctionality', 'Daily-CallingReliability'];

  filterForm = this.formBuilder.group({
    reportType: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  });

  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private msalService: MsalService,
    private subaccountService: SubAccountService,
    private formBuilder: FormBuilder,
    private ctaasSetupService: CtaasSetupService,
    private bannerService: BannerService) { }

  ngOnInit(): void {
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.userSetupData();
    this.maxDate = moment().format("YYYY-MM-DD[T]HH:mm:ss");
  }


  filterReport(): void {
    const details = this.filterForm.value;
    const parsedStartTime = Utility.parseReportDate(new Date(details.startDate));
    const parsedEndTime = Utility.parseReportDate(new Date(details.endDate));
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${details.reportType}&start=${parsedStartTime}&end=${parsedEndTime}`;
    window.open(url);
    window.close();
  }

  toggleDateValue(date: any) {
    this.minEndDate = date;
  }

  clearDateFilter(selector: string) {
    console.log(selector);
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

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
