import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Project } from '../model/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL: string = environment.apiEndpoint + '/projects';
  private selectedSubAccount: string;
  constructor(private httpClient: HttpClient) { }

  public setSelectedSubAccount(value: string): void {
    this.selectedSubAccount = value;
  }

  public getSelectedSubAccount(): string {
    return this.selectedSubAccount;
  }

  /**
   * create new Project
   * @param data: Project
   * @returns: Observable 
   */
  public createProject(data: Project): Observable<any> {
    return this.httpClient.post(this.API_URL, data);
  }
  /**
   * get projects list
   * @returns: Observable 
   */
  public getProjectList(): Observable<Project[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<Project[]>(this.API_URL, { headers });
  }

  /**
   * update Project details
   * @param subAccount: Project 
   * @returns: Observable 
   */
  public updateProject(project: Project): Observable<any> {
    return this.httpClient.put(`${this.API_URL}/${project.id}`, project);
  }

  /**
   * delete selected Project by projectId
   * @param projectId: string 
   * @returns: Observable 
   */
  public deleteSubAccount(projectId: string): Observable<any> {
    return this.httpClient.delete(`${this.API_URL}/${projectId}`);
  }

  public getProjectDetailsBySubAccount(subaccountId: string): Observable<Project[]> {
    const headers = this.getHeaders();
    const params = new HttpParams().set('subaccountId', subaccountId);
    return this.httpClient.get<Project[]>(this.API_URL, { headers, params });
    // return this.httpClient.get<Project[]>(this.API_URL + "/" + subaccountId, { headers });
  }


  /**
   * set the header for the request
   * @returns: HttpHeaders 
   */
  public getHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
