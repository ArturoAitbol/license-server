import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { Utility } from 'src/app/helpers/utils';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search-consolidated-report',
  templateUrl: './search-consolidated-report.component.html',
  styleUrls: ['./search-consolidated-report.component.css']
})
export class SearchConsolidatedReportComponent implements OnInit {
  maxDate: any;
  maxEndDate: any;
  minEndDate: any;
  subaccountDetails:any;
  isDataLoading = false;
  maxTime: any;
  minTimeBK: any;
  minTime: any;
  startDate: any;
  endDate: any;
  dateLimit: number = 9;
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
    public dialogRef: MatDialogRef<SearchConsolidatedReportComponent>) { }

  ngOnInit(): void {
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.maxDate = moment().format("YYYY-MM-DD[T]HH:mm:ss");
    this.maxEndDate = this.maxDate;
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
    const parsedStartDate = Utility.parseReportDate(new Date(parsedStartTime));
    const parsedEndDate = Utility.parseReportDate(new Date(parsedEndTime));
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${reportType}&start=${parsedStartDate}&end=${parsedEndDate}`;
    window.open(url);
  }

  toggleDateValue(date: any) {
    let selectedDate;
    let actualDate;
    let dateControl;
    this.minEndDate = date;
    this.startDate = date;
    this.searchForm.get('startTime').setValue("");
    selectedDate = [parseInt(moment.utc(date).format("DD")), parseInt(moment.utc(date).format("MM")), parseInt(moment.utc(date).format("YYYY"))];
    actualDate = [parseInt(moment.utc().format("DD")),  parseInt(moment.utc().format("MM")), parseInt(moment.utc().format("YYYY"))];
    dateControl = actualDate[0] - selectedDate[0];
    if(dateControl < this.dateLimit && (selectedDate[1] == actualDate[1]) && (selectedDate[2] == actualDate[2])){
      this.maxEndDate = moment.utc(date).add(dateControl, 'days').format("YYYY-MM-DD[T]HH:mm:ss");
    }else {
      this.maxEndDate = moment.utc(date).add(this.dateLimit, 'days').format("YYYY-MM-DD[T]HH:mm:ss");
    }
  }
  
  toggleEndDate(endDate: any) {
    this.endDate = endDate;
    this.searchForm.get('endTime').setValue("");
  }

  validateTimers() {
    let selectedStartDate = [ parseInt(moment(this.startDate).format("DD")), parseInt(moment(this.startDate).format("MM")), parseInt(moment(this.startDate).format("YYYY"))]
    let selectedEndDate = [ parseInt(moment(this.endDate).format("DD")), parseInt(moment(this.endDate).format("MM")), parseInt(moment(this.endDate).format("YYYY"))]
    if(this.endDate > this.startDate){
      this.minTime = "00:00";
    }else if(selectedStartDate[0] == selectedEndDate[0] && selectedStartDate[1] == selectedEndDate[1] && selectedStartDate[2] == selectedEndDate[2]) {
      this.minTime = this.minTimeBK;
    }
  }
  
  onChangeStartTime(event) {
    this.minTime = event
    this.minTimeBK = event
  }

  endtTimeChanged(event) {
    this.maxTime = event
  }
}
