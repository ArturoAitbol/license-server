import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Bundle } from '../model/bundle.model';

@Injectable({
  providedIn: 'root'
})
export class BundleService {
  private readonly API_URL: string = environment.apiEndpoint + '/bundles';

  constructor(private httpClient: HttpClient) { }
  
  /**
   * get particular Bundle details by bundleId
   * @param bundleId: string 
   * @returns: Observable 
   */
  public getBundleDetails(bundleId: string) {
    const headers = this.getHeaders();
    return this.httpClient.get(`${this.API_URL}/${bundleId}`, { headers });
  }
  /**
   * fetch Bundle details list
   * @returns: Observable 
   */
  public getBundleList() {
    const headers = this.getHeaders();
    return this.httpClient.get<Bundle>(this.API_URL, { headers });
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
