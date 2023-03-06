import { Observable } from 'rxjs';

const TEST_DASHBOARD_1 = {
    imageBase64:"data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
    lastUpdatedTS:"Thu, 08 Dec 2022 11:04:55 BOT",
    reportType:"Daily-FeatureFunctionality",
    timestampId:"221208090108"
};
const TEST_DASHBOARD_2 = {
    imageBase64:"data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
    lastUpdatedTS:"Thu, 08 Dec 2022 11:04:54 BOT",
    reportType:"Daily-CallingReliability",
    timestampId:"221208090125"
};
const TEST_DASHBOARD_3 = {
    imageBase64:"data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
    lastUpdatedTS:"Thu, 08 Dec 2022 11:04:55 BOT",
    reportType:"Daily-PESQ",
    timestampId:"221208090142"
};
const TEST_DASHBOARD_4 = {
    imageBase64:"data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
    lastUpdatedTS:"Thu, 08 Dec 2022 11:04:57 BOT",
    reportType:"Weekly-FeatureFunctionality",
    timestampId:"221208090132"
};
const TEST_DASHBOARD_5 = {
    imageBase64:"data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
    lastUpdatedTS:"Thu, 08 Dec 2022 11:04:57 BOT",
    reportType:"Weekly-PESQ",
    timestampId:"221208090150"
};

const CTAAS_DASHBOARD_LIST = [
        TEST_DASHBOARD_1,
        TEST_DASHBOARD_2,
        TEST_DASHBOARD_3,
        TEST_DASHBOARD_4,
        TEST_DASHBOARD_5
]

const DASHBOARD_DETAIL_REPORT = {
    response: {
        report: {
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
    "Daily-FeatureFunctionality": {
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


const ERROR_MSG = 'Expected setupDetails response error';

export const CtaasDashboardServiceMock = {
    dashboardList: CTAAS_DASHBOARD_LIST,
    dashboardDetailedReport: DASHBOARD_DETAIL_REPORT,
    dashboardDetailedReportsWithEmptyEndpoints: DASHBOARD_DETAIL_REPORT_EMPTY_ENDPOINTS,
    dashboardDetailedReportsWithMissingAttributes: DASHBOARD_DETAIL_REPORT_WITH_MISSING_ATTRIBUTES,
    reportDetailedObject: REPORT_DETAILED_OBJ,
    reportDetailedWithOneResult:CONTENT_DOWNLOADED,
    getCtaasDashboardDetails: (subaccountId: string, reportType: string, timestamp?: string) => {
        return new Observable( (observer) => {
            observer.next(
                {
                    response: CTAAS_DASHBOARD_LIST.filter((e) => e.reportType === reportType)[0]
                }
            );
            observer.complete();
            return {
                unsubscribe() { return; }
            };
        });
    },
    setReports:() =>{
    },
    getReports: () => {
        return CTAAS_DASHBOARD_LIST;
    },
    getCtaasPowerBiDashboardDetails: (subaccountId) => {
        return new Observable( (observer) => {
            observer.next(
                {
                    powerBiInfo:{
                    daily: {
                        embedUrl: 'testUrl',
                        embedToken: 'testToken'
                    },
                    weekly: {
                        embedUrl: 'testUrl',
                        embedToken: 'testToken'
                    }}
                }
            )
            observer.complete();
            return {
                unsubscribe() { return; }
            };
        })
    },
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
