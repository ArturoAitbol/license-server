import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { defaultGaugeChartOptions } from "./defaultGaugeChartOptions";
import { ChartComponent } from "ng-apexcharts";
import { ChartOptions } from "../../helpers/chart-options-type";

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.css']
})
export class GaugeChartComponent {

  chartOptions: ChartOptions = JSON.parse(JSON.stringify(defaultGaugeChartOptions));
  @Input() title: string;
  @Input() numberCalls: number;
  @Input() timePeriod: string;
  @Input() set value(value: number) {
    this.chartOptions.series = [Number(value.toFixed(2))];
  }
  @Output() viewDetailedTableEvent = new EventEmitter<null>();

  @ViewChild("chart") chart: ChartComponent;

  viewDetailedTableClicked() {
    this.viewDetailedTableEvent.emit();
  }
}
