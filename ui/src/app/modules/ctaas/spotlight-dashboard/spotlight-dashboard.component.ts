import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from "../../../helpers/chart-options-type";
import {
  defaultFailedCallsChartOptions,
  defaultVqChartOptions,
  defaultWeeklyFeatureFunctionalityChartOptions,
  defaultWeeklyCallingReliabilityChartOptions,
  defaultWeeklyCallsStatusChartOptions,
  defaultWeeklyVQChartOptions
} from "./initial-chart-config";
import { SubAccountService } from "../../../services/sub-account.service";
import { SpotlightChartsService } from "../../../services/spotlight-charts.service";
import moment, { Moment } from "moment";
import { forkJoin, Observable, interval } from "rxjs";
import { Utility } from "../../../helpers/utils";
import { environment } from "../../../../environments/environment";
import { ReportType } from "../../../helpers/report-type";
import { FormBuilder } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { NetworkQualityComponent } from "./network-quality/network-quality.component";
import { Subject } from "rxjs/internal/Subject";
import { ActivatedRoute } from "@angular/router";
import { Note } from "../../../model/note.model";
import { NoteService } from "../../../services/notes.service";
@Component({
  selector: 'app-spotlight-dashboard',
  templateUrl: './spotlight-dashboard.component.html',
  styleUrls: ['./spotlight-dashboard.component.css']
})

export class SpotlightDashboardComponent implements OnInit{
  vqChartOptions: Partial<ChartOptions>;

  // Weekly Feature Functionality variables
  weeklyFeatureFunctionality = {timePeriod: '', numberCalls: 0, p2pCalls: 0, onNetCalls: 0, offNetCalls: 0};
  weeklyFeatureFunctionalityChartOptions: Partial<ChartOptions>;

  // Weekly Calling Reliability variables
  weeklyCallingReliability = {timePeriod: '', numberCalls: 0, p2pCalls: 0, onNetCalls: 0, offNetCalls: 0};
  weeklyCallingReliabilityChartOptions: Partial<ChartOptions>;
  weeklyCallsStatusChartOptions: Partial<ChartOptions>;

  // Weekly calls status Heat Map variables
  weeklyCallsStatusHeatMap: { series:any , maxValues:any , summary:any };
  heatMapCallsSummary = { total: 0 , failed: 0 };
  selectedStatus = 'total';

  // Weekly VQ variables
  weeklyVQ = {timePeriod: '', numberCalls: 0, numberStreams: 0, p2p: 0, onNet: 0, offNet: 0};
  weeklyVQChartOptions: Partial<ChartOptions>;

  // Daily Failed Calls chart variables
  failedCallsChartOptions: Partial<ChartOptions>;
  calls = {timePeriod: '', total: 0, failed: 0, onNetCalls:0, offNetCalls:0, p2pCalls: 0 };

  // Daily Calling Reliabilty gaguge variables
  callingReliability = { value: 0, total: 0, p2p:0, onNet:0, offNet:0, period: '' };

  // Daily Feature Functionality gaguge variables
  featureFunctionality = { value: 0, total: 0, p2p:0, onNet:0, offNet:0,  period: '' };

  // Daily Feature Functionality gaguge variables
  vq = { period: '', calls: 0, streams: 0, numericValues: [], p2p: 0, onNet: 0, offNet: 0};

  //Selected graphs variables
  selectedPeriod = 'daily';

  //Daily filters variables
  filters = this.fb.group({
    date: [moment().utc()],
    region: [""]
  });

  //Weekly filters variables
  weeklyFilters = this.fb.group({
    date: [moment().utc()],
    region: [""]
  });

  regions: { country: string, state: string, city: string, displayName: string }[] = [];
  users: string[] = [];
  filteredRegions: Observable<{ country: string, state: string, city: string, displayName: string }[]>;
  weeklyFilteredRegions: Observable<{ country: string, state: string, city: string, displayName: string }[]>;
  filteredUsers: Observable<string[]>;
  maxDate = moment().utc();
  minDate = moment.utc('0001-01-01');

  selectedDate: Moment = null;
  selectedRange: {start: Moment, end: Moment} = null;
  loadingTime = 0;

  isloading = true;

  startTime = 0;
  milliseconds = 0;
  seconds = 0;
  timer: any;
  stopTimer$: Subject<void> = new Subject();
  timerIsRunning = false;
  isRefreshing = false;
  chartsLoaded = 0;
  selectedRegions = [];
  weeklySelectedRegions = [];

  // Historical view variables
  isHistoricalView = false;
  note: Note;

  @ViewChild('regionInput') regionInput: ElementRef<HTMLInputElement>;

  @ViewChild('networkQuality') networkQuality: NetworkQualityComponent;

  constructor(private subaccountService: SubAccountService,
              private spotlightChartsService: SpotlightChartsService,
              private noteService: NoteService,
              private route: ActivatedRoute,
              private fb: FormBuilder) {
    this.vqChartOptions = defaultVqChartOptions;
    this.weeklyFeatureFunctionalityChartOptions = defaultWeeklyFeatureFunctionalityChartOptions;
    this.weeklyCallingReliabilityChartOptions = defaultWeeklyCallingReliabilityChartOptions;
    this.failedCallsChartOptions = defaultFailedCallsChartOptions;
    this.weeklyCallsStatusChartOptions = defaultWeeklyCallsStatusChartOptions;
    this.weeklyVQChartOptions = defaultWeeklyVQChartOptions;
    this.setWeeklyRange();
  }

  ngOnInit() {
    this.initAutocompletes();
    this.initWeeklyAutocompletes();
    this.route.queryParams.subscribe(params => {
      if (params?.noteId) {
        this.noteService.getNoteList(this.subaccountService.getSelectedSubAccount().id, params.noteId).subscribe(res => {
          this.note = res.notes[0];
          this.filters.get('date').setValue(moment(this.note.openDate).utc());
          this.weeklyFilters.get('date').setValue(moment(this.note.openDate).utc());
          console.log(this.note.openDate, this.filters.get('date').value, this.weeklyFilters.get('date').value);
          this.isHistoricalView = true;
          this.loadCharts();
        });
      } else this.loadCharts();
    });
  }

  getStartWeekDate(): Moment{
    return this.weeklyFilters.get('date').value.clone().subtract(6, 'days').startOf('day');
  }
  getEndWeekDate(): Moment{
    return Utility.setHoursOfDate(this.weeklyFilters.get('date').value.clone());
  }

  setWeeklyRange(){
    this.selectedRange = { start: this.getStartWeekDate(), end: this.getEndWeekDate() };
  }
  
  remove(region: string): void {
    const regions = this.selectedPeriod==='daily'? this.selectedRegions : this.weeklySelectedRegions;
    const index = regions.indexOf(region);
    if (index >= 0) {
      regions.splice(index, 1);
    }
  }

  selected(): void {
    if(this.selectedPeriod==='daily'){
      this.selectedRegions.push(this.filters.get('region').value);
      this.filters.get('region').setValue("");
      this.initAutocompletes();
    }else{
      this.weeklySelectedRegions.push(this.weeklyFilters.get('region').value);
      this.weeklyFilters.get('region').setValue("");
      this.initWeeklyAutocompletes();
    }
    this.regionInput.nativeElement.value = ''; 
  }

  clearRegionsFilter(){
    if(this.selectedPeriod==='daily')
      this.selectedRegions=[];
    else
      this.weeklySelectedRegions=[];
  }

  chartsStatus(chartCompleted:boolean){
    if(chartCompleted)
      this.chartsLoaded++;
    if(this.chartsLoaded==2){
      this.stopTimer();
      this.chartsLoaded = 0;
    }
  }

  reloadCharts(){
    if (this.filters.get('date').dirty || this.weeklyFilters.get('date').dirty)
      this.isHistoricalView = false;
    this.loadCharts();
    this.networkQuality.loadCharts();
  }

  loadCharts() {
    this.startTimer();
    this.chartsLoaded = 0;
    this.calls.total = 0;
    this.calls.failed = 0;
    this.isloading = true;
    const startTime = performance.now();
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    const obs = [];

    if (this.selectedPeriod == "daily") {
      const selectedDate = Utility.setHoursOfDate(this.filters.get('date').value);
      this.selectedDate = selectedDate.clone().utc();
      obs.push(this.spotlightChartsService.getDailyCallsStatusSummary(selectedDate, this.selectedRegions, subaccountId));
      obs.push(this.spotlightChartsService.getVoiceQualityChart(selectedDate, selectedDate, this.selectedRegions, subaccountId));
    } else {
      this.setWeeklyRange();
      const selectedStartDate: Moment = this.selectedRange.start.clone();
      const selectedEndDate: Moment = this.selectedRange.end.clone();
      obs.push(this.spotlightChartsService.getWeeklyComboBarChart(selectedStartDate, selectedEndDate, subaccountId, 'FeatureFunctionality', this.weeklySelectedRegions));
      obs.push(this.spotlightChartsService.getWeeklyComboBarChart(selectedStartDate, selectedEndDate, subaccountId, 'CallingReliability', this.weeklySelectedRegions));
      obs.push(this.spotlightChartsService.getWeeklyCallsStatusHeatMap(selectedStartDate, selectedEndDate, subaccountId, this.weeklySelectedRegions));
      obs.push(this.spotlightChartsService.getWeeklyCallsStatusSummary(selectedStartDate, selectedEndDate, this.weeklySelectedRegions, subaccountId));
      obs.push(this.spotlightChartsService.getVoiceQualityChart(selectedStartDate, selectedEndDate, this.weeklySelectedRegions, subaccountId, true));
    }
    forkJoin(obs).subscribe((res: any) => {
      if (this.selectedPeriod == "daily")
        this.processDailyData(res);
      else
        this.processWeeklyData(res);
      // common values
      const endTime = performance.now();
      this.loadingTime = (endTime - startTime) / 1000;
      this.isloading = false;
      this.chartsStatus(true);
    }, error => {
      console.error(error);
      this.isloading = false;
      this.chartsStatus(true);
    });
  }
  

  private processDailyData (res: any) {
    const executionTime = this.formatExecutionTime(this.selectedDate,this.selectedDate);
    // Daily Calling reliability
    const dailyCallingReliabiltyRes: any = res[0].callingReliability;
    const POLQA = res[0].POLQA;
    let passedCalls = dailyCallingReliabiltyRes.callsByStatus.PASSED + POLQA.callsByStatus.PASSED;
    let failedCalls = dailyCallingReliabiltyRes.callsByStatus.FAILED + POLQA.callsByStatus.FAILED;
    this.callingReliability.total = passedCalls + failedCalls;
    this.callingReliability.p2p = dailyCallingReliabiltyRes.callsByType.p2p + POLQA.callsByType.p2p;
    this.callingReliability.onNet = dailyCallingReliabiltyRes.callsByType.onNet + POLQA.callsByType.onNet;
    this.callingReliability.offNet = dailyCallingReliabiltyRes.callsByType.offNet + POLQA.callsByType.offNet;
    this.callingReliability.value = (passedCalls / this.callingReliability.total) * 100 || 0;

    this.callingReliability.period = executionTime;
    
    this.calls.total += this.callingReliability.total;
    this.calls.failed += dailyCallingReliabiltyRes.callsByStatus.FAILED;
    this.calls.p2pCalls += this.callingReliability.p2p;
    this.calls.onNetCalls += this.callingReliability.onNet;
    this.calls.offNetCalls += this.callingReliability.offNet;

    this.calls.timePeriod = executionTime;

    // Daily Feature Functionality
    const dailyFeatureFunctionalityRes: any = res[0].featureFunctionality;
    passedCalls = dailyFeatureFunctionalityRes.callsByStatus.PASSED;
    failedCalls = dailyFeatureFunctionalityRes.callsByStatus.FAILED;
    this.featureFunctionality.total = passedCalls + failedCalls;
    this.featureFunctionality.p2p = dailyFeatureFunctionalityRes.callsByType.p2p;
    this.featureFunctionality.onNet = dailyFeatureFunctionalityRes.callsByType.onNet;
    this.featureFunctionality.offNet = dailyFeatureFunctionalityRes.callsByType.offNet;
    this.featureFunctionality.value = (passedCalls / this.featureFunctionality.total) * 100 || 0;

    this.featureFunctionality.period = executionTime;
    
    this.calls.total += this.featureFunctionality.total;
    this.calls.failed += dailyFeatureFunctionalityRes.callsByStatus.FAILED;
    this.calls.p2pCalls += this.featureFunctionality.p2p;
    this.calls.onNetCalls += this.featureFunctionality.onNet;
    this.calls.offNetCalls += this.featureFunctionality.offNet;

    // Daily Voice Quality
    const voiceQualityRes: any = res[1];
    this.vq.calls = voiceQualityRes.summary.calls;
    this.vq.streams = voiceQualityRes.summary.streams;
    this.vq.p2p = POLQA.p2p;
    this.vq.onNet = POLQA.onNet;
    this.vq.offNet = POLQA.offNet;
    this.vqChartOptions.series = [ { name: 'percentages', data: voiceQualityRes.percentages }];
    this.vqChartOptions.xAxis.categories = voiceQualityRes.categories;
    this.vq.period = executionTime;
    this.vq.numericValues = voiceQualityRes.numericValues;

    // Daily Failed Calls Chart
    this.failedCallsChartOptions.series = [Number((this.calls.failed / this.calls.total * 100 || 0).toFixed(2))];

    if(this.selectedRegions.length>0)
      this.reloadUserOptions(this.selectedRegions);
    else
      this.reloadFilterOptions();
  }

  private processWeeklyData (res: any) {
    // Weekly Feature Functionality
    const weeklyFeatureFunctionalityData = res[0];
    this.weeklyFeatureFunctionalityChartOptions.xAxis.categories = weeklyFeatureFunctionalityData.categories;
    this.weeklyFeatureFunctionalityChartOptions.series = [
      {
        name: "Success %",
        data: weeklyFeatureFunctionalityData.series['percentage'],
        type: "line"
      },
      {
        name: "Passed",
        data: weeklyFeatureFunctionalityData.series['passed'],
        type: "column",
      },
      {
        name: "Failed",
        data: weeklyFeatureFunctionalityData.series['failed'],
        type: "column",
      }
    ];

    // Weekly Calling Reliability
    const weeklyCallingReliabilityData = res[1];
    this.weeklyCallingReliabilityChartOptions.xAxis.categories = weeklyCallingReliabilityData.categories;
    this.weeklyCallingReliabilityChartOptions.series = [
      {
        name: "Success %",
        data: weeklyCallingReliabilityData.series['percentage'],
        type: "line"
      },
      {
        name: "Passed",
        data: weeklyCallingReliabilityData.series['passed'],
        type: "column",
      },
      {
        name: "Failed",
        data: weeklyCallingReliabilityData.series['failed'],
        type: "column",
      }
    ];

    // Weekly Calls Status HeatMap
    this.weeklyCallsStatusHeatMap = res[2];
    this.heatMapCallsSummary.total = this.weeklyCallsStatusHeatMap.summary.totalCalls;
    this.heatMapCallsSummary.failed = this.weeklyCallsStatusHeatMap.summary.failedCalls;
    this.changeHeatMapData();

    // Weekly CR and FF footer info
    const weeklyCallStatus = res[3];
    const POLQA = res[3].POLQA;
    this.weeklyFeatureFunctionality.p2pCalls = weeklyCallStatus.featureFunctionality.callsByType.p2p;
    this.weeklyFeatureFunctionality.onNetCalls = weeklyCallStatus.featureFunctionality.callsByType.onNet;
    this.weeklyFeatureFunctionality.offNetCalls = weeklyCallStatus.featureFunctionality.callsByType.offNet;
    this.weeklyFeatureFunctionality.numberCalls = weeklyCallStatus.featureFunctionality.callsByStatus.PASSED + weeklyCallStatus.featureFunctionality.callsByStatus.FAILED;

    this.weeklyCallingReliability.p2pCalls = weeklyCallStatus.callingReliability.callsByType.p2p + POLQA.callsByType.p2p;
    this.weeklyCallingReliability.onNetCalls = weeklyCallStatus.callingReliability.callsByType.onNet + POLQA.callsByType.onNet;
    this.weeklyCallingReliability.offNetCalls = weeklyCallStatus.callingReliability.callsByType.offNet + POLQA.callsByType.offNet;
    this.weeklyCallingReliability.numberCalls = weeklyCallStatus.callingReliability.callsByStatus.PASSED + weeklyCallStatus.callingReliability.callsByStatus.FAILED
        + POLQA.callsByStatus.PASSED + POLQA.callsByStatus.FAILED;

    const timePeriod = this.formatExecutionTime(this.selectedRange.start,this.selectedRange.end);
    this.weeklyFeatureFunctionality.timePeriod = timePeriod;
    this.weeklyCallingReliability.timePeriod = timePeriod;

    // Weekly VQ chart
    const vqData = res[4];
    this.weeklyVQ.timePeriod = timePeriod;
    this.weeklyVQ.numberStreams = vqData.summary.streams;
    this.weeklyVQ.numberCalls = vqData.summary.calls;
    this.weeklyVQ.p2p = POLQA.p2p;
    this.weeklyVQ.onNet = POLQA.onNet;
    this.weeklyVQ.offNet = POLQA.offNet;
    this.weeklyVQChartOptions.xAxis.categories = vqData.categories;
    this.weeklyVQChartOptions.series = [ {
      name: 'Excellent',
      data: vqData.percentages.excellent,
    }, {
      name: 'Good',
      data: vqData.percentages.good,
    }, {
      name: 'Fair',
      data: vqData.percentages.fair,
    }, {
      name: 'Bad',
      data: vqData.percentages.bad,
    } ];

    if(this.weeklySelectedRegions.length>0)
      this.reloadUserOptions(this.weeklySelectedRegions);
    else
      this.reloadFilterOptions();
  }

  formatExecutionTime(startDate: Moment,endDate): string{
    return startDate.format("MM-DD-YYYY 00:00:00") + " AM UTC to " + endDate.format("MM-DD-YYYY HH:mm:ss A") + " UTC";
  }

  changeHeatMapData(){
    this.weeklyCallsStatusChartOptions.series = this.weeklyCallsStatusHeatMap.series[this.selectedStatus];
    const maxValue = this.weeklyCallsStatusHeatMap.maxValues[this.selectedStatus];
    this.weeklyCallsStatusChartOptions.plotOptions.heatmap.colorScale.ranges[0].to = maxValue;
  }

  navigateToDetailedTable(reportType?: string) {
    const startDate = this.selectedDate.clone().utc().startOf('day');
    const endDate = this.selectedDate.clone().utc();
    const startTime = Utility.parseReportDate(startDate);
    const endTime = Utility.parseReportDate(endDate);
    const reportFilter = reportType? "type=" + reportType : "status=FAILED";
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountService.getSelectedSubAccount().id}&${reportFilter}&start=${startTime}&end=${endTime}`;
    window.open(url);
  }

  regionDisplayFn(region: any) {
    return region.displayName;
  }

  private _filterRegion(value: string): { country: string; state: string; city: string; displayName: string }[] {
    const filterValue = value.toLowerCase();

    return this.regions.filter(option => option.displayName.toLowerCase().includes(filterValue));
  }

  private initAutocompletes() {
    this.filteredRegions = this.filters.get('region').valueChanges.pipe(
        startWith(''),
        map(value => this._filterRegion(value || '')),
    );
  }

  private initWeeklyAutocompletes() {
    this.weeklyFilteredRegions = this.weeklyFilters.get('region').valueChanges.pipe(
        startWith(''),
        map(value => this._filterRegion(value || '')),
    );
  }

  private reloadFilterOptions() {
    this.weeklyFilters.disable();
    this.filters.disable();
    this.networkQuality.filters.disable();
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    let startDate, endDate;
    if (this.selectedPeriod == "daily") {
      startDate = endDate = this.selectedDate;
    }else{
      startDate = this.selectedRange.start;
      endDate = this.selectedRange.end;
    }
    this.spotlightChartsService.getFilterOptions(subaccountId,startDate,endDate).subscribe((res: any) => {
      const regions = [];
      res.regions.map(region => {
        if (region.country !== null){
          regions.push({country: region.country, state: null, city: null, displayName: region.country});
          if (region.state && region.country) regions.push({country: region.country, state: region.state, city: null, displayName: `${region.state}, ${region.country}`});
          if (region.state && region.country && region.city) regions.push({country: region.country, state: region.state, city: region.city, displayName: `${region.city}, ${region.state}, ${region.country}`});
        }
      });
      const flags = new Set();
      this.regions = regions.filter(entry => {
        if (flags.has(entry.displayName) || !entry.displayName.trim().length) {
          return false;
        }
        flags.add(entry.displayName);
        return true;
      }).sort();
      this.users = res.users.filter(user => user !== null);
      this.filters.enable();
      this.weeklyFilters.enable();

      this.networkQuality.initAutocompletes();

      this.networkQuality.filters.enable();
    })
  }

  private reloadUserOptions(regions?: any) {
    this.filters.disable();
    this.weeklyFilters.disable();
    this.networkQuality.filters.disable();
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    let startDate, endDate;
    if (this.selectedPeriod == "daily") {
      startDate = endDate = this.selectedDate;
    }else{
      startDate = this.selectedRange.start;
      endDate = this.selectedRange.end;
    }
    this.spotlightChartsService.getFilterOptions(subaccountId,startDate,endDate,"users",regions ? regions : null).subscribe((res: any) => {
      this.users = res.users.filter(user => user !== null);
      this.filters.enable();
      this.weeklyFilters.enable();

      this.networkQuality.initAutocompletes();
      this.networkQuality.filters.enable();
    })
  }

  readonly ReportType = ReportType;


  startTimer() {
    if(!this.timerIsRunning){
        this.startTime = 0;
        this.seconds=0;
        this.milliseconds = 0;
        this.startTime = performance.now();
        this.timer = interval(1).subscribe(() => {
            const elapsedTime = performance.now() - this.startTime;
            this.seconds = Math.floor(elapsedTime / 1000);
            this.milliseconds = Math.floor(elapsedTime % 1000);
        });
        this.timerIsRunning = true;
    }
  }

  stopTimer() {
      this.timer.unsubscribe();
      this.timerIsRunning = false;
  }

  getSubaccountId(): string {
    return this.subaccountService.getSelectedSubAccount().id;
  }
}
