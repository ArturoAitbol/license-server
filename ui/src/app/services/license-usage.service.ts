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
  public getLicenseDetails(data: { subaccount: string, view: string, month?: string, year?: string }) {
    const headers = this.getHeaders();
    let url = this.API_URL + '/' + data.subaccount + '/' + data.view + '/';
    if (data.year) {
      url += '/' + data.year;
      if (data.month) {
        url += '/' + data.month;
      }
    }
    return this.httpClient.get(`${url}`, { headers });
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
