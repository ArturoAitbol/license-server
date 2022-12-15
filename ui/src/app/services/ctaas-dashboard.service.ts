import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constants } from '../helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class CtaasDashboardService {
  private readonly API_URL: string = environment.apiEndpoint + '/ctaasDashboard';
  private readonly FETCH_DASHBOARD_URL: string = this.API_URL + '/{subaccountId}/{reportType}';
  
  private currentReports: any;

  constructor(private httpClient: HttpClient) { }

  //set current reports identifiers (type, timestamp)
  setReports(reports: any) {
    localStorage.setItem(Constants.CURRENT_REPORTS, JSON.stringify(reports));
    this.currentReports = reports;
  }

  //get current reports identifiers
  getReports() : any {
    return (this.currentReports) ? this.currentReports : JSON.parse(localStorage.getItem(Constants.CURRENT_REPORTS));
  }

  /**
   * fetch SpotLight Power BI reports
   * @param subaccountId: string 
   * @param reportType: string 
   * @param timestampId: string
   * @returns: Observable<any> 
   */
  public getCtaasDashboardDetails(subaccountId: string, reportType: string, timestampId?: string): Observable<any> {
    let params;
    if(timestampId)
      params = new HttpParams().append('timestampId', timestampId);
    const url = this.FETCH_DASHBOARD_URL.replace(/{subaccountId}/g, subaccountId).replace(/{reportType}/g, reportType);
    return this.httpClient.get(url,{params});
  }
}
