import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { SpotlightChartsService } from "../../../../services/spotlight-charts.service";
import moment, { Moment } from "moment";
import { forkJoin, Observable, Subscription } from "rxjs";
import { SubAccountService } from "../../../../services/sub-account.service";
import { FormBuilder } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { environment } from "../../../../../environments/environment";
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

  networkTrendsData = null;
  customerNetworkQualityData = null;

  qualitySubscriber:Subscription;

  filteredUsers: Observable<string[]>;
  selectedUsers = [];
  usersForDropdown: string[] = [];
  preselectedUsers = [];
  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  

  networkQualityValues: any[] = ['Worst Case', 'Average'];
  avgFlag = true;

  filters = this.fb.group({
    user: [""],
    selectedValue: [""]
  });

  summary = {
    totalCalls: 0,
    aboveThreshold: { jitter: 0, packetLoss: 0, roundTripTime: 0 },
    avgAboveThreshold: { jitter: 0, packetLoss: 0, roundTripTime: 0 },
    overall: { packetLoss: 0, jitter: 0, roundTripTime: 0, polqa:0, sendBitrate: 0 },
    average: { packetLoss: 0, jitter: 0, roundTripTime: 0, polqa:0, sendBitrate: 0 }
  };

  hideChart = true;
  isChartLoading = false;
  selectedGraph = 'jitter';

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

  readonly MetricsThresholds = MetricsThresholds;

  @ViewChild('outlet', { read: ViewContainerRef }) outletRef: ViewContainerRef;
  @ViewChild('chartContent', { read: TemplateRef }) chartContentRef: TemplateRef<any>;


  constructor(private spotlightChartsService: SpotlightChartsService,
              private subaccountService: SubAccountService,
              private fb: FormBuilder,
              private matIconRegistry: MatIconRegistry,
              private domSanitzer: DomSanitizer) {
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
    this.loadCharts({hideChart:false,showLoading:true});
    this.initAutocompletes();
  }

  loadCharts(params:{hideChart?:boolean,showLoading?:boolean} = {hideChart:true,showLoading:false}) {
    if(this.qualitySubscriber)
      this.qualitySubscriber.unsubscribe();
    this.isChartLoading = params.showLoading;
    this.hideChart = params.hideChart;
    const obs = [];
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    obs.push(this.spotlightChartsService.getCustomerNetworkTrendsData(this.startDate, this.endDate, this.regions, this.selectedUsers, subaccountId, this.groupBy, true));
    obs.push(this.spotlightChartsService.getNetworkQualitySummary(this.startDate, this.endDate, this.regions, this.selectedUsers, subaccountId, true));
    obs.push(this.spotlightChartsService.getCustomerNetworkQualityData(this.startDate, this.endDate, this.regions, this.selectedUsers, subaccountId, this.groupBy, true));
    this.qualitySubscriber =  forkJoin(obs).subscribe((res: any) => {
      try {
        this.networkTrendsData = res[0];
        this.setSummaryData(res[1]);
        this.customerNetworkQualityData = res[2];

        this.isChartLoading = false;
        this.hideChart = false;
        this.chartLoadCompleted();
      } catch (error) {
        console.error(error);
      }
    }, error => {
      console.error(error);
      this.hideChart = false;
      this.chartLoadCompleted();
    });
  }

  setSummaryData(summary){
    this.summary.totalCalls = summary.totalCalls;
    this.summary.overall.packetLoss = summary.maxPacketLoss;
    this.summary.overall.jitter = summary.maxJitter;
    this.summary.overall.roundTripTime = summary.maxRoundTripTime;
    this.summary.overall.polqa = summary.minPolqa;
    this.summary.overall.sendBitrate = summary.avgSentBitrate;

    this.summary.average.packetLoss = summary.avgPacketLoss;
    this.summary.average.jitter = summary.avgJitter;
    this.summary.average.roundTripTime = summary.avgRoundTripTime;
    this.summary.average.polqa = summary.avgPolqa;

    this.summary.aboveThreshold.jitter = summary.jitterAboveThld;
    this.summary.aboveThreshold.packetLoss = summary.packetLossAboveThld;
    this.summary.aboveThreshold.roundTripTime = summary.roundTripTimeAboveThld;

    this.summary.avgAboveThreshold.jitter = summary.avgjitterAboveThld;
    this.summary.avgAboveThreshold.packetLoss = summary.avgpacketLossAboveThld;
    this.summary.avgAboveThreshold.roundTripTime = summary.avgroundTripTimeAboveThld;
  }
  
  navigateToDetailedTable(details:{chartContext:any,dataPointIndex:any,polqaCalls:any}) {
    const category = details.chartContext.opts.xaxis.categories[details.dataPointIndex];
    let startDate: Moment, endDate: Moment;
    if (this.groupBy==='hour') {
      const [ startTime, endTime ] = category.split('-');
      startDate = this.startDate.clone().utc().startOf('day').hour(startTime.split(':')[0]);
      endDate = Utility.setMinutesOfDate(this.endDate.clone().utc().startOf('day').hour(startTime.split(':')[0]));
    } else {
      startDate = moment.utc(category).hour(0);
      endDate = Utility.setHoursOfDate(moment.utc(category));
    }
    const parsedStartTime = Utility.parseReportDate(startDate);
    const parsedEndTime = Utility.parseReportDate(endDate);
    let url = `${ environment.BASE_URL }/#/spotlight/details?subaccountId=${ this.subaccountService.getSelectedSubAccount().id }&start=${ parsedStartTime }&end=${ parsedEndTime }`;
    if (this.regions.length > 0)
      url += "&regions=" + JSON.stringify(this.regions);
    if (this.selectedUsers.length > 0)
      url+= "&users=" + this.selectedUsers.join(',');
    if (details.polqaCalls)
      url+= "&polqaCalls=true";
    if (this.groupBy==='day')
      url+= "&statsTab=true";
    window.open(url);
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

  ngOnDestroy(): void {
    if(this.qualitySubscriber)
      this.qualitySubscriber.unsubscribe();
  }

}
