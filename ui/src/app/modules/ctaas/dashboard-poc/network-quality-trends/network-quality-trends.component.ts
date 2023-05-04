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
import { SubAccountService } from "../../../../services/sub-account.service";
import { environment } from "../../../../../environments/environment";
import { ReportType } from "../../../../helpers/report-type";

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

  constructor(private spotlightChartsService: SpotlightChartsService,
              private subaccountService: SubAccountService) {
    this.commonChartOptions = trendsChartCommonOptions;
  }

  ngOnInit(): void {
    this.loadCharts();
  }

  loadCharts() {
    this.isLoading = true;
    const obs = [];
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    obs.push(this.spotlightChartsService.getCustomerNetworkTrendsData(this.date, this.date, this.user, subaccountId));
    obs.push(this.spotlightChartsService.getNetworkQualityTrendsSummary(this.date, this.date, this.user, subaccountId));
    forkJoin(obs).subscribe((res: any) => {
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
    this.receivedPacketLossChartOptions.chart.events = {
      markerClick: this.navigateToCallingReliabilityDetailedTableFromPoint.bind(this)
    };
  }

  navigateToCallingReliabilityDetailedTableFromPoint(event, chartContext, { seriesIndex, dataPointIndex, config}) {
    const category = chartContext.opts.xaxis.categories[dataPointIndex];
    const [ startTime, endTime ] = category.split('-');
    const startDate = this.date.clone().utc().startOf('day').hour(startTime.split(':')[0]);
    const endDate = this.date.clone().utc().startOf('day').hour(startTime.split(':')[0]).minutes(59).seconds(59);
    const parsedStartTime = startDate.format('YYMMDDHHmmss');
    const parsedEndTime = endDate.format('YYMMDDHHmmss');
    const url = `${ environment.BASE_URL }/#/spotlight/details?subaccountId=${ this.subaccountService.getSelectedSubAccount().id }&type=${ ReportType.DAILY_CALLING_RELIABILITY }&start=${ parsedStartTime }&end=${ parsedEndTime }`;
    window.open(url);
  }

}
