import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Moment } from 'moment';
import { environment } from 'src/environments/environment';
import { Constants } from '../helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class MapService {  
  private readonly CTAAS_MAP_SUMMARY_API_URL = environment.apiEndpoint + '/spotlighCharts/mapSummary';

  constructor(private httpClient: HttpClient) { }
  
  getMapSummary(date: Moment, subaccountId:string, regions: {city: string, state:string, country:string}[]){
    let params = new HttpParams();
    params = params.set('startDate', date.format("YYYY-MM-DD 00:00:00"));
    params = params.set('endDate', date.format(Constants.DATE_TIME_FORMAT));
    params = params.set('subaccountId', subaccountId);
    if( regions.length > 0)
      params = params.set('regions',JSON.stringify(regions));
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
