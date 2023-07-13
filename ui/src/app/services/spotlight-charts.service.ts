import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Moment } from "moment";
import { ReportName } from "../helpers/report-type";

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
    
    public getCustomerNetworkQualityData(startDate: Moment, endDate: Moment,  regions: { country: string, state: string, city: string }[], users: string[], subaccountId: string, groupBy: string, selectedFilter:boolean) {
        return this.getNetworkQualityData(startDate, endDate, regions, 'POLQA,Received Jitter,Received packet loss,Round trip time', users, subaccountId, groupBy, selectedFilter,ReportName.TAP_VQ);
    }

    /**
     *
     * @param startDate Start date in local time
     * @param endDate End date in local time
     * @param user DID of the user
     * @param subaccountId Subaccount ID
     */
    public getCustomerNetworkTrendsData(startDate: Moment, endDate: Moment, regions:  { country: string, state: string, city: string }[], users: string[], subaccountId: string, groupBy: string, selectedFilter:boolean) {
        return this.getNetworkQualityData(startDate, endDate, regions, 'Received Jitter,Received packet loss,Round trip time,Sent bitrate', users, subaccountId,groupBy, selectedFilter,null);
    }

    private getNetworkQualityData(startDate: Moment, endDate: Moment, regions: { country: string, state: string, city: string }[], metric: string, users: string[], subaccountId: string, groupBy: string, selectedFilter:boolean, callsFilter:string): Observable<any> {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('metric', metric);
        params = params.set('subaccountId', subaccountId);
        params = params.set('groupBy',groupBy);
        if (users.length>0) params = params.set('users', users.join(','));
        if (regions.length>0) params = params.set('regions', JSON.stringify(regions));
        if(selectedFilter === true) params = params.set('average', selectedFilter);
        if(callsFilter) params = params.set('callsFilter', callsFilter);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'networkQualityChart', { headers, params });
    }


    public getNetworkQualitySummary(startDate: Moment, endDate: Moment,  regions: { country: string, state: string, city: string }[], users: string[], subaccountId: string, selectedFilter:boolean) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('metric', 'Received Jitter,Received packet loss,Round trip time,Sent bitrate,POLQA');
        params = params.set('subaccountId', subaccountId);
        if(selectedFilter === true) params = params.set('average', selectedFilter);
        if(users.length>0) params = params.set('users', users.join(','));
        if(regions.length>0) params = params.set('regions', JSON.stringify(regions));
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
    public getWeeklyComboBarChart(startDate: Moment, endDate: Moment, subaccountId: string, reportType: string, regions: { country: string, state: string, city: string }[]): Observable<any> {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('reportType', reportType);
        params = params.set('subaccountId', subaccountId);
        if(regions.length>0) params = params.set('regions', JSON.stringify(regions));
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
    public getWeeklyCallsStatusHeatMap(startDate: Moment, endDate: Moment, subaccountId: string, regions: { country: string, state: string, city: string }[]){
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('subaccountId', subaccountId);
        if(regions.length>0) params = params.set('regions', JSON.stringify(regions));
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'callsStatusHeatMap', { headers, params });
    }

    /**
     *
     * @param date date in local time
     * @param region Region
     * @param subaccountId Subaccount ID
     */
    public getDailyCallsStatusSummary(date: Moment, regions: { country: string, state: string, city: string }[], subaccountId: string, callsFilter:string): Observable<any> {
       return this.getCallsStatusSummary(date, date, regions, subaccountId, callsFilter);
    }

    /**
     *
     * @param startDate date in local time
     * @param endDate date in local time
     * @param regions Regions
     * @param subaccountId Subaccount ID
     */
    public getWeeklyCallsStatusSummary(startDate: Moment, endDate: Moment, regions: { country: string, state: string, city: string }[], subaccountId: string, callsFilter:string): Observable<any> {
        return this.getCallsStatusSummary(startDate, endDate, regions, subaccountId, callsFilter);
    }

    private getCallsStatusSummary(startDate: Moment, endDate: Moment, regions: { country: string, state: string, city: string }[], subaccountId: string, callsFilter:string) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('subaccountId', subaccountId);
        if(regions.length>0) params = params.set('regions', JSON.stringify(regions));
        if(callsFilter) params = params.set('callsFilter', callsFilter);
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
    public getVoiceQualityChart(startDate: Moment, endDate: Moment, regions: { country: string, state: string, city: string }[], subaccountId: string, weekly = false) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        params = params.set('subaccountId', subaccountId);
        if(regions.length>0) params = params.set('regions', JSON.stringify(regions));
        if (weekly) params = params.set('reportPeriod', 'weekly');
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'voiceQualityChart', { headers, params });
    }

    public getFilterOptions(subaccountId: string, startDate: Moment, endDate: Moment, filter?: string, regions?: { country: string, state: string, city: string }[]) {
        const headers = this.getHeaders();
        let params = new HttpParams();
        params = params.set('subaccountId', subaccountId);
        params = params.set('startDate', startDate.utc().format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.utc().format("YYYY-MM-DD HH:mm:ss"));
        if(filter) params = params.set('filter', filter);
        if(regions && regions.length>0) params = params.set('regions', JSON.stringify(regions));
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
