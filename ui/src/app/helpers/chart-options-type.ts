import {
    ApexNonAxisChartSeries,
    ApexPlotOptions,
    ApexChart,
    ApexFill,
    ApexGrid,
    ApexStates,
    ApexDataLabels,
    ApexStroke,
    ApexTitleSubtitle,
    ApexXAxis,
    ApexAxisChartSeries,
    ApexYAxis, ApexMarkers, ApexLegend, ApexTooltip, ApexAnnotations,
} from "ng-apexcharts";

export type ChartOptions = {
    series: ApexNonAxisChartSeries | ApexAxisChartSeries,
    chart: ApexChart,
    labels: string[],
    plotOptions: ApexPlotOptions,
    fill: ApexFill,
    grid: ApexGrid,
    states: ApexStates,
    xAxis: ApexXAxis,
    yAxis: ApexYAxis | ApexYAxis[],
    dataLabels: ApexDataLabels,
    stroke: ApexStroke,
    title: ApexTitleSubtitle,
    markers: ApexMarkers,
    legend: ApexLegend,
    tooltip: ApexTooltip,
    annotations: ApexAnnotations,
    toolbar: any
    colors: any
};
