import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ChartOptions } from "../../../../helpers/chart-options-type";
import {
  defaultJitterChartOptions,
  defaultReceivedPacketLossChartOptions, defaultRoundtripTimeChartOptions,
  defaultSentBitrateChartOptions,
  trendsChartCommonOptions
} from "./initial-chart-config";
import { SpotlightChartsService } from "../../../../services/spotlight-charts.service";
import moment, { Moment } from "moment";
import { forkJoin, Observable } from "rxjs";
import { SubAccountService } from "../../../../services/sub-account.service";
import { FormBuilder } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { environment } from "../../../../../environments/environment";
import { ReportType } from "../../../../helpers/report-type";
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
export class NetworkQualityComponent implements OnInit {

  @Input() startDate: Moment;
  @Input() endDate: Moment;
  @Input() users: string[] = [];
  @Input() regions;
  @Input() groupBy = 'hour';
  @Input() isLoading: boolean;
  @Output() chartStatus = new EventEmitter<boolean>();

  polqaChartOptions: Partial<ChartOptions>;
  customerNetworkQualityData = null;

  // Customer Network Trends variables
  receivedPacketLossChartOptions: Partial<ChartOptions>;
  jitterChartOptions: Partial<ChartOptions>;
  sentBitrateChartOptions: Partial<ChartOptions>;
  roundTripChartOptions: Partial<ChartOptions>;
  commonChartOptions: Partial<ChartOptions>;
  filteredUsers: Observable<string[]>;
  selectedUsers = [];

  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  

  filterNetworkQualityForm: any[] = ['Most Representative', 'Average'];
  defaultValue: string = this.filterNetworkQualityForm[0];
  selectedFilter: boolean = false;
  avgFlag: boolean = false;
  maxLabel: string = 'Max.';
  minLabel: string = 'Min.';
  avgLabel: string = 'Avg.'
    filters = this.fb.group({
      user: [""],
      selectedValue: [""]
    });

  summary = {
    totalCalls: 0,
    aboveThreshold: { jitter: 0, packetLoss: 0, roundTripTime: 0 },
    overall: { packetLoss: 0, jitter: 0, sendBitrate: 0, roundTripTime: 0, polqa:0 }
  };

  privateIsLoading = true;
  isChartLoading = false;
  selectedGraph = 'jitter';

  readonly MetricsThresholds = MetricsThresholds;

  constructor(private spotlightChartsService: SpotlightChartsService,
              private subaccountService: SubAccountService,
              private fb: FormBuilder,
              private matIconRegistry: MatIconRegistry,
              private domSanitzer: DomSanitizer) {
    this.commonChartOptions = trendsChartCommonOptions;
    this.polqaChartOptions = defaultPolqaChartOptions;
    this.polqaChartOptions.chart.events = {
      markerClick: this.navigateToPolqaDetailedTableFromPoint.bind(this)
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

  chartLoadCompleted() {
    this.chartStatus.emit(true);
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
    this.loadCharts(true);
  }

  onChangeValue(event:any){
    console.log(event)
    if(event === 'Most Representative')
      this.selectedFilter = false;
    if(event === 'Average')
      this.selectedFilter = true;
  }

  loadCharts(isReload?) {
    if (!isReload) this.privateIsLoading = true;
    const obs = [];
    if(this.selectedFilter === false) {
      this.selectedFilter = false;
      this.maxLabel = "Max."
      this.minLabel = "Min."
      this.avgLabel = "Avg."
    }
    if(this.selectedFilter === true) {
      this.maxLabel = ""
      this.minLabel = ""
      this.avgLabel = ""
    }
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    obs.push(this.spotlightChartsService.getCustomerNetworkTrendsData(this.startDate, this.endDate,this.regions, this.selectedUsers, subaccountId, this.groupBy, this.selectedFilter));
    obs.push(this.spotlightChartsService.getNetworkQualitySummary(this.startDate, this.endDate, this.regions, this.selectedUsers, subaccountId,this.selectedFilter));
    obs.push(this.spotlightChartsService.getCustomerNetworkQualityData(this.startDate, this.endDate, this.regions, this.selectedUsers, subaccountId, this.groupBy, this.selectedFilter));
    forkJoin(obs).subscribe((res: any) => {
      const trendsData = res[0];
      if(this.groupBy==='hour'){
        this.commonChartOptions.xAxis.categories = trendsData.categories.map(category => category.split(" ")[1]);
        this.commonChartOptions.xAxis.title.text = 'Hour';
      }
      else{
        this.commonChartOptions.xAxis.categories = trendsData.categories;
        this.commonChartOptions.xAxis.title.text = 'Date';
      }

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
      this.summary.totalCalls = summary.totalCalls;
      this.summary.overall.sendBitrate = summary.avgSentBitrate;
      this.summary.overall.jitter = summary.maxJitter;
      this.summary.overall.roundTripTime = summary.maxRoundTripTime;
      this.summary.overall.packetLoss = summary.maxPacketLoss;
      this.summary.overall.polqa = summary.minPolqa;
      this.summary.aboveThreshold.jitter = summary.jitterAboveThld;
      this.summary.aboveThreshold.packetLoss = summary.packetLossAboveThld;
      this.summary.aboveThreshold.roundTripTime = summary.roundTripTimeAboveThld;

      this.customerNetworkQualityData = res[2];
      if(this.groupBy==='hour') {
        this.polqaChartOptions.xAxis.categories = this.customerNetworkQualityData.categories.map((category: string) => category.split(" ")[1]);
        this.polqaChartOptions.xAxis.title.text = 'Hour';
      }
      else{
        this.polqaChartOptions.xAxis.categories = this.customerNetworkQualityData.categories;
        this.polqaChartOptions.xAxis.title.text = 'Date';
      }

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

      this.isChartLoading = false;
      this.privateIsLoading = false;
      this.chartLoadCompleted();
    }, error => {
      console.error(error);
      this.chartLoadCompleted();
      this.privateIsLoading = false;
    });
  }

  private initChartOptions() {
    defaultReceivedPacketLossChartOptions.title.text = this.maxLabel + ' Received Packet Loss (%)';
    defaultJitterChartOptions.title.text = this.maxLabel + ' Jitter (ms)';
    defaultSentBitrateChartOptions.title.text =this.avgLabel + ' Sent Bitrate (kbps)';
    defaultRoundtripTimeChartOptions.title.text = this.maxLabel +' Round Trip Time (ms)';
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
    let startDate: Moment, endDate: Moment;
    if(this.groupBy==='hour'){
      const [ startTime, endTime ] = category.split('-');
      startDate = this.startDate.clone().utc().startOf('day').hour(startTime.split(':')[0]);
      endDate = Utility.setMinutesOfDate(this.endDate.clone().utc().startOf('day').hour(startTime.split(':')[0]));
    }else{
      startDate = moment(category).utc().hour(0);
      endDate = Utility.setHoursOfDate(moment(category).utc());
    }

    const parsedStartTime = startDate.format('YYMMDDHHmmss');
    const parsedEndTime = endDate.format('YYMMDDHHmmss');
    const url = `${ environment.BASE_URL }/#/spotlight/details?subaccountId=${ this.subaccountService.getSelectedSubAccount().id }&start=${ parsedStartTime }&end=${ parsedEndTime }`;
    window.open(url);
  }

  navigateToPolqaDetailedTableFromPoint(event, chartContext, { seriesIndex, dataPointIndex, config}) {
    const category = chartContext.opts.xaxis.categories[dataPointIndex];
    let startDate: Moment, endDate: Moment;
    if(this.groupBy==='hour'){
      const [ startTime, endTime ] = category.split('-');
      startDate = this.startDate.clone().utc().startOf('day').hour(startTime.split(':')[0]);
      endDate = Utility.setMinutesOfDate(this.endDate.clone().utc().startOf('day').hour(startTime.split(':')[0]));
    }else{
      startDate = moment(category).utc().hour(0);
      endDate = Utility.setHoursOfDate(moment(category).utc());
    }
   
    const parsedStartTime = startDate.format('YYMMDDHHmmss');
    const parsedEndTime = endDate.format('YYMMDDHHmmss');
    const url = `${ environment.BASE_URL }/#/spotlight/details?subaccountId=${ this.subaccountService.getSelectedSubAccount().id }&type=${ ReportType.DAILY_VQ }&start=${ parsedStartTime }&end=${ parsedEndTime }`;
    window.open(url);
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
      this.polqaChartOptions.yAxis[0].title.text = 'Round Trip Time';
    }
  }

  remove(user: string): void {
    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
  }

  selected(): void {
    this.selectedUsers.push(this.filters.get('user').value);
    this.userInput.nativeElement.value = '';
    this.filters.get('user').setValue("");
    this.initAutocompletes();
  }

  clearUsersFilter(){
    this.selectedUsers=[];
  }

}
