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
    constructor(private httpClient: HttpClient) {
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     * @param user DID of the user
     */
    public getCustomerNetworkQualityData(startDate: Moment, endDate: Moment, user: string) {
        return this.getNetworkQualityData(startDate, endDate, 'POLQA,Received Jitter,Received packet loss,Round trip time', user);
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     * @param user DID of the user
     */
    public getCustomerNetworkTrendsData(startDate: Moment, endDate: Moment, user: string) {
        return this.getNetworkQualityData(startDate, endDate, 'Received Jitter,Received packet loss,Round trip time,Sent bitrate', user);
    }

    private getNetworkQualityData(startDate: Moment, endDate: Moment, metric: string, user: string): Observable<any> {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD 23:59:59"));
        params = params.set('metric', metric);
        params = params.set('subaccountId', '2c8e386b-d1bd-48b3-b73a-12bfa5d00805');
        if (user) params = params.set('user', user);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'networkQualityChart', { headers, params });
    }

    public getCustomerNetworkQualitySummary(startDate: Moment, endDate: Moment, user: string) {
        return this.getNetworkQualitySummary(startDate, endDate, 'POLQA,Received Jitter,Received packet loss,Round trip time', user)
    }

    public getNetworkQualityTrendsSummary(startDate: Moment, endDate: Moment, user: string) {
        return this.getNetworkQualitySummary(startDate, endDate, 'Received Jitter,Received packet loss,Round trip time,Sent bitrate', user)
    }

    private getNetworkQualitySummary(startDate: Moment, endDate: Moment, metric: string, user: string) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD 23:59:59"));
        params = params.set('metric', metric);
        params = params.set('subaccountId', '2c8e386b-d1bd-48b3-b73a-12bfa5d00805');
        if (user) params = params.set('user', user);
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
        params = params.set('subaccountId', '2c8e386b-d1bd-48b3-b73a-12bfa5d00805');
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'collectionChart', { headers, params });
    }

    /**
     *
     * @param date date in local time
     * @param region Region
     */
    public getDailyCallingReliability(date: Moment, region: { country: string, state: string, city: string }): Observable<any> {
       return this.getSimpleChart(date, date, 'CallingReliability', region);
    }

    /**
     *
     * @param date Date in local time
     * @param region Region
     */
    public getDailyFeatureFunctionality(date: Moment, region: { country: string, state: string, city: string }): Observable<any> {
        return this.getSimpleChart(date, date, 'FeatureFunctionality', region);
    }

    private getSimpleChart(startDate: Moment, endDate: Moment, reportType: string, region: { country: string, state: string, city: string }) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD 23:59:59"));
        params = params.set('reportType', reportType);
        params = params.set('subaccountId', '2c8e386b-d1bd-48b3-b73a-12bfa5d00805');
        if (region.country) params = params.set('country', region.country);
        if (region.state) params = params.set('state)', region.state);
        if (region.city) params = params.set('city', region.city);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'simpleChart', { headers, params });
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     * @param region Region
     */
    public getVoiceQualityChart(startDate: Moment, endDate: Moment, region: { country: string, state: string, city: string }) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD 23:59:59"));
        params = params.set('subaccountId', '2c8e386b-d1bd-48b3-b73a-12bfa5d00805');
        if (region.country) params = params.set('country', region.country);
        if (region.state) params = params.set('state)', region.state);
        if (region.city) params = params.set('city', region.city);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'voiceQualityChart', { headers, params });
    }

    public getFilterOptions() {
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'getFilterOptions', { headers });
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
