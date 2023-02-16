import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { FeatureToggle } from "../model/feature-toggle.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class FeatureToggleMgmtService {

    private readonly FT_API_URL: string = environment.apiEndpoint + '/featureToggles';
    private readonly FT_EXCEPTIONS_API_URL = environment.apiEndpoint + '/featureToggleExceptions';

    constructor(private httpClient: HttpClient) { }

    /**
     * Gets the feature toggles from the backend and returns an observable.
     */
    getFeatureToggles() {
        const headers = this.getHeaders();
        return this.httpClient.get(`${this.FT_API_URL}`, { headers });
    }

    /**
     * Creates a new feature toggle
     * @param featureToggle
     */
    createFeatureToggle(featureToggle: FeatureToggle) {
        const headers = this.getHeaders();
        return this.httpClient.post(`${this.FT_API_URL}`, featureToggle, { headers });
    }

    /**
     * Modifies the feature toggle
     * @param featureToggle
     */
    modifyFeatureToggle(featureToggle: FeatureToggle) {
        const headers = this.getHeaders();
        return this.httpClient.put(`${this.FT_API_URL}/${featureToggle.id}`, featureToggle, { headers });
    }

    /**
     * Deletes the feature toggle
     * @param featureToggleId
     */
    deleteFeatureToggle(featureToggleId: string) {
        const headers = this.getHeaders();
        return this.httpClient.delete(`${this.FT_API_URL}/${featureToggleId}`, { headers });
    }

    /**
     * Creates a new feature toggle exception
     * @param exception
     */
    createException(exception: {featureToggleId: string, subaccountId: string, status: boolean}) {
        const headers = this.getHeaders();
        return this.httpClient.post(this.FT_EXCEPTIONS_API_URL, exception, { headers });
    }

    /**
     * Updates an existing feature toggle exception
     * @param exception
     */
    updateException(exception: {featureToggleId: string, subaccountId: string, status: boolean}) {
        const headers = this.getHeaders();
        return this.httpClient.put(this.FT_EXCEPTIONS_API_URL, exception, { headers });
    }

    /**
     * Deletes a feature toggle based on the provided feature toggle ID and subaccount ID
     * @param featureToggleId
     * @param subaccountId
     */
    deleteException(featureToggleId: string, subaccountId: string) {
        const headers = this.getHeaders();
        return this.httpClient.delete(this.FT_EXCEPTIONS_API_URL, { headers: headers, body: { featureToggleId: featureToggleId, subaccountId: subaccountId } });
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
