import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from "../../../helpers/chart-options-type";
import { ChartComponent } from "ng-apexcharts";
import { CtaasSetupService } from "../../../services/ctaas-setup.service";
import {
  defaultPolqaChartOptions,
  defaultWeeklyFeatureFunctionalityChartOptions
} from "./initial-chart-config";
import { SubAccountService } from "../../../services/sub-account.service";
import { SpotlightChartsService } from "../../../services/spotlight-charts.service";
import moment from "moment";
import { forkJoin } from "rxjs";

@Component({
  selector: 'app-dashboard-poc',
  templateUrl: './dashboard-poc.component.html',
  styleUrls: ['./dashboard-poc.component.css']
})
export class DashboardPocComponent implements OnInit{
  polqaChartOptions: Partial<ChartOptions>;
  weeklyCallingReliabilityChartOptions: Partial<ChartOptions>;
  @ViewChild('polqaChart') polqaChart: ChartComponent;

  // Calling Reliabilty gaguge variables
  callingReliability = { value: 0, total: 0, period: '' };

  // Feature Functionality gaguge variables
  featureFunctionality = { value: 0, total: 0, period: '' };

  // Feature Functionality gaguge variables
  vq = { value: 0, total: 0, period: '' };

  // POLQA chart variables
  customerNetworkQualityData = null;

  selectedGraph = 'jitter';
  selectedPeriod = 'daily';

  isloading = true;

  constructor(private ctaasSetupService: CtaasSetupService,
              private subaccountService: SubAccountService,
              private spotlightChartsService: SpotlightChartsService) {
    this.polqaChartOptions = defaultPolqaChartOptions;
    this.weeklyCallingReliabilityChartOptions = defaultWeeklyFeatureFunctionalityChartOptions;
  }

  ngOnInit() {
    // this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountService.getSelectedSubAccount().id).subscribe();
    const subs = [];
    subs.push(this.spotlightChartsService.getDailyCallingReliability(moment(), moment()));
    subs.push(this.spotlightChartsService.getDailyFeatureFunctionality(moment(), moment()));
    subs.push(this.spotlightChartsService.getDailyVoiceQuality(moment(), moment()));
    subs.push(this.spotlightChartsService.getNetworkQualityData(moment(), moment()));
    subs.push(this.spotlightChartsService.getWeeklyCallingReliability(moment().startOf('week').add(1, 'day'), moment().endOf('week').add(1, 'day')));
    forkJoin(subs).subscribe((res: any) => {
      console.log(res)
      const dailyCallingReliabiltyRes: any = res[0].series;
      this.callingReliability.total = dailyCallingReliabiltyRes.reduce((accumulator, entry) => accumulator + entry.value, 0);
      this.callingReliability.value = (dailyCallingReliabiltyRes.find(entry => entry.id === 'PASSED')?.value / this.callingReliability.total) * 100;
      console.log(this.callingReliability.total, this.callingReliability.value);
      this.callingReliability.period = moment().format("MM-DD-YYYY 00:00:00") + " AM UTC to " + moment().format("MM-DD-YYYY 12:59:59") + " PM UTC";

      const featureFunctionalityRes: any = res[1].series;
      this.featureFunctionality.total = featureFunctionalityRes.reduce((accumulator, entry) => accumulator + entry.value, 0);
      this.featureFunctionality.value = (featureFunctionalityRes.find(entry => entry.id === 'PASSED')?.value / this.featureFunctionality.total) * 100;
      console.log(this.featureFunctionality.total, this.featureFunctionality.value);
      this.featureFunctionality.period = moment().format("MM-DD-YYYY 00:00:00") + " AM UTC to " + moment().format("MM-DD-YYYY 12:59:59") + " PM UTC";

      const voiceQualityRes: any = res[2].series;
      this.vq.total = voiceQualityRes.reduce((accumulator, entry) => accumulator + entry.value, 0);
      this.vq.value = (voiceQualityRes.find(entry => entry.id === 'PASSED')?.value / this.vq.total) * 100;
      console.log(this.vq.total, this.vq.value);
      this.vq.period = moment().format("MM-DD-YYYY 00:00:00") + " AM UTC to " + moment().format("MM-DD-YYYY 12:59:59") + " PM UTC";


      this.customerNetworkQualityData = res[3];
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

      const weeklyFeatureFunctionalityData = res[4];
      this.weeklyCallingReliabilityChartOptions.xAxis.categories = weeklyFeatureFunctionalityData.categories;
      this.weeklyCallingReliabilityChartOptions.series = [
        {
          name: "Percentage",
          data: weeklyFeatureFunctionalityData.series['percentage'],
          type: "line"
        },
        {
          name: "Passed",
          data: weeklyFeatureFunctionalityData.series['passed'],
          type: "column",
        },
        {
          name: "Failed",
          data: weeklyFeatureFunctionalityData.series['failed'],
          type: "column",
        }
      ];
      this.isloading = false;
    })
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
        text: "Average Jitter vs POLQA",
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
