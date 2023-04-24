import { ChartOptions } from "../../../helpers/chart-options-type";

const defaultPolqaChartOptions: Partial<ChartOptions> = {
    series: [
        {
            name: "Jitter",
            data: [ 77.77, 69.00, 67.67, 84.98, 92.75, 80.38, 72.90, 55.08, 73.10, 87.66, 70.70 ]
        },
        {
            name: "POLQA",
            data: [ 4.66, 4.65, 4.63, 4.65, 4.64, 4.64, 4.65, 4.64, 4.65, 4.67, 4.65, ]
        },
    ],
    chart: {
        type: "line",
        height: 450,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    colors: ["#7694B7", "#E66C37"],
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: "straight",
        width: 2
    },
    title: {
        text: "Average Jitter vs POLQA",
        align: "left"
    },
    grid: {
        row: {
            colors: [ "#f3f3f3", "transparent" ], // takes an array which will be repeated on columns
            opacity: 0.5
        }
    },
    xAxis: {
        title: {
            text: "Hours",
            style: {
                color: "#000000"
            },
        },
        categories: [
            "00:00-01:00",
            "00:01-02:00",
            "00:02-03:00",
            "00:03-04:00",
            "00:04-05:00",
            "00:05-06:00",
            "00:06-07:00",
            "00:07-08:00",
            "00:08-00:00",
            "00:09-10:00",
            "00:09-11:00",
        ]
    },
    yAxis: [
        {
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#7694B7"
            },
            labels: {
                style: {
                    colors: "#7694B7"
                }
            },
            title: {
                text: "Jitter",
                style: {
                    color: "#7694B7"
                }
            }
        },
        {
            opposite: true,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#E66C37"
            },
            labels: {
                style: {
                    colors: "#E66C37"
                }
            },
            title: {
                text: "POLQA",
                style: {
                    color: "#E66C37"
                }
            }
        }
    ],
    markers: {
        size: 4,
        colors: ["#7694B7", "#E66C37"],
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
    }
};

const defaultWeeklyFeatureFunctionalityChartOptions: Partial<ChartOptions> = {
    series: [
        {
            name: "Percentage",
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
    colors: [ "#7694B7", "#83C96B", "#CE5A5B" ],
    dataLabels: {
        enabled: true,
        style: {
            colors: ["#000000", "#FFFFFF", "#FFFFFF"]
        },
        formatter(val: string | number, opts?: { seriesIndex, dataPointIndex, w }): string | number {
            if (opts.seriesIndex === 0) {
                return val + "%"
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
            seriesName: "Percentage",
            opposite: true,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#7694B7"
            },
            labels: {
                style: {
                    colors: "#7694B7"
                }
            },
            title: {
                text: "Success %",
                style: {
                    color: "#7694B7"
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
                color: "#7694B7"
            },
            labels: {
                style: {
                    colors: "#7694B7"
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
        colors: [ "#7694B7", "#83C96B", "#CE5A5B" ],
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
    }
};

export { defaultPolqaChartOptions, defaultWeeklyFeatureFunctionalityChartOptions }
