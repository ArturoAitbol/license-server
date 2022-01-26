import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TestPlan } from '../model/test-plan';
import { TestCase } from '../model/test-case';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class TestPlansService {
    createNewPlan: EventEmitter<any>;
    apiURL: string = environment.apiEndpoint + '/testPlan';
    closeModal: EventEmitter<any>;
    refresh: EventEmitter<any>;
    selectedTestPlan: any;

    constructor(private httpClient: HttpClient) {
        this.createNewPlan = new EventEmitter<any>();
        this.closeModal = new EventEmitter<any>();
        this.refresh = new EventEmitter<any>();
    }

    public createTestPlan(testPlan: TestPlan) {
        return this.httpClient.post(this.apiURL + '/create', testPlan);
    }

    public updateTestPlan(testPlan: TestPlan) {
        return this.httpClient.put(this.apiURL + '/update/' + testPlan.id, testPlan);
    }

    public getTestPlanById(id: string) {
        return this.httpClient.get(this.apiURL + '/get/' + id);
    }

    public deleteTestPlan(id: string) {
        return this.httpClient.delete(this.apiURL + '/delete/' + id);
    }

    public deleteMultiplePlans(ids: string[]) {
        return this.httpClient.post(this.apiURL + '/deleteMultiple', { testPlanIds: ids });
    }

    public addTestToPlan(testPlanId: string, test: TestCase) {
        return this.httpClient.post(this.apiURL + '/addTestCase/' + testPlanId, test);
    }
    public swapTestCase(testPlanId: string, testCases: any) {
        return this.httpClient.post(this.apiURL + '/swapTestCases/' + testPlanId, testCases);
    }
    public addTestsToPlan(testPlanId: string, tests: any) {
        return this.httpClient.post(this.apiURL + '/addTestCases/' + testPlanId, tests);
    }

    public removeTestFromPlan(testPlanId: string, testCaseId: string) {
        return this.httpClient.post(this.apiURL + '/removeTestCase/' + testPlanId + '/' + testCaseId, testCaseId);
    }

    public removeTestsFromPlan(testPlanId: string, ids: string[]) {
        return this.httpClient.post(this.apiURL + '/removeTestCase/' + testPlanId, { testcaseIds: ids });
    }

    public getTestPlans(url?: string) {
        const headers = this.getHeaders();
        return this.httpClient.get<TestPlan[]>(this.apiURL + '/listAll', { headers });
    }

    getRequiredPhonePools(id: string): any {
        return this.httpClient.get(this.apiURL + '/getRequiredPhonePools/' + id);
    }

    getRequiredResources(id: string): any {
        return this.httpClient.get(this.apiURL + '/getRequiredResources/' + id);
    }

    doesProjectHasDUT(testPlanId: string) {
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/containsDut/' + testPlanId, { headers: headers });
    }

    setTestPlan(value: any) {
        this.selectedTestPlan = value;
    }
    getTestPlan() {
        return this.selectedTestPlan;
    }
    public exportTestPlans(testPlanId: string, fileName: string) {
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/exportPlan/'+testPlanId, { responseType: 'arraybuffer' });
    }
    public importTestPlans(files: File[], importFileName:string) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            const fileToUpload = files[i];
            formData.append('files', fileToUpload, fileToUpload.name );
        }
        formData.append('name', importFileName);
        return this.httpClient.post(this.apiURL + '/importPlan', formData);
    }
    public getHeaders() {
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
