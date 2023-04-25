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
     * get stakeholder list details
     * @returns: Observable<any>
     */
    public getNetworkQualityData(startDate: Moment, endDate: Moment): Observable<any> {
        let params = new HttpParams();
        params = params.set('startDate', startDate.format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.format("YYYY-MM-DD 23:59:59"));
        params = params.set('metric', 'POLQA,Received Jitter,Received packet loss,Round trip time');
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'networkQualityChart', { headers, params });
    }

    /**
     * get stakeholder list details
     * @returns: Observable<any>
     */
    public getWeeklyCallingReliability(startDate: Moment, endDate: Moment): Observable<any> {
        let params = new HttpParams();
        params = params.set('startDate', startDate.format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.format("YYYY-MM-DD 23:59:59"));
        params = params.set('reportType', 'CallingReliability');
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'collectionChart', { headers, params });
    }

    public getDailyCallingReliability(startDate: Moment, endDate: Moment): Observable<any> {
       return this.getSimpleChart(startDate, endDate, 'CallingReliability');
    }

    public getDailyFeatureFunctionality(startDate: Moment, endDate: Moment): Observable<any> {
        return this.getSimpleChart(startDate, endDate, 'FeatureFunctionality');
    }

    public getDailyVoiceQuality(startDate: Moment, endDate: Moment): Observable<any> {
        return this.getSimpleChart(startDate, endDate, 'VQ');
    }

    private getSimpleChart(startDate: Moment, endDate: Moment, reportType: string) {
        let params = new HttpParams();
        params = params.set('startDate', startDate.format("YYYY-MM-DD 00:00:00"));
        params = params.set('endDate', endDate.format("YYYY-MM-DD 23:59:59"));
        params = params.set('reportType', reportType);
        const headers = this.getHeaders();
        return this.httpClient.get(this.API_URL + 'simpleChart', { headers, params });
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
