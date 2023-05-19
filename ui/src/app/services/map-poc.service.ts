import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Moment } from 'moment';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EsriServicesService {
  private readonly ESRI_API_KEY: string = "AAPK9a825082c90049619a88880a1ef411c8VPBfmElvpxTEHaVZljmH4iSxttFkqZKNa361AOU5WwoVIxf0d2oZQ6e9-_GwiISt";
  private readonly ESRI_API_URL: string = 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?address';
  
  private readonly CTAAS_MAP_SUMMARY_API_URL = environment.apiEndpoint + '/spotlighCharts/mapSummary';

  constructor(private httpClient: HttpClient) { }
  
  public getLocationData(zipCodeAndAddress: string) {
    const headers = this.getHeaders();
    return this.httpClient.get(`${this.ESRI_API_URL}=${zipCodeAndAddress}&maxLocations=1&f=json&token=${this.ESRI_API_KEY}`, {headers});
  }
  
  getMapSummary(startDate: string, subaccountId:string){
    let params = new HttpParams();
    params = params.set('startDate', startDate);
    params = params.set('subaccountId', subaccountId);
    //params = params.set('endDate', endDate);
    // params = params.set('from', from);
    // params = params.set('to', to);
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
