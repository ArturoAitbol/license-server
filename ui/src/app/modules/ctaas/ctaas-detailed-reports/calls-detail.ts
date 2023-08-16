import { ChartOptions } from "src/app/helpers/chart-options-type";
import { MetricsThresholds } from "src/app/helpers/metrics";

const polqaChartCommonOptions: Partial<ChartOptions> = {
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: "straight",
        width: 2,
        dashArray: [0, 0]
    },
    grid: {
        row: {
            colors: [ "#f3f3f3", "transparent" ], // takes an array which will be repeated on columns
            opacity: 0.5
        }
    },
    xAxis: {
        max: 40,
        title: {
            text: "Hours",
            style: {
                color: "#000000"
            },
        },
        labels: {
            style: {
                fontSize: '11px'
            }
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
        markers:{
            radius:10
        }
    }
};

const defaultPolqaPacketLossChartOptions: Partial<ChartOptions> = {
    chart: {
        type: 'line',
        id: 'polqa-packet-loss',
        group: 'polqa-metrics',
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
    },events:{
        markerClick:function(){
            console.log("network trends - jitter")
        }
    },
    colors: ["#EC7C56","#9E9EFF"],
    series: [
        {
            name: 'Packet Loss',
            data: []
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
        colors: ["#EC7C56","#9E9EFF"],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.receivedPacketLoss,
            borderColor: '#bb2426',
            fillColor: '#bb2426',
            strokeDashArray: 8,
        }]
    }
};

const defaultPolqaJitterChartOptions: Partial<ChartOptions> = {
    chart: {
        type: 'line',
        id: 'polqa-jitter',
        group: 'polqa-metrics',
        height: 300,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    stroke: {
        curve: "straight",
        width: 2,
        dashArray: [0, 0]
    },
    title: {
        text: "Max. Jitter (ms)",
        align: "center",
        style: {
            color: '#000000'
        }
    },
    colors: ["#EC7C56","#9E9EFF"],
    series: [
        {
            name: "Jitter",
            data: []
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
        colors: ["#EC7C56","#9E9EFF"],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.receivedJitter,
            borderColor: '#bb2426',
            fillColor: '#bb2426',
            strokeDashArray: 8,
        }]
    }
};
const defaultPolqaReceivedPacketsChartOptions: Partial<ChartOptions> = {
    title:{
        text: "",
        align: "center",
        style: {
            color: '#000000'
        }
    },
    series: [
        {
            name: "received-packets",
            data: []
        }
    ],
    chart: {
        type: "line",
        id: "received-packets",
        group: 'polqa-metrics',
        height: 300,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    colors: ["#EC7C56","#9E9EFF"],
    yAxis:{
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
            minWidth: 40
        },
        title: {
            text: "Received Packets",
            style: {
                color: "#000000"
            }
        },
        forceNiceScale: true,
    }
    ,
    markers: {
        size: 4,
        colors: ["#EC7C56","#9E9EFF"],
    }
};

const defaultPolqaSentPacketsChartOptions: Partial<ChartOptions> = {
    title:{
        text: "",
        align: "center",
        style: {
            color: '#000000'
        }
    },
    series: [
        {
            name: "sent-packets",
            data: []
        }
    ],
    chart: {
        type: "line",
        id: "sent-packets",
        group: 'polqa-metrics',
        height: 300,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    colors: ["#EC7C56","#9E9EFF"],
    yAxis:{
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
            minWidth: 40
        },
        title: {
            text: "Sent Packets",
            style: {
                color: "#000000"
            }
        },
        forceNiceScale: true,
    }
    ,
    markers: {
        size: 4,
        colors: ["#EC7C56","#9E9EFF"],
    }
};


const defaultPolqaRoundtripTimeChartOptions: Partial<ChartOptions> = {
    chart: {
        type: 'line',
        id: 'polqa-round-trip-time',
        height: 300,
        group: 'polqa-metrics',
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
    colors: ['#EC7C56',"#9E9EFF"],
    series: [
        {
            name: "Round Trip Time",
            data: []
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
        colors: [ "#EC7C56", "#9E9EFF" ],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.roundTripTime,
            borderColor: '#bb2426',
            fillColor: '#bb2426',
            strokeDashArray: 8,
        }]
    }
};
const defaultPolqaChartOptions: Partial<ChartOptions> = {
    title:{
        text: "",
        align: "center",
        style: {
            color: '#000000'
        }
    },
    series: [
        {
            name: "POLQA",
            data: []
        }
    ],
    chart: {
        type: "scatter",
        id: "POLQA",
            height: 300,
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        },
        events:
        {
            markerClick: function(event, chartContext, config){
                console.log("POLQA",config);
            }
        }
    },
    colors: ["#EC7C56","#9E9EFF"],
    yAxis:{
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
            minWidth: 40
        },
        title: {
            text: "POLQA",
            style: {
                color: "#000000"
            }
        },
        forceNiceScale: true,
    }
    ,
    markers: {
        size: 4,
        colors: ["#EC7C56","#9E9EFF"],
    }
};

const defaultSentBitrateChartOptions: Partial<ChartOptions> = {
    chart: {
        type: 'line',
        group: 'polqa-metrics',
        id: 'Sent-Bitrate',
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
    colors: ["#EC7C56","#9E9EFF"],
    series: [
        {
            name: "Sent Bitrate",
            data: []
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
        colors: ["#EC7C56","#9E9EFF"],
    },
    annotations: {
        yaxis: [{
            y: MetricsThresholds.minBitrate,
            y2: MetricsThresholds.maxBitrate,
            borderColor: '#bb2426',
            fillColor: '#9ad5a5',
            strokeDashArray: 8,
        }]
    }
};

export { 
    polqaChartCommonOptions,
    defaultPolqaChartOptions,
    defaultPolqaRoundtripTimeChartOptions,
    defaultPolqaJitterChartOptions,
    defaultPolqaPacketLossChartOptions, 
    defaultSentBitrateChartOptions,
    defaultPolqaReceivedPacketsChartOptions,
    defaultPolqaSentPacketsChartOptions
}
