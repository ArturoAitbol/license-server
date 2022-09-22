import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CtaasDashboardService {
  private readonly API_URL: string = environment.apiEndpoint + '/ctaasDashboard';
  private readonly FETCH_DASHBOARD_URL: string = this.API_URL + '/{subaccountId}';
  constructor(private httpClient: HttpClient) { }
  /**
   * fetch CTaaS Power BI dashboard required details like embedUrl & embedToken
   * @param subaccountId: string 
   * @returns: Observable<any> 
   */
  public getCtaasDashboardDetails(subaccountId: string): Observable<any> {
    const url = this.FETCH_DASHBOARD_URL.replace(/{subaccountId}/g, subaccountId);
    return this.httpClient.get(url);
  }
}
