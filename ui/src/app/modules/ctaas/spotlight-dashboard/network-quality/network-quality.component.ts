import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ChartOptions } from "../../../../helpers/chart-options-type";
import {
  defaultJitterChartOptions,
  defaultReceivedPacketLossChartOptions, defaultRoundtripTimeChartOptions,
  defaultSentBitrateChartOptions,
  trendsChartCommonOptions
} from "./initial-chart-config";
import { SpotlightChartsService } from "../../../../services/spotlight-charts.service";
import moment, { Moment } from "moment";
import { forkJoin, Observable, of, Subscription } from "rxjs";
import { SubAccountService } from "../../../../services/sub-account.service";
import { FormBuilder } from '@angular/forms';
import { catchError, map, startWith } from 'rxjs/operators';
import { environment } from "../../../../../environments/environment";
import { defaultPolqaChartOptions } from "../initial-chart-config";
import { Utility } from 'src/app/helpers/utils';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { MetricsThresholds } from 'src/app/helpers/metrics';

@Component({
  selector: 'app-network-quality',
  templateUrl: './network-quality.component.html',
  styleUrls: ['./network-quality.component.css']
})
export class NetworkQualityComponent implements OnInit, OnChanges, OnDestroy {

  @Input() startDate: Moment;
  @Input() endDate: Moment;
  @Input() users: string[] = [];
  @Input() regions;
  @Input() groupBy = 'hour';
  @Input() isLoading: boolean;
  @Output() chartStatus = new EventEmitter<boolean>();

  polqaChartOptions: Partial<ChartOptions>;
  customerNetworkQualityData = null;
  qualitySubscriber:Subscription

  // Customer Network Trends variables
  receivedPacketLossChartOptions: Partial<ChartOptions>;
  jitterChartOptions: Partial<ChartOptions>;
  sentBitrateChartOptions: Partial<ChartOptions>;
  roundTripChartOptions: Partial<ChartOptions>;
  commonChartOptions: Partial<ChartOptions>;
  filteredUsers: Observable<string[]>;
  selectedUsers = [];
  usersForDropdown: string[] = [];
  preselectedUsers = [];
  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  

  filterNetworkQualityForm: any[] = ['Worst Case', 'Average'];
  defaultValue: string = this.filterNetworkQualityForm[0];
  averageSelected = false;
  preselectedFilter = 'Worst Case';
  avgFlag = false;
  maxLabel = 'Max.';
  minLabel = 'Min.';
  avgLabel = 'Avg.';
  filters = this.fb.group({
    user: [""],
    selectedValue: [""]
  });

  summary = {
    totalCalls: 0,
    aboveThreshold: { jitter: 0, packetLoss: 0, roundTripTime: 0 },
    overall: { packetLoss: 0, jitter: 0, roundTripTime: 0, polqa:0, sendBitrate: 0 }
  };

  hideChart = true;
  isChartLoading = false;
  selectedGraph = 'jitter';

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
    }
  }

  readonly MetricsThresholds = MetricsThresholds;

  @ViewChild('outlet', { read: ViewContainerRef }) outletRef: ViewContainerRef;
  @ViewChild('chartContent', { read: TemplateRef }) chartContentRef: TemplateRef<any>;


  constructor(private spotlightChartsService: SpotlightChartsService,
              private subaccountService: SubAccountService,
              private fb: FormBuilder,
              private matIconRegistry: MatIconRegistry,
              private domSanitzer: DomSanitizer) {
    this.commonChartOptions = trendsChartCommonOptions;
    this.polqaChartOptions = defaultPolqaChartOptions;
    this.polqaChartOptions.chart.events = {
      markerClick: this.navigateToDetailedTableFromPolqaChart.bind(this)
    };
    this.matIconRegistry.addSvgIcon(
        'packetloss',
        this.domSanitzer.bypassSecurityTrustResourceUrl('assets/images/icons/packetloss.svg')
    );
    this.matIconRegistry.addSvgIcon(
        'jitter',
        this.domSanitzer.bypassSecurityTrustResourceUrl('assets/images/icons/jitter.svg')
    );
  }

  ngOnInit(): void {
    this.loadCharts();
  }

  ngOnChanges(changes: SimpleChanges){
    if(!changes.regions.firstChange || !changes.startDate.firstChange || !changes.endDate.firstChange){
      this.loadCharts();
    }
  }

  chartLoadCompleted() {
    this.chartStatus.emit(true);
  }

  
  public initAutocompletes() {
    this.filteredUsers = this.filters.get('user').valueChanges.pipe(
        startWith(''),
        map(value =>  this._filterUser(value || '')),
    );

    this.filteredUsers.subscribe((users) => {
      this.usersForDropdown = [...users];
      this.preselectedUsers.forEach(user => {
        const index = this.usersForDropdown.indexOf(user);
        if (index !== -1)
          this.usersForDropdown.splice(index, 1);
      });
    });
  }

  private _filterUser(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.users.filter(option => option.toLowerCase().includes(filterValue));
  }

  applyFilters(){
    this.selectedUsers = [...this.preselectedUsers];
    this.averageSelected = this.evaluateFilter();
    this.loadCharts({hideChart:false,showLoading:true});
    this.initAutocompletes();
  }

  onChangeValue(event:any){
    this.preselectedFilter = event;
  }

  loadCharts(params:{hideChart?:boolean,showLoading?:boolean} = {hideChart:true,showLoading:false}) {
    if(this.qualitySubscriber)
      this.qualitySubscriber.unsubscribe();
    this.isChartLoading = params.showLoading;
    this.hideChart = params.hideChart;
    const obs = [];
    if (!this.averageSelected) {
      this.maxLabel = "Max."
      this.minLabel = "Min."
      this.avgLabel = "Avg."
    } else {
      this.maxLabel = ""
      this.minLabel = ""
      this.avgLabel = ""
    }
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    obs.push(this.spotlightChartsService.getCustomerNetworkTrendsData(this.startDate, this.endDate, this.regions, this.selectedUsers, subaccountId, this.groupBy, this.averageSelected));
    obs.push(this.spotlightChartsService.getNetworkQualitySummary(this.startDate, this.endDate, this.regions, this.selectedUsers, subaccountId, this.averageSelected));
    obs.push(this.spotlightChartsService.getCustomerNetworkQualityData(this.startDate, this.endDate, this.regions, this.selectedUsers, subaccountId, this.groupBy, this.averageSelected));
    this.qualitySubscriber =  forkJoin(obs).subscribe((res: any) => {
      try {
        this.processData(res);
      } catch (error) {
        console.error(error);
      }
    }, error => {
      console.error(error);
      this.chartLoadCompleted();
      this.hideChart = false;
    });
  }

  private processData(res: any) {
    const trendsData = res[0];
    if(this.groupBy==='hour'){
      this.commonChartOptions.xAxis = {...this.commonChartOptions.xAxis, categories: trendsData.categories.map(category => category.split(" ")[1])};
      this.commonChartOptions.xAxis.title.text = 'Hour';
    }
    else{
      this.commonChartOptions.xAxis = {...this.commonChartOptions.xAxis, categories: trendsData.categories};
      this.commonChartOptions.xAxis.title.text = 'Date';
    }

    this.initChartOptions();
    this.receivedPacketLossChartOptions.series = [{
      name: this.series.packetLoss.label,
      data: trendsData.series[this.series.packetLoss.value]
    }];
    this.jitterChartOptions.series = [{
      name: this.series.jitter.label,
      data: trendsData.series[this.series.jitter.value]
    }];
    this.sentBitrateChartOptions.series = [{
      name: this.series.sentBitrate.label,
      data: trendsData.series[this.series.sentBitrate.value]
    }];
    this.roundTripChartOptions.series = [{
      name: this.series.roundTripTime.label,
      data: trendsData.series[this.series.roundTripTime.value]
    }];

    const summary = res[1];
    this.summary.totalCalls = summary.totalCalls;
    this.summary.overall.packetLoss = summary.maxPacketLoss;
    this.summary.overall.jitter = summary.maxJitter;
    this.summary.overall.roundTripTime = summary.maxRoundTripTime;
    this.summary.overall.polqa = summary.minPolqa;
    this.summary.overall.sendBitrate = summary.avgSentBitrate;
    this.summary.aboveThreshold.jitter = summary.jitterAboveThld;
    this.summary.aboveThreshold.packetLoss = summary.packetLossAboveThld;
    this.summary.aboveThreshold.roundTripTime = summary.roundTripTimeAboveThld;

    this.customerNetworkQualityData = res[2];
    if(this.groupBy==='hour') {
      this.polqaChartOptions.xAxis = {...this.polqaChartOptions.xAxis, categories: this.customerNetworkQualityData.categories.map((category: string) => category.split(" ")[1])};
      this.polqaChartOptions.xAxis.title.text = 'Hour';
    }
    else{
      this.polqaChartOptions.xAxis = {...this.polqaChartOptions.xAxis, categories: this.customerNetworkQualityData.categories };
      this.polqaChartOptions.xAxis.title.text = 'Date';
    }

    this.polqaChartOptions.series = [
      {
        name: this.series[this.selectedGraph].label,
        data: this.customerNetworkQualityData.series[this.series[this.selectedGraph].value]
      },
      {
        name: 'POLQA',
        data: this.customerNetworkQualityData.series['POLQA']
      }
    ];

    this.isChartLoading = false;
    this.hideChart = false;
    this.chartLoadCompleted();
  }

  private initChartOptions() {
    defaultReceivedPacketLossChartOptions.title.text = this.maxLabel + ' ' + this.series.packetLoss.label + ' (%)';
    defaultJitterChartOptions.title.text = this.maxLabel + ' ' + this.series.jitter.label + ' (ms)';
    defaultSentBitrateChartOptions.title.text =this.avgLabel + ' ' + this.series.sentBitrate.label + ' (kbps)';
    defaultRoundtripTimeChartOptions.title.text = this.maxLabel + ' ' + this.series.roundTripTime.label + ' (ms)';
    this.receivedPacketLossChartOptions = { ...this.commonChartOptions, ...defaultReceivedPacketLossChartOptions };
    this.jitterChartOptions = { ...this.commonChartOptions, ...defaultJitterChartOptions };
    this.sentBitrateChartOptions = {...this.commonChartOptions, ...defaultSentBitrateChartOptions };
    this.roundTripChartOptions = {...this.commonChartOptions, ...defaultRoundtripTimeChartOptions };
    this.receivedPacketLossChartOptions.chart.events = {
      markerClick: this.navigateToDetailedTableFromNetworkChart.bind(this)
    };
  }

  navigateToDetailedTableFromPolqaChart(event, chartContext, { seriesIndex, dataPointIndex, config}) {
    this.navigateToDetailedTable(chartContext, dataPointIndex, true);
  }
  
  navigateToDetailedTableFromNetworkChart(event, chartContext, { seriesIndex, dataPointIndex, config}) {
    this.navigateToDetailedTable(chartContext, dataPointIndex, false);
  }

  navigateToDetailedTable(chartContext, dataPointIndex, polqaCalls = false) {
    const category = chartContext.opts.xaxis.categories[dataPointIndex];
    let startDate: Moment, endDate: Moment;
    if (this.groupBy==='hour') {
      const [ startTime, endTime ] = category.split('-');
      startDate = this.startDate.clone().utc().startOf('day').hour(startTime.split(':')[0]);
      endDate = Utility.setMinutesOfDate(this.endDate.clone().utc().startOf('day').hour(startTime.split(':')[0]));
    } else {
      startDate = moment.utc(category).hour(0);
      endDate = Utility.setHoursOfDate(moment.utc(category));
    }
    const parsedStartTime = startDate.format('YYMMDDHHmmss');
    const parsedEndTime = endDate.format('YYMMDDHHmmss');
    let url = `${ environment.BASE_URL }/#/spotlight/details?subaccountId=${ this.subaccountService.getSelectedSubAccount().id }&start=${ parsedStartTime }&end=${ parsedEndTime }`;
    if (this.regions.length > 0)
      url += "&regions=" + JSON.stringify(this.regions);
    if (this.selectedUsers.length > 0)
      url+= "&users=" + this.selectedUsers.join(',');
    if (polqaCalls)
      url+= "&polqaCalls=true";
    window.open(url);
  }

  changeGraph() {
    this.polqaChartOptions.series = [
      {
        name: this.series[this.selectedGraph].label,
        data: this.customerNetworkQualityData.series[this.series[this.selectedGraph].value]
      },
      {
        name: 'POLQA',
        data: this.customerNetworkQualityData.series['POLQA']
      },
    ];
    this.polqaChartOptions.yAxis[0].title.text = this.series[this.selectedGraph].label;
    this.outletRef.clear();
    this.outletRef.createEmbeddedView(this.chartContentRef);
  }

  remove(user: string): void {
    const index = this.preselectedUsers.indexOf(user);
    if (index >= 0) {
      this.preselectedUsers.splice(index, 1);
    }
    this.initAutocompletes();
  }

  selected(): void {
    this.preselectedUsers.push(this.filters.get('user').value);
    this.userInput.nativeElement.value = '';
    this.filters.get('user').setValue("");
    this.initAutocompletes();
  }

  clearUsersFilter(){
    this.preselectedUsers=[];
    this.initAutocompletes();
  }

  userHasChanged(){
    return JSON.stringify(this.preselectedUsers)!==JSON.stringify(this.selectedUsers);
  }
  
  metricValueHasChanged(){
    return this.averageSelected !== this.evaluateFilter();
  }

  evaluateFilter():boolean{
    return this.preselectedFilter === 'Average';
  }

  ngOnDestroy(): void {
    if(this.qualitySubscriber)
      this.qualitySubscriber.unsubscribe();
  }

}
