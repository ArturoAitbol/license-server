import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChartOptions } from 'src/app/helpers/chart-options-type';
import { 
  defaultJitterChartOptions, 
  defaultReceivedPacketLossChartOptions, 
  defaultRoundtripTimeChartOptions, 
  defaultSentBitrateChartOptions, 
  trendsChartCommonOptions } 
from '../initial-chart-config';

@Component({
  selector: 'app-network-trends',
  templateUrl: './network-trends.component.html',
  styleUrls: ['./network-trends.component.css']
})
export class NetworkTrendsComponent implements OnInit {

  @Input() networkTrendsData;
  @Input() groupBy = 'hour';
  @Input() series;
  @Input() labels;

  @Output() navigateToDetailedTable: EventEmitter<any> = new EventEmitter();

  calls = 0;
  
  // Customer Network Trends variables
  receivedPacketLossChartOptions: Partial<ChartOptions>;
  jitterChartOptions: Partial<ChartOptions>;
  sentBitrateChartOptions: Partial<ChartOptions>;
  roundTripChartOptions: Partial<ChartOptions>;
  commonChartOptions: Partial<ChartOptions>;

  constructor() {
    this.commonChartOptions = trendsChartCommonOptions;
   }

  ngOnInit(): void {
    this.setNetworkTrendsData(this.networkTrendsData);
  }

  setNetworkTrendsData(trendsData){
    let categories: any;
    let timeLapse: string;
    if(this.groupBy==='hour'){
      categories = trendsData.categories.map(category => category.split(" ")[1]);
      timeLapse = 'Hour';
    }
    else{
      categories = trendsData.categories;
      timeLapse = 'Date';
    }

    this.initChartOptions(categories, timeLapse);

    const avgPrefix = "avg ";
    
    this.receivedPacketLossChartOptions.series = [
      {
        name: this.labels.avgLabel + this.series.packetLoss.label,
        data: trendsData.series[avgPrefix + this.series.packetLoss.value]
      },
      {
      name: this.labels.maxLabel + this.series.packetLoss.label,
      data: trendsData.series[this.series.packetLoss.value]
      }
    ];

    this.jitterChartOptions.series = [
      {
        name: this.labels.avgLabel + this.series.jitter.label,
        data: trendsData.series[avgPrefix + this.series.jitter.value]
      },
      {
      name: this.labels.maxLabel + this.series.jitter.label,
      data: trendsData.series[this.series.jitter.value]
      }
    ];

    this.roundTripChartOptions.series = [
      {
        name: this.labels.avgLabel + this.series.roundTripTime.label,
        data: trendsData.series[avgPrefix + this.series.roundTripTime.value]
      },
      {
      name: this.labels.maxLabel + this.series.roundTripTime.label,
      data: trendsData.series[this.series.roundTripTime.value]
      }
    ];

    this.sentBitrateChartOptions.series = [{
      name: this.series.sentBitrate.label,
      data: trendsData.series[this.series.sentBitrate.value]
    }];
  }

  private initChartOptions(categories:string[],timeLapse:string) {
    this.commonChartOptions.xAxis = {...this.commonChartOptions.xAxis, categories: categories};
    this.commonChartOptions.xAxis.title.text = timeLapse;
    
    defaultReceivedPacketLossChartOptions.title.text = this.series.packetLoss.label + ' (%)';
    defaultJitterChartOptions.title.text = this.series.jitter.label + ' (ms)';
    defaultSentBitrateChartOptions.title.text = this.series.sentBitrate.label + ' (kbps)';
    defaultRoundtripTimeChartOptions.title.text = this.series.roundTripTime.label + ' (ms)';
    this.receivedPacketLossChartOptions = { ...this.commonChartOptions, ...defaultReceivedPacketLossChartOptions };
    this.jitterChartOptions = { ...this.commonChartOptions, ...defaultJitterChartOptions };
    this.sentBitrateChartOptions = {...this.commonChartOptions, ...defaultSentBitrateChartOptions };
    this.roundTripChartOptions = {...this.commonChartOptions, ...defaultRoundtripTimeChartOptions };
    this.receivedPacketLossChartOptions.chart.events = {
      markerClick: this.navigateToDetailedTableFromNetworkChart.bind(this)
    };
  }

  navigateToDetailedTableFromNetworkChart(event, chartContext, { seriesIndex, dataPointIndex, config}) {
    const chartTitle: string = event.srcElement.farthestViewportElement.children[1].innerHTML;
    if(chartTitle.toLowerCase().includes("packet loss")){
      this.calls += 1;
      if(this.calls==5){
        this.navigateToDetailedTable.emit({chartContext:chartContext, dataPointIndex: dataPointIndex, polqaCalls: false});
        this.calls=0;
      }
    }else{
      this.navigateToDetailedTable.emit({chartContext:chartContext, dataPointIndex: dataPointIndex, polqaCalls: false});
    }
  }

}
