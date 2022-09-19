import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IStakeholder } from '../model/stakeholder.model';

@Injectable({
  providedIn: 'root'
})
export class StakeHolderService {
  private readonly API_URL: string = environment.apiEndpoint + '/stakeholders';
  private readonly CREATE_STAKE_HOLDER_API = this.API_URL;
  private readonly UPDATE_STAKE_HOLDER_API = this.API_URL + '/update';
  private readonly DELETE_STAKE_HOLDER_API = this.API_URL + '/delete';

  constructor(private httpClient: HttpClient) { }
  /**
   * get stakeholder list details
   * @returns: Observable<any>
   */
  public getStakeholderList(): Observable<any> {
    return this.httpClient.get(this.CREATE_STAKE_HOLDER_API);
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
    return this.httpClient.put(this.UPDATE_STAKE_HOLDER_API, stakeholder);
  }
  /**
   * delete stake holder by id
   * @param id: string 
   * @returns: Observable<any>  
   */
  public deleteStakeholder(id: string): Observable<any> {
    return this.httpClient.delete(this.DELETE_STAKE_HOLDER_API + '/' + id);
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
