import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EsriServicesService {
  private readonly ESRI_API_KEY: string = "AAPK9a825082c90049619a88880a1ef411c8VPBfmElvpxTEHaVZljmH4iSxttFkqZKNa361AOU5WwoVIxf0d2oZQ6e9-_GwiISt";
  private readonly ESRI_API_URL: string = 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?address';
  
  private readonly ZIP_CODE_API: string = 'https://www.zipcodeapi.com/rest'
  
  private readonly ZIP_2: string = 'https://api.zipcodestack.com/v1/search?codes'

  constructor(private httpClient: HttpClient) { }
  
  public getLocationData(zipCodeAndAddress: string) {
    const headers = this.getHeaders();
    return this.httpClient.get(`${this.ESRI_API_URL}=${zipCodeAndAddress}&maxLocations=1&f=json&token=${this.ESRI_API_KEY}`, {headers});
  }
  // public getLocationDataZipApi(zipCode:any){
    
  //   return this.httpClient.get(`${this.ZIP_CODE_API}/Dj1WY7jdp7LiNYN9Mq1i0TRUhRFS25v5vCm9QLoyIxxld0njEImIRuISB8srH96b/info.json/${zipCode}/degrees`)
  // }
  // public zip2(zipCode:any){
  //   const headers = this.getHeaders();
  //   return this.httpClient.get(`${this.ZIP_2}=${zipCode}&country=us`, {headers:{apiKey:'01H00SEX6B6DHCS2HSY85Z8C2F'}})
  // }

  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    return headers;
  }
}
