import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
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
     * @param subaccountId Subaccount ID
     */
    public getCustomerNetworkQualityData(startDate: Moment, endDate: Moment, region: { country: string, state: string, city: string }, user: string, subaccountId: string, groupBy: string) {
        return this.getNetworkQualityData(startDate, endDate, region, 'POLQA,Received Jitter,Received packet loss,Round trip time', user, subaccountId, groupBy);
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     * @param user DID of the user
     * @param subaccountId Subaccount ID
     */
    public getCustomerNetworkTrendsData(startDate: Moment, endDate: Moment, region:  { country: string, state: string, city: string }, user: string, subaccountId: string, groupBy: string) {
        return this.getNetworkQualityData(startDate, endDate, region, 'Received Jitter,Received packet loss,Round trip time,Sent bitrate', user, subaccountId,groupBy);
    }

    private getNetworkQualityData(startDate: Moment, endDate: Moment, region: { country: string, state: string, city: string }, metric: string, user: string, subaccountId: string, groupBy: string): Observable<any> {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('metric', metric);
        params = params.set('subaccountId', subaccountId);
        params = params.set('groupBy',groupBy);
        if (user) params = params.set('user', user);
        if (region.country) params = params.set('country',region.country);
        if (region.state) params = params.set('state',region.state);
        if (region.city) params = params.set('city',region.city);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'networkQualityChart', { headers, params });
    }

    public getCustomerNetworkQualitySummary(startDate: Moment, endDate: Moment, region: { country: string, state: string, city: string }, user: string, subaccountId: string) {
        return this.getNetworkQualitySummary(startDate, endDate, region, 'POLQA,Received Jitter,Received packet loss,Round trip time', user, subaccountId)
    }

    public getNetworkQualityTrendsSummary(startDate: Moment, endDate: Moment, region: { country: string, state: string, city: string }, user: string, subaccountId: string) {
        return this.getNetworkQualitySummary(startDate, endDate, region, 'Received Jitter,Received packet loss,Round trip time,Sent bitrate', user, subaccountId)
    }

    private getNetworkQualitySummary(startDate: Moment, endDate: Moment,  region: { country: string, state: string, city: string }, metric: string, user: string, subaccountId: string) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('metric', metric);
        params = params.set('subaccountId', subaccountId);
        if (user) params = params.set('user', user);
        if (region.country) params = params.set('country',region.country);
        if (region.state) params = params.set('state',region.state);
        if (region.city) params = params.set('city',region.city);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'networkQualitySummary', { headers, params });
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     * @param subaccountId Subaccount ID
     * @param reportType
     * @param region
     */
    public getWeeklyComboBarChart(startDate: Moment, endDate: Moment, subaccountId: string, reportType: string, region: { country: string, state: string, city: string }): Observable<any> {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('reportType', reportType);
        params = params.set('subaccountId', subaccountId);
        if (region.country) params = params.set('country', region.country);
        if (region.state) params = params.set('state', region.state);
        if (region.city) params = params.set('city', region.city);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'collectionChart', { headers, params });
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     * @param subaccountId Subaccount ID
     * @param region
     */
    public getWeeklyCallsStatusHeatMap(startDate: Moment, endDate: Moment, subaccountId: string, region: { country: string, state: string, city: string }){
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('subaccountId', subaccountId);
        if (region.country) params = params.set('country', region.country);
        if (region.state) params = params.set('state', region.state);
        if (region.city) params = params.set('city', region.city);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'callsStatusHeatMap', { headers, params });
    }

    /**
     *
     * @param date date in local time
     * @param region Region
     * @param subaccountId Subaccount ID
     */
    public getDailyCallsStatusSummary(date: Moment, region: { country: string, state: string, city: string }, subaccountId: string): Observable<any> {
       return this.getCallsStatusSummary(date, date, region, subaccountId);
    }

    /**
     *
     * @param startDate date in local time
     * @param endDate date in local time
     * @param region Region
     * @param subaccountId Subaccount ID
     */
    public getWeeklyCallsStatusSummary(startDate: Moment, endDate: Moment, region: { country: string, state: string, city: string }, subaccountId: string): Observable<any> {
        return this.getCallsStatusSummary(startDate, endDate, region, subaccountId);
    }

    private getCallsStatusSummary(startDate: Moment, endDate: Moment, region: { country: string, state: string, city: string }, subaccountId: string) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('subaccountId', subaccountId);
        if (region.country) params = params.set('country', region.country);
        if (region.state) params = params.set('state', region.state);
        if (region.city) params = params.set('city', region.city);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'callsStatusSummary', { headers, params });
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     * @param region Region
     * @param subaccountId Subaccount ID
     * @param weekly
     */
    public getVoiceQualityChart(startDate: Moment, endDate: Moment, region: { country: string, state: string, city: string }, subaccountId: string, weekly = false) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('subaccountId', subaccountId);
        if (region.country) params = params.set('country', region.country);
        if (region.state) params = params.set('state', region.state);
        if (region.city) params = params.set('city', region.city);
        if (weekly) params = params.set('reportPeriod', 'weekly');
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'voiceQualityChart', { headers, params });
    }

    public getFilterOptions(subaccountId: string,filter?: string, region?: { country: string, state: string, city: string }) {
        const headers = this.getHeaders();
        let params = new HttpParams();
        params = params.set('subaccountId', subaccountId);
        if(filter) params = params.set('filter', filter);
        if(region) {
            if (region.country) params = params.set('country', region.country);
            if (region.state) params = params.set('state', region.state);
            if (region.city) params = params.set('city', region.city);
        }
        return this.httpClient.get(this.API_URL + 'getFilterOptions', { headers, params });
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
