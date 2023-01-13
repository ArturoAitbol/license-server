import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ITestReports, TestReportsAPIResponse } from '../model/test-reports.model';

@Injectable({
  providedIn: 'root'
})
export class TestReportsService {

  private readonly API_URL: string = environment.apiEndpoint + '/reports';
  private readonly DOWNLOAD_REPORT_URL: string = this.API_URL + '/downloadReport/{subaccountId}/{reportType}';
  subaacountService: any;

  constructor(private httpClient: HttpClient) { }

  public getTestReportsList(subaccountId?: string, reportType?:string, date?:string) {
    let params = new HttpParams();
    if (subaccountId) {
      params = params.set('date', date);
      params = params.set('reportType', reportType);
    }
    const headers = this.getHeaders();
    return this.httpClient.get<ITestReports>(`${this.API_URL}/${subaccountId}`, { headers, params });
  }

  public getTestReport(subaccountId: string, reportType: string): Observable<any> {
    const url = this.DOWNLOAD_REPORT_URL.replace(/{subaccountId}/g, subaccountId).replace(/{reportType}/g, reportType);
    return this.httpClient.get(url);
  }

  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
