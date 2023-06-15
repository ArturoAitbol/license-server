import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Moment } from 'moment';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapServicesService {  
  private readonly CTAAS_MAP_SUMMARY_API_URL = environment.apiEndpoint + '/spotlighCharts/mapSummary';

  constructor(private httpClient: HttpClient) { }
  
  getMapSummary(startDate: string, subaccountId:string){
    let params = new HttpParams();
    params = params.set('startDate', startDate);
    params = params.set('subaccountId', subaccountId);
    const headers = this.getHeaders();
    return this.httpClient.get(this.CTAAS_MAP_SUMMARY_API_URL,{headers,params});
  }

  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    return headers;
  }
}
