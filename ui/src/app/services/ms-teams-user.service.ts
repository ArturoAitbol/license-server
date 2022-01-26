import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { MSTeamsUser } from '../model/ms-team-user';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MSTeamsUserService {

  apiURL: string = environment.apiEndpoint + '/deviceUser';
  private userDetails: any = {};
  constructor(private httpClient: HttpClient) { }

  public setUserDetailsForEdit(user: MSTeamsUser): void {
    this.userDetails = user;
  }

  public getUserDetails(): MSTeamsUser {
    return this.userDetails;
  }
  /**
   * create MS Teams User
   * @param user: MSTeamsUser
   */
  public createUser(user: MSTeamsUser) {
    return this.httpClient.post(this.apiURL + '/create', user);
  }
  /**
   * update MS Teams User
   * @param user: MSTeamsUser
   */
  public updateUser(user: MSTeamsUser) {
    return this.httpClient.put(this.apiURL + '/update/' + user.id, user);
  }
  /**
   * delete particular User
   * @param id: string 
   */
  public deleteUser(id: string) {
    return this.httpClient.delete(this.apiURL + '/delete/' + id);
  }
  /**
   * delete multiple Users
   * @param ids: string[] 
   */
  public deleteMultipleUsers(ids: string[]) {
    return this.httpClient.post(this.apiURL + '/deleteMultiple', {ids});
  }
  /**
   * get all MS Teams Users
   */
  public getAllUsers() {
    const headers = this.getHeaders();
    const url = this.apiURL + '/listAll';
    return this.httpClient.get(url, { headers }).pipe(shareReplay(1));
  }
  /**
   * set Content Type to the headers
   */
  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
