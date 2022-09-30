import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constants } from '../helpers/constants';
import { IUserProfile } from '../model/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly API_URL: string = environment.apiEndpoint + '/authUserProfile';
  private readonly GET_USER_PROFILE_DETAILS: string = this.API_URL;
  private readonly CREATE_USER_PROFILE_URL: string = this.API_URL;
  private readonly UPDATE_USER_PROFILE_URL: string = this.API_URL;
  private userProfileDetails: IUserProfile;

  constructor(private httpClient: HttpClient) { }
  /**
   * get user profile details
   * @returns: Observable<IUserProfile> 
   */
  public getUserProfileDetails(): Observable<IUserProfile> {
    const headers = this.getHeaders();
    return this.httpClient.get<IUserProfile>(this.GET_USER_PROFILE_DETAILS, { headers });
  }
  /**
   * 
   * @param userDetails: IUserProfile 
   * @returns 
   */
  public createUserProfile(userDetails: IUserProfile): Observable<any> {
    return this.httpClient.post<IUserProfile>(this.CREATE_USER_PROFILE_URL, userDetails);
  }
  /**
   * update user profile details
   * @param userDetails: IUserProfile 
   * @returns: Observable<any>
   */
  public updateUserProfile(userDetails: IUserProfile): Observable<any> {
    return this.httpClient.put<IUserProfile>(this.UPDATE_USER_PROFILE_URL, userDetails);
  }
  /**
   * set the header for the request
   * @returns: HttpHeaders
   */
  private getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
  /**
   * set logged in subaccount user profile details
   * @param details: IUserProfile 
   */
  setSubaccountUserProfileDetails(details: IUserProfile) {
    localStorage.setItem(Constants.SUBACCOUNT_USER_PROFILE, JSON.stringify(details)),
      this.userProfileDetails = details;
  }
  /**
   * get subaccount user profile details
   * @returns: IUserProfile 
   */
  getSubaccountUserProfileDetails(): IUserProfile {
    return (this.userProfileDetails) ? this.userProfileDetails : JSON.parse(localStorage.getItem(Constants.SUBACCOUNT_USER_PROFILE));
  }

}
