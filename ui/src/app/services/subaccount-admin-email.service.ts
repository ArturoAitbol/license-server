import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SubaccountAdminEmailService {
  private readonly API_URL: string = environment.apiEndpoint + '/subaccountAdminEmails';

  constructor(private httpClient: HttpClient) { }

  /**
   * create new customer admin email
   * @returns: Observable
   * @param newAdminEmail
   */
  public createAdminEmail(newAdminEmail: {subaccountAdminEmail: string, subaccountId: string }) {
    return this.httpClient.post(this.API_URL, newAdminEmail);
  }

  /**
   * delete selected customer by customerId
   * @returns: Observable
   * @param email
   */
  public deleteAdminEmail(email: string) {
    return this.httpClient.delete(`${this.API_URL}/${email}`);
  }

  /**
   * set the header for the request
   * @returns: HttpHeaders 
   */
  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
