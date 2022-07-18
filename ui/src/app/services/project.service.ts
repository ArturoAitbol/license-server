import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
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
   * @param project: Project 
   * @returns: Observable 
   */
  public updateProject(project: Project): Observable<any> {
    return this.httpClient.put(`${this.API_URL}/${project.id}`, project);
  }

  public closeProject(project: {id:string,status:string,closeDate:string}): Observable<any>{
    return this.httpClient.put<HttpResponse<any>>(`${this.API_URL}/${project.id}`, project,{observe:'response'});
  }

  /**
   * delete selected Project by projectId
   * @param projectId: string 
   * @returns: Observable 
   */
  public deleteProject(projectId: string): Observable<any> {
    return this.httpClient.delete<HttpResponse<any>>(`${this.API_URL}/${projectId}`,{observe: 'response'});
  }

  public getProjectDetailsBySubAccount(subaccountId: string, status?: string): Observable<Project[]> {
    const headers = this.getHeaders();
    let params = new HttpParams();
    params = params.set('subaccountId', subaccountId);
    if (status) params = params.set('status', status);
    return this.httpClient.get<Project[]>(this.API_URL, { headers, params });
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
