import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChartOptions } from 'src/app/helpers/chart-options-type';
import { 
  defaultPolqaJitterChartOptions, 
  defaultPolqaPacketLossChartOptions, 
  defaultPolqaRoundtripTimeChartOptions, 
  polqaChartCommonOptions,
  defaultPolqaChartOptions } 
from '../initial-chart-config';

@Component({
  selector: 'app-polqa-graphs',
  templateUrl: './polqa-graphs.component.html',
  styleUrls: ['./polqa-graphs.component.css']
})
export class PolqaGraphsComponent implements OnInit {

  @Input() customerNetworkQualityData;
  @Input() groupBy = 'hour';
  @Input() series;
  @Input() labels;

  @Output() navigateToDetailedTable: EventEmitter<any> = new EventEmitter();

  calls = 0;

  polqaChartOptions: Partial<ChartOptions>;
  polqaCommonChartOptions: Partial<ChartOptions>;
  polqaPacketLossChartOptions: Partial<ChartOptions>;
  polqaJitterChartOptions: Partial<ChartOptions>;
  polqaRoundTripChartOptions: Partial<ChartOptions>;
  defaultPolqaPacketLoss: Partial<ChartOptions>;
  defaultPolqaJitter: Partial<ChartOptions>;
  defaultPolqaRoundTripTime: Partial<ChartOptions>;

  constructor() {
    this.polqaCommonChartOptions = polqaChartCommonOptions;
  }

  ngOnInit(): void {
    this.setCustomerNQualityData(this.customerNetworkQualityData);
  }

  setCustomerNQualityData(customerNetworkQualityData){
    let categories: any;
    let timeLapse: string;
    if(this.groupBy==='hour'){
      categories = customerNetworkQualityData.categories.map((category: string) => category.split(" ")[1]);
      timeLapse = 'Hour';
    }
    else{
      categories = customerNetworkQualityData.categories;
      timeLapse = 'Date';
    }

    this.initChartOptions(categories,timeLapse);

    const avgPrefix = "avg ";

    this.polqaChartOptions.series = [
      {
        name: this.labels.avgLabel + this.series.POLQA.label,
        data: customerNetworkQualityData.series[avgPrefix + this.series.POLQA.value]
      },
      {
        name: this.labels.minLabel + this.series.POLQA.label,
        data: customerNetworkQualityData.series[this.series.POLQA.value]
      }
    ];

    this.polqaPacketLossChartOptions.series = [
      {
        name: this.labels.avgLabel + this.series.packetLoss.label,
        data: customerNetworkQualityData.series[avgPrefix + this.series.packetLoss.value]
      },
      {
        name: this.labels.maxLabel + this.series.packetLoss.label,
        data: customerNetworkQualityData.series[this.series.packetLoss.value]
      }
    ];

    this.polqaJitterChartOptions.series = [
      {
        name: this.labels.avgLabel + this.series.jitter.label,
        data: customerNetworkQualityData.series[avgPrefix + this.series.jitter.value]
      },
      {
        name: this.labels.maxLabel + this.series.jitter.label,
        data: customerNetworkQualityData.series[this.series.jitter.value]
      }
    ];

    this.polqaRoundTripChartOptions.series = [
      {
        name: this.labels.avgLabel + this.series.roundTripTime.label,
        data: customerNetworkQualityData.series[avgPrefix + this.series.roundTripTime.value]
      },
      {
        name: this.labels.maxLabel + this.series.roundTripTime.label,
        data: customerNetworkQualityData.series[this.series.roundTripTime.value]
      }
    ];
  }

  private initChartOptions(categories:string[],timeLapse:string) {
    
    this.polqaCommonChartOptions.xAxis = {...this.polqaCommonChartOptions.xAxis, categories: categories };
    this.polqaCommonChartOptions.xAxis.title.text = timeLapse;
  
    defaultPolqaChartOptions.title.text = this.series.POLQA.label;
    defaultPolqaPacketLossChartOptions.title.text = this.series.packetLoss.label + ' (%)';
    defaultPolqaJitterChartOptions.title.text = this.series.jitter.label + ' (ms)';
    defaultPolqaRoundtripTimeChartOptions.title.text = this.series.roundTripTime.label + ' (ms)';
    this.polqaChartOptions = { ...this.polqaCommonChartOptions, ...defaultPolqaChartOptions };
    this.polqaPacketLossChartOptions = { ...this.polqaCommonChartOptions, ...defaultPolqaPacketLossChartOptions }
    this.polqaJitterChartOptions = { ...this.polqaCommonChartOptions, ...defaultPolqaJitterChartOptions };
    this.polqaRoundTripChartOptions = {...this.polqaCommonChartOptions, ...defaultPolqaRoundtripTimeChartOptions };
    this.polqaChartOptions.chart.events = {
      markerClick: this.navigateToDetailedTableFromPolqaChart.bind(this)
    };

  }

  navigateToDetailedTableFromPolqaChart(event, chartContext, { seriesIndex, dataPointIndex, config}) {
    const chartTitle: string = event.srcElement.farthestViewportElement.children[1].innerHTML;
    if(chartTitle.toLowerCase().includes("polqa")){
      this.calls += 1;
      if(this.calls==5){
        this.navigateToDetailedTable.emit({chartContext:chartContext, dataPointIndex: dataPointIndex, polqaCalls: true});
        this.calls=0;
      }
    }else{
      this.navigateToDetailedTable.emit({chartContext:chartContext, dataPointIndex: dataPointIndex, polqaCalls: true});
    }
  }

}
