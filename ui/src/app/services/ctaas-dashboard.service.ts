import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CtaasDashboardService {
  private readonly API_URL: string = environment.apiEndpoint + '/ctaasDashboard';
  private readonly FETCH_DASHBOARD_REPORT_URL: string = environment.apiEndpoint + '/ctaasDashboardReport/{subaccountId}';
  private readonly DOWNLOAD_DASHBOARD_REPORT_URL: string = this.API_URL + '/downloadReport';

  private detailedReportObj: any = {};

  constructor(private httpClient: HttpClient) { }

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

}
