import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserList } from '../model/user-list';

@Injectable({
  providedIn: 'root'
})
export class UserListService {
  private currentList: any;
  listOperationsHide: EventEmitter<any>;
  apiURL: string = environment.apiEndpoint + '/deviceUserList/list';

  constructor(private httpClient: HttpClient) { }

  /**
   * get all users list
   */
  public getUsersLists() {
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + '/', { headers });
  }
  /**
   * create user list
   * @param userList: any 
   */
  public createUsersList(userList: any) {
    return this.httpClient.post(this.apiURL + '/create', userList);
  }
  /**
   * update user list
   * @param userList: any 
   */
  public updateUsersList(userList: any) {
    return this.httpClient.put(this.apiURL + '/' + userList.id, userList);
  }
  /**
   * delete user list
   * @param id: string 
   */
  public deleteUserList(id: string) {
    return this.httpClient.delete(this.apiURL + '/' + id);
  }
  /**
   * delete multipl users list
   * @param ids: string[] 
   */
  public deleteMultipleLists(ids: string[]) {
    return this.httpClient.post(this.apiURL + '/deleteMultiple', { deviceUserListIds: ids });
  }

  public getUserListById(id: string) {
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + '/get/' + id, { headers });
  }

  public setList(list: any): void {
    this.currentList = list;
  }

  public getList(): UserList {
    return this.currentList;
  }

  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
