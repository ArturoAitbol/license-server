import { Observable } from 'rxjs';


const LOCATION_A = {
    "totalCalls": 4,
    "receivedPacketLoss": {
        "avg": 0,
        "max": 0,
        "count": 106
    },
    "sentBitrate": {
        "avg": 0,
        "count": 0
    },
    "polqa": {
        "min": 2.02,
        "avg": 3.783541666666667,
        "count": 96
    },
    "roundTripTime": {
        "avg": 132.4433962264151,
        "max": 263,
        "count": 106
    },
    "from": {
        "country": "United States",
        "city": "Tampa",
        "location": {
            "x": -82.450195,
            "y": 27.940102
        },
        "state": "FL"
    },
    "receivedJitter": {
        "avg": 6.134020618556701,
        "max": 13.33,
        "count": 106
    },
    "to": {
        "country": "United States",
        "city": "Tampa",
        "location": {
            "x": -82.450195,
            "y": 27.940102
        },
        "state": "FL"
    },
    "passed": 4,
    "failed": 0
}

const LOCATION_B = {
    "totalCalls": 1,
    "receivedPacketLoss": {
        "avg": 0,
        "max": 0,
        "count": 26
    },
    "sentBitrate": {
        "avg": 0,
        "count": 0
    },
    "polqa": {
        "min": 2.89,
        "avg": 3.7929166666666667,
        "count": 24
    },
    "roundTripTime": {
        "avg": 97.5,
        "max": 134,
        "count": 26
    },
    "from": {
        "country": "United States",
        "city": "Tampa",
        "location": {
            "x": -82.450195,
            "y": 27.940102
        },
        "state": "FL"
    },
    "receivedJitter": {
        "avg": 7.602,
        "max": 12.86,
        "count": 26
    },
    "to": {
        "country": "United States",
        "city": "Chicago",
        "location": {
            "x": -87.619705,
            "y": 41.88399
        },
        "state": "IL"
    },
    "passed": 1,
    "failed": 0
};

const LOCATION_C = {
    "totalCalls": 1,
    "receivedPacketLoss": {
        "avg": 0,
        "max": 0,
        "count": 0
    },
    "sentBitrate": {
        "avg": 0,
        "count": 0
    },
    "polqa": {
        "min": 2.46,
        "avg": 3.7170833333333335,
        "count": 24
    },
    "roundTripTime": {
        "avg": 141.21875,
        "max": 223,
        "count": 32
    },
    "from": {
        "country": "United States",
        "city": "Tampa",
        "location": {
            "x": -82.450195,
            "y": 27.940102
        },
        "state": "FL"
    },
    "receivedJitter": {
        "avg": 7.554193548387097,
        "max": 8.3,
        "count": 32
    },
    "to": {
        "country": "United States",
        "city": "The Lakes",
        "location": {
            "x": -115.14,
            "y": 36.18
        },
        "state": "NV"
    },
    "passed": 1,
    "failed": 0
};

const LOCATION_D = {
    "totalCalls": 4,
    "receivedPacketLoss": {
        "avg": 0.015132743362831859,
        "max": 1.71,
        "count": 120
    },
    "sentBitrate": {
        "avg": 0,
        "count": 0
    },
    "polqa": {
        "min": 2.45,
        "avg": 4.0115625,
        "count": 96
    },
    "roundTripTime": {
        "avg": 71.04166666666667,
        "max": 141,
        "count": 120
    },
    "from": {
        "country": "United States",
        "city": "Chicago",
        "location": {
            "x": -87.619705,
            "y": 41.88399
        },
        "state": "IL"
    },
    "receivedJitter": {
        "avg": 5.295,
        "max": 12.5,
        "count": 120
    },
    "to": {
        "country": "United States",
        "city": "Tampa",
        "location": {
            "x": -82.450195,
            "y": 27.940102
        },
        "state": "FL"
    },
    "passed": 4,
    "failed": 0
}
const LOCATION_E = {
    "totalCalls": 6,
    "receivedPacketLoss": {
        "avg": 0,
        "max": 0,
        "count": 131
    },
    "sentBitrate": {
        "avg": 0,
        "count": 0
    },
    "polqa": {
        "min": 0,
        "avg": 0,
        "count": 0
    },
    "roundTripTime": {
        "avg": 49.03389830508475,
        "max": 145,
        "count": 131
    },
    "from": {
        "country": "United States",
        "city": "Chicago",
        "location": {
            "x": -87.619705,
            "y": 41.88399
        },
        "state": "Illinois"
    },
    "receivedJitter": {
        "avg": 6.987575757575757,
        "max": 11.49,
        "count": 131
    },
    "to": {
        "country": "United States",
        "city": "Woodville",
        "location": {
            "x": -94.41488,
            "y": 30.775345
        },
        "state": "Texas"
    },
    "passed": 4,
    "failed": 2
};

const LOCATION_F = {
    "totalCalls": 1,
    "receivedPacketLoss": {
        "avg": 0.023125,
        "max": 0.37,
        "count": 0
    },
    "sentBitrate": {
        "avg": 36,
        "count": 0
    },
    "polqa": {
        "min": 0,
        "avg": 1.9333333333333333,
        "count": 24
    },
    "roundTripTime": {
        "avg": 132.5,
        "max": 143,
        "count": 32
    },
    "from": {
        "country": "United States",
        "city": "Rockport",
        "location": {
            "x": -97.05,
            "y": 28.02
        },
        "state": "Texas"
    },
    "receivedJitter": {
        "avg": 9.789375,
        "max": 11.83,
        "count": 32
    },
    "to": {
        "country": "United States",
        "city": "Las Vegas",
        "location": {
            "x": -115.14,
            "y": 36.18
        },
        "state": "Nevada"
    },
    "passed": 0,
    "failed": 1
}

const LOCATION_G ={
    "totalCalls": 1,
    "receivedPacketLoss": {
        "avg": 0,
        "max": 0,
        "count": 0
    },
    "sentBitrate": {
        "avg": 36,
        "count": 0
    },
    "polqa": {
        "min": 0,
        "avg": 0,
        "count": 0
    },
    "roundTripTime": {
        "avg": 174.03125,
        "max": 232,
        "count": 32
    },
    "from": {
        "country": "United States",
        "city": "Franklin",
        "location": {
            "x": -86.87,
            "y": 35.93
        },
        "state": "Tennessee"
    },
    "receivedJitter": {
        "avg": 5.075185185185185,
        "max": 6.52,
        "count": 32
    },
    "to": {
        "country": "United States",
        "city": "Woodville",
        "location": {
            "x": -94.41488,
            "y": 30.775345
        },
        "state": "Texas"
    },
    "passed": 1,
    "failed": 0
}

const LOCATION_H = {
    "totalCalls": 2,
    "receivedPacketLoss": {
        "avg": 0,
        "max": 0,
        "count": 64
    },
    "sentBitrate": {
        "avg": 36,
        "count": 64
    },
    "polqa": {
        "min": 0,
        "avg": 0,
        "count": 0
    },
    "roundTripTime": {
        "avg": 78.609375,
        "max": 130,
        "count": 64
    },
    "from": {
        "country": "United States",
        "city": "Woodville",
        "location": {
            "x": -94.41488,
            "y": 30.775345
        },
        "state": "Texas"
    },
    "receivedJitter": {
        "avg": 7.640483870967742,
        "max": 14.82,
        "count": 64
    },
    "to": {
        "country": "United States",
        "city": "Franklin",
        "location": {
            "x": -86.87,
            "y": 35.93
        },
        "state": "Tennessee"
    },
    "passed": 2,
    "failed": 0
}

const SELECTED_NODE = {
    "region": {
        "country": "United States",
        "city": "Chicago",
        "location": {
            "x": -87.619705,
            "y": 41.88399
        },
        "state": "IL"
    },
    "totalCalls": 2,
    "totalCallTimes": 4000,
    "callsOriginated": {
        "passed": 2,
        "failed": 0,
        "total": 2,
        "polqa": {
            "count": 0,
            "min": "",
            "avg": ""
        },
        "receivedJitter": {
            "avg": 3.9466666666666668,
            "max": 8.03,
            "count": 12
        },
        "roundTripTime": {
            "avg": 1,
            "max": 1,
            "count": 12
        },
        "receivedPacketLoss": {
            "avg": 0,
            "max": 0,
            "count": 12
        },
        "sentBitrate": {
            "avg": 40,
            "count": 12
        }
    },
    "callsTerminated": {
        "passed": 0,
        "failed": 0,
        "total": 0,
        "polqa": {
            "count": 0,
            "min": "",
            "avg": ""
        },
        "receivedJitter": {
            "count": 0,
            "max": "",
            "avg": ""
        },
        "roundTripTime": {
            "count": 0,
            "max": "",
            "avg": ""
        },
        "receivedPacketLoss": {
            "count": 0,
            "max": "",
            "avg": ""
        },
        "sentBitrate": {
            "count": 0,
            "avg": ""
        }
    },
    "date": "2023-06-26T23:59:59.999Z"
}

const SELECTED_LINE = {
    "totalCalls": 4,
    "totalCallTimes": 4000,
    "receivedPacketLoss": {
        "avg": 0,
        "max": 0,
        "count": 98
    },
    "sentBitrate": {
        "avg": 36,
        "count": 98
    },
    "polqa": {
        "min": 2.51,
        "avg": 3.8598958333333333,
        "count": 96
    },
    "roundTripTime": {
        "avg": 86.09183673469387,
        "max": 124,
        "count": 98
    },
    "from": {
        "country": "United States",
        "city": "Chicago",
        "location": {
            "x": -87.619705,
            "y": 41.88399
        },
        "state": "IL"
    },
    "receivedJitter": {
        "avg": 5.135969387755103,
        "max": 10.89,
        "count": 98
    },
    "to": {
        "country": "United States",
        "city": "The Lakes",
        "location": {
            "x": -115.14,
            "y": 36.18
        },
        "state": "NV"
    },
    "passed": 4,
    "failed": 0,
    "fromLocation": "Chicago, IL, United States",
    "toLocation": "The Lakes, NV, United States",
    "date": "2023-06-28T15:00:35.827Z"
}

const LOCATION_LIST = [
    LOCATION_A,
    LOCATION_B,
    LOCATION_C,
    LOCATION_D,
    LOCATION_E,
    LOCATION_F,
    LOCATION_G,
    LOCATION_H
];

const ERROR_MSG = 'Expected note service error';

export const MapServiceMock = {
    selectedNode: SELECTED_NODE,
    selectedLine: SELECTED_LINE,
    getMapSummary: () => {
        return new Observable((observer) => {
            observer.next(
                LOCATION_LIST
            );
            observer.complete();
            return {
                unsubscribe() { return; }
            };
        });
    },
    errorResponse: () => {
        return new Observable((observer) => {
            observer.next({
                error: ERROR_MSG
            });
            observer.complete();
            return {
                unsubscribe() { return; }
            };
        });
    },
    errorMsg: ERROR_MSG
};
