import { Observable } from "rxjs";
import { Moment } from "moment";
import { HttpHeaders, HttpParams } from "@angular/common/http";

import { ReportName } from "src/app/helpers/report-type";

const NETWORK_QUALITY_DATA = {
  series: {
    POLQA: [
      4.04,
      3.42,
      4.12,
      3.72,
      3.84,
      3.73,
      2.37,
      4.41,
      3.87,
      3.45,
      3.92,
      4.39,
      2.93,
      3.56,
      3.13,
      3.72,
      null,
      null,
    ],
    "Received packet loss": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      null,
      null,
    ],
    "Received Jitter": [
      10.66,
      7.86,
      10.55,
      10.12,
      7.3,
      7.7,
      2.87,
      2.13,
      2.04,
      8.97,
      10.79,
      8.38,
      10.48,
      10.25,
      8.86,
      4.48,
      null,
      null,
    ],
    "Round trip time": [
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      null,
      1,
      1,
      1,
      1,
      null,
      null,
    ],
  },
  categories: [
    "06-21-2023 00:00-01:00",
    "06-21-2023 01:00-02:00",
    "06-21-2023 02:00-03:00",
    "06-21-2023 03:00-04:00",
    "06-21-2023 04:00-05:00",
    "06-21-2023 05:00-06:00",
    "06-21-2023 06:00-07:00",
    "06-21-2023 07:00-08:00",
    "06-21-2023 08:00-09:00",
    "06-21-2023 09:00-10:00",
    "06-21-2023 10:00-11:00",
    "06-21-2023 11:00-12:00",
    "06-21-2023 12:00-13:00",
    "06-21-2023 13:00-14:00",
    "06-21-2023 14:00-15:00",
    "06-21-2023 15:00-16:00",
    "06-21-2023 16:00-17:00",
    "06-21-2023 17:00-18:00",
  ],
};

const NETWORK_TRENDS_DATA = {
  series: {
    "Received packet loss": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      null,
      null,
    ],
    "Sent bitrate": [
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      40,
      null,
      null,
    ],
    "Received Jitter": [
      10.66,
      7.86,
      10.55,
      10.12,
      7.3,
      7.7,
      2.87,
      2.13,
      2.04,
      8.97,
      10.79,
      8.38,
      10.48,
      10.25,
      8.86,
      4.48,
      null,
      null,
    ],
    "Round trip time": [
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      null,
      1,
      1,
      1,
      1,
      null,
      null,
    ],
  },
  categories: [
    "06-21-2023 00:00-01:00",
    "06-21-2023 01:00-02:00",
    "06-21-2023 02:00-03:00",
    "06-21-2023 03:00-04:00",
    "06-21-2023 04:00-05:00",
    "06-21-2023 05:00-06:00",
    "06-21-2023 06:00-07:00",
    "06-21-2023 07:00-08:00",
    "06-21-2023 08:00-09:00",
    "06-21-2023 09:00-10:00",
    "06-21-2023 10:00-11:00",
    "06-21-2023 11:00-12:00",
    "06-21-2023 12:00-13:00",
    "06-21-2023 13:00-14:00",
    "06-21-2023 14:00-15:00",
    "06-21-2023 15:00-16:00",
    "06-21-2023 16:00-17:00",
    "06-21-2023 17:00-18:00",
  ],
};

const NETWORK_SUMMARY_DATA = {
  totalCalls: 59,
  maxPacketLoss: 0,
  avgSentBitrate: 40,
  maxJitter: 10.79,
  jitterAboveThld: 0,
  packetLossAboveThld: 0,
  minPolqa: 2.37,
  roundTripTimeAboveThld: 0,
  maxRoundTripTime: 1,
};

export class SpotlightChartsServiceMock {
  getCustomerNetworkQualityData(
    startDate: Moment,
    endDate: Moment,
    regions: { country: string; state: string; city: string }[],
    users: string[],
    subaccountId: string,
    groupBy: string,
    selectedFilter: boolean
  ) {
    return new Observable((observer) => {
      observer.next(NETWORK_QUALITY_DATA);
      observer.complete();
      return {
        unsubscribe() {
          return;
        },
      };
    });
  }

  getCustomerNetworkTrendsData(
    startDate: Moment,
    endDate: Moment,
    regions: { country: string; state: string; city: string }[],
    users: string[],
    subaccountId: string,
    groupBy: string,
    selectedFilter: boolean
  ) {
    return new Observable((observer) => {
      observer.next(NETWORK_TRENDS_DATA);
      observer.complete();
      return {
        unsubscribe() {
          return;
        },
      };
    });
  }

  getNetworkQualitySummary(
    startDate: Moment,
    endDate: Moment,
    regions: { country: string; state: string; city: string }[],
    users: string[],
    subaccountId: string,
    selectedFilter: boolean
  ) {
    return new Observable((observer) => {
        observer.next(NETWORK_SUMMARY_DATA);
        observer.complete();
        return {
          unsubscribe() {
            return;
          },
        };
      });
  }

  //TODO: mock other public service functions

  getWeeklyComboBarChart(
    startDate: Moment,
    endDate: Moment,
    subaccountId: string,
    reportType: string,
    regions: { country: string; state: string; city: string }[]
  ): Observable<any> {
    return null;
  }

  getWeeklyCallsStatusHeatMap(
    startDate: Moment,
    endDate: Moment,
    subaccountId: string,
    regions: { country: string; state: string; city: string }[]
  ) {}

  getDailyCallsStatusSummary(
    date: Moment,
    regions: { country: string; state: string; city: string }[],
    subaccountId: string
  ): Observable<any> {
    return null;
  }

  getWeeklyCallsStatusSummary(
    startDate: Moment,
    endDate: Moment,
    regions: { country: string; state: string; city: string }[],
    subaccountId: string
  ): Observable<any> {
    return null;
  }

  getVoiceQualityChart(
    startDate: Moment,
    endDate: Moment,
    regions: { country: string; state: string; city: string }[],
    subaccountId: string,
    weekly = false
  ) {}

  getFilterOptions(
    subaccountId: string,
    startDate: Moment,
    endDate: Moment,
    filter?: string,
    regions?: { country: string; state: string; city: string }[]
  ) {}

  getHeaders(): HttpHeaders {
    return null;
  }
}
