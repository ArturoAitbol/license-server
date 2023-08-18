import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";


@Injectable({
    providedIn: 'root'
})
export  class CallbackService {
    private readonly API_URL: string = environment.apiEndpoint + '/callback';

    constructor(private httpClient: HttpClient) {}


    public createCallback(userData: any) {
        return this.httpClient.post(`${this.API_URL}`, userData);
    }
}
