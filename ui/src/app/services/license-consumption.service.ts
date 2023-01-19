import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LicenseConsumption } from '../model/license-consumption.model';

@Injectable({
  providedIn: 'root'
})
export class LicenseConsumptionService {
  private readonly API_URL: string = environment.apiEndpoint + '/licenseUsageDetails';
  private readonly CONSUMPTION_EVENT_URL: string = environment.apiEndpoint + '/consumptionEvent';

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
   * add New License Usage details
   * @param data: LicenseConsumption
   * @returns: Observable 
   */
  public addLicenseConsumptionEvent(data: any) {
    return this.httpClient.post(this.CONSUMPTION_EVENT_URL, data);
  }
  /**
   * get particular LicenseConsumption details by parameters
   * @param filters: any 
   * @returns: Observable 
   */
  public getLicenseConsumptionDetails(filters: any) {
    const headers = this.getHeaders();
    let params = new HttpParams()
        .set('subaccountId', filters.subaccount)
        .set('licenseId', filters.licenseId)
        .set('view', filters.view);
    if (filters.year)
      params = params.set('year', filters.year);
    if (filters.month)
      params = params.set('month', filters.month);
    if (filters.type)
      params = params.set('type', filters.type);
    if (filters.project)
      params = params.set('projectId', filters.project);
    if (filters.startDate && filters.endDate) {
      params = params.set('startDate', filters.startDate);
      params = params.set('endDate', filters.endDate);
    }
    if (filters.limit)
      params = params.set('limit', filters.limit);
    if (filters.offset)
      params = params.set('offset', filters.offset);
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
