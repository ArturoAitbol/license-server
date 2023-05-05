import { Component, Input, OnInit } from '@angular/core';
import { ChartOptions } from "../../../../helpers/chart-options-type";
import {
  defaultJitterChartOptions,
  defaultReceivedPacketLossChartOptions, defaultRoundtripTimeChartOptions,
  defaultSentBitrateChartOptions,
  trendsChartCommonOptions
} from "./initial-chart-config";
import { SpotlightChartsService } from "../../../../services/spotlight-charts.service";
import { Moment } from "moment";
import { forkJoin, Observable } from "rxjs";
import { SubAccountService } from "../../../../services/sub-account.service";
import { FormBuilder } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-network-quality-trends',
  templateUrl: './network-quality-trends.component.html',
  styleUrls: ['./network-quality-trends.component.css']
})
export class NetworkQualityTrendsComponent implements OnInit {

  @Input() date: Moment;
  @Input() user: string;
  @Input() users: string[] = [];

  // Customer Network Trends variables
  receivedPacketLossChartOptions: Partial<ChartOptions>;
  jitterChartOptions: Partial<ChartOptions>;
  sentBitrateChartOptions: Partial<ChartOptions>;
  roundTripChartOptions: Partial<ChartOptions>;
  commonChartOptions: Partial<ChartOptions>;
  filteredUsers: Observable<string[]>;
 

    filters = this.fb.group({
      user: [""]
    });

  summary = { packetLoss: 0, jitter: 0, sendBitrate: 0, roundTripTime: 0 };

  isLoading = false;
  isChartLoading = false;

  constructor(private spotlightChartsService: SpotlightChartsService,
              private subaccountService: SubAccountService,
              private fb: FormBuilder) {
    this.commonChartOptions = trendsChartCommonOptions;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadCharts();
  }

  
  public initAutocompletes() {
    this.filteredUsers = this.filters.get('user').valueChanges.pipe(
        startWith(''),
        map(value =>  this._filterUser(value || '')),
    );
  }

  private _filterUser(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.users.filter(option => option.toLowerCase().includes(filterValue));
  }

  reloadCharts(){
    this.isChartLoading = true;
    this.loadCharts();
  }


  loadCharts() {
    const selectedUser = this.filters.get("user").value;
    const obs = [];
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    obs.push(this.spotlightChartsService.getCustomerNetworkTrendsData(this.date, this.date, selectedUser, subaccountId));
    obs.push(this.spotlightChartsService.getNetworkQualityTrendsSummary(this.date, this.date, selectedUser, subaccountId));
    forkJoin(obs).subscribe((res: any) => {
      console.log(res)
      const trendsData = res[0];
      this.commonChartOptions.xAxis.categories = trendsData.categories.map(category => category.split(" ")[1]);
      this.initChartOptions();
      this.receivedPacketLossChartOptions.series = [{
        name: 'Received packet loss',
        data: trendsData.series['Received packet loss']
      }];
      this.jitterChartOptions.series = [{
        name: 'Jitter',
        data: trendsData.series['Received Jitter']
      }];
      this.sentBitrateChartOptions.series = [{
        name: 'Sent bitrate',
        data: trendsData.series['Sent bitrate']
      }];
      this.roundTripChartOptions.series = [{
        name: 'Round trip time',
        data: trendsData.series['Round trip time']
      }];

      const summary = res[1];
      this.summary.sendBitrate = summary.avgSentBitrate;
      this.summary.jitter = summary.maxJitter;
      this.summary.roundTripTime = summary.maxRoundTripTime;
      this.summary.packetLoss = summary.maxPacketLoss;

      this.isLoading = false;
      this.isChartLoading = false;
    });
  }

  private initChartOptions() {
    this.receivedPacketLossChartOptions = { ...this.commonChartOptions, ...defaultReceivedPacketLossChartOptions };
    this.jitterChartOptions = { ...this.commonChartOptions, ...defaultJitterChartOptions };
    this.sentBitrateChartOptions = {...this.commonChartOptions, ...defaultSentBitrateChartOptions };
    this.roundTripChartOptions = {...this.commonChartOptions, ...defaultRoundtripTimeChartOptions };
  }

}
