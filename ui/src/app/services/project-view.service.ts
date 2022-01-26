import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Project } from '../model/project';

@Injectable({
    providedIn: 'root'
})
export class ProjectViewService {
    apiURL: string = environment.apiEndpoint + '/project';
    createNewProject: EventEmitter<any>;
    createdProject: EventEmitter<any>;
    editedProject: EventEmitter<any>;
    cancelEdit: EventEmitter<any>;
    openSingle: EventEmitter<any>;
    updateTests: EventEmitter<any>;
    private selectedProject: any;

    constructor(private httpClient: HttpClient) {
        this.createNewProject = new EventEmitter<any>();
        this.createdProject = new EventEmitter<any>();
        this.editedProject = new EventEmitter<any>();
        this.cancelEdit = new EventEmitter<any>();
        this.openSingle = new EventEmitter<any>();
        this.updateTests = new EventEmitter<any>();
    }

    setProject(value: any) {
        this.selectedProject = value;
    }

    getProject() {
        return this.selectedProject;
    }

    public createProject(project: Project) {
        return this.httpClient.post(this.apiURL + '/create', project);
    }

    public updateProject(project: Project) {
        return this.httpClient.put(this.apiURL + '/update/', project);
    }

    public getLastRun(id: string) {
        return this.httpClient.get(this.apiURL + '/run/lastRun/' + id);
    }

    public getProjectById(id: string) {
        return this.httpClient.get(this.apiURL + '/get/' + id);
    }

    public deleteProject(id: string) {
        return this.httpClient.delete(this.apiURL + '/delete/' + id);
    }

    public deleteMultipleProjects(projects: any) {
        return this.httpClient.post(this.apiURL + '/deleteMultiple/', { projectIds: projects });
    }

    /**
     * fetch the projects list based on the selected date range
     * @param dateRange: {fromDate:value, toDate:value}
     */
    public getProjectsByDate(dateRange: any) {
        let params = new HttpParams();
        params = params.append('fromDate', dateRange.fromDate);
        params = params.append('toDate', dateRange.toDate);
        const headers = this.getHeaders();
        if (dateRange.fromDate && dateRange.toDate) {
            return this.httpClient.get<Project[]>(this.apiURL + '/listByDate', { params: params, headers });
        }
        // return this.httpClient.get<Project[]>(this.apiURL + '/listByDate', { headers });
    }

    public getRunInstancesByDate(dateRange: any, projectId: string) {
        let params = new HttpParams();
        params = params.append('fromDate', dateRange.fromDate);
        params = params.append('toDate', dateRange.toDate);
        const headers = this.getHeaders();
        if (dateRange.fromDate && dateRange.toDate) {
            return this.httpClient.get<Project[]>(this.apiURL + '/run/listByDate/' + projectId, { params: params, headers });
        }
    }

    /**
     * download the selected project entire report
     * @param projectId: string
     */
    public downloadProjectReport(downloadReportInformation:any , projectId: any) {
        let params = new HttpParams();
        const headers = this.getHeaders();
        if(downloadReportInformation.fromDate!==null && downloadReportInformation.toDate!==null){
            params = params.append('fromDate', downloadReportInformation.fromDate);
            params = params.append('toDate', downloadReportInformation.toDate);
            return this.httpClient.get(this.apiURL + '/download/report/' + projectId, { params: params, headers, responseType: 'arraybuffer' });
        }
        if(downloadReportInformation.numberOfRuns!==null ){
            params = params.append('numberOfRuns', downloadReportInformation.numberOfRuns);
            return this.httpClient.get(this.apiURL + '/download/report/' + projectId, { params: params, headers, responseType: 'arraybuffer' });
        }
    }

    /**
     * download the selected project entire logs
     * @param projectId: string
     */
    public downloadProjectLogs(projectId: string) {
        return this.httpClient.get(this.apiURL + '/download/logs/' + projectId, { responseType: 'arraybuffer' });
    }

    public getProjects(url?: string) {
        const headers = this.getHeaders();
        return this.httpClient.get<Project[]>(this.apiURL + '/listAll', { headers });
    }

    public fetchProjectPhoneList(id: string) {
        return this.httpClient.get(this.apiURL + '/get/phoneLists/' + id);
    }

   

    public runProject(url: string, id: string) {
        return this.httpClient.post(this.apiURL + '/run/start/' + url, id);
    }

    public stopProject(id: string) {
        return this.httpClient.post(this.apiURL + '/run/stop/' + id, id);
    }

    public pauseProject(id: string) {
        return this.httpClient.post(this.apiURL + '/run/pause/' + id, id);
    }

    public playProject(id: string) {
        return this.httpClient.post(this.apiURL + '/run/play/' + id, id);
    }

    public getRunInstances(id: string) {
        const headers = this.getHeaders();
        return this.httpClient.get<any[]>(this.apiURL + '/run/history/' + id, { headers });
    }

    public getTestResults(id: string) {
        const headers = this.getHeaders();
        return this.httpClient.get<any[]>(this.apiURL + '/run/results/' + id, { headers });
    }

    public getTestReport(id: string) {
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/run/subResult/report/' + id, { headers });
    }

    public downloadLogs(url: string) {
        const fullUrl = '/run/download/log/' + url;
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + fullUrl, { responseType: 'arraybuffer' });
    }

    public downloadReports(url: string) {
        const fullUrl = '/run/download/report/' + url;
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + fullUrl, { responseType: 'arraybuffer' });
    }

    /**
     * download the selected run instances reports
     * @param ids: string[]
     */
    public downloadRunInstanceReports(ids: string[]) {
        return this.httpClient.post(this.apiURL + '/run/download/instances/report', ids, { responseType: 'arraybuffer' });
    }

    /**
     * download the selected run instances logs
     * @param ids: string[]
     */
    public downloadRunInstanceLogs(ids: string[]) {
        return this.httpClient.post(this.apiURL + '/run/download/instances/logs', ids, { responseType: 'arraybuffer' });
    }

    public getProjectReports() {
        const headers = this.getHeaders();
        return this.httpClient.get<Project[]>(this.apiURL + '/listAll/reports', { headers });
    }

    public getProjectStatus(id: string) {
        return this.httpClient.get(this.apiURL + '/getStatus/' + id);
    }

    public getInstanceStatus(id: string) {
        return this.httpClient.get(this.apiURL + '/run/getStatus/' + id);
    }

    /**
     * validate the resources in test cases that are in the test plan
     * @param projectId: string
     */
    validateResources(projectId: string) {
        return this.httpClient.post(this.apiURL + '/validate/' + projectId, {});
    }

    /**
     * download the validate the resources in test cases that are in the test plan
     * @param projectId: string
     */
    downloadValidateResources(projectId: string) {
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/validate/download/' + projectId, { responseType: 'arraybuffer' });
    }

    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }

}
