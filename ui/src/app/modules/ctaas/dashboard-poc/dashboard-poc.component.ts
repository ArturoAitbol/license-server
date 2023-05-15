import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from "../../../helpers/chart-options-type";
import {
  defaultFailedCallsChartOptions,
  defaultVqChartOptions,
  defaultWeeklyFeatureFunctionalityChartOptions
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
import { NetworkQualityTrendsComponent } from "./network-quality-trends/network-quality-trends.component";
import { Subject } from "rxjs/internal/Subject";
import { CustomerNetworkQualityComponent } from './customer-network-quality/customer-network-quality/customer-network-quality.component';
@Component({
  selector: 'app-dashboard-poc',
  templateUrl: './dashboard-poc.component.html',
  styleUrls: ['./dashboard-poc.component.css']
})

export class DashboardPocComponent implements OnInit{
  vqChartOptions: Partial<ChartOptions>;
  weeklyCallingReliabilityChartOptions: Partial<ChartOptions>;

  // Failed Calls chart variables
  failedCallsChartOptions: Partial<ChartOptions>;
  calls = { total: 0, failed: 0 };

  // Calling Reliabilty gaguge variables
  callingReliability = { value: 0, total: 0, p2p:0, onNet:0, offNet:0, period: '' };

  // Feature Functionality gaguge variables
  featureFunctionality = { value: 0, total: 0, p2p:0, onNet:0, offNet:0,  period: '' };

  // Feature Functionality gaguge variables
  vq = { period: '', calls: 0, streams: 0 };

  //Selected graphs variables
  selectedPeriod = 'daily';

  // Filters variables
  filters = this.fb.group({
    date: [moment()],
    region: [""]
  });
  regions: { country: string, state: string, city: string, displayName: string }[] = [];
  users: string[] = [];
  filteredRegions: Observable<{ country: string, state: string, city: string, displayName: string }[]>;
  filteredUsers: Observable<string[]>;
  maxDate = moment();

  selectedDate: Moment = null;
  loadingTime = 0;

  isloading = true;

  startTime: number = 0;
  milliseconds: number = 0;
  seconds: number = 0;
  timer: any;
  stopTimer$: Subject<void> = new Subject();
  timerIsRunning = false;
  isRefreshing = false;
  chartsLoaded = 0;

  @ViewChild('dailyNetworkTrends') dailyNetworkTrends: NetworkQualityTrendsComponent;
  @ViewChild('customerNetworkQuality') customerNetworkQuality: CustomerNetworkQualityComponent;
  
  constructor(private subaccountService: SubAccountService,
              private spotlightChartsService: SpotlightChartsService,
              private fb: FormBuilder) {
    this.vqChartOptions = defaultVqChartOptions;
    this.weeklyCallingReliabilityChartOptions = defaultWeeklyFeatureFunctionalityChartOptions;
    this.failedCallsChartOptions = defaultFailedCallsChartOptions;
  }

  ngOnInit() {
    this.initAutocompletes();
    this.loadCharts();
    this.startTimer();
  }

  chartsStatus(chartCompleted:boolean){
    if(chartCompleted)
      this.chartsLoaded++;
    if(this.chartsLoaded==3){
      this.stopTimer();
      this.chartsLoaded = 0;
    }
  }

  reloadCharts() {
    this.chartsLoaded = 0;
    this.dailyNetworkTrends.isLoading = true;
    this.customerNetworkQuality.isLoading = true;
    this.loadCharts();
    this.dailyNetworkTrends.loadCharts();
    this.customerNetworkQuality.loadCharts();
    this.startTimer();
  }

  loadCharts() {
    this.calls.total = 0;
    this.calls.failed = 0;
    this.isloading = true;
    const startTime = performance.now();
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    const obs = [];
    const selectedDate = this.filters.get('date').value;
    const selectedRegion = this.filters.get('region').value;
    this.selectedDate = this.filters.get('date').value.clone().utc();

    obs.push(this.spotlightChartsService.getDailyCallsStatusSummary(selectedDate, selectedRegion, subaccountId));
    obs.push(this.spotlightChartsService.getVoiceQualityChart(selectedDate, selectedDate, selectedRegion, subaccountId));
    obs.push(this.spotlightChartsService.getWeeklyCallingReliability(moment().startOf('week').add(1, 'day'), moment().endOf('week').add(1, 'day'), subaccountId));
    forkJoin(obs).subscribe((res: any) => {
      // Daily Calling reliability
      const dailyCallingReliabiltyRes: any = res[0].callingReliability;
      let passedCalls = dailyCallingReliabiltyRes.callsByStatus.PASSED;
      let failedCalls = dailyCallingReliabiltyRes.callsByStatus.FAILED;
      this.callingReliability.total = passedCalls + failedCalls;
      this.callingReliability.p2p = dailyCallingReliabiltyRes.callsByType.p2p;
      this.callingReliability.onNet = dailyCallingReliabiltyRes.callsByType.onNet;
      this.callingReliability.offNet = dailyCallingReliabiltyRes.callsByType.offNet;
      this.callingReliability.value = (passedCalls/this.callingReliability.total)*100 || 0;

      this.callingReliability.period = selectedDate.format("MM-DD-YYYY 00:00:00") + " AM UTC to " + selectedDate.format("MM-DD-YYYY 11:59:59") + " PM UTC";
      
      this.calls.total += this.callingReliability.total;
      this.calls.failed += dailyCallingReliabiltyRes.callsByStatus.FAILED;

      // Daily Feature Functionality
      const dailyFeatureFunctionalityRes: any = res[0].featureFunctionality;
      passedCalls = dailyFeatureFunctionalityRes.callsByStatus.PASSED;
      failedCalls = dailyFeatureFunctionalityRes.callsByStatus.FAILED;
      this.featureFunctionality.total = passedCalls + failedCalls;
      this.featureFunctionality.p2p = dailyFeatureFunctionalityRes.callsByType.p2p;
      this.featureFunctionality.onNet = dailyFeatureFunctionalityRes.callsByType.onNet;
      this.featureFunctionality.offNet = dailyFeatureFunctionalityRes.callsByType.offNet;
      this.featureFunctionality.value = (passedCalls/this.featureFunctionality.total)*100 || 0;

      this.featureFunctionality.period = selectedDate.format("MM-DD-YYYY 00:00:00") + " AM UTC to " + selectedDate.format("MM-DD-YYYY 11:59:59") + " PM UTC";
      
      this.calls.total += this.featureFunctionality.total;
      this.calls.failed += dailyFeatureFunctionalityRes.callsByStatus.FAILED;

      // Daily Voice Quality
      const voiceQualityRes: any = res[1];
      this.vq.calls = voiceQualityRes.summary.calls;
      this.vq.streams = voiceQualityRes.summary.calls_stream;
      this.vqChartOptions.series = [ { data: voiceQualityRes.percentages } ];
      this.vqChartOptions.xAxis = { categories: voiceQualityRes.categories };
      this.vq.period =selectedDate.format("MM-DD-YYYY 00:00:00") + " AM UTC to " + selectedDate.format("MM-DD-YYYY 11:59:59") + " PM UTC";
      this.calls.total += this.vq.calls;

      // Daily Failed Calls Chart
      this.failedCallsChartOptions.series = [Number((this.calls.failed / this.calls.total * 100 || 0).toFixed(2))];

      // Weekly Feature Functionality
      const weeklyFeatureFunctionalityData = res[2];
      this.weeklyCallingReliabilityChartOptions.xAxis.categories = weeklyFeatureFunctionalityData.categories;
      this.weeklyCallingReliabilityChartOptions.series = [
        {
          name: "Percentage",
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
      const endTime = performance.now();
      this.loadingTime = (endTime - startTime) / 1000;
      this.isloading = false;
      this.dailyNetworkTrends.isLoading = false;
      this.customerNetworkQuality.isLoading = false;
      this.chartsStatus(true);
      const region = this.filters.get('region').value;
      if(region !== ""){
        this.reloadUserOptions(region);
      }else{
        this.reloadFilterOptions();
      }
    }, error => {
      console.error(error);
      this.chartsStatus(true);
    });
  }


  navigateToDetailedTable(metric: string) {
    const startDate = this.selectedDate.toDate();
    startDate.setHours(0, 0, 0, 0);
    const endDate = this.selectedDate.toDate();
    endDate.setHours(23, 59, 59, 999);
    const startTime = Utility.parseReportDate(startDate);
    const endTime = Utility.parseReportDate(endDate);
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountService.getSelectedSubAccount().id}&type=${metric}&start=${startTime}&end=${endTime}`;
    window.open(url);
  }

  regionDisplayFn(region) {
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

  private reloadFilterOptions() {
    this.filters.disable();
    this.dailyNetworkTrends.filters.disable();
    this.customerNetworkQuality.filters.disable();
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    this.spotlightChartsService.getFilterOptions(subaccountId).subscribe((res: any) => {
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
      this.dailyNetworkTrends.initAutocompletes();
      this.customerNetworkQuality.initAutocompletes();
      this.dailyNetworkTrends.filters.enable();
      this.customerNetworkQuality.filters.enable();
    })
  }

  private reloadUserOptions(region?: any) {
    this.filters.disable();
    this.dailyNetworkTrends.filters.disable();
    this.customerNetworkQuality.filters.disable();
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    this.spotlightChartsService.getFilterOptions(subaccountId,"users",region ? region : null).subscribe((res: any) => {
      this.users = res.users.filter(user => user !== null);
      this.filters.enable();
      this.dailyNetworkTrends.initAutocompletes();
      this.customerNetworkQuality.initAutocompletes();
      this.dailyNetworkTrends.filters.enable();
      this.customerNetworkQuality.filters.enable();
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
  async refreshDashboard() {
    if(this.selectedPeriod == "daily"){
      this.isRefreshing = true;
      this.reloadCharts();
      this.startTimer();
      this.isRefreshing = false;
    }
  }
  getSubaccountId(): string {
    return this.subaccountService.getSelectedSubAccount().id;
  }
}
