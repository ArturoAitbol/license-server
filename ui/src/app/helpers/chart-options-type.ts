import {
    ApexNonAxisChartSeries,
    ApexPlotOptions,
    ApexChart,
    ApexFill,
} from "ng-apexcharts";

export type ChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    plotOptions: ApexPlotOptions;
    fill: ApexFill;
};
