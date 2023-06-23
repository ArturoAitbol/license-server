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
  @Input() p2pCalls: number;
  @Input() onNetCalls: number;
  @Input() offNetCalls: number;
  @Input() description: string;
  @Input() set seriesName(value: string){
    this.chartOptions.labels = [value];
  }
  @Input() set value(value: number) {
    this.chartOptions.series = [Number(value.toFixed(2))];
  }
  @Output() viewDetailedTableEvent = new EventEmitter<null>();

  @ViewChild("chart") chart: ChartComponent;

  constructor() {
    this.chartOptions.tooltip.y = {
      formatter(val: number, opts?: any): string {
        if (val !== null && val !== undefined)
            return val + "%";
        return "";
      },
    }
  }

  viewDetailedTableClicked() {
    this.viewDetailedTableEvent.emit();
  }
}
