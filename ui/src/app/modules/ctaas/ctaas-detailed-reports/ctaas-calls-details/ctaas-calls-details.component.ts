import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChartOptions } from 'src/app/helpers/chart-options-type';
import { defaultPolqaChartOptions, defaultPolqaJitterChartOptions, defaultPolqaPacketLossChartOptions, defaultPolqaRoundtripTimeChartOptions, defaultSentBitrateChartOptions, polqaChartCommonOptions } from '../calls-detail';



@Component({
  selector: 'app-ctaas-calls-details',
  templateUrl: './ctaas-calls-details.component.html',
  styleUrls: ['./ctaas-calls-details.component.css']
})
export class CtaasCallsDetailsComponent implements OnInit {
  @Input() groupBy = 'hour';
  @Input() series;
  @Input() labels;

  @Output() navigateToDetailedTable: EventEmitter<any> = new EventEmitter();

  interaction: string = '1';
  polqaChartOptions: Partial<ChartOptions>;
  polqaCommonChartOptions: Partial<ChartOptions>;
  polqaPacketLossChartOptions: Partial<ChartOptions>;
  polqaRoundTripChartOptions: Partial<ChartOptions>;
  defaultPolqaPacketLoss: Partial<ChartOptions>;
  sentBitrateChartOptions: Partial<ChartOptions>;
  defaultPolqaJitter: Partial<ChartOptions>;
  defaultPolqaRoundTripTime: Partial<ChartOptions>;
  polqaJitterChartOptions: Partial<ChartOptions>;
  fromMediaStatsData: any;
  toMediaStatsData: any;
  generalMediaStats: any;
  isLoadingResults: boolean = false;
  selectedTimeStamp: string;
  selecetedDID: string;
  mediaStats = {
    sentPackets: "",
    sentCodec:"",
    receivedJitter: "",
    receivedCodec: "",
    roundTripTime: "",
    sentBitrate: "",
    receivedPackets: "",
    receivedPacketLoss: "",
    POLQA: "",
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CtaasCallsDetailsComponent>
  ) { 
    this.polqaCommonChartOptions = polqaChartCommonOptions;
  }

  ngOnInit(): void {
  }

  onCancel(type?: string): void {
    this.dialogRef.close(type);
  }

  onChange(option:any){
    this.interaction = option;
    if(option === '2') {
      this.setCustomerNQualityData();
      this.getDataOfTimeStamp(this.data.from.mediaStats[0])
    }
  }
  
  getDataOfTimeStamp(event: any) {    try {
      this.mediaStats.sentPackets = event.data['Sent packets'];
      this.mediaStats.receivedJitter = event.data['Received Jitter'];
      this.mediaStats.sentCodec = event.data['Sent codec'];
      this.mediaStats.roundTripTime = event.data['Round trip time'];
      this.mediaStats.receivedPackets = event.data['Received packets'];
      this.mediaStats.receivedCodec = event.data['Received codec'];
      this.mediaStats.sentBitrate = event.data['Sent bitrate'];
      this.mediaStats.receivedPacketLoss = event.data['Received packet loss'];
      if(event.data['POLQA']) {
        this.mediaStats.POLQA = event.data['POLQA'];
      }
      this.selectedTimeStamp = event.timestamp.split(" ")[0];
      this.isLoadingResults = false;
    } catch(error) {
      console.log(error)
      this.isLoadingResults = false;
    }
  }

  timestampSort(a: any, b: any): number {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    
    return dateA.getTime() - dateB.getTime();
  }

  sortCategories(a:any, b:any):number {
    const dateA = new Date(a);
    const dateB = new Date(b);
    
    return dateA.getTime() - dateB.getTime();
  }

  setCustomerNQualityData(){
    this.fromMediaStatsData = [...this.data.from.mediaStats].sort(this.timestampSort);
    this.toMediaStatsData = [...this.data.to.mediaStats].sort(this.timestampSort);
    
    let categories = [];
    let fromCategories = [];
    let toCategories = []

    let chartData = {
      fromReceivedJitter: [],
      fromRoundTripTime: [],
      fromSentBitrate: [],
      fromReceivedPacketLoss: [],
      fromPOLQA: [],
      toReceivedJitter: [],
      toRoundTripTime: [],
      toSentBitrate: [],
      toReceivedPacketLoss: [],
      toPOLQA: [],
    };
    let timeLapse = 'Hour';
  
    this.fromMediaStatsData.map(fromData => {
      fromCategories.push(fromData.timestamp.split(" ")[1])
    });

    this.toMediaStatsData.map(toData => {
      toCategories.push(toData.timestamp.split(" ")[1])
    });
    
    categories = [...new Set([...fromCategories, ...toCategories])].sort()
    this.selectedTimeStamp = fromCategories[0].split(" ")[0];
    this.selecetedDID = this.data.from.DID;
    try {
      categories.forEach(category => {
        let fromIndex = this.data.from.mediaStats.findIndex(mediaStat => mediaStat.timestamp.includes(category));
        let toIndex = this.data.to.mediaStats.findIndex(mediaStat => mediaStat.timestamp.includes(category));
          if(fromIndex != -1) {
            this.data.from.mediaStats[fromIndex].data['Received Jitter'] && this.data.from.mediaStats[fromIndex].data['Received Jitter'] !== "--" ? chartData.fromReceivedJitter.push(parseFloat(this.data.from.mediaStats[fromIndex].data['Received Jitter'])) : chartData.fromReceivedJitter.push(null)
            this.data.from.mediaStats[fromIndex].data['POLQA'] && this.data.from.mediaStats[fromIndex].data['POLQA'] !== "--" ? chartData.fromPOLQA.push(parseFloat(this.data.from.mediaStats[fromIndex].data['POLQA'])) : chartData.fromPOLQA.push(null)
            this.data.from.mediaStats[fromIndex].data['Received packet loss'] && this.data.from.mediaStats[fromIndex].data['Received packet loss'] !== "--" ? chartData.fromReceivedPacketLoss.push(parseFloat(this.data.from.mediaStats[fromIndex].data['Received packet loss'])) : chartData.fromReceivedPacketLoss.push(null)
            this.data.from.mediaStats[fromIndex].data['Sent bitrate'] && this.data.from.mediaStats[fromIndex].data['Sent bitrate'] !== "--" ? chartData.fromSentBitrate.push(parseFloat(this.data.from.mediaStats[fromIndex].data['Sent bitrate'])) : chartData.fromSentBitrate.push(null)
            this.data.from.mediaStats[fromIndex].data['Round trip time'] && this.data.from.mediaStats[fromIndex].data['Round trip time'] !== "--" ? chartData.fromRoundTripTime.push(parseFloat(this.data.from.mediaStats[fromIndex].data['Round trip time'])) : chartData.fromRoundTripTime.push(null)
          } else {
            chartData.fromReceivedJitter.push(null)
            chartData.fromRoundTripTime.push(null)
            chartData.fromSentBitrate.push(null)
            chartData.fromReceivedPacketLoss.push(null)
            chartData.fromPOLQA.push(null)
          }
          if(toIndex != -1) {
            this.data.to.mediaStats[toIndex].data['Received Jitter'] && this.data.to.mediaStats[toIndex].data['Received Jitter'] !== "--" ? chartData.toReceivedJitter.push(parseFloat(this.data.to.mediaStats[toIndex].data['Received Jitter'])) : chartData.toReceivedJitter.push(null)
            this.data.to.mediaStats[toIndex].data['POLQA'] && this.data.to.mediaStats[toIndex].data['POLQA'] !== "--" ? chartData.toPOLQA.push(parseFloat(this.data.to.mediaStats[toIndex].data['POLQA'])) : chartData.toPOLQA.push(null)
            this.data.to.mediaStats[toIndex].data['Received packet loss'] && this.data.to.mediaStats[toIndex].data['Received packet loss'] !== "--" ? chartData.toReceivedPacketLoss.push(parseFloat(this.data.to.mediaStats[toIndex].data['Received packet loss'])) : chartData.toReceivedPacketLoss.push(null)
            this.data.to.mediaStats[toIndex].data['Sent bitrate'] && this.data.to.mediaStats[toIndex].data['Sent bitrate'] !== "--" ? chartData.toSentBitrate.push(parseFloat(this.data.to.mediaStats[toIndex].data['Sent bitrate'])) : chartData.toSentBitrate.push(null)
            this.data.to.mediaStats[toIndex].data['Round trip time'] && this.data.to.mediaStats[toIndex].data['Round trip time'] !== "--" ? chartData.toRoundTripTime.push(parseFloat(this.data.to.mediaStats[toIndex].data['Round trip time'])) : chartData.toRoundTripTime.push(null)
          } else {
            chartData.toReceivedJitter.push(null)
            chartData.toRoundTripTime.push(null)
            chartData.toSentBitrate.push(null)
            chartData.toReceivedPacketLoss.push(null)
            chartData.toPOLQA.push(null)
          }
      })
    } catch(error){
      console.log(error)
    }
   

    console.log(chartData)

    this.initChartOptions(categories,timeLapse);
    
    this.polqaChartOptions.series = [
      {
        name: 'From. POLQA',
        data: chartData.fromPOLQA
      },
      {
        name: 'To. POLQA',
        data: chartData.toPOLQA
      }
    ];
    
    this.polqaPacketLossChartOptions.series = [
      {
        name: 'From. Packet Loss',
        data: chartData.fromReceivedPacketLoss
      },
      {
        name: 'To. Packet Loss',
        data: chartData.toReceivedPacketLoss
      }
    ];

    this.polqaJitterChartOptions.series = [
      {
        name: "From. Jitter",
        data: chartData.fromReceivedJitter
      },
      {
        name: "To. Jitter",
        data: chartData.toReceivedJitter
      }
    ];

    this.polqaRoundTripChartOptions.series = [
      {
        name: "From. Round Trip Time",
        data: chartData.fromRoundTripTime
      },
      {
        name: "To. Round Trip Time",
        data: chartData.toRoundTripTime
      }
    ];
    
    this.sentBitrateChartOptions.series = [
    {
      name: "From. Bitrate",
      data: chartData.fromSentBitrate
    },
    {
      name: "To. Bitrate",
      data: chartData.toSentBitrate
    }];
  }
  
  
  private initChartOptions(categories:string[],timeLapse:string) {
    try {
      this.polqaCommonChartOptions.xAxis = {...this.polqaCommonChartOptions.xAxis, categories: categories , max: categories.length};
      this.polqaCommonChartOptions.xAxis.title.text = timeLapse;
    
      defaultPolqaChartOptions.title.text = 'POLQA';
      defaultPolqaPacketLossChartOptions.title.text = 'Packet Loss' + ' (%)';
      defaultPolqaJitterChartOptions.title.text = 'Jitter' + ' (ms)';
      defaultPolqaRoundtripTimeChartOptions.title.text = 'Round Trip Time' + ' (ms)';
      defaultSentBitrateChartOptions.title.text = 'Bitrate' + ' (kbps)';
      this.polqaChartOptions = { ...this.polqaCommonChartOptions, ...defaultPolqaChartOptions };
      this.polqaPacketLossChartOptions = { ...this.polqaCommonChartOptions, ...defaultPolqaPacketLossChartOptions }
      this.polqaJitterChartOptions = { ...this.polqaCommonChartOptions, ...defaultPolqaJitterChartOptions };
      this.polqaRoundTripChartOptions = {...this.polqaCommonChartOptions, ...defaultPolqaRoundtripTimeChartOptions };
      this.sentBitrateChartOptions = {...this.polqaCommonChartOptions, ...defaultSentBitrateChartOptions };
      this.polqaChartOptions.chart.events = {
        markerClick: this.navigateToDetailedTableFromPolqaChart.bind(this)
      };
      this.polqaPacketLossChartOptions.chart.events = {
        markerClick: this.navigateToDetailedTableFromPolqaChart.bind(this)
      };
      this.polqaJitterChartOptions.chart.events = {
        markerClick: this.navigateToDetailedTableFromPolqaChart.bind(this)
      };
      this.polqaRoundTripChartOptions.chart.events = {
        markerClick: this.navigateToDetailedTableFromPolqaChart.bind(this)
      };
      this.sentBitrateChartOptions.chart.events = {
        markerClick: this.navigateToDetailedTableFromPolqaChart.bind(this)
      };
    } catch (error) {
      console.log(error)
    }

  }

  //To 1 - From 0
  navigateToDetailedTableFromPolqaChart(event, chartContext, { seriesIndex, dataPointIndex, config}) {
    this.isLoadingResults = true;
    let selectedTimeStamp = chartContext.w.globals.categoryLabels[dataPointIndex];
    if(seriesIndex === 0) {
      this.selecetedDID = this.data.from.DID
      let fromElement = this.fromMediaStatsData.find(from => from.timestamp.includes(selectedTimeStamp));
      this.getDataOfTimeStamp(fromElement);
    } else {
      this.selecetedDID = this.data.from.DID
      let toElement = this.toMediaStatsData.find(to => to.timestamp.includes(selectedTimeStamp));
      this.getDataOfTimeStamp(toElement);
    }
  }
}
