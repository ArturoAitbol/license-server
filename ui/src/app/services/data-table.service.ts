import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DataTableService {
  apiUrl: string = environment.apiEndpoint;
  updateWidth: EventEmitter<any>;
  refresh: EventEmitter<any>;
  scrollEvent: EventEmitter<any>;
  updateTableHeight: EventEmitter<any>;

  constructor(private http: HttpClient) {
    this.updateWidth = new EventEmitter<any>();
    this.refresh = new EventEmitter<any>();
    this.scrollEvent = new EventEmitter<any>();
    this.updateTableHeight = new EventEmitter<any>();
  }

  public get(url: string) {
    let headers = this.getHeaders();
    return this.http.get(this.apiUrl + url, { headers });
  }

  public getHeaders() {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
