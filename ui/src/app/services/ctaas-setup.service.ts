import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ICtaasSetup } from "../model/ctaas-setup.model";

@Injectable({
  providedIn: 'root'
})
export class CtaasSetupService {
  private readonly API_URL: string = environment.apiEndpoint + '/ctaasSetups';
  private readonly UPDATE_ONBOARD_DETAILS: string = this.API_URL + '/onBoarding/{setupId}';

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
    const params = new HttpParams().append('subaccountId', subaccountId);
    return this.httpClient.get<any>(this.API_URL, { headers, params });
  }

  public updateCtaasSetupDetailsById(id: string, ctaasSetup: ICtaasSetup) {
    const headers = this.getHeaders();
    return this.httpClient.put(this.API_URL + `/${id}`,ctaasSetup, { headers });
  }

  /**
   * update subaccount onboarding setup details
   * @param setupDetails: { onBoardingComplete: string, ctaasSetupId: string }
   * @returns: Observable<any> 
   */
  public updateSubaccountCtaasDetails(setupDetails: { onBoardingComplete: boolean, ctaasSetupId: string }) {
    const { ctaasSetupId } = setupDetails;
    const url = this.UPDATE_ONBOARD_DETAILS.replace(/{setupId}/g, ctaasSetupId);
    return this.httpClient.put(url, setupDetails);
  }


}
