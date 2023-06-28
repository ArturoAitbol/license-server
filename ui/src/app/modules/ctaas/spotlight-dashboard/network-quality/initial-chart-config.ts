import { MetricsThresholds } from "src/app/helpers/metrics";
import { ChartOptions } from "../../../../helpers/chart-options-type";

const trendsChartCommonOptions: Partial<ChartOptions> = {
    dataLabels: {
        enabled: false
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
    legend: {
        position: 'top',
        horizontalAlign: 'right',
    }
};

const defaultReceivedPacketLossChartOptions: Partial<ChartOptions> = {
    chart: {
        type: 'line',
        id: 'Packet Loss',
        group: 'network-quality-trends',
        height: 300,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    title: {
        text: "Max. Packet Loss (%)",
        align: "center",
        style: {
            color: '#000000'
        }
    },
    colors: ["#273176"],
    series: [
        {
            name: 'Packet Loss',
            data: [ 77.77, 69.00, 67.67, 84.98, 92.75, 80.38, 72.90, 55.08, 73.10, 87.66, 70.70 ]
        },
    ],
    yAxis: {
            // min: 0,
            // tickAmount: 4,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#000000"
            },
            labels: {
                style: {
                    colors: "#000000",
                },
                minWidth: 40,
                formatter(val: number, opts?: any): string | string[] {
                    if (val !== null && val !== undefined)
                        return val + "%";
                    return "--";
                }
            },
            title: {
                text: "Packet Loss",
                style: {
                    color: "#000000"
                }
            },
            forceNiceScale: true,
            min: 0,
            max: max => max > MetricsThresholds.receivedPacketLoss ? max : MetricsThresholds.receivedPacketLoss
        },
    markers: {
        size: 4,
        colors: ["#273176"],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.receivedPacketLoss,
            borderColor: '#EC7C56',
            fillColor: '#EC7C56',
            strokeDashArray: 8,
        }]
    }
};

const defaultJitterChartOptions: Partial<ChartOptions> = {
    chart: {
        type: 'line',
        id: 'Jitter',
        group: 'network-quality-trends',
        height: 300,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    title: {
        text: "Max. Jitter (ms)",
        align: "center",
        style: {
            color: '#000000'
        }
    },
    colors: ['#6E76B4'],
    series: [
        {
            name: "Jitter",
            data: [ 77.77, 69.00, 67.67, 84.98, 92.75, 80.38, 72.90, 55.08, 73.10, 87.66, 70.70 ]
        },
    ],
    yAxis:
        {
            // min: 0,
            // tickAmount: 4,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#000000"
            },
            labels: {
                style: {
                    colors: "#000000",
                },
                minWidth: 40,
                formatter(val: number, opts?: any): any | any[] {
                    if (val !== null && val !== undefined)
                        return val;
                    return "--";
                }
            },
            title: {
                text: "Jitter",
                style: {
                    color: "#000000"
                }
            },
            forceNiceScale: true,
            min: 0,
            max: max => max > MetricsThresholds.receivedJitter ? max : MetricsThresholds.receivedJitter
        },
    markers: {
        size: 4,
        colors: ["#6E76B4"],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.receivedJitter,
            borderColor: '#EC7C56',
            fillColor: '#EC7C56',
            strokeDashArray: 8,
        }]
    }
};

const defaultSentBitrateChartOptions: Partial<ChartOptions> = {
    chart: {
        type: 'line',
        id: 'Sent Bitrate',
        group: 'network-quality-trends',
        height: 300,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    title: {
        text: "Avg. Sent Bitrate (kbps)",
        align: "center",
        style: {
            color: '#000000'
        }
    },
    colors: ['#76BD83'],
    series: [
        {
            name: "Sent Bitrate",
            data: [ 77.77, 69.00, 67.67, 84.98, 92.75, 80.38, 72.90, 55.08, 73.10, 87.66, 70.70 ]
        },
    ],
    yAxis:
        {
            // min: 0,
            // tickAmount: 4,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#000000"
            },
            labels: {
                style: {
                    colors: "#000000",
                },
                minWidth: 40,
                formatter(val: number, opts?: any): any | any[] {
                    if (val !== null && val !== undefined)
                        return val;
                    return "--";
                }
            },
            title: {
                text: "Sent Bitrate",
                style: {
                    color: "#000000"
                }
            },
            forceNiceScale: true,
            min: 0,
            max: max => max > MetricsThresholds.maxBitrate ? max : MetricsThresholds.maxBitrate
        },
    markers: {
        size: 4,
        colors: ["#76BD83"],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.minBitrate,
            y2: MetricsThresholds.maxBitrate,
            borderColor: '#EC7C56',
            fillColor: '#9ad5a5',
            strokeDashArray: 8,
        }]
    }
};

const defaultRoundtripTimeChartOptions: Partial<ChartOptions> = {
    chart: {
        type: 'line',
        id: 'Round Trip Time',
        group: 'network-quality-trends',
        height: 300,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    title: {
        text: "Max. Round Trip Time (ms)",
        align: "center",
        style: {
            color: '#000000'
        }
    },
    colors: ['#6CD6EC'],
    series: [
        {
            name: "Round Trip Time",
            data: [ 77.77, 69.00, 67.67, 84.98, 92.75, 80.38, 72.90, 55.08, 73.10, 87.66, 70.70 ]
        },
    ],
    yAxis:
        {
            // min: 0,
            // tickAmount: 4,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#000000"
            },
            labels: {
                style: {
                    colors: "#000000",
                },
                minWidth: 40,
                formatter(val: number, opts?: any): any | any[] {
                    if (val !== null && val !== undefined)
                        return val;
                    return "--";
                }
            },
            title: {
                text: "Round Trip Time",
                style: {
                    color: "#000000"
                }
            },
            forceNiceScale: true,
            min: 0,
            max: max => max > MetricsThresholds.roundTripTime ? max : MetricsThresholds.roundTripTime
        },
    markers: {
        size: 4,
        colors: [ "#6CD6EC" ],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.roundTripTime,
            borderColor: '#EC7C56',
            fillColor: '#EC7C56',
            strokeDashArray: 8,
        }]
    }
};

export { trendsChartCommonOptions, defaultReceivedPacketLossChartOptions, defaultJitterChartOptions, defaultRoundtripTimeChartOptions, defaultSentBitrateChartOptions }
