import { Component, Input, OnInit } from '@angular/core';
import { Moment } from 'moment';
import { ChartOptions } from 'src/app/helpers/chart-options-type';
import { defaultPolqaTrendsChartOptions,
  defaultPolqaTrendsJitterChartOptions,
  defaultPolqaTrendsPacketLossChartOptions,
  defaultPolqaTrendsRoundtripTimeChartOptions,
  defaultPolqaTrendsSentBitrateChartOptions,
  polqaTrendsCommonOptions } from './initial-chart-config';

@Component({
  selector: 'app-polqa-trends',
  templateUrl: './polqa-trends.component.html',
  styleUrls: ['./polqa-trends.component.css']
})
export class PolqaTrendsComponent implements OnInit {

  @Input() startDate:Moment;
  @Input() endDate:Moment;
  @Input() regions:string;
  @Input() subaccountId:string;
  @Input() groupBy:string;
  @Input() data:any;



  
  isLoading: boolean = false;

  polqaTrendsChartOptions: Partial<ChartOptions>;
  polqaPacketLossChartOptions: Partial<ChartOptions>;
  polqaJitterChartOptions: Partial<ChartOptions>;
  polqaSentBitrateChartOptions: Partial<ChartOptions>;
  polqaRoundTripChartOptions: Partial<ChartOptions>;

  commonOptions: Partial<ChartOptions>;
  messageSpinner = "Loading...";

  networkTrendsData:any;

  readonly labels = {
    maxLabel : 'Max. ',
    minLabel : 'Min. ',
    avgLabel : 'Avg. '
  }

  readonly series = {
    jitter: {
      label: "Jitter",
      value: "Received Jitter"
    },
    packetLoss: {
      label: "Packet Loss",
      value: "Received packet loss"
    },
    sentBitrate: {
      label: "Sent Bitrate",
      value: "Sent bitrate"
    },
    roundTripTime: {
      label: "Round Trip Time",
      value: "Round trip time"
    },
    POLQA:{
      label: "POLQA",
      value: "POLQA"
    }
  }

  constructor() { 
      this.commonOptions = polqaTrendsCommonOptions;
  }

  ngOnInit(): void {
        let categories,timelapse;
        if(this.groupBy === "hour"){
          categories = this.data.categories.map(category => category.split(" ")[1]);
          timelapse = "Hour";
        }
        this.commonOptions.xAxis = {...this.commonOptions.xAxis, categories: categories};
        this.commonOptions.xAxis.title.text = timelapse;

        this.setPolqaChart(this.data);
        this.setPacketLoss(this.data);
        this.setJitter(this.data);
        this.setSentBitrate(this.data);
        this.setRoundTripTime(this.data);
  }

  setPolqaChart(data){
    this.polqaTrendsChartOptions = {...this.commonOptions,...defaultPolqaTrendsChartOptions};
    this.polqaTrendsChartOptions.title.text = this.series.POLQA.label;
    this.polqaTrendsChartOptions.tooltip.custom = ({ series, seriesIndex, dataPointIndex, w }) => {
      return this.getToolTip(w.config.series,dataPointIndex);
    }
    
    this.polqaTrendsChartOptions.series = [
      {
        name: "Avg. " + this.series.POLQA.label,
        data: data.series["avg " + this.series.POLQA.value]
      },
      {
        name: this.labels.minLabel + this.series.POLQA.label,
        data: data.series[this.series.POLQA.value]
      }
    ]
  }

  setPacketLoss(data){
    this.polqaPacketLossChartOptions = {...this.commonOptions,...defaultPolqaTrendsPacketLossChartOptions};
    this.polqaPacketLossChartOptions.title.text = this.series.packetLoss.label + ' (%)';
    this.polqaPacketLossChartOptions.tooltip.custom = ({ series, seriesIndex, dataPointIndex, w }) => {
      return this.getToolTip(w.config.series,dataPointIndex);
    }

    this.polqaPacketLossChartOptions.series = [
      {
        name: "Avg. " + this.series.packetLoss.label,
        data: data.series["avg " + this.series.packetLoss.value]
      },
      {
        name: this.labels.maxLabel + this.series.packetLoss.label,
        data: data.series[this.series.packetLoss.value]
      }
    ]
  }

  setJitter(data){
    this.polqaJitterChartOptions = {...this.commonOptions,...defaultPolqaTrendsJitterChartOptions};
    this.polqaJitterChartOptions.title.text = this.series.jitter.label + ' (ms)';
    this.polqaJitterChartOptions.tooltip.custom = ({ series, seriesIndex, dataPointIndex, w }) => {
      return this.getToolTip(w.config.series,dataPointIndex);
    }

    this.polqaJitterChartOptions.series = [
      {
        name: "Avg. " + this.series.jitter.label,
        data: data.series["avg " + this.series.jitter.value]
      },
      {
        name: this.labels.maxLabel + this.series.jitter.label,
        data: data.series[this.series.jitter.value]
      }
    ]
  }

  setSentBitrate(data){
    this.polqaSentBitrateChartOptions = {...this.commonOptions,...defaultPolqaTrendsSentBitrateChartOptions};
    this.polqaSentBitrateChartOptions.title.text = this.series.sentBitrate.label + ' (kbps)';
    this.polqaSentBitrateChartOptions.tooltip.custom = ({ series, seriesIndex, dataPointIndex, w }) => {
      return this.getToolTip(w.config.series,dataPointIndex);
    }

    this.polqaSentBitrateChartOptions.series = [
      {
        name: this.series.sentBitrate.label,
        data: data.series[this.series.sentBitrate.value]
      }
    ]
  }

  setRoundTripTime(data){
    this.polqaRoundTripChartOptions = {...this.commonOptions,...defaultPolqaTrendsRoundtripTimeChartOptions};
    this.polqaRoundTripChartOptions.title.text = this.series.roundTripTime.label + ' (ms)';
    this.polqaRoundTripChartOptions.tooltip.custom = ({ series, seriesIndex, dataPointIndex, w }) => {
      return this.getToolTip(w.config.series,dataPointIndex);
    }

    this.polqaRoundTripChartOptions.series = [
      {
        name: "Avg. " + this.series.roundTripTime.label,
        data: data.series["avg " + this.series.roundTripTime.value]
      },
      {
        name: this.labels.maxLabel + this.series.roundTripTime.label,
        data: data.series[this.series.roundTripTime.value]
      }
    ]
  }

  getToolTip(series:any[],dataPointIndex:number):string{
    let labels:string = "";
    const markersColors = ["rgb(110, 118, 180)","rgb(236, 124, 86)"];
    
    series.forEach((serie,index) => {
      const value = serie.data[dataPointIndex];
      if(value !== undefined){
        labels += `<div class="apexcharts-tooltip-series-group apexcharts-active" style="order: ${index+1}; display: flex;">
                    <span class="apexcharts-tooltip-marker" style="background-color: ${markersColors[index]};"></span>${serie.name}:&nbsp;<b>${value === null ? "--" : value}</b>
                  </div>`;
      }
    });
    
    const callStreams = this.data.series["call_streams"][dataPointIndex];

    return `
    <div class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;" xmlns="http://www.w3.org/1999/html">
      <div> <b>Call streams:</b> ${ callStreams === null ? "--" : callStreams }</div>
    </div>
    <div class="apexcharts-tooltip-series-group" 
      style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; display: flex !important; flex-direction: column; align-items: flex-start;">  
      ${labels}
    </div>`;
  }

}
