import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { SubAccountService } from "./sub-account.service";
import { Observable } from "rxjs";
import { Moment } from "moment";

@Injectable({
    providedIn: 'root'
})
export class SpotlightChartsService {
    private readonly API_URL: string = environment.apiEndpoint + '/spotlightCharts/';
    constructor(private httpClient: HttpClient, private subaacountService: SubAccountService) {
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     */
    public getCustomerNetworkQualityData(startDate: Moment, endDate: Moment) {
        return this.getNetworkQualityData(startDate, endDate, 'POLQA,Received Jitter,Received packet loss,Round trip time');
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     */
    public getCustomerNetworkTrendsData(startDate: Moment, endDate: Moment) {
        return this.getNetworkQualityData(startDate, endDate, 'Received Jitter,Received packet loss,Round trip time,Sent bitrate');
    }

    private getNetworkQualityData(startDate: Moment, endDate: Moment, metric: string): Observable<any> {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD 23:59:59"));
        params = params.set('metric', metric);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'networkQualityChart', { headers, params });
    }

    public getCustomerNetworkQualitySummary(startDate: Moment, endDate: Moment) {
        return this.getNetworkQualitySummary(startDate, endDate, 'POLQA,Received Jitter,Received packet loss,Round trip time')
    }

    public getNetworkQualityTrendsSummary(startDate: Moment, endDate: Moment) {
        return this.getNetworkQualitySummary(startDate, endDate, 'Received Jitter,Received packet loss,Round trip time,Sent bitrate')
    }

    private getNetworkQualitySummary(startDate: Moment, endDate: Moment, metric: string) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD 23:59:59"));
        params = params.set('metric', metric);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'networkQualitySummary', { headers, params });
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     */
    public getWeeklyCallingReliability(startDate: Moment, endDate: Moment): Observable<any> {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD 23:59:59"));
        params = params.set('reportType', 'CallingReliability');
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'collectionChart', { headers, params });
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     */
    public getDailyCallingReliability(startDate: Moment, endDate: Moment): Observable<any> {
       return this.getSimpleChart(startDate, endDate, 'CallingReliability');
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     */
    public getDailyFeatureFunctionality(startDate: Moment, endDate: Moment): Observable<any> {
        return this.getSimpleChart(startDate, endDate, 'FeatureFunctionality');
    }

    private getSimpleChart(startDate: Moment, endDate: Moment, reportType: string) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD 23:59:59"));
        params = params.set('reportType', reportType);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'simpleChart', { headers, params });
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     */
    public getVoiceQualityChart(startDate: Moment, endDate: Moment) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD 23:59:59"));
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'voiceQualityChart', { headers, params });
    }

    /**
     * set the header for the request
     * @returns: HttpHeaders
     */
    public getHeaders(): HttpHeaders {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
