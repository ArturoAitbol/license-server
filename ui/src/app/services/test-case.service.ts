import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TestCase } from '../model/test-case';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class TestCaseService {

    private apiURL: string = environment.apiEndpoint + '/testCase';
    private testCaseNameRegex = '^[a-zA-Z0-9 ]+[a-zA-Z0-9 ()[\\]{}|\\-_+=`~?,.:;!@#$%^&*"\'<>\\\\]*$';
    selectedTestCase: any;
    closeModal: EventEmitter<any>;
    private traceCaptureEnabled: any = [];

    constructor(private httpClient: HttpClient) {
        this.closeModal = new EventEmitter<any>();
    }

    /**
     * test case name regex pattern which accepts alphanumerics at start and doesn't allow forward slash(/) in test case
     * @returns: string
     */
    public get testCaseRxPattern(): string {
        return this.testCaseNameRegex;
    }

    public createTestCase(test: TestCase) {
        return this.httpClient.post(this.apiURL + '/create', test);
    }

    public editTestCase(test: TestCase) {
        return this.httpClient.put(this.apiURL + '/update/details/' + test.id, test);
    }

    public updateTestCase(test: TestCase) {
        return this.httpClient.put(this.apiURL + '/update/' + test.id, test);
    }

    public getTestCaseById(id: string) {
        return this.httpClient.get(this.apiURL + '/get/' + id);
    }

    public deleteTestCase(testCaseId: string) {
        return this.httpClient.delete(this.apiURL + '/delete/' + testCaseId);
    }

    public publish(id: string) {
        return this.httpClient.post(this.apiURL + '/publish/' + id, { id: id });
    }

    public deleteMultipleTests(ids: string[]) {
        return this.httpClient.post(this.apiURL + '/deleteMultiple', { testcaseIds: ids });
    }

    public getTestCases(url?: string) {
        const headers = this.getHeaders();
        return this.httpClient.get<TestCase[]>(this.apiURL + '/listAll', { headers });
    }

    public setTestCase(value: any) {
        this.selectedTestCase = value;
    }

    public getTestCase() {
        return this.selectedTestCase;
    }

    public exportTestCases(tests: any, fileName: string) {
        return this.httpClient.post(this.apiURL + '/exportTests', { tests: tests, fileName: fileName }, { responseType: 'arraybuffer' });
    }

    public importTestCases(files: File[]) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            const fileToUpload = files[i];
            formData.append('files', fileToUpload, fileToUpload.name);
        }
        return this.httpClient.post(this.apiURL + '/importTests/', formData);
    }

    public overwriteTestCases(tests: TestCase[]) {
        return this.httpClient.post(this.apiURL + '/overwrite', tests);
    }
    /**
     * for setting the value of traceCaptureEnabled for yealink
     */
    public setTraceCaptureEnabledToVendors(data: string) {
        this.traceCaptureEnabled = data;
    }

    public getTraceCaptureEnabledToVendors() {
        return this.traceCaptureEnabled;
    }

    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
