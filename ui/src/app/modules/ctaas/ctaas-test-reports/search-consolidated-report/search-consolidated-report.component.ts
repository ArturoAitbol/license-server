import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import moment, { Moment } from 'moment';
import { Utility } from 'src/app/helpers/utils';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { environment } from 'src/environments/environment';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-search-consolidated-report',
  templateUrl: './search-consolidated-report.component.html',
  styleUrls: ['./search-consolidated-report.component.css']
})
export class SearchConsolidatedReportComponent implements OnInit {
  maxStartDate: any;
  minStartDate: any;
  maxEndDate: any;
  minEndDate: any;
  subaccountDetails:any;
  isDataLoading = false;
  maxTime: any;
  maxTimeBK: any;
  minTime: any;
  minTimeBK: any;
  startDate: Moment;
  endDate: Moment;
  dateLimit: number = 4;
  readonly CALLING: string = 'Calling Reliability';
  readonly FEATURE: string = 'Feature Functionality';
  readonly VOICE: string = 'Voice Quality (POLQA)';

  readonly reportsTypes = ['Feature Functionality', 'Calling Reliability', 'Voice Quality (POLQA)'];

  searchForm = this.formBuilder.group({
    reportType: ['',Validators.required],
    startDate: ['',Validators.required],
    endDate: ['',Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required]
  });


  constructor(
    private subaccountService: SubAccountService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<SearchConsolidatedReportComponent>,
    private dialogService: DialogService) { }

  ngOnInit(): void {
    this.dialogService.showHelpButton = true;
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.maxStartDate = moment().format("YYYY-MM-DD[T]HH:mm:ss");
    this.maxEndDate = this.maxStartDate;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  consolidatedReport(): void {
    const details = this.searchForm.value;
    let reportType;
    switch (details.reportType) {
      case this.FEATURE:
        reportType = 'Daily-FeatureFunctionality';
        break;
      case this.CALLING:
        reportType = 'Daily-CallingReliability';
        break;
      case this.VOICE:
        reportType = 'Daily-VQ'
        break;
    }
    const parsedStartTime = moment.utc(details.startDate).format("MM-DD-YYYY") + ' ' + details.startTime + ':00';
    const parsedEndTime = moment.utc(details.endDate).format("MM-DD-YYYY") + ' ' + details.endTime + ':59';
    const parsedStartDate = Utility.parseReportDate(moment.utc(parsedStartTime, 'MM-DD-YYYY HH:mm:ss'));
    const parsedEndDate = Utility.parseReportDate(moment.utc(parsedEndTime, 'MM-DD-YYYY HH:mm:ss'));
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${reportType}&start=${parsedStartDate}&end=${parsedEndDate}`;
    window.open(url);
  }

  toggleStartDate(date: any) {
    this.startDate = date;
    this.searchForm.get('startTime').setValue("");
    this.minEndDate = date;
    let actualDate = moment.utc();
    let dateLimitControl = moment.utc(date).add(this.dateLimit, "days");
    if (actualDate.isSameOrBefore(dateLimitControl))
      this.maxEndDate = actualDate.format("YYYY-MM-DD[T]HH:mm:ss");
    else
      this.maxEndDate = dateLimitControl.format("YYYY-MM-DD[T]HH:mm:ss");
  }
  
  toggleEndDate(endDate: any) {
    this.endDate = endDate;
    this.searchForm.get('endTime').setValue("");
  }

  validateTimers() {
    if (!this.startDate || !this.endDate)
      return;
    const daysDiff = this.endDate.diff(this.startDate, "days");
    if (daysDiff > 0) {
      this.minTime = "00:00";
      this.maxTime = "23:59";
    } else if (daysDiff === 0) {
      this.minTime = this.minTimeBK;
      this.maxTime = this.maxTimeBK;
    }
  }
  
  onChangeStartTime(event: any) {
    if (this.startDate && this.endDate && this.endDate.diff(this.startDate, "days") === 0)
      this.minTime = event;
    this.minTimeBK = event;
  }

  onChangeEndTime(event: any) {
    if (this.startDate && this.endDate && this.endDate.diff(this.startDate, "days") === 0)
      this.maxTime = event;
    this.maxTimeBK = event;
  }

}
