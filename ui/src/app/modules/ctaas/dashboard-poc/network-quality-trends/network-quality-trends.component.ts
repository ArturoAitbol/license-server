import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartOptions } from "../../../../helpers/chart-options-type";
import {
  defaultJitterChartOptions,
  defaultReceivedPacketLossChartOptions, defaultRoundtripTimeChartOptions,
  defaultSentBitrateChartOptions,
  trendsChartCommonOptions
} from "./initial-chart-config";
import { SpotlightChartsService } from "../../../../services/spotlight-charts.service";
import { Moment } from "moment";
import { forkJoin } from "rxjs";

@Component({
  selector: 'app-network-quality-trends',
  templateUrl: './network-quality-trends.component.html',
  styleUrls: ['./network-quality-trends.component.css']
})
export class NetworkQualityTrendsComponent implements OnInit {

  @Input() date: Moment;
  @Input() user: string;

  // Customer Network Trends variables
  receivedPacketLossChartOptions: Partial<ChartOptions>;
  jitterChartOptions: Partial<ChartOptions>;
  sentBitrateChartOptions: Partial<ChartOptions>;
  roundTripChartOptions: Partial<ChartOptions>;
  commonChartOptions: Partial<ChartOptions>;

  summary = { packetLoss: 0, jitter: 0, sendBitrate: 0, roundTripTime: 0 };

  isLoading = true;

  constructor(private spotlightChartsService: SpotlightChartsService) {
    this.commonChartOptions = trendsChartCommonOptions;
  }

  ngOnInit(): void {
    this.loadCharts();
  }

  loadCharts() {
    this.isLoading = true;
    const obs = [];
    obs.push(this.spotlightChartsService.getCustomerNetworkTrendsData(this.date, this.date, this.user));
    obs.push(this.spotlightChartsService.getNetworkQualityTrendsSummary(this.date, this.date, this.user));
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
    });
  }

  private initChartOptions() {
    this.receivedPacketLossChartOptions = { ...this.commonChartOptions, ...defaultReceivedPacketLossChartOptions };
    this.jitterChartOptions = { ...this.commonChartOptions, ...defaultJitterChartOptions };
    this.sentBitrateChartOptions = {...this.commonChartOptions, ...defaultSentBitrateChartOptions };
    this.roundTripChartOptions = {...this.commonChartOptions, ...defaultRoundtripTimeChartOptions };
  }

}
