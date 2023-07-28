import { ChartOptions } from "../../../helpers/chart-options-type";

const defaultWeeklyFeatureFunctionalityChartOptions: Partial<ChartOptions> = {
    series: [
        {
            name: "Success %",
            data: [ 100, 100, 97.6, 50, 90.3, 100, 80.9 ],
            type: "line"
        },
        {
            name: "Passed",
            data: [ 110, 213, 40, 14, 167, 47, 165],
            type: "column",
        },
        {
            name: "Failed",
            data: [ 0, 0, 1, 14, 18, 0, 39],
            type: "column",
        },
    ],
    chart: {
        type: "bar",
        stacked: true,
        height: 450,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    colors: [ "#6E76B4", "#9ad5a5", "#bb2426" ],
    dataLabels: {
        enabled: true,
        style: {
            colors: ["#000000", "#000000", "#FFFFFF"]
        },
        formatter(val: string | number, opts?: { seriesIndex, dataPointIndex, w }): string | number {
            if (opts.seriesIndex === 0) {
                if (val !== null && val !== undefined)
                    return val + "%";
                return "--";
            } else return val;
        }
    },
    stroke: {
        curve: "straight",
        width: 2
    },
    grid: {
        row: {
            colors: [ "#f3f3f3", "transparent" ], // takes an array which will be repeated on columns
            opacity: 0.5
        }
    },
    xAxis: {
        title: {
            text: "Date",
            style: {
                color: "#000000"
            },
        },
        categories: [
            "Apr-15-2023",
            "Apr-16-2023",
            "Apr-17-2023",
            "Apr-18-2023",
            "Apr-19-2023",
            "Apr-20-2023",
            "Apr-21-2023",
        ]
    },
    yAxis: [
        {
            seriesName: "Success %",
            opposite: true,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#000000"
            },
            labels: {
                style: {
                    colors: "#000000"
                }
            },
            title: {
                text: "Success %",
                style: {
                    color: "#000000"
                }
            },
            min: 0,
            max: 100,
        },
        {
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#000000"
            },
            labels: {
                style: {
                    colors: "#000000"
                }
            },
            title: {
                text: "Number of calls",
                style: {
                    color: "#000000"
                }
            }
        },
        {
            seriesName: "Passed",
            show: false
        }
    ],
    markers: {
        size: 4,
        colors: [ "#6E76B4", "#9ad5a5", "#bb2426" ],
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
    }
};

const defaultWeeklyCallingReliabilityChartOptions: Partial<ChartOptions> = {
    series: [
        {
            name: "Success %",
            data: [ 100, 100, 97.6, 50, 90.3, 100, 80.9 ],
            type: "line"
        },
        {
            name: "Passed",
            data: [ 110, 213, 40, 14, 167, 47, 165],
            type: "column",
        },
        {
            name: "Failed",
            data: [ 0, 0, 1, 14, 18, 0, 39],
            type: "column",
        },
    ],
    chart: {
        type: "bar",
        stacked: true,
        height: 450,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    colors: [ "#6E76B4", "#9ad5a5", "#bb2426" ],
    dataLabels: {
        enabled: true,
        style: {
            colors: ["#000000", "#000000", "#FFFFFF"]
        },
        formatter(val: string | number, opts?: { seriesIndex, dataPointIndex, w }): string | number {
            if (opts.seriesIndex === 0) {
                if (val !== null && val !== undefined)
                    return val + "%";
                return "--";
            } else return val;
        }
    },
    stroke: {
        curve: "straight",
        width: 2
    },
    grid: {
        row: {
            colors: [ "#f3f3f3", "transparent" ], // takes an array which will be repeated on columns
            opacity: 0.5
        }
    },
    xAxis: {
        title: {
            text: "Date",
            style: {
                color: "#000000"
            },
        },
        categories: [
            "Apr-15-2023",
            "Apr-16-2023",
            "Apr-17-2023",
            "Apr-18-2023",
            "Apr-19-2023",
            "Apr-20-2023",
            "Apr-21-2023",
        ]
    },
    yAxis: [
        {
            seriesName: "Success %",
            opposite: true,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#000000"
            },
            labels: {
                style: {
                    colors: "#000000"
                }
            },
            title: {
                text: "Success %",
                style: {
                    color: "#000000"
                }
            },
            min: 0,
            max: 100,
        },
        {
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#000000"
            },
            labels: {
                style: {
                    colors: "#000000"
                }
            },
            title: {
                text: "Number of calls",
                style: {
                    color: "#000000"
                }
            }
        },
        {
            seriesName: "Passed",
            show: false
        }
    ],
    markers: {
        size: 4,
        colors: [ "#6E76B4", "#9ad5a5", "#bb2426" ],
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
    }
};

const defaultWeeklyCallsStatusChartOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
        height: 350,
        type: "heatmap",
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    dataLabels: {
        enabled: true
    },
    colors: [ "#6E76B4" ],
    plotOptions: {
        heatmap: {
            shadeIntensity: 0.3,
            colorScale: {
                ranges: [
                    {
                        from: 0,
                        color: "#6E76B4",
                        foreColor: "#000000"
                    }
                ]
            }
        }
    }
};

const defaultVqChartOptions: Partial<ChartOptions> = {
    chart: {
        type: 'bar',
        toolbar: {
            show: false
        },
        width: '100%',
        // height: '100%'
    },
    plotOptions: {
        bar: {
            borderRadius: 4,
            horizontal: true,
            barHeight: '70%',
            columnWidth: '70%',
            distributed: true,
        }
    },
    series: [ {
        data: []
    },
    ],
    colors: [ "#9ad5a5", "#6CD6EC", "#EC7C56", "#bb2426" ],
    dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: {
            colors: ["#424242"]
        },
        formatter(val: number, opts?: any): string | number {
            return val.toFixed(2) + '%'
        },
    },
    xAxis: {
        categories: ['Excellent [4-5]', 'Good [3-4]', 'Fair [2-3]', 'Poor [1-2]'],
        title: {
            text: 'Percentage of call streams',
        },
    },
    yAxis: {
        min: 0,
        max: 100,
        labels: {
            style: {
                fontSize: '16px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 400,
            },
        },
        title: {
            text: 'Quality'
        }
    },
    legend: {
        show: false
    },
    labels: [ 'Excellent [4-5]', 'Good [3-4]', 'Fair [2-3]', 'Poor [1-2]' ],
    tooltip: {
        enabled: true,
        y: {
            formatter(val: number, opts?: any): string {
                return val + '%'
            },
            title: {
                formatter(seriesName: string): string {
                    return "Percentage of call streams: "
                }
            }
        }
    },
};

const defaultFailedCallsChartOptions: Partial<ChartOptions> = {
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
        colors: ['#bb2426'],
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
    labels: ['Failed'],
    tooltip: {
        enabled: true,
        fillSeriesColor: false,
        y:{
            formatter(val: number, opts?: any): string {
                if (val !== null && val !== undefined)
                    return val + "%";
                return "--";
            },
        },
    },
    colors: ['#bb2426'],
};

const defaultWeeklyVQChartOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
        type: "bar",
        stacked: true,
        height: 450,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    colors: [ "#9ad5a5", "#6CD6EC", "#EC7C56", "#bb2426" ],
    dataLabels: {
        enabled: true,
        style: {
            colors: ["#000000", "#000000", "#000000", "#FFFFFF"]
        },
        formatter(val: number, opts?: { seriesIndex, dataPointIndex, w }): string | number {
            if (val !== null && val !== undefined)
                return val.toFixed(2) + "%"
            return "--";
        }
    },
    grid: {
        row: {
            colors: [ "#f3f3f3", "transparent" ], // takes an array which will be repeated on columns
            opacity: 0.5
        }
    },
    xAxis: {
        title: {
            text: "Date",
            style: {
                color: "#000000"
            },
        },
        categories: []
    },
    yAxis: [
        {
            decimalsInFloat: 2,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#000000"
            },
            labels: {
                style: {
                    colors: "#000000"
                },
                formatter(val: number, opts?: any): string | string[] {
                    return val + '%';
                }
            },
            title: {
                text: "Percentage of call streams",
                style: {
                    color: "#000000"
                }
            },
            min: 0,
            max: 100,
        },
    ],
    markers: {
        size: 4,
        colors: [ "#6E76B4"],
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
    },
    tooltip: {
      enabled: true,
    }
};

export {
    defaultWeeklyFeatureFunctionalityChartOptions,
    defaultWeeklyCallingReliabilityChartOptions,
    defaultWeeklyCallsStatusChartOptions,
    defaultVqChartOptions,
    defaultFailedCallsChartOptions,
    defaultWeeklyVQChartOptions
}
