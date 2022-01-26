import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class RelayService {
    apiURL: string = environment.apiEndpoint + '/opr';
    closeModal: EventEmitter<any>;

    private relayInstance: any;

    constructor(private httpClient: HttpClient) {
        this.closeModal = new EventEmitter<any>();
    }

    setRelay(relay: any): void {
        this.relayInstance = relay;
    }

    getRelay(): string {
        return this.relayInstance;
    }

    /**
     * fetch the relays list
     */
    public getAllRelays() {
        const headers = this.getHeaders();
        return this.httpClient.get<any[]>(this.apiURL + '/listAll', { headers });
    }

    /**
     * to update the relay details
     * @param relayId: string
     */
    public updateParticularRelay(data: any) {
        return this.httpClient.put<any[]>(this.apiURL + '/update/' + data.id, data);
    }

    /**
     * to get the particular relay details
     * @param relayId: string
     */
    public getParticularRelay(relayId: string) {
        const headers = this.getHeaders();
        return this.httpClient.get<any[]>(this.apiURL + '/get/' + relayId, { headers });

    }

    /**
     * to delete the particular relay details
     * @param relayId: string
     */
    public deleteParticularRelay(relayId: string) {
        return this.httpClient.delete(this.apiURL + '/delete/' + relayId);
    }

    /**
     * to delete mutiple relays
     * @param relayIds: string[]
     */
    public deleteMultipleRelays(relayIds: string[]) {
        return this.httpClient.post(this.apiURL + '/deleteMultiple/', { ids: relayIds });
    }

    /**
     * download the relay
     */
    public downloadRelay() {
        return this.httpClient.get(this.apiURL + '/download/installer', { responseType: 'arraybuffer' });
    }

    /**
     * get the download relay name
     */
    public getDownloadRelayName() {
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/download/installer/name', { headers: headers });
    }

    /**
     * checks for any changes in the relay
     */
    public anyChangeInRelay(serverTime: string) {
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/anyChange/' + serverTime, { headers: headers });
    }

    /**
     *@return HttpHeaders
     */
    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
