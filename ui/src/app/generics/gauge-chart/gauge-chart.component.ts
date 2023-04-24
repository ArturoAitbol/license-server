import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { defaultGaugeChartOptions } from "./defaultGaugeChartOptions";
import { ChartComponent } from "ng-apexcharts";

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.css']
})
export class GaugeChartComponent {

  chartOptions = defaultGaugeChartOptions;
  @Input() title: string;
  @Input() numberCalls: number;
  @Input() timePeriod: string;
  @Input() set value(value: number) {
    this.chartOptions.series = [value];
  }

  @ViewChild("chart") chart: ChartComponent;


}
