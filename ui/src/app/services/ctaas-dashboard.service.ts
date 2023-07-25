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
  private readonly FETCH_DASHBOARD_REPORT_URL: string = environment.apiEndpoint + '/ctaasDashboardReport/{subaccountId}';
  private readonly DOWNLOAD_DASHBOARD_REPORT_URL: string = this.API_URL + '/downloadReport';
  private readonly FETCH_HISTORICAL_DASHBOARD_URL: string = `${environment.apiEndpoint}/ctassHistoricalDashboard/{subaccountId}/{noteId}`;

  private currentReports: any;
  private detailedReportObj: any = {};

  constructor(private httpClient: HttpClient) { }

  //set current reports identifiers (type, timestamp)
  setReports(reports: any) {
    localStorage.setItem(Constants.CURRENT_REPORTS, JSON.stringify(reports));
    this.currentReports = reports;
  }

  //get current reports identifiers
  getReports(): any {
    return (this.currentReports) ? this.currentReports : JSON.parse(localStorage.getItem(Constants.CURRENT_REPORTS));
  }
  /**
   * set detailed report response by type
   * @param obj: any 
   */
  setDetailedReportObject(obj: any): void { this.detailedReportObj = obj; }
  /**
   * get detailed report response object
   * @returns: any 
   */
  getDetailedReportyObject(): any { return this.detailedReportObj; }

  /**
   * fetch SpotLight Power BI reports
   * @param subaccountId: string 
   * @param reportType: string 
   * @param timestampId: string
   * @returns: Observable<any> 
   */
  public getCtaasDashboardDetails(subaccountId: string, reportType: string, timestampId?: string): Observable<any> {
    let params = new HttpParams();
    if (timestampId)
    params = params.set('timestampId', timestampId);
    const url = this.FETCH_DASHBOARD_URL.replace(/{subaccountId}/g, subaccountId).replace(/{reportType}/g, reportType);
    return this.httpClient.get(url, { params });
  }
  /**
   * fetch Dashboard Report by type
   * @param subaccountId: string 
   * @param reportType: string 
   * @returns: Observable<any>  
   */
  public getCtaasDashboardDetailedReport(subaccountId: string, reportType: string, startDateStr: string, endDateStr: string, status: string, regions: string, users: string, polqaCalls: boolean): Observable<any> {
    const url = this.FETCH_DASHBOARD_REPORT_URL.replace(/{subaccountId}/g, subaccountId);
    let params = new HttpParams()
      .set('startDate', startDateStr)
      .set('endDate', endDateStr);
    if (reportType != '') params = params.set('reportType', reportType);
    if (status != '') params = params.set('status', status);
    if (regions != '') params = params.set('regions', regions);
    if (users != '') params = params.set('users', users);
    if (polqaCalls) params = params.set('polqaCalls', 'true');
    return this.httpClient.get(url, { params });
  }
  /**
   * download detailed report in excel by type
   * @param detailedResponseObj: any 
   * @returns : Observable<any> 
   */
  public downloadCtaasDashboardDetailedReport(detailedResponseObj: any): Observable<any> {
    return this.httpClient.post(this.DOWNLOAD_DASHBOARD_REPORT_URL, { detailedReport: detailedResponseObj }, { responseType: 'blob' });
  }

  public getCtaasHistoricalDashboardDetails(subaccountId: string, noteId: string): Observable<any> {
    const url = this.FETCH_HISTORICAL_DASHBOARD_URL.replace(/{subaccountId}/g,subaccountId).replace(/{noteId}/g,noteId);
    return this.httpClient.get(url); 
  }
}
