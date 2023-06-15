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
            color: '#7694B7'
        }
    },
    colors: ["#7694B7"],
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
                color: "#7694B7"
            },
            labels: {
                style: {
                    colors: "#7694B7",
                },
                minWidth: 40,
                formatter(val: number, opts?: any): string | string[] {
                    return val + '%'
                }
            },
            title: {
                text: "Packet Loss",
                style: {
                    color: "#7694B7"
                }
            },
            forceNiceScale: true,
            min: 0,
            max: max => max > MetricsThresholds.receivedPacketLoss ? max : MetricsThresholds.receivedPacketLoss
        },
    markers: {
        size: 4,
        colors: ["#7694B7"],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.receivedPacketLoss,
            borderColor: '#B80000',
            fillColor: '#B80000',
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
            color: '#7694B7'
        }
    },
    colors: ['#E66C37'],
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
                color: "#E66C37"
            },
            labels: {
                style: {
                    colors: "#E66C37",
                },
                minWidth: 40
            },
            title: {
                text: "Jitter",
                style: {
                    color: "#E66C37"
                }
            },
            forceNiceScale: true,
            min: 0,
            max: max => max > MetricsThresholds.receivedJitter ? max : MetricsThresholds.receivedJitter
        },
    markers: {
        size: 4,
        colors: ["#E66C37"],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.receivedJitter,
            borderColor: '#B80000',
            fillColor: '#B80000',
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
            color: '#7694B7'
        }
    },
    colors: ['#079398'],
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
                color: "#079398"
            },
            labels: {
                style: {
                    colors: "#079398",
                },
                minWidth: 40
            },
            title: {
                text: "Sent Bitrate",
                style: {
                    color: "#079398"
                }
            },
            forceNiceScale: true,
            min: 0,
            max: max => max > MetricsThresholds.maxBitrate ? max : MetricsThresholds.maxBitrate
        },
    markers: {
        size: 4,
        colors: ["#079398"],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.minBitrate,
            y2: MetricsThresholds.maxBitrate,
            borderColor: '#22b800',
            fillColor: '#22b800',
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
            color: '#7694B7'
        }
    },
    colors: ['#570798'],
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
                color: "#570798"
            },
            labels: {
                style: {
                    colors: "#570798",
                },
                minWidth: 40
            },
            title: {
                text: "Round Trip Time",
                style: {
                    color: "#570798"
                }
            },
            forceNiceScale: true,
            min: 0,
            max: max => max > MetricsThresholds.roundTripTime ? max : MetricsThresholds.roundTripTime
        },
    markers: {
        size: 4,
        colors: [ "#570798" ],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.roundTripTime,
            borderColor: '#B80000',
            fillColor: '#B80000',
            strokeDashArray: 8,
        }]
    }
};

export { trendsChartCommonOptions, defaultReceivedPacketLossChartOptions, defaultJitterChartOptions, defaultRoundtripTimeChartOptions, defaultSentBitrateChartOptions }
