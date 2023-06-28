import { ChartOptions } from "../../helpers/chart-options-type";

const defaultGaugeChartOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
        type: "radialBar",
        offsetY: -20,
        width: '100%',
        sparkline: { enabled: true }
    },
    plotOptions: {
        radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
                background: "#e7e7e7",
                strokeWidth: "97%",
                margin: 5, // margin is in pixels
                dropShadow: {
                    enabled: true,
                    top: 2,
                    left: 0,
                    opacity: 0.31,
                    blur: 2
                }
            },
            dataLabels: {
                name: {
                    show: false
                },
                value: {
                    offsetY: -2,
                    fontSize: "22px"
                }
            }
        }
    },
    fill: {
        colors: ['#9ad5a5'],
        type: "gradient",
        gradient: {
            shade: "light",
            shadeIntensity: 0.4,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 53, 91]
        }
    },
    grid: {
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
    },
    states: {
        normal: {
            filter: {
                type: 'none',
                value: 0,
            }
        },
        hover: {
            filter: {
                type: 'none',
            }
        },
        active: {
            filter: {
                type: 'none',
            }
        },
    },
    tooltip: {
        enabled: true,
        fillSeriesColor: false,
        y:{
            formatter(val: number, opts?: any): string {
                if (val !== null && val !== undefined)
                    return val + "%";
                return "";
            },
        },
    },
    colors: ['#9ad5a5'],
    labels: ['Passed']
};

export { defaultGaugeChartOptions }
