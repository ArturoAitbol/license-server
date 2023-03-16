import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { Utility } from 'src/app/helpers/utils';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search-consolidate-date',
  templateUrl: './search-consolidate-date.component.html',
  styleUrls: ['./search-consolidate-date.component.css']
})
export class SearchConsolidateDateComponent implements OnInit {
  public maxDate: any;
  public minEndDate: any;
  subaccountDetails:any;
  isDataLoading = false;
  maxTime: any;
  minTimeBK: any;
  minTime: any;
  startDate: any;
  endDate: any;

  readonly reportsTypes = ['Daily-FeatureFunctionality', 'Daily-CallingReliability'];

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
    public dialogRef: MatDialogRef<SearchConsolidateDateComponent>) { }

  ngOnInit(): void {
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.maxDate = moment().format("YYYY-MM-DD[T]HH:mm:ss");
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  consolidatedReport(): void {
    const details = this.searchForm.value;
    const parsedStartTime = moment.utc(details.startDate).format("MM-DD-YYYY") + ' ' + details.startTime + ':00';
    const parsedEndTime = moment.utc(details.endDate).format("MM-DD-YYYY") + ' ' + details.endTime + ':59'; 
    const parsedStartDate = Utility.parseReportDate(new Date(parsedStartTime));
    const parsedEndDate = Utility.parseReportDate(new Date(parsedEndTime));
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${details.reportType}&start=${parsedStartDate}&end=${parsedEndDate}`;
    window.open(url);
    window.close();
  }

  toggleDateValue(date: any) {
    this.minEndDate = date;
    this.startDate = date;
    this.searchForm.get('startTime').setValue("");
  }
  
  toggleEndDate(endDate: any) {
    this.endDate = endDate;
    this.searchForm.get('endTime').setValue("");
  }

  validateTimers() {
    if(this.endDate > this.startDate)
      this.minTime = "00:00";
    else
      this.minTime = this.minTimeBK;
  }
  
  onChangeStartTime(event) {
    this.minTime = event
    this.minTimeBK = event
  }

  endtTimeChanged(event) {
    this.maxTime = event
  }
}
