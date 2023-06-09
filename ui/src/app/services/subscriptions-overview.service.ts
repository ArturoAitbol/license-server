import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SubscriptionOverview } from "../model/subscription-overview.model";

@Injectable({
    providedIn: 'root'
})
export class SubscriptionsOverviewService {
    private readonly API_URL: string = environment.apiEndpoint + '/subscriptions';
    constructor(private httpClient: HttpClient) { }

    /**
     * get subscriptions list
     * @returns: Observable
     */
    public getSubscriptionsList(): Observable<SubscriptionOverview[]> {
        const headers = this.getHeaders();
        return this.httpClient.get<SubscriptionOverview[]>(this.API_URL, { headers });
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
