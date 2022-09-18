import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CtaasSetupService {
  private readonly API_URL: string = environment.apiEndpoint + '/ctaasSetups';

  constructor(private httpClient: HttpClient) { }

  /**
   * set the header for the request
   * @returns: HttpHeaders 
   */
  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }

  /**
   * fetch subaccount setup details
   * @returns: Observable 
   */
  public getSubaccountCtaasSetupDetails(subaccountId: string) {
    const headers = this.getHeaders();
    const params = new HttpParams();
    console.debug('subbaccount id | ', subaccountId);
    params.append('subaccountId', subaccountId);
    return this.httpClient.get<any>(this.API_URL, { headers, params });
  }

  public updateSubaccountCtaasDetails(setupDetails: { onBoardingComplete: boolean, ctaasSetupId: string }) {
    const { ctaasSetupId } = setupDetails;
    return this.httpClient.put(this.API_URL + '/onBoarding/' + ctaasSetupId, setupDetails);
  }


}
