import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CtaasSupportEmailService {
  private readonly API_URL: string = environment.apiEndpoint + '/ctaasSupportEmails';

  constructor(private httpClient: HttpClient) { }

  /**
   * create new support email
   * @returns: Observable
   * @param newSupportEmail
   */
  public createSupportEmail(newSupportEmail: {supportEmail: string, ctaasSetupId: string }) {
    return this.httpClient.post(this.API_URL, newSupportEmail);
  }

  /**
   * delete selected support email
   * @returns: Observable
   * @param email
   */
  public deleteSupportEmail(email: string) {
    return this.httpClient.delete(`${this.API_URL}/${email}`);
  }
}
