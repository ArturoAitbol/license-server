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
  public getDevicesList(subaccountId?: string, vendor?: string, product?: string, version?: string ): Observable<Device> {
    let params = new HttpParams();
    if (subaccountId){
      params = params.set('subaccountId', subaccountId);
    }
    if (vendor){
      params = params.set('vendor', vendor);
    }
    if (product){
      params = params.set('product', product);
    }
    if (version){
      params = params.set('version', version);
    }
    const headers = this.getHeaders();
    return this.httpClient.get<Device>(this.API_URL, { headers, params });
  }

  public getDevicesTypesList():Observable<any>{
    const headers = this.getHeaders();
    return this.httpClient.get<any>(environment.apiEndpoint + `/deviceTypes`, { headers });
  }

  /**
   * get device by id
   * @returns: Observable
   */
  public getDeviceById(id: string): Observable<Device> {
    const headers = this.getHeaders();
    return this.httpClient.get<Device>(this.API_URL + `/${id}`, { headers });
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
   * get device vendor list
   * @returns: Observable<string []>
   */
  public getAllDeviceVendors(deviceType:string = null): Observable<{ vendors: string[], supportVendors: string[] }> {
    let params = new HttpParams();
    if(deviceType)
      params = params.set("deviceType", deviceType);
    const headers = this.getHeaders();
    return this.httpClient.get<{ vendors: string[], supportVendors: string[] }>(environment.apiEndpoint + '/vendors', {headers,params});
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
