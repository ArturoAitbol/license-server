import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {ProjectService} from './project.service';
import {environment} from '../../environments/environment';
import {Project} from "../model/project.model";
import {ProjectServiceMock} from '../../test/mock/services/project-service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let projectService: ProjectService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Customer service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        projectService = new ProjectService(httpClientSpy);
    });

    it('should make the proper http calls on getProjectList()', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(ProjectServiceMock.getProjectList());

        projectService.getProjectList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/projects', { headers });

        params.append('projectName', 'Project-Test1');
        projectService.getProjectList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/projects', { headers });
    });

    it('should make the proper http calls on getProjectDetailsBySubAccount()', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(ProjectServiceMock.getProjectDetailsBySubAccount());

        projectService.getProjectList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/projects', { headers });

        params.append('subaccountId', 'eea5f3b8-37eb-41fe-adad-5f94da124a5a');
        params.append('status', 'Open');
        projectService.getProjectDetailsBySubAccount('eea5f3b8-37eb-41fe-adad-5f94da124a5a', 'Open').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/projects', { headers });
    });

    it('should make the proper http calls on getProjectDetailsByLicense()', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(ProjectServiceMock.getProjectDetailsByLicense());

        projectService.getProjectList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/projects', { headers });

        params.append('subaccountId', 'eea5f3b8-37eb-41fe-adad-5f94da124a5a');
        params.append('licenseId', 'eea5f3b8-37eb-41fe-adad-5f94da124a5a');
        params.append('status', 'Open');
        projectService.getProjectDetailsByLicense('eea5f3b8-37eb-41fe-adad-5f94da124a5a','eea5f3b8-37eb-41fe-adad-5f94da124a5a' , 'Open').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/projects', { headers });
    });

    it('should make the proper http calls on updateProject()', (done: DoneFn) => {
        const updatedProject: Project = {
            id: '459cf3ca-7365-47a1-8d9b-1abee381545c',
            projectName: 'Project-Test1',
            projectNumber: 'test-code',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            licenseId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-01-26 05:00:00',
            closeDate: '2022-05-29 05:00:00',
            status: 'Open'
        };
        httpClientSpy.put.and.returnValue(ProjectServiceMock.updateProject(updatedProject));
        projectService.updateProject(updatedProject).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/projects/' + updatedProject.id, updatedProject);
    });

    it('should make the proper http calls on deleteProject()', (done: DoneFn) => {
        const updatedProject: Project = {
            id: '459cf3ca-7365-47a1-8d9b-1abee381545c',
            projectName: 'Project-Test1',
            projectNumber: 'test-code',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            licenseId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-01-26 05:00:00',
            closeDate: '2022-05-29 05:00:00',
            status: 'Open'
        };
        httpClientSpy.delete.and.returnValue(ProjectServiceMock.deleteProject());
        projectService.deleteProject(updatedProject.id).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/projects/' + updatedProject.id, Object({ observe: 'response' }));
    });

    it('should make the proper calls on createProject()', (done: DoneFn) => {
        const projectToCreate: Project = {
            id: '459cf3ca-7365-47a1-8d9b-1abee381545c',
            projectName: 'Project-Test1',
            projectNumber: 'test-code',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            licenseId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-01-26 05:00:00',
            closeDate: '2022-05-29 05:00:00',
            status: 'Open'
        };
        httpClientSpy.post.and.returnValue(ProjectServiceMock.createProject());
        projectService.createProject(projectToCreate).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/projects', projectToCreate);
    });
    it('should make the proper http calls on closeProject()', (done: DoneFn) => {
        const updatedProject: Project = {
            id: '459cf3ca-7365-47a1-8d9b-1abee381545c',
            projectName: 'Project-Test1',
            projectNumber: 'test-code',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            licenseId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-01-26 05:00:00',
            closeDate: '2022-05-29 05:00:00',
            status: 'Open'
        };
        httpClientSpy.put.and.returnValue(ProjectServiceMock.closeProject());
        projectService.closeProject(updatedProject).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/projects/' + updatedProject.id, updatedProject,  Object({ observe: 'response'}));
    });
});
