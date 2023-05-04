import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from "../../../helpers/chart-options-type";
import { CtaasSetupService } from "../../../services/ctaas-setup.service";
import {
  defaultFailedCallsChartOptions,
  defaultPolqaChartOptions, defaultVqChartOptions,
  defaultWeeklyFeatureFunctionalityChartOptions
} from "./initial-chart-config";
import { SubAccountService } from "../../../services/sub-account.service";
import { SpotlightChartsService } from "../../../services/spotlight-charts.service";
import moment from "moment";
import { forkJoin, Observable } from "rxjs";
import { Utility } from "../../../helpers/utils";
import { environment } from "../../../../environments/environment";
import { ReportType } from "../../../helpers/report-type";
import { FormBuilder } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { NetworkQualityTrendsComponent } from "./network-quality-trends/network-quality-trends.component";

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
  callingReliability = { value: 0, total: 0, period: '' };

  // Feature Functionality gaguge variables
  featureFunctionality = { value: 0, total: 0, period: '' };

  // Feature Functionality gaguge variables
  vq = { period: '', calls: 0, streams: 0 };

  // Customer Network Quality variables
  polqaChartOptions: Partial<ChartOptions>;
  customerNetworkQualityData = null;
  customerNetworkQualitySummary = {
    totalCalls: 0,
    aboveThreshold: { jitter: 0, packetLoss: 0, roundTripTime: 0 },
    overall: { jitter: 0, packetLoss: 0, roundTripTime: 0, polqa:0 }
  };

  //Selected graphs variables
  selectedGraph = 'jitter';
  selectedPeriod = 'daily';

  // Filters variables
  filters = this.fb.group({
    date: [moment()],
    region: [""],
    user: [""]
  });
  regions: { country: string, state: string, city: string, displayName: string }[] = [];
  users: string[] = [];
  filteredRegions: Observable<{ country: string, state: string, city: string, displayName: string }[]>;
  filteredUsers: Observable<string[]>;
  maxDate = moment();

  selectedDate = '';
  loadingTime = 0;

  isloading = true;

  @ViewChild('dailyNetworkTrends') dailyNetworkTrends: NetworkQualityTrendsComponent;

  constructor(private ctaasSetupService: CtaasSetupService,
              private subaccountService: SubAccountService,
              private spotlightChartsService: SpotlightChartsService,
              private fb: FormBuilder) {
    this.polqaChartOptions = defaultPolqaChartOptions;
    this.vqChartOptions = defaultVqChartOptions;
    this.weeklyCallingReliabilityChartOptions = defaultWeeklyFeatureFunctionalityChartOptions;
    this.failedCallsChartOptions = defaultFailedCallsChartOptions;
  }

  ngOnInit() {
    this.initAutocompletes();
    this.loadCharts();
  }

  reloadCharts() {
    const selectedDate = this.filters.get('date').value;
    const selectedUser = this.filters.get('user').value;
    this.dailyNetworkTrends.date = selectedDate;
    this.dailyNetworkTrends.user = selectedUser;
    this.dailyNetworkTrends.loadCharts();
    this.loadCharts();
  }

  loadCharts() {
    this.isloading = true;
    const startTime = performance.now();
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    const obs = [];
    const selectedDate = this.filters.get('date').value;
    const selectedRegion = this.filters.get('region').value;
    const selectedUser = this.filters.get('user').value;
    this.selectedDate = this.filters.get('date').value.format('MMMM-DD-YYYY');

    obs.push(this.spotlightChartsService.getDailyCallingReliability(selectedDate, selectedRegion, subaccountId));
    obs.push(this.spotlightChartsService.getDailyFeatureFunctionality(selectedDate, selectedRegion, subaccountId));
    obs.push(this.spotlightChartsService.getVoiceQualityChart(selectedDate, selectedDate, selectedRegion, subaccountId));
    obs.push(this.spotlightChartsService.getCustomerNetworkQualityData(selectedDate, selectedDate, selectedUser, subaccountId));
    obs.push(this.spotlightChartsService.getCustomerNetworkQualitySummary(selectedDate, selectedDate, selectedUser, subaccountId));
    obs.push(this.spotlightChartsService.getWeeklyCallingReliability(moment().startOf('week').add(1, 'day'), moment().endOf('week').add(1, 'day'), subaccountId));
    forkJoin(obs).subscribe((res: any) => {
      console.log(res);
      // Daily Calling reliability
      const dailyCallingReliabiltyRes: any = res[0].series;
      this.callingReliability.total = dailyCallingReliabiltyRes.reduce((accumulator, entry) => accumulator + entry.value, 0);
      if (this.callingReliability.total !== 0) {
        this.callingReliability.value = ((dailyCallingReliabiltyRes.find(entry => entry.id === 'PASSED')?.value  || 0) / this.callingReliability.total) * 100;
      } else {
        this.callingReliability.value = 0;
      }
      this.callingReliability.period = selectedDate.format("MM-DD-YYYY 00:00:00") + " AM UTC to " + selectedDate.format("MM-DD-YYYY 11:59:59") + " PM UTC";
      this.calls.total = this.calls.total + this.callingReliability.total;
      this.calls.failed = this.calls.failed + (dailyCallingReliabiltyRes.find(entry => entry.id === 'FAILED')?.value || 0);

      // Daily Feature Functionality
      const dailyFeatureFunctionalityRes: any = res[1].series;
      this.featureFunctionality.total = dailyFeatureFunctionalityRes.reduce((accumulator, entry) => accumulator + entry.value, 0);
      if (this.featureFunctionality.total !== 0) {
        this.featureFunctionality.value = ((dailyFeatureFunctionalityRes.find(entry => entry.id === 'PASSED')?.value || 0) / this.featureFunctionality.total) * 100;
      } else {
        this.featureFunctionality.value = 0;
      }
      this.featureFunctionality.period = selectedDate.format("MM-DD-YYYY 00:00:00") + " AM UTC to " + selectedDate.format("MM-DD-YYYY 11:59:59") + " PM UTC";
      this.calls.total = this.calls.total + this.featureFunctionality.total;
      this.calls.failed = this.calls.failed + (dailyFeatureFunctionalityRes.find(entry => entry.id === 'FAILED')?.value || 0);

      // Daily Voice Quality
      const voiceQualityRes: any = res[2];
      this.vq.calls = voiceQualityRes.summary.calls;
      this.vq.streams = voiceQualityRes.summary.calls_stream;
      this.vqChartOptions.series = [ { data: voiceQualityRes.percentages } ];
      this.vqChartOptions.xAxis = { categories: voiceQualityRes.categories };
      this.vq.period =selectedDate.format("MM-DD-YYYY 00:00:00") + " AM UTC to " + selectedDate.format("MM-DD-YYYY 11:59:59") + " PM UTC";
      console.log(this.vqChartOptions);

      // Daily Failed Calls Chart
      this.failedCallsChartOptions.series = [(this.calls.failed / this.calls.total * 100 || 0)];

      // Customer Network Quality
      this.customerNetworkQualityData = res[3];
      this.polqaChartOptions.xAxis.categories = this.customerNetworkQualityData.categories.map((category: string) => category.split(" ")[1]);
      this.polqaChartOptions.series = [
        {
          name: 'Received Jitter',
          data: this.customerNetworkQualityData.series['Received Jitter']
        },
        {
          name: 'POLQA',
          data: this.customerNetworkQualityData.series['POLQA']
        }
      ];

      const customerNetworkQualitySummary = res[4];
      this.customerNetworkQualitySummary.totalCalls = customerNetworkQualitySummary.totalCalls;
      this.customerNetworkQualitySummary.aboveThreshold.jitter = customerNetworkQualitySummary.jitterAboveThld;
      this.customerNetworkQualitySummary.aboveThreshold.packetLoss = customerNetworkQualitySummary.packetLossAboveThld;
      this.customerNetworkQualitySummary.aboveThreshold.roundTripTime = customerNetworkQualitySummary.roundTripTimeAboveThld;
      this.customerNetworkQualitySummary.overall.jitter = customerNetworkQualitySummary.maxJitter;
      this.customerNetworkQualitySummary.overall.packetLoss = customerNetworkQualitySummary.maxPacketLoss;
      this.customerNetworkQualitySummary.overall.roundTripTime = customerNetworkQualitySummary.maxRoundTripTime;
      this.customerNetworkQualitySummary.overall.polqa = customerNetworkQualitySummary.minPolqa;

      // Weekly Feature Functionality
      const weeklyFeatureFunctionalityData = res[5];
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
      this.reloadFilterOptions();
    }, error => {
      console.error(error);
    });
  }

  changeGraph() {
    if (this.selectedGraph === 'jitter') {
      this.polqaChartOptions.series = [
        {
          name: 'Received Jitter',
          data: this.customerNetworkQualityData.series['Received Jitter']
        },
        {
          name: 'POLQA',
          data: this.customerNetworkQualityData.series['POLQA']
        },
      ];
      this.polqaChartOptions.title = {
        text: "Average Jitter vs POLQA",
        align: "left"
      };
      this.polqaChartOptions.yAxis[0].title.text = 'Jitter';
    } else if (this.selectedGraph === 'packetLoss') {
      this.polqaChartOptions.series = [
        {
          name: 'Received Packet Loss',
          data: this.customerNetworkQualityData.series['Received packet loss']
        },
        {
          name: 'POLQA',
          data: this.customerNetworkQualityData.series['POLQA']
        },
      ];
      this.polqaChartOptions.title = {
        text: 'Packet Loss vs POLQA',
        align: 'left'
      };
      this.polqaChartOptions.yAxis[0].title.text = 'Packet Loss';

    } else if (this.selectedGraph === 'roundTripTime') {
      this.polqaChartOptions.series = [
        {
          name: 'Round Trip Time',
          data: this.customerNetworkQualityData.series['Round trip time']
        },
        {
          name: 'POLQA',
          data: this.customerNetworkQualityData.series['POLQA']
        },
      ];
      this.polqaChartOptions.title = {
        text: 'Round Trip Time vs POLQA',
        align: 'left'
      };
      this.polqaChartOptions.yAxis[0].title.text = 'Round Trip Time';
    }
  }

  navigateToDetailedTable(metric: string) {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startTime = Utility.parseReportDate(startDate);
    const endTime = Utility.parseReportDate(new Date(endDate));
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

  private _filterUser(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.users.filter(option => option.toLowerCase().includes(filterValue));
  }

  private initAutocompletes() {
    this.filteredRegions = this.filters.get('region').valueChanges.pipe(
        startWith(''),
        map(value => this._filterRegion(value || '')),
    );
    this.filteredUsers = this.filters.get('user').valueChanges.pipe(
        startWith(''),
        map(value => this._filterUser(value || '')),
    );
  }

  private reloadFilterOptions() {
    this.filters.disable();
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
    })
  }

  readonly ReportType = ReportType;
}
