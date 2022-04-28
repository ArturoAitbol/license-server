import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsageDetailService {
  private readonly API_URL: string = environment.apiEndpoint + '/usageDetails';
  private selectedUsageDetail: string;
  constructor(private httpClient: HttpClient) { }

  public setSelectedUsageDetail(value: string): void {
    this.selectedUsageDetail = value;
  }

  public getSelectedUsageDetail(): string {
    return this.selectedUsageDetail;
  }

  /**
   * create new UsageDetail
   * @param data: UsageDetail
   * @returns: Observable 
   */
  public createUsageDetail(data: any): Observable<any> {
    return this.httpClient.post(this.API_URL, data);
  }
  /**
   * get usageDetails list
   * @returns: Observable 
   */
  public getUsageDetailList(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(this.API_URL, { headers });
  }

  /**
   * update UsageDetail details
   * @param subAccount: UsageDetail 
   * @returns: Observable 
   */
  public updateUsageDetail(usageDetail: any): Observable<any> {
    return this.httpClient.put(`${this.API_URL}/${usageDetail.id}`, usageDetail);
  }

  /**
   * delete selected UsageDetail by usageDetailId
   * @param usageDetailId: string 
   * @returns: Observable 
   */
  public deleteUsageDetail(usageDetailId: string): Observable<any> {
    return this.httpClient.delete(`${this.API_URL}/${usageDetailId}`);
  }

  public getUsageDetailDetailsByConsumptionId(consumptionId: string): Observable<any[]> {
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
