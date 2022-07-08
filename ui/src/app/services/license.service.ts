import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { License } from '../model/license.model';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private readonly API_URL: string = environment.apiEndpoint + '/licenses';

  constructor(private httpClient: HttpClient) { }

  /**
   * purchase new License
   * @param data: License
   * @returns: Observable 
   */
  public purchaseLicense(data: License) {
    return this.httpClient.post(this.API_URL, data);
  }
  /**
   * get particular License details by licenseId
   * @param licenseId: string 
   * @returns: Observable 
   */
  public getLicenseDetails(licenseId: string) {
    const headers = this.getHeaders();
    return this.httpClient.get(`${this.API_URL}/${licenseId}`, { headers });
  }
  /**
   * fetch License details list
   * @returns: Observable 
   */
  public getLicenseList(subaccountId?: string, subaccountName?: string) {
    let params = new HttpParams();
    if (subaccountId)
      params = params.set('subaccountId', subaccountId);
    else if (subaccountName)
      params = params.set('subaccountName', subaccountName);
    const headers = this.getHeaders();
    return this.httpClient.get<License>(this.API_URL, { headers, params });
  }
  /**
   * update License details
   * @param License: License 
   * @returns: Observable 
   */
  public updateLicenseDetails(data: License) {
    return this.httpClient.put(`${this.API_URL}/${data.id}`, data);
  }

  /**
   * delete selected license by licenseId
   * @param licenseId: string 
   * @returns: Observable
   */
  public deleteLicense(licenseId: string) {
    return this.httpClient.delete(`${this.API_URL}/${licenseId}`);
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
