import { Injectable } from "@angular/core";
import { FeatureToggle } from "../model/feature-toggle.model";
import { HttpBackend, HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { Constants } from "../helpers/constants";

@Injectable({
    providedIn: 'root'
})
export class FeatureToggleService {
    private featureToggleMap: Map<string, FeatureToggle>;
    private intervalId = null;
    private httpClient: HttpClient;
    private readonly API_URL: string = environment.apiEndpoint + '/featureToggles';

    constructor( handler: HttpBackend) {
        this.httpClient = new HttpClient(handler);
    }

    /**
     * Refresh the feature toggle map, should be called when a user logs in.
     */
    public refreshToggles(): Observable<void> {
        return new Observable<void>(subscriber => {
            this.featureToggleMap = new Map<string, FeatureToggle>();
            const headers = this.getHeaders();
            this.httpClient.get(`${this.API_URL}`, { headers }).subscribe((res: {featureToggles: FeatureToggle[]}) => {
                res.featureToggles.forEach(featureToggle => {
                    this.featureToggleMap.set(featureToggle.name, featureToggle);
                });
                if (this.intervalId == null) this.setUpPeriodicRefresh();
                subscriber.next(void 0);
                subscriber.complete();
            });
        });
    }

    public clearPeriodicRefresh(): void {
        if (this.intervalId != null) clearInterval(this.intervalId);
    }

    private setUpPeriodicRefresh(): void {
        this.intervalId = setInterval(() => {
            this.refreshToggles().subscribe();
        }, Constants.TOGGLES_REFRESH_INTERVAL);
    }

    /**
     * Returns a boolean indicating if the feature toggle is enabled, <b>if the feature toggle is not defined by default the return value is true<b>;
     * @param toggleName The unique name that identifies the feature toggle
     * @param subaccountId The subaccountId to check if there's any exception
     */
    public isFeatureEnabled(toggleName: string, subaccountId?: string): boolean {
        const featureToggle = this.featureToggleMap.get(toggleName);
        if (featureToggle) {
            if (subaccountId) {
                const exception = featureToggle?.exceptions?.find(exception => exception.subaccountId == subaccountId);
                // If the exception exists it takes priority
                if (exception) return exception.status;
                else return featureToggle.status;
            } else return featureToggle.status;
        } else return true;
    }

    /**
     * get the headers for a http request
     * @returns: HttpHeaders
     */
    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
