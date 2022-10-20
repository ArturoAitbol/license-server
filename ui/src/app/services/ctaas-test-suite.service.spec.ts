import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {CtaasTestSuiteService} from './ctaas-test-suite.service';
import {environment} from '../../environments/environment';
import {TestSuite} from "../model/test-suite.model";
import {TestSuitesMock} from '../../test/mock/services/ctaas-test-suites.service.mock';
import { map } from 'rxjs/operators'

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let ctaasTestSuiteService: CtaasTestSuiteService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('CTaaS Test Suite service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        ctaasTestSuiteService = new CtaasTestSuiteService(httpClientSpy);
    });

    it('should make the proper calls on getTestSuitesBySubAccount()', (done: DoneFn) => {
        let params = new HttpParams();
        params = params.set('subaccountId', 'fbb2d912-b202-432d-8c07-dce0dad51f7f');
        httpClientSpy.get.and.returnValue(TestSuitesMock.getTestSuitesBySubAccount());
        ctaasTestSuiteService.getTestSuitesBySubAccount('fbb2d912-b202-432d-8c07-dce0dad51f7f').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        console.log(JSON.stringify(params));
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/ctaasTestSuites', { headers, params});
    });

    it('should make the proper http calls on updateTestSuite()', (done: DoneFn) => {
        const updatedTestSuite: TestSuite = {
            subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
            totalExecutions: "0",
            suiteName: "testSuiteV",
            id: "ca637f77-03eb-4fd1-a473-7bcaaa54302f",
            frequency: "Daily",
            service: "MS Teams",
            nextExecution: "2022-10-12 00:00:00"
        };
        httpClientSpy.put.and.returnValue(TestSuitesMock.updateTestSuite(updatedTestSuite));
        ctaasTestSuiteService.updateTestSuite(updatedTestSuite).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/ctaasTestSuites/' + updatedTestSuite.id, updatedTestSuite);
    });

    it('should make the proper http calls on deleteTestSuite()', (done: DoneFn) => {
        const deleteTestSuite: TestSuite = {
            subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
            totalExecutions: "0",
            suiteName: "testSuiteV",
            id: "ca637f77-03eb-4fd1-a473-7bcaaa54302f",
            frequency: "Daily",
            service: "MS Teams",
            nextExecution: "2022-10-12 00:00:00"
        };
        httpClientSpy.delete.and.returnValue(TestSuitesMock.deleteTestSuite());
        ctaasTestSuiteService.deleteTestSuite(deleteTestSuite.id).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/ctaasTestSuites/' + deleteTestSuite.id);
    });

    it('should make the proper calls on createTestSuite()', (done: DoneFn) => {
        const testSuiteToCreate: TestSuite = {
            subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
            totalExecutions: "0",
            suiteName: "testSuiteV",
            id: "5e3a1f0e-eacd-4f0f-8631-62f60f33bac8",
            frequency: "Daily",
            service: "service",
            nextExecution: "next execution"
        };
        httpClientSpy.post.and.returnValue(TestSuitesMock.createTestSuite());
        ctaasTestSuiteService.createTestSuite(testSuiteToCreate).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/ctaasTestSuites', testSuiteToCreate);
    });
});
