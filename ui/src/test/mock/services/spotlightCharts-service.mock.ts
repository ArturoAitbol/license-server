import { Observable } from "rxjs";


const ERROR_MSG = 'Expected note service error';

const REGIONS_USERS_RESPONSE = {
    regions: [
        {
            "country": "United States",
            "city": "Tampa",
            "state": "FL"
        },
        {
            "country": "United States",
            "city": "Chicago",
            "state": "IL"
        },
        {
            "country": "United States",
            "city": "The Lakes",
            "state": "NV"
        },
        {
            "country": "United States",
            "city": "Carson",
            "state": "PA"
        },
        {
            "country": "United States",
            "city": "Franklin",
            "state": "TN"
        },
        {
            "country": "United States",
            "city": "Rockport",
            "state": "TX"
        },
        {
            "country": "United States",
            "city": "San Antonio",
            "state": "TX"
        },
        {
            "country": "United States",
            "city": "Woodville",
            "state": "TX"
        }
    ],

    users:[
        "2142428803",
        "2142428811",
        "2142428812",
        "2142428813",
        "2142428818",
        "9725980041",
        "9725980042",
        "9725980051",
        "9725980054",
        "9725980056",
        "9725980057",
        "9725980066",
        "9725980067"
    ]
}

export const SpotlightChartsServiceMock = {
    getFilterOptions: () => {
        return new Observable((observer) => {
            observer.next(
                REGIONS_USERS_RESPONSE
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
