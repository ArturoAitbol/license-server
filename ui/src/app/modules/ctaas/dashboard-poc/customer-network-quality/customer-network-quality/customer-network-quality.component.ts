import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import moment, { Moment } from 'moment';
import { Observable, forkJoin } from 'rxjs';
import { ChartOptions } from 'src/app/helpers/chart-options-type';
import { SpotlightChartsService } from 'src/app/services/spotlight-charts.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { defaultPolqaChartOptions } from '../../initial-chart-config';
import { environment } from 'src/environments/environment';
import { ReportType } from 'src/app/helpers/report-type';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-customer-network-quality',
  templateUrl: './customer-network-quality.component.html',
  styleUrls: ['./customer-network-quality.component.css']
})
export class CustomerNetworkQualityComponent implements OnInit {

  @Input() date: Moment;
  @Input() users: string[] = [];
  @Input() region;
  @Output() chartStatus = new EventEmitter<boolean>();

  // Filters variables
  filters = this.fb.group({
    date: [moment()],
    region: [""],
    user: [""]
  });

  filteredUsers: Observable<string[]>;
  // Customer Network Quality variables
  polqaChartOptions: Partial<ChartOptions>;
  customerNetworkQualityData = null;
  customerNetworkQualitySummary = {
    totalCalls: 0,
    aboveThreshold: { jitter: 0, packetLoss: 0, roundTripTime: 0 },
    overall: { jitter: 0, packetLoss: 0, roundTripTime: 0, polqa:0 }
  };
  customerNetworkQualityLoading: boolean = false;

  //Selected graphs variables
  selectedGraph = 'jitter';
  selectedPeriod = 'daily';

  selectedDate: Moment = null;

  isLoading = true;
  privateIsLoading = true;

  constructor(private spotlightChartsService: SpotlightChartsService, private subaccountService: SubAccountService, private fb: FormBuilder) {
    this.polqaChartOptions = defaultPolqaChartOptions;
    this.polqaChartOptions.chart.events = {
    markerClick: this.navigateToPolqaDetailedTableFromPoint.bind(this)
    };
  }

  ngOnInit(): void {
    this.loadCharts();
  }

  chartLoadCompleted() {
    this.chartStatus.emit(true);
  }

  initAutocompletes() {
    this.filteredUsers = this.filters.get('user').valueChanges.pipe(
        startWith(''),
        map(value => this._filterUser(value || '')),
    );
  }

  private _filterUser(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.users.filter(option => option.toLowerCase().includes(filterValue));
  }

  reloadCharts(){
    this.loadCharts(true);
  }

  loadCharts(isReload?){
    if (!isReload) this.privateIsLoading = true;
    this.customerNetworkQualityLoading = true;
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    const obs = [];
    const selectedUser = this.filters.get('user').value;
    this.selectedDate = this.filters.get('date').value.clone().utc();

    obs.push(this.spotlightChartsService.getCustomerNetworkQualityData(this.date, this.date, this.region, selectedUser, subaccountId));
    obs.push(this.spotlightChartsService.getCustomerNetworkQualitySummary(this.date, this.date, this.region, selectedUser, subaccountId));
    forkJoin(obs).subscribe((res: any) => {
      // Customer Network Quality
      this.customerNetworkQualityData = res[0];
      this.polqaChartOptions.xAxis.categories = this.customerNetworkQualityData.categories.map((category: string) => category.split(" ")[1]);
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
      const customerNetworkQualitySummary = res[1];
      this.customerNetworkQualitySummary.totalCalls = customerNetworkQualitySummary.totalCalls;
      this.customerNetworkQualitySummary.aboveThreshold.jitter = customerNetworkQualitySummary.jitterAboveThld;
      this.customerNetworkQualitySummary.aboveThreshold.packetLoss = customerNetworkQualitySummary.packetLossAboveThld;
      this.customerNetworkQualitySummary.aboveThreshold.roundTripTime = customerNetworkQualitySummary.roundTripTimeAboveThld;
      this.customerNetworkQualitySummary.overall.jitter = customerNetworkQualitySummary.maxJitter;
      this.customerNetworkQualitySummary.overall.packetLoss = customerNetworkQualitySummary.maxPacketLoss;
      this.customerNetworkQualitySummary.overall.roundTripTime = customerNetworkQualitySummary.maxRoundTripTime;
      this.customerNetworkQualitySummary.overall.polqa = customerNetworkQualitySummary.minPolqa;

      this.customerNetworkQualityLoading = false;
      this.privateIsLoading = false;
      this.chartLoadCompleted();
    }, error => {
      console.error(error);
      this.chartLoadCompleted();
      this.privateIsLoading = false;
    });
  }

  navigateToPolqaDetailedTableFromPoint(event, chartContext, { seriesIndex, dataPointIndex, config}) {
    const category = chartContext.opts.xaxis.categories[dataPointIndex];
    const [ startTime, endTime ] = category.split('-');
    const startDate = this.selectedDate.clone().utc().startOf('day').hour(startTime.split(':')[0]);
    const endDate = this.selectedDate.clone().utc().startOf('day').hour(startTime.split(':')[0]).minutes(59).seconds(59);
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
      this.polqaChartOptions.title = {
        text: "Max. Jitter vs Min. POLQA",
        align: "left"
      };
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
      this.polqaChartOptions.title = {
        text: 'Packet Loss vs POLQA',
        align: 'left'
      };
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
      this.polqaChartOptions.title = {
        text: 'Round Trip Time vs POLQA',
        align: 'left'
      };
      this.polqaChartOptions.yAxis[0].title.text = 'Round Trip Time';
    }
  }
}
