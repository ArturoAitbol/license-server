import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsageDetailService {
  private readonly API_URL: string = environment.apiEndpoint + '/usageDetails';
  constructor(private httpClient: HttpClient) { }
  /**
   * create new UsageDetails
   * @param data: UsageDetails
   * @returns: Observable 
   */
  public createUsageDetails(data: any): Observable<any> {
    return this.httpClient.post(`${this.API_URL}/${data.id}`, data);
  }

  /**
   * delete selected UsageDetails by ids
   * @param data: UsageDetails
   * @returns: Observable 
   */
  public deleteUsageDetails(data: any): Observable<any> {
    return this.httpClient.put(`${this.API_URL}/${data.id}`, data);
  }

  public getUsageDetailsByConsumptionId(consumptionId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(`${this.API_URL}/${consumptionId}`, { headers });
  }

  /**
   * set the header for the request
   * @returns: HttpHeaders 
   */
  public getHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
