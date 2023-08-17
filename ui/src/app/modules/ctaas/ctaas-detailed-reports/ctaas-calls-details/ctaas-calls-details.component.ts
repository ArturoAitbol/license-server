import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChartOptions } from 'src/app/helpers/chart-options-type';
import { defaultPolqaChartOptions, defaultPolqaJitterChartOptions, defaultPolqaPacketLossChartOptions, defaultPolqaReceivedPacketsChartOptions, defaultPolqaRoundtripTimeChartOptions, defaultPolqaSentPacketsChartOptions, defaultSentBitrateChartOptions, polqaChartCommonOptions } from '../calls-detail';



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
  polqaReceivedPackets: Partial<ChartOptions>;
  polqaSentPackets: Partial<ChartOptions>;
  fromMediaStatsData: any;
  toMediaStatsData: any;
  generalMediaStats: any;
  fromPolqaCategories:string[] = [];
  toPolqaCategories: string[] = [];
  isLoadingResults: boolean = false;
  selectedPoint: boolean = false;
  active: boolean = true;
  chartsWithData: boolean = true;
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
    if(this.data.from.mediaStats.length === 0 && this.data.to.mediaStats.length === 0){
      this.chartsWithData = false
    }
  }

  onCancel(type?: string): void {
    this.dialogRef.close(type);
  }

  onChange(option:any){
    this.active = false;
    this.interaction = option;
    if(option === '2') {
      this.setCustomerNQualityData();
      this.getDataOfTimeStamp(this.data.from.mediaStats[0])
    }
  }
  
  getDataOfTimeStamp(event: any) {    try {
    this.isLoadingResults = true;
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
  
    let fromCategories = [];
    let toCategories = []

    let chartData = {
      fromReceivedJitter: [],
      fromRoundTripTime: [],
      fromSentBitrate: [],
      fromReceivedPacketLoss: [],
      fromPOLQA: [],
      fromReceivedPackets: [],
      fromSentPackets: [],
      toReceivedJitter: [],
      toRoundTripTime: [],
      toSentBitrate: [],
      toReceivedPacketLoss: [],
      toPOLQA: [],
      toReceivedPackets: [],
      toSentPackets: []
    };
    let timeLapse = 'Hour';
  
    this.fromMediaStatsData.map(fromData => {
      if (!fromData.data["POLQA"])
        fromCategories.push(fromData.timestamp.split(" ")[1]);
      else 
        this.fromPolqaCategories.push(fromData.timestamp.split(" ")[1]);
    });

    this.toMediaStatsData.map(toData => {
      if (!toData.data["POLQA"])
        toCategories.push(toData.timestamp.split(" ")[1]);
      else 
        this.toPolqaCategories.push(toData.timestamp.split(" ")[1]);
    });
    
    let categories = [...new Set([...fromCategories, ...toCategories])].sort();
    let polqaCategories = [...new Set([...this.toPolqaCategories, ...this.fromPolqaCategories])].sort();
    this.selectedTimeStamp = fromCategories[0].split(" ")[0];
    this.selecetedDID = this.data.from.DID;
    try {
      categories.forEach(category => {
        let fromIndex = this.data.from.mediaStats.findIndex(mediaStat => mediaStat.timestamp.includes(category));
        let toIndex = this.data.to.mediaStats.findIndex(mediaStat => mediaStat.timestamp.includes(category));
          if(fromIndex !== -1) {
            this.data.from.mediaStats[fromIndex].data['Received Jitter'] && this.data.from.mediaStats[fromIndex].data['Received Jitter'] !== "--" ? chartData.fromReceivedJitter.push(parseFloat(this.data.from.mediaStats[fromIndex].data['Received Jitter'])) : chartData.fromReceivedJitter.push(null);
            this.data.from.mediaStats[fromIndex].data['Received packet loss'] && this.data.from.mediaStats[fromIndex].data['Received packet loss'] !== "--" ? chartData.fromReceivedPacketLoss.push(parseFloat(this.data.from.mediaStats[fromIndex].data['Received packet loss'])) : chartData.fromReceivedPacketLoss.push(null);
            this.data.from.mediaStats[fromIndex].data['Sent bitrate'] && this.data.from.mediaStats[fromIndex].data['Sent bitrate'] !== "--" ? chartData.fromSentBitrate.push(parseFloat(this.data.from.mediaStats[fromIndex].data['Sent bitrate'])) : chartData.fromSentBitrate.push(null);
            this.data.from.mediaStats[fromIndex].data['Round trip time'] && this.data.from.mediaStats[fromIndex].data['Round trip time'] !== "--" ? chartData.fromRoundTripTime.push(parseFloat(this.data.from.mediaStats[fromIndex].data['Round trip time'])) : chartData.fromRoundTripTime.push(null);
            this.data.from.mediaStats[fromIndex].data['Received packets'] && this.data.from.mediaStats[fromIndex].data['Received packets'] !== "--" ? chartData.fromReceivedPackets.push(parseFloat(this.data.from.mediaStats[fromIndex].data['Received packets'])) : chartData.fromReceivedPackets.push(null);
            this.data.from.mediaStats[fromIndex].data['Sent packets'] && this.data.from.mediaStats[fromIndex].data['Sent packets'] !== "--" ? chartData.fromSentPackets.push(parseFloat(this.data.from.mediaStats[fromIndex].data['Sent packets'])) : chartData.fromSentPackets.push(null);
          } else {
            chartData.fromReceivedJitter.push(null);
            chartData.fromRoundTripTime.push(null);
            chartData.fromSentBitrate.push(null);
            chartData.fromReceivedPacketLoss.push(null);
            chartData.fromReceivedPackets.push(null);
            chartData.fromSentPackets.push(null);
          }
          if(toIndex !== -1) {
            this.data.to.mediaStats[toIndex].data['Received Jitter'] && this.data.to.mediaStats[toIndex].data['Received Jitter'] !== "--" ? chartData.toReceivedJitter.push(parseFloat(this.data.to.mediaStats[toIndex].data['Received Jitter'])) : chartData.toReceivedJitter.push(null);
            this.data.to.mediaStats[toIndex].data['Received packet loss'] && this.data.to.mediaStats[toIndex].data['Received packet loss'] !== "--" ? chartData.toReceivedPacketLoss.push(parseFloat(this.data.to.mediaStats[toIndex].data['Received packet loss'])) : chartData.toReceivedPacketLoss.push(null);
            this.data.to.mediaStats[toIndex].data['Sent bitrate'] && this.data.to.mediaStats[toIndex].data['Sent bitrate'] !== "--" ? chartData.toSentBitrate.push(parseFloat(this.data.to.mediaStats[toIndex].data['Sent bitrate'])) : chartData.toSentBitrate.push(null);
            this.data.to.mediaStats[toIndex].data['Round trip time'] && this.data.to.mediaStats[toIndex].data['Round trip time'] !== "--" ? chartData.toRoundTripTime.push(parseFloat(this.data.to.mediaStats[toIndex].data['Round trip time'])) : chartData.toRoundTripTime.push(null);
            this.data.to.mediaStats[toIndex].data['Received packets'] && this.data.to.mediaStats[toIndex].data['Received packets'] !== "--" ? chartData.toReceivedPackets.push(parseFloat(this.data.to.mediaStats[toIndex].data['Received packets'])) : chartData.toReceivedPackets.push(null);
            this.data.to.mediaStats[toIndex].data['Sent packets'] && this.data.to.mediaStats[toIndex].data['Sent packets'] !== "--" ? chartData.toSentPackets.push(parseFloat(this.data.to.mediaStats[toIndex].data['Sent packets'])) : chartData.toSentPackets.push(null);
          } else {
            chartData.toReceivedJitter.push(null);
            chartData.toRoundTripTime.push(null);
            chartData.toSentBitrate.push(null);
            chartData.toReceivedPacketLoss.push(null);
            chartData.toReceivedPackets.push(null);
            chartData.toSentPackets.push(null);
          }
      })
      polqaCategories.forEach(polqaCategory => {
        let fromIndex = this.data.from.mediaStats.findIndex(mediaStat => mediaStat.timestamp.includes(polqaCategory));
        let toIndex = this.data.to.mediaStats.findIndex(mediaStat => mediaStat.timestamp.includes(polqaCategory));
        if(fromIndex !== -1) {
          this.data.from.mediaStats[fromIndex].data['POLQA'] && this.data.from.mediaStats[fromIndex].data['POLQA'] !== "--" ? chartData.fromPOLQA.push(parseFloat(this.data.from.mediaStats[fromIndex].data['POLQA'])) : chartData.fromPOLQA.push(null);
        } else {
          chartData.fromPOLQA.push(null);
        }
        if(toIndex !== -1) {
          this.data.to.mediaStats[toIndex].data['POLQA'] && this.data.to.mediaStats[toIndex].data['POLQA'] !== "--" ? chartData.toPOLQA.push(parseFloat(this.data.to.mediaStats[toIndex].data['POLQA'])) : chartData.toPOLQA.push(null);
        } else {
          chartData.toPOLQA.push(null);
        }
      })
    } catch(error){
      console.log(error)
    }
   
    this.initChartOptions(categories,timeLapse, false);
    this.initChartOptions(polqaCategories, timeLapse, true);
    
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
    this.polqaReceivedPackets.series = [
      {
        name: "From. Received Packets",
        data: chartData.fromReceivedPackets
      },
      {
        name: "To. Received Packets",
        data: chartData.toReceivedPackets
      }
    ];
    this.polqaSentPackets.series = [
      {
        name: "From. Received Packets",
        data: chartData.fromSentPackets
      },
      {
        name: "To. Received Packets",
        data: chartData.toSentPackets
      }
    ]
  }
  
  
  private initChartOptions(categories:string[],timeLapse:string, polqaFlag:boolean) {
    try {
      this.polqaCommonChartOptions.xAxis = {...this.polqaCommonChartOptions.xAxis, categories: categories , max: categories.length};
      this.polqaCommonChartOptions.xAxis.title.text = timeLapse;
      if(polqaFlag) {
        defaultPolqaChartOptions.title.text = 'POLQA';
        this.polqaChartOptions = { ...this.polqaCommonChartOptions, ...defaultPolqaChartOptions };
        this.polqaChartOptions.chart.events = {
          markerClick: this.navigateToDetailedTableFromPolqaChart.bind(this)
        };
      } else {
        defaultPolqaPacketLossChartOptions.title.text = 'Packet Loss' + ' (%)';
        defaultPolqaJitterChartOptions.title.text = 'Jitter' + ' (ms)';
        defaultPolqaRoundtripTimeChartOptions.title.text = 'Round Trip Time' + ' (ms)';
        defaultSentBitrateChartOptions.title.text = 'Bitrate' + ' (kbps)';
        defaultPolqaReceivedPacketsChartOptions.title.text ='Received Packtes';
        defaultPolqaSentPacketsChartOptions.title.text = 'Sent Packets'
       
        this.polqaPacketLossChartOptions = { ...this.polqaCommonChartOptions, ...defaultPolqaPacketLossChartOptions }
        this.polqaJitterChartOptions = { ...this.polqaCommonChartOptions, ...defaultPolqaJitterChartOptions };
        this.polqaRoundTripChartOptions = {...this.polqaCommonChartOptions, ...defaultPolqaRoundtripTimeChartOptions };
        this.sentBitrateChartOptions = {...this.polqaCommonChartOptions, ...defaultSentBitrateChartOptions };
        this.polqaReceivedPackets = {...this.polqaCommonChartOptions, ...defaultPolqaReceivedPacketsChartOptions};
        this.polqaSentPackets = {...this.polqaCommonChartOptions, ...defaultPolqaSentPacketsChartOptions};
        this.polqaPacketLossChartOptions.chart.events = {
          markerClick:this.navigateToDetailedTableFromPolqaChart.bind(this)
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
        this.polqaReceivedPackets.chart.events = {
          markerClick: this.navigateToDetailedTableFromPolqaChart.bind(this)
        };
        this.polqaSentPackets.chart.events = {
          markerClick: this.navigateToDetailedTableFromPolqaChart.bind(this)
        };
      }
    } catch (error) {
      console.log(error)
    }

  }

  //To 1 - From 0
  navigateToDetailedTableFromPolqaChart(event, chartContext, { seriesIndex, dataPointIndex, config}) {
    this.selectedPoint = true;
    const eventChartTitle: string = event.srcElement.farthestViewportElement.children[1].innerHTML;
    const chartTitle: string = chartContext.w.config.title.text
    let selectedTimeStamp = chartContext.w.globals.categoryLabels[dataPointIndex];
    if(eventChartTitle === chartTitle) {
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
}
