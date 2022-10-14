import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IStakeholder } from '../model/stakeholder.model';
import { SubAccountService } from './sub-account.service';

@Injectable({
  providedIn: 'root'
})
export class StakeHolderService {
  private readonly API_URL: string = environment.apiEndpoint + '/subaccountStakeHolders';
  private readonly GET_STAKE_HOLDER_LIST: string = this.API_URL;
  private readonly CREATE_STAKE_HOLDER_API: string = this.API_URL;
  private readonly UPDATE_STAKE_HOLDER_API: string = this.API_URL + '/{email}';
  private readonly DELETE_STAKE_HOLDER_API: string = this.API_URL + '/{email}';

  constructor(private httpClient: HttpClient, private subaacountService: SubAccountService) { }
  /**
   * get stakeholder list details
   * @returns: Observable<any>
   */
  public getStakeholderList(): Observable<any> {
    let params = new HttpParams();
    const subaccountDetails = this.subaacountService.getSelectedSubAccount();
    const { id, subaccountId } = subaccountDetails;
    const SUB_ACCOUNT_ID = (id) ? id : subaccountId;
    params = params.set('subaccountId', SUB_ACCOUNT_ID);
    const headers = this.getHeaders();
    return this.httpClient.get(this.GET_STAKE_HOLDER_LIST, { headers, params });
  }
  /**
   * create stake holder
   * @param stakeholder: IStakeholder 
   * @returns: Observable<any> 
   */
  public createStakeholder(stakeholder: IStakeholder): Observable<any> {
    return this.httpClient.post(this.CREATE_STAKE_HOLDER_API, stakeholder);
  }
  /**
   * update stake holder details
   * @param stakeholder: IStakeholder 
   * @returns: Observable<any>  
   */
  public updateStakeholderDetails(stakeholder: IStakeholder): Observable<any> {
    const { subaccountAdminEmail } = stakeholder;
    const url = (this.UPDATE_STAKE_HOLDER_API.replace(/{email}/g, subaccountAdminEmail));
    return this.httpClient.put(url, stakeholder);
  }
  /**
   * delete stake holder by email
   * @param email: string 
   * @returns: Observable<any>  
   */
  public deleteStakeholder(email: string): Observable<any> {
    const url = (this.DELETE_STAKE_HOLDER_API.replace(/{email}/g, email));
    return this.httpClient.delete(url);
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
