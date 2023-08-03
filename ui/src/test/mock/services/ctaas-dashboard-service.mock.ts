import { Observable } from 'rxjs';

const DASHBOARD_DETAIL_REPORT = {
    response: {
        reportType: 'LTS',
        report: {
            summary: {
                total: 5,
                startTime: "02-26-2023 00:20:29 UTC",
                passed: 5,
                failed: 0,
                endTime: "02-26-2023 05:50:55 UTC"
            },
            endpoints:[{
                zipcode: "9725980067",
                country: "US",
                city: "Colombus",
                vendor: "Microsoft",
                model: "MS-TEAMS",
                state: "Washington",
                firmwareVersion: "1.5.00.36367",
                did: "9725989021"
            }],
            type: "LTS",
            results:[{
                errorCategory: null,
                errorReason: null,
                startTime: "02-26-2023 00:20:29 UTC",
                closeKey: true,
                from: {
                    mediaStats: [{data: {
                            "Received packet loss": "0.00%",
                            "Sent bitrate": "47.2 Kbps",
                            "Received Jitter": "1.22 ms",
                            "Round trip time": "--",
                            "Sent codec": "SATIN",
                            "Received packets": "2308 packets",
                            "Received codec": "SATIN",
                            "Sent packets": "2313 packets"
                        }, 
                        timeStampIndex: 0, 
                        timestamp: "02-27-2023 10:57:34 UTC"
                    },{data:{
                        "Received packet loss": "0.00%",
                        "Sent bitrate": "47.2 Kbps",
                        "Received Jitter": "3.45 ms",
                        "Round trip time": "1.00 ms",
                        "Sent codec": "SATIN",
                        "Received packets": "2764 packets",
                        "Received codec": "SATIN",
                        "Sent packets": "2104 packets"
                    },
                    timeStampIndex: 1,
                    timestamp: "02-27-2023 02:08:54 UTC"
                }],
                    DID: "9725989021"
                },
                testCaseName: "2_Func_tekv-Basic-MSTeams-005",
                endTime: "02-26-2023 00:24:44 UTC",
                to: {
                    mediaStats: [{data: {
                        "Received packet loss": "0.00%",
                        "Sent bitrate": "47.2 Kbps",
                        "Received Jitter": "1.39 ms",
                        "Round trip time": "--",
                        "Sent codec": "SATIN",
                        "Received packets": "8787 packets",
                        "Received codec": "SATIN",
                        "Sent packets": "8783 packets"
                    },
                    timeStampIndex: 0,
                    timestamp: "02-27-2023 10:59:42 UTC"
                }],
                    DID: "9725989023"
                },
                otherParties: [{
                    DID:"9725980058",
                    mediaStats:[{
                        data:{
                            "Received packet loss": "--",
                            "Sent bitrate": "36 Kbps",
                            "Received Jitter": "4.97 ms",
                            "Round trip time": "--",
                            "Sent codec": "SATIN",
                            "Received codec": "SATIN",
                            "Received packets": "33 packets",
                            "Sent packets": "1 packets"
                        },
                        timeStampIndex: 0,
                        timestamp: "02-26-2023 11:54:39 UTC"
                    }]
                }],
                status: "PASSED"
            },{
                closeKey: true,
                errorCategory: null,
                errorReason: null,
                startTime: "02-26-2023 00:20:29 UTC",
                from: {
                    mediaStats: [],
                    DID: "9725989021"
                },
                testCaseName: "2_Func_tekv-Basic-MSTeams-005",
                endTime: "02-26-2023 00:24:44 UTC",
                to: {
                    mediaStats: [],
                    DID: "9725989023"
                },
                otherParties: [{
                    DID:"9725980058",
                    mediaStats:[]
                }],
                status: "PASSED"
            }],
        },
    }
}


const DASHBOARD_DETAIL_REPORT_EMPTY_ENDPOINTS = {
    response: {
        report: {
            endpoints:[],
            results:[{
                closeKey: true,
                errorCategory: null,
                errorReason: null,
                startTime: "02-26-2023 00:20:29 UTC",
                from: {
                    mediaStats: [{data: {
                            "Received packet loss": "0.00%",
                            "Sent bitrate": "47.2 Kbps",
                            "Received Jitter": "1.22 ms",
                            "Round trip time": "--",
                            "Sent codec": "SATIN",
                            "Received packets": "2308 packets",
                            "Received codec": "SATIN",
                            "Sent packets": "2313 packets"
                        }, 
                        timeStampIndex: 0, 
                        timestamp: "02-27-2023 10:57:34 UTC"
                    }],
                    DID: "9725989021"
                },
                testCaseName: "2_Func_tekv-Basic-MSTeams-005",
                endTime: "02-26-2023 00:24:44 UTC",
                to: {
                    mediaStats: [{data: {
                        "Received packet loss": "0.00%",
                        "Sent bitrate": "47.2 Kbps",
                        "Received Jitter": "1.39 ms",
                        "Round trip time": "--",
                        "Sent codec": "SATIN",
                        "Received packets": "8787 packets",
                        "Received codec": "SATIN",
                        "Sent packets": "8783 packets"
                    },
                    timeStampIndex: 0,
                    timestamp: "02-27-2023 10:59:42 UTC"
                }],
                    DID: "9725989023"
                },
                otherParties: [{
                    DID:"9725980058",
                    mediaStats:[{
                        data:{
                            "Received packet loss": "--",
                            "Sent bitrate": "36 Kbps",
                            "Received Jitter": "4.97 ms",
                            "Round trip time": "--",
                            "Sent codec": "SATIN",
                            "Received codec": "SATIN",
                            "Received packets": "33 packets",
                            "Sent packets": "1 packets"
                        },
                        timeStampIndex: 0,
                        timestamp: "02-26-2023 11:54:39 UTC"
                    }]
                }],
                status: "PASSED"
            },{
                errorCategory: null,
                errorReason: null,
                startTime: "02-26-2023 00:20:29 UTC",
                from: {
                    mediaStats: [],
                    DID: "9725989021"
                },
                testCaseName: "2_Func_tekv-Basic-MSTeams-005",
                endTime: "02-26-2023 00:24:44 UTC",
                to: {
                    mediaStats: [],
                    DID: "9725989023"
                },
                otherParties: [{
                    DID:"9725980058",
                    mediaStats:[]
                }],
                status: "PASSED"
            }],
            summary: {
                total: 5,
                startTime: "02-26-2023 00:20:29 UTC",
                passed: 5,
                failed: 0,
                endTime: "02-26-2023 05:50:55 UTC"
            },
            type: "LTS"
        },
        reportType: 'LTS'
    }
}

const DASHBOARD_DETAIL_REPORT_WITH_MISSING_ATTRIBUTES = {
    response: {
        report: {
            endpoints:[{
                zipcode: "9725980067",
                country: "US",
                city: "Colombus",
                vendor: "Microsoft",
                model: "MS-TEAMS",
                firmwareVersion: "1.5.00.36367",
                did: "9725989021"
            }],
            results:[{
                closeKey: true,
                errorCategory: null,
                errorReason: null,
                startTime: "02-26-2023 00:20:29 UTC",
                from: {
                    mediaStats: [{data: {
                            "Received packet loss": "0.00%",
                            "Sent bitrate": "47.2 Kbps",
                            "Received Jitter": "1.22 ms",
                            "Round trip time": "--",
                            "Sent codec": "SATIN",
                            "Received packets": "2308 packets",
                            "Received codec": "SATIN",
                            "Sent packets": "2313 packets"
                        }, 
                        timeStampIndex: 0, 
                        timestamp: "02-27-2023 10:57:34 UTC"
                    }],
                    DID: "9725989021"
                },
                testCaseName: "2_Func_tekv-Basic-MSTeams-005",
                endTime: "02-26-2023 00:24:44 UTC",
                to: {
                    mediaStats: [{data: {
                        "Received packet loss": "0.00%",
                        "Sent bitrate": "47.2 Kbps",
                        "Received Jitter": "1.39 ms",
                        "Round trip time": "--",
                        "Sent codec": "SATIN",
                        "Received packets": "8787 packets",
                        "Received codec": "SATIN",
                        "Sent packets": "8783 packets"
                    },
                    timeStampIndex: 0,
                    timestamp: "02-27-2023 10:59:42 UTC"
                }],
                    DID: "9725989023"
                },
                otherParties: [{
                    DID:"9725980058",
                    mediaStats:[{
                        data:{
                            "Received packet loss": "--",
                            "Sent bitrate": "36 Kbps",
                            "Received Jitter": "4.97 ms",
                            "Round trip time": "--",
                            "Sent codec": "SATIN",
                            "Received codec": "SATIN",
                            "Received packets": "33 packets",
                            "Sent packets": "1 packets"
                        },
                        timeStampIndex: 0,
                        timestamp: "02-26-2023 11:54:39 UTC"
                    }]
                }],
                status: "PASSED"
            },{
                errorCategory: null,
                errorReason: null,
                startTime: "02-26-2023 00:20:29 UTC",
                from: {
                    mediaStats: [],
                    DID: "9725989021"
                },
                testCaseName: "2_Func_tekv-Basic-MSTeams-005",
                endTime: "02-26-2023 00:24:44 UTC",
                to: {
                    mediaStats: [],
                    DID: "9725989023"
                },
                otherParties: [{
                    DID:"9725980058",
                    mediaStats:[]
                }],
                status: "PASSED"
            }],
            summary: {
                total: 5,
                startTime: "02-26-2023 00:20:29 UTC",
                passed: 5,
                failed: 0,
                endTime: "02-26-2023 05:50:55 UTC"
            },
            type: "LTS"
        },
        reportType: 'LTS'
    }
}

const REPORT_DETAILED_OBJ = {    
        endPoints:[{
            zipcode: "9725980067",
            country: "US",
            city: "Colombus",
            vendor: "Microsoft",
            model: "MS-TEAMS",
            state: "Washington",
            firmwareVersion: "1.5.00.36367",
            did: "9725989021"
        }],
        results:[{
            closeKey: true,
            errorCategory: null,
            errorReason: null,
            startTime: "02-26-2023 00:20:29 UTC",
            from: {
                mediaStats: [{
                    data: {
                    "Received packet loss": "0.00%",
                    "Sent bitrate": "47.2 Kbps",
                    "Received Jitter": "1.22 ms",
                    "Round trip time": "--",
                    "Sent codec": "SATIN",
                    "Received packets": "2308 packets",
                    "Received codec": "SATIN",
                    "Sent packets": "2313 packets"
                }, 
                timeStampIndex: 0, 
                timestamp: "02-27-2023 10:57:34 UTC"
            }],
                DID: "9725989021"
            },
            testCaseName: "2_Func_tekv-Basic-MSTeams-005",
            endTime: "02-26-2023 00:24:44 UTC",
            to: {
                mediaStats: [{data: {
                    "Received packet loss": "0.00%",
                    "Sent bitrate": "47.2 Kbps",
                    "Received Jitter": "1.39 ms",
                    "Round trip time": "--",
                    "Sent codec": "SATIN",
                    "Received packets": "8787 packets",
                    "Received codec": "SATIN",
                    "Sent packets": "8783 packets"
                },
                timeStampIndex: 0,
                timestamp: "02-27-2023 10:59:42 UTC"
            }],
                DID: "9725989023"
            },
            otherParties: [{
                DID:"9725980058",
                mediaStats:[{
                    data:{
                        "Received packet loss": "--",
                        "Sent bitrate": "36 Kbps",
                        "Received Jitter": "4.97 ms",
                        "Round trip time": "--",
                        "Sent codec": "SATIN",
                        "Received codec": "SATIN",
                        "Received packets": "33 packets",
                        "Sent packets": "1 packets"
                    },
                    timeStampIndex: 0,
                    timestamp: "02-26-2023 11:54:39 UTC"
                }]
            }],
            status: "PASSED"
        }],
        summary: {
            total: 5,
            startTime: "02-26-2023 00:20:29 UTC",
            passed: 5,
            failed: 0,
            endTime: "02-26-2023 05:50:55 UTC"
        },
        type: "LTS"
   
}

const CONTENT_DOWNLOADED = {
    endPoints:[{
        zipcode: "9725980067",
        country: "US",
        city: "Colombus",
        vendor: "Microsoft",
        model: "MS-TEAMS",
        state: "Washington",
        firmwareVersion: "1.5.00.36367",
        did: "9725989021"
    }],
    results:[{
        closeKey: false,
        errorCategory: null,
        errorReason: null,
        startTime: "02-26-2023 00:20:29 UTC",
        from: {
            mediaStats: [{
                data: {
                "Received packet loss": "0.00%",
                "Sent bitrate": "47.2 Kbps",
                "Received Jitter": "1.22 ms",
                "Round trip time": "--",
                "Sent codec": "SATIN",
                "Received packets": "2308 packets",
                "Received codec": "SATIN",
                "Sent packets": "2313 packets"
            }, 
            timeStampIndex: 0, 
            timestamp: "02-27-2023 10:57:34 UTC"
        }],
            DID: "9725989021"
        },
        testCaseName: "2_Func_tekv-Basic-MSTeams-005",
        endTime: "02-26-2023 00:24:44 UTC",
        to: {
            mediaStats: [{data: {
                "Received packet loss": "0.00%",
                "Sent bitrate": "47.2 Kbps",
                "Received Jitter": "1.39 ms",
                "Round trip time": "--",
                "Sent codec": "SATIN",
                "Received packets": "8787 packets",
                "Received codec": "SATIN",
                "Sent packets": "8783 packets"
            },
            timeStampIndex: 0,
            timestamp: "02-27-2023 10:59:42 UTC"
        }],
            DID: "9725989023"
        },
        otherParties: [{
            DID:"9725980058",
            mediaStats:[{
                data:{
                    "Received packet loss": "--",
                    "Sent bitrate": "36 Kbps",
                    "Received Jitter": "4.97 ms",
                    "Round trip time": "--",
                    "Sent codec": "SATIN",
                    "Received codec": "SATIN",
                    "Received packets": "33 packets",
                    "Sent packets": "1 packets"
                },
                timeStampIndex: 0,
                timestamp: "02-26-2023 11:54:39 UTC"
            }]
        }],
        status: "PASSED"
    }],
    summary: {
        total: 5,
        startTime: "02-26-2023 00:20:29 UTC",
        passed: 5,
        failed: 0,
        endTime: "02-26-2023 05:50:55 UTC"
    },
    type: "LTS"
}

export const CtaasDashboardServiceMock = {
    dashboardDetailedReport: DASHBOARD_DETAIL_REPORT,
    dashboardDetailedReportsWithEmptyEndpoints: DASHBOARD_DETAIL_REPORT_EMPTY_ENDPOINTS,
    dashboardDetailedReportsWithMissingAttributes: DASHBOARD_DETAIL_REPORT_WITH_MISSING_ATTRIBUTES,
    reportDetailedObject: REPORT_DETAILED_OBJ,
    reportDetailedWithOneResult:CONTENT_DOWNLOADED,
    getCtaasDashboardDetailedReport:() => {
        return new Observable( (observer) => {
            observer.next(DASHBOARD_DETAIL_REPORT)
            observer.complete();
            return {
                unsubscribe() {return;}
            }
        })
    },
    getDetailedReportyObject: () => {
        return REPORT_DETAILED_OBJ
    },
    setDetailedReportObject: () => {
        return;
    },
    downloadCtaasDashboardDetailedReport:(detailedResponseObj) => {
        return new Observable( (observer) => {
            observer.next(CONTENT_DOWNLOADED)
            observer.complete();
            return {
                unsubscribe() { return; }
            };
        })
    }
};
