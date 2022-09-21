import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CtaasTestSuiteService {
  private readonly API_URL: string = environment.apiEndpoint + '/ctaasTestSuites';
  private selectedSubAccount: string;
  constructor(private httpClient: HttpClient) { }

  public setSelectedSubAccount(value: string): void {
    this.selectedSubAccount = value;
  }

  public getSelectedSubAccount(): string {
    return this.selectedSubAccount;
  }

  public getTestSuitesBySubAccount(subaccountId: string): Observable<any[]> {
    const headers = this.getHeaders();
    let params = new HttpParams();
    params = params.set('subaccountId', subaccountId);
    return this.httpClient.get<any[]>(this.API_URL, { headers, params });
  }

  public getHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
