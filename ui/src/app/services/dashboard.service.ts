import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  apiURL: string = environment.apiEndpoint;
  getExpiryRefresh$: EventEmitter<any>;

  constructor(private httpClient: HttpClient) {
    this.getExpiryRefresh$ = new EventEmitter<any>();
  }
  public getExpiryDaysDetails() {
    const headers = this.getHeaders();
    return this.httpClient.get(environment.apiEndpoint + '/dashboard/expiryDays', { headers });
  }

  public getDashboardDetails() {
    let headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + "/dashboard/details", { headers });
  }

  public fetchBWApiList() {
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + '/dashboard/apiList', { headers });
  }

  public getHeaders() {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
