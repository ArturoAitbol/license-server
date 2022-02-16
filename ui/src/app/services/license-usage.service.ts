import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LicenseUsage } from '../model/license-usage.model';

@Injectable({
  providedIn: 'root'
})
export class LicenseUsageService {
  private readonly API_URL: string = environment.apiEndpoint + '/licenseUsageDetails';

  constructor(private httpClient: HttpClient) { }

  /**
   * add License Usage details
   * @param data: LicenseUsage
   * @returns: Observable 
   */
  public addLicenseUsageDetails(data: LicenseUsage) {
    return this.httpClient.post(this.API_URL, { data });
  }
  /**
   * get particular LicenseUsage details by licenseId
   * @param licenseId: string 
   * @returns: Observable 
   */
  public getLicenseDetails(data: { subaccount: string, month: string, view: string }) {
    const headers = this.getHeaders();
    const params = new HttpParams();
    params.append('subaccount', data.subaccount);
    params.append('view', data.view);
    if (data.month) {
      params.append('month', data.month);
    }
    return this.httpClient.get(`${this.API_URL}`, { headers, params });
  }
  /**
   * update License Usage details
   * @param data: LicenseUsage 
   * @returns: Observable 
   */
  public updateLicenseUsageDetails(data: LicenseUsage) {
    return this.httpClient.put(`${this.API_URL}/${data.consumptionId}`, data);
  }
  /**
   * delete License Usage details
   * @param data: LicenseUsage 
   * @returns: Observable 
   */
  public deleteLicenseUsageDetails(consumptionId: string) {
    return this.httpClient.delete(`${this.API_URL}/${consumptionId}`);
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
