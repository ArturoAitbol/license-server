import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constants } from '../helpers/constants';
import { SubAccount } from '../model/subaccount.model';

@Injectable({
  providedIn: 'root'
})
export class SubAccountService {
  private readonly API_URL: string = environment.apiEndpoint + '/subaccounts';
  private selectedSubAccount: any;
  subaccountData =  new Subject<any>();

  constructor(private httpClient: HttpClient) { }

  //set the selected subaccount
  setSelectedSubAccount(subaccount: any) { 
    sessionStorage.setItem(Constants.SELECTED_SUBACCOUNT, JSON.stringify(subaccount));
    this.selectedSubAccount = subaccount;

    this.subaccountData.next(this.selectedSubAccount);
  }
  //get the selected subaccount
  getSelectedSubAccount() {
    if(this.selectedSubAccount?.id)
      return this.selectedSubAccount;
    if(sessionStorage.getItem(Constants.SELECTED_SUBACCOUNT))
      return JSON.parse(sessionStorage.getItem(Constants.SELECTED_SUBACCOUNT));
    //if the other sentences aren't matched return a default empty template
    return { id: "", name: "", customerName: "" };
  }

  /**
   * create new SubAccount
   * @param data: SubAccount
   * @returns: Observable 
   */
  public createSubAccount(data: SubAccount) {
    return this.httpClient.post(this.API_URL, data);
  }
  /**
   * get particular subaccount details by subaccountId
   * @param subaccountId: string 
   * @returns: Observable 
   */
  public getSubAccountDetails(subaccountId: string) {
    const headers = this.getHeaders();
    return this.httpClient.get(`${this.API_URL}/${subaccountId}`, { headers });
  }
  /**
   * fetch SubAccount details list
   * @returns: Observable 
   */
  public getSubAccountList(customerId?: string, customerName?: string) {
    let params = new HttpParams();
    if (customerId) {
      params = params.append('customerId', customerId);
    } else if (customerName) {
      params = params.append('customerName', customerName);
    }

    const headers = this.getHeaders();
    return this.httpClient.get<SubAccount>(this.API_URL, { headers, params });
  }
  /**
   * fetch SubAccount details list for a CustomerUser
   * @returns: Observable 
   */
  public getSubAccountListForCustomerUser() {
    const params = new HttpParams().append('filterByCustomerUser', true);

    const headers = this.getHeaders();
    return this.httpClient.get<SubAccount>(this.API_URL, { headers, params });
  }
  /**
   * update SubAccount details
   * @param subaccount: SubAccount 
   * @returns: Observable 
   */
  public updateSubAccount(subaccount: any) {
    return this.httpClient.put(`${this.API_URL}/${subaccount.id}`, subaccount);
  }

  /**
   * delete selected SubAccount by subaccountId
   * @param subaccountId: string 
   * @returns: Observable 
   */
  public deleteSubAccount(subaccountId: string) {
    return this.httpClient.delete(`${this.API_URL}/${subaccountId}`);
  }


  /**
   * set the header for the request
   * @returns: HttpHeaders 
   */
  public getHeaders() {
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    return headers;
  }
}
