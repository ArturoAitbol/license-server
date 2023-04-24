import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from "../../../helpers/chart-options-type";
import { ChartComponent } from "ng-apexcharts";
import { CtaasSetupService } from "../../../services/ctaas-setup.service";
import {
  defaultPolqaChartOptions,
  defaultWeeklyFeatureFunctionalityChartOptions
} from "./initial-chart-config";
import { SubAccountService } from "../../../services/sub-account.service";

@Component({
  selector: 'app-dashboard-poc',
  templateUrl: './dashboard-poc.component.html',
  styleUrls: ['./dashboard-poc.component.css']
})
export class DashboardPocComponent implements OnInit{
  polqaChartOptions: Partial<ChartOptions>;
  weeklyFeatureFunctionalityChartOptions: Partial<ChartOptions>;
  @ViewChild('polqaChart') polqaChart: ChartComponent;

  selectedGraph = 'jitter';
  selectedPeriod = 'daily';

  constructor(private ctaasSetupService: CtaasSetupService,
              private subaccountService: SubAccountService) {
    this.polqaChartOptions = defaultPolqaChartOptions;
    this.weeklyFeatureFunctionalityChartOptions = defaultWeeklyFeatureFunctionalityChartOptions;
  }

  ngOnInit() {
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountService.getSelectedSubAccount().id).subscribe();
  }

  changeGraph() {
    console.log(this.selectedGraph);
    if (this.selectedGraph === 'jitter') {
      this.polqaChartOptions.series = [
        {
          name: "Jitter",
          data: [ 77.77, 69.00, 67.67, 84.98, 92.75, 80.38, 72.90, 55.08, 73.10, 87.66, 70.70 ]
        },
        {
          name: "POLQA",
          data: [ 4.66, 4.65, 4.63, 4.65, 4.64, 4.64, 4.65, 4.64, 4.65, 4.67, 4.65, ]
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
          name: 'Packet Loss',
          data: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
        },
        {
          name: 'POLQA',
          data: [ 4.66, 4.65, 4.63, 4.65, 4.64, 4.64, 4.65, 4.64, 4.65, 4.67, 4.65, ]
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
          data: [ 19.25, 19.42, 20.42, 18.50, 19.17, 19.33, 18.83, 17.42, 18.60, 19.45, 18.83 ]
        },
        {
          name: 'POLQA',
          data: [ 4.66, 4.65, 4.63, 4.65, 4.64, 4.64, 4.65, 4.64, 4.65, 4.67, 4.65, ]
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
