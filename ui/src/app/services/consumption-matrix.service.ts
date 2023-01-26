import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IConsumptionMatrixEntry } from "../model/consumption-matrix-entry.model";
import { Observable } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class ConsumptionMatrixService {
    private readonly API_URL: string = environment.apiEndpoint + '/consumptionMatrix';

    constructor(private httpClient: HttpClient) { }

    /**
     * Create a new entry on the consumption matrix
     * @param consumptionMatrixEntry
     */
    public createConsumptionMatrix(consumptionMatrixEntry: IConsumptionMatrixEntry) {
        return this.httpClient.post(this.API_URL, consumptionMatrixEntry);
    }

    /**
     * Get the consumption matrix as a list of entries
     */
    public getConsumptionMatrix(): Observable<{ consumptionMatrix: IConsumptionMatrixEntry[] }> {
        const headers = this.getHeaders();
        return <Observable<{ consumptionMatrix: IConsumptionMatrixEntry[] }>>this.httpClient.get(`${ this.API_URL }`, { headers });
    }

    /**
     * Updates a consumption matrix entry by its id
     * @param id
     * @param consumptionMatrixEntry
     */
    public updateConsumptionMatrix(id: string, consumptionMatrixEntry: IConsumptionMatrixEntry) {
        const headers = this.getHeaders();
        return this.httpClient.put(this.API_URL + `/${id}`,consumptionMatrixEntry, { headers });
    }

    /**
     * Deletes a consumption matrix entry by its id
     * @param id
     */
    public deleteConsumptionEntry(id: string) {
        return this.httpClient.delete(`${this.API_URL}/${id}`);
    }

    /**
     * set the header for the request
     * @returns: HttpHeaders
     */
    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
