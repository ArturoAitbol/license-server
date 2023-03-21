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
                            id: '859f29e3-fbf3-4313-ac0d-f616acaa47c1',
                            embedUrl: 'testUrl',
                            embedToken: 'testToken'
                        },
                        test1:{
                            embedUrl: "https://app.powerbi.com/reportEmbed?reportId=c535fee0-168f-4c4d-9562-10c9fdbbb97d&groupId=062207f8-b0ab-4bd4-b6e9-ab57d42a7e76&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLU5PUlRILUNFTlRSQUwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7Im1vZGVybkVtYmVkIjp0cnVlLCJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19",
                            id: "c535fee0-168f-4c4d-9562-10c9fdbbb97d",
                            embedToken: "H4sIAAAAAAAEAB2Ut66EVgBE_-W1WCInSy4IC8uSc-hICyyZS7pr-d_97G6K0RRnRvP3j5PDYc6rnz9_jkffaZGz2wZ6WIbyGb-gINQQk1FlF0eBGgF8HOEH1qIIcfLqDY-LH8YnTrgGY_BeDUQV53_1Yna2RVev-bNGEaK8OZ1IkK4JpbxftAb4RzG_bHfAe83fqZYZVkvD2o7HOQ0VtIiW6CHRhtNPMx0Ve1x_g82upyP6apZXMYFDT6iuGF24ABv_LJHEDtnwVIgmkOpjaLCs_DTkmbL-IeYSG1vtaKgvo-A9xEDDTzN8lHg2bukiP4JsQ1fFntxdULk2IENJZmumyKWuWN6-trTvvhkH9hAvqBYAUKk5lRHnwbtZXrslr_tku-dVRQxEKdCHx6hzM5cNzC30yRdsaY4L0E_oq4kZkMKXk1wPqtwUdrhZb5U-kbS-uWLqi2uQhkv74VBTeDCt0wqXGvG5PZ8P5Vyxx443joiw7dNzGickQ34f7oJgbcaTxe16sKqeI6GGx-xFhxmO97l5ywy2cG5zzOo2mssxErqjyK3j7IASr0U16PiYXiOThcirqhpu3MVqDi0kzfDr62h-6xDEFlXCI_dhB5R8Cgaf4jMD6L5naQPTSVz3jEImJTWbim0eROSjfgsRuWmcBctNriNxrtVpJIqrD-0yPDPqdcC099qFZuorVAv1YRQEjtUSt4RfKCVw9AgRfKKRREECgGDhEgkcUHz2pdQBJw92FaU3AnyB7yiBQk2omsjTUerSxxB6_9QHO1mTWSwJeExTgdP3LBVqNG695fX882rc40XvnLEkiSYSVxFMeUp7qWYlLI5_fSu1UlUZUYUvTDBIZQRHv1gt103fhIakDZ6arpNs51LkgTpeIjY_PT1rEyNTAzz7zfJcDJm5QkNCBrzb453bOVqHfopXuiswUwf85M0TFUv7-lbTzwdzGDromHtI56oyPbItDI17lkvf8IGZ72p_nCx-yMizKcBQggAt4YEwnfF088Bc9dG-71Vaso_1xXHJxGhiwPxJpcIHw43VLeP3ykTuqGfXukcY99rE6ToKsySZtKEXPt55Q3nY06B3dE3LIFayTHuN_EgYyrOyWikDq1zGd3rahfSYe9SfCXGfZ5kdW8QuAnnXEPuoFl5EQlYXt0FIRvbnjx9pg8s-6zX8vZOveoRyFscWlkBZyJ_7m0aqi0KmIVlLmG-I6KXKq462AdHLnXbyan55oHKR0xzQEfr-ri6ixbLhfCEf23Bvc2zTMb227CCywNlr8SLpb9xfKxbB7fiYPZtuwsMUkA8FH2u70SafbqjRc4WRYW5neddMs2OGvoAWhEGBBijxRh_DxbrKeTb65cQKSk2Z6tpal1MidRzot9NWspwN-mQjYm-TDmm6qT2Bo6SWAlwqVbIPMYQ9EdtGKpwK8krlSHqPg5n4rx4ORWLr7IqNIlPnb4WLWQvY-vNkOy8HTiOZ51fOG-P6tvEKykOpU9GzdQ9IZpTRGKsmCkxdPVlSOsxpuakgbP766z_McGnrTYt-KRfwaEVk09k2TnGAC0E0mvn1v8vvminfj63-tb23C1uC4lpvALpjFa0rGyoo8p3MfoeMvTlXzz5v-GYa585fvpcQV2S6r1U2parMe_bqfpf6QkccrfXCMbegUiFf4GWfWPMoBDTfzoSAYUzAjTDIG_zUb1dd0BwK1xOH2RbVp3vCLokuj7Qg4FikW1PjDhhL78CE4SWWV6Rs9PjbM7ok_BZIIW2WZfbS9qTVh930ybZTvwX1sneRmLjmW93QXgANR7gIzA_jXVTgtXnp6ptWtqEVxb0nG0698WTwjxFpa1Iz7hXaBb_75zzttxINQV8vv1841_oMKrGNy2Po4ZIhpVcFlnm3pHkTtUpLHtHoeu9rnCRhFFIlXXdrz8YUfjH_8y93iMOqQgcAAA==.eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLU5PUlRILUNFTlRSQUwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJleHAiOjE2Nzk0MTU4OTIsImFsbG93QWNjZXNzT3ZlclB1YmxpY0ludGVybmV0Ijp0cnVlfQ=="
                        },
                        test2: {
                            embedUrl: "https://app.powerbi.com/reportEmbed?reportId=7761e805-e685-4033-b96b-216cd26ba7a2&groupId=062207f8-b0ab-4bd4-b6e9-ab57d42a7e76&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLU5PUlRILUNFTlRSQUwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7Im1vZGVybkVtYmVkIjp0cnVlLCJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19",
                            id: "7761e805-e685-4033-b96b-216cd26ba7a2",
                            embedToken: "H4sIAAAAAAAEAB2Ut66EVgBE_-W1WCInSy4IC8uSc-hICyyZS7pr-d_97G6K0RRnRvP3j5PDYc6rnz9_jkffaZGz2wZ6WIbyGb-gINQQk1FlF0eBGgF8HOEH1qIIcfLqDY-LH8YnTrgGY_BeDUQV53_1Yna2RVev-bNGEaK8OZ1IkK4JpbxftAb4RzG_bHfAe83fqZYZVkvD2o7HOQ0VtIiW6CHRhtNPMx0Ve1x_g82upyP6apZXMYFDT6iuGF24ABv_LJHEDtnwVIgmkOpjaLCs_DTkmbL-IeYSG1vtaKgvo-A9xEDDTzN8lHg2bukiP4JsQ1fFntxdULk2IENJZmumyKWuWN6-trTvvhkH9hAvqBYAUKk5lRHnwbtZXrslr_tku-dVRQxEKdCHx6hzM5cNzC30yRdsaY4L0E_oq4kZkMKXk1wPqtwUdrhZb5U-kbS-uWLqi2uQhkv74VBTeDCt0wqXGvG5PZ8P5Vyxx443joiw7dNzGickQ34f7oJgbcaTxe16sKqeI6GGx-xFhxmO97l5ywy2cG5zzOo2mssxErqjyK3j7IASr0U16PiYXiOThcirqhpu3MVqDi0kzfDr62h-6xDEFlXCI_dhB5R8Cgaf4jMD6L5naQPTSVz3jEImJTWbim0eROSjfgsRuWmcBctNriNxrtVpJIqrD-0yPDPqdcC099qFZuorVAv1YRQEjtUSt4RfKCVw9AgRfKKRREECgGDhEgkcUHz2pdQBJw92FaU3AnyB7yiBQk2omsjTUerSxxB6_9QHO1mTWSwJeExTgdP3LBVqNG695fX882rc40XvnLEkiSYSVxFMeUp7qWYlLI5_fSu1UlUZUYUvTDBIZQRHv1gt103fhIakDZ6arpNs51LkgTpeIjY_PT1rEyNTAzz7zfJcDJm5QkNCBrzb453bOVqHfopXuiswUwf85M0TFUv7-lbTzwdzGDromHtI56oyPbItDI17lkvf8IGZ72p_nCx-yMizKcBQggAt4YEwnfF088Bc9dG-71Vaso_1xXHJxGhiwPxJpcIHw43VLeP3ykTuqGfXukcY99rE6ToKsySZtKEXPt55Q3nY06B3dE3LIFayTHuN_EgYyrOyWikDq1zGd3rahfSYe9SfCXGfZ5kdW8QuAnnXEPuoFl5EQlYXt0FIRvbnjx9pg8s-6zX8vZOveoRyFscWlkBZyJ_7m0aqi0KmIVlLmG-I6KXKq462AdHLnXbyan55oHKR0xzQEfr-ri6ixbLhfCEf23Bvc2zTMb227CCywNlr8SLpb9xfKxbB7fiYPZtuwsMUkA8FH2u70SafbqjRc4WRYW5neddMs2OGvoAWhEGBBijxRh_DxbrKeTb65cQKSk2Z6tpal1MidRzot9NWspwN-mQjYm-TDmm6qT2Bo6SWAlwqVbIPMYQ9EdtGKpwK8krlSHqPg5n4rx4ORWLr7IqNIlPnb4WLWQvY-vNkOy8HTiOZ51fOG-P6tvEKykOpU9GzdQ9IZpTRGKsmCkxdPVlSOsxpuakgbP766z_McGnrTYt-KRfwaEVk09k2TnGAC0E0mvn1v8vvminfj63-tb23C1uC4lpvALpjFa0rGyoo8p3MfoeMvTlXzz5v-GYa585fvpcQV2S6r1U2parMe_bqfpf6QkccrfXCMbegUiFf4GWfWPMoBDTfzoSAYUzAjTDIG_zUb1dd0BwK1xOH2RbVp3vCLokuj7Qg4FikW1PjDhhL78CE4SWWV6Rs9PjbM7ok_BZIIW2WZfbS9qTVh930ybZTvwX1sneRmLjmW93QXgANR7gIzA_jXVTgtXnp6ptWtqEVxb0nG0698WTwjxFpa1Iz7hXaBb_75zzttxINQV8vv1841_oMKrGNy2Po4ZIhpVcFlnm3pHkTtUpLHtHoeu9rnCRhFFIlXXdrz8YUfjH_8y93iMOqQgcAAA==.eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLU5PUlRILUNFTlRSQUwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJleHAiOjE2Nzk0MTU4OTIsImFsbG93QWNjZXNzT3ZlclB1YmxpY0ludGVybmV0Ijp0cnVlfQ=="
                        },
                        weekly: {
                            id: '6aabb047-8119-46f3-a462-e4ce6927cd21',
                            embedUrl: 'testUrl',
                            embedToken: 'testToken'
                        }
                    }
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
