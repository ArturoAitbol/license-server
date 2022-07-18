import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LicenseConsumption } from '../model/license-consumption.model';

@Injectable({
  providedIn: 'root'
})
export class LicenseConsumptionService {
  private readonly API_URL: string = environment.apiEndpoint + '/licenseUsageDetails';

  constructor(private httpClient: HttpClient) { }

  /**
   * add License Usage details
   * @param data: LicenseConsumption
   * @returns: Observable 
   */
  public addLicenseConsumptionDetails(data: any) {
    return this.httpClient.post(this.API_URL, data);
  }
  /**
   * get particular LicenseConsumption details by licenseId
   * @param licenseId: string 
   * @returns: Observable 
   */
  public getLicenseConsumptionDetails(data: any) {
    const headers = this.getHeaders();
    let params = new HttpParams()
        .set('subaccountId', data.subaccount)
        .set('view', data.view);
    if (data.year)
      params = params.set('year', data.year);
    if (data.month)
      params = params.set('month', data.month);
    if (data.type)
      params = params.set('type', data.type);
    if (data.project)
      params = params.set('project', data.project);
    if (data.startDate && data.endDate) {
      params = params.set('startDate', data.startDate);
      params = params.set('endDate', data.endDate);
    }
    if (data.limit)
      params = params.set('limit', data.limit);
    if (data.offset)
      params = params.set('offset', data.offset);
    return this.httpClient.get(this.API_URL, { headers, params });
  }
  /**
   * update License Usage details
   * @param data: LicenseConsumption 
   * @returns: Observable 
   */
  public updateLicenseConsumptionDetails(data: LicenseConsumption) {
    return this.httpClient.put(`${this.API_URL}/${data.consumptionId}`, data);
  }
  /**
   * delete License Usage details
   * @param data: LicenseConsumption 
   * @returns: Observable 
   */
  public deleteLicenseConsumptionDetails(consumptionId: string) {
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
