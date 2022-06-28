import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Device } from '../model/device.model';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  private readonly API_URL: string = environment.apiEndpoint + '/devices';

  constructor(private httpClient: HttpClient) { }
  /**
   * get devices list
   * @returns: Observable 
   */
  public getDevicesList(subaccountId?: string, object?: { vendor: string, product: string, version: string }): Observable<Device> {
    let url = this.API_URL;
    if (object) {
      if (object.vendor) {
        url += '/' + object.vendor;
        if (object.product) {
          url += '/' + object.product;
          if (object.version) {
            url += '/' + object.version;
          }
        }
      }
    }
    let params = new HttpParams();
    if (subaccountId){
      params = params.set('subaccountId', subaccountId);
    }
    const headers = this.getHeaders();
    return this.httpClient.get<Device>(url, { headers, params });
  }
  /**
   * create device
   * @param device: Device 
   * @returns: Observable<Device> 
   */
  public createDevice(device: Device): Observable<any> {
    return this.httpClient.post(this.API_URL, device);
  }
  /**
   * update device
   * @param device: Device 
   * @returns: Observable<Device> 
   */
  public updateDevice(device: Device): Observable<any> {
    return this.httpClient.put(`${this.API_URL}/${device.id}`, device);
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
