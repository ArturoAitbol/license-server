import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { FeatureToggleMgmtServiceMock } from "src/test/mock/services/feature-toggle-mgmt-service.mock";
import { FeatureToggle } from "../model/feature-toggle.model";
import { FeatureToggleMgmtService } from "./feature-toggle-mgmt.service";

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let featureToggleService: FeatureToggleMgmtService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe(' feature toggle mgmt service http request test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        featureToggleService = new FeatureToggleMgmtService(httpClientSpy);
    });

    it('should make the proper http calls on getFeatureToggles', (done: DoneFn) => {
        httpClientSpy.get.and.returnValue(FeatureToggleMgmtServiceMock.getFeatureToggles());
        featureToggleService.getFeatureToggles().subscribe({
            next: () => {done();},
            error: done.fail
        });

        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/featureToggles', {headers});
    });

    it('should maje the proper http calls on createFeatureToggle', (done: DoneFn) => {
        const createFeatureToggle: FeatureToggle = {
            "author": "ogonzalez@tekvizionlabs.com",
            "name": "ad-customer-user-creation",
            "description": "Customer User Creation",
            "id": "950f47c7-a477-455b-b65b-331ecacc88dd",
            "exceptions": [
                {
                    "subaccountId": "f5a609c0-8b70-4a10-9dc8-9536bdb5652c",
                    "customerId": "7d133fd2-8228-44ff-9636-1881f58f2dbb",
                    "subaccountName": "Test RealCustomer - 360 Small",
                    "customerName": "Test RealCustomer",
                    "status": false
                }
            ],
            "status": false
        }
        httpClientSpy.post.and.returnValue(FeatureToggleMgmtServiceMock.createFeatureToggle(createFeatureToggle));
        featureToggleService.createFeatureToggle(createFeatureToggle).subscribe({
            next: () => {done();},
            error: done.fail
        });

        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/featureToggles',createFeatureToggle, {headers});
    });

    it('should make the proper http calls on modifyFeatureToggle', (done: DoneFn) => {
        const updateFeatureToggle: FeatureToggle = {
            "author": "ogonzalez@tekvizionlabs.com",
            "name": "ad-customer-user-creation",
            "description": "Customer User Creation",
            "id": "950f47c7-a477-455b-b65b-331ecacc88dd",
            "exceptions": [
                {
                    "subaccountId": "f5a609c0-8b70-4a10-9dc8-9536bdb5652c",
                    "customerId": "7d133fd2-8228-44ff-9636-1881f58f2dbb",
                    "subaccountName": "Test RealCustomer - 360 Small",
                    "customerName": "Test RealCustomer",
                    "status": false
                }
            ],
            "status": false
        }
        httpClientSpy.put.and.returnValue(FeatureToggleMgmtServiceMock.modifyFeatureToggle(updateFeatureToggle));
        featureToggleService.modifyFeatureToggle(updateFeatureToggle).subscribe({
            next: () => {done();},
            error: done.fail
        });

        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/featureToggles' + `/${updateFeatureToggle.id}`, updateFeatureToggle, { headers });
    });

    it('should make the proper http calls on deleteFeatureToggle', (done: DoneFn) => {
        const featureToggleId = "950f47c7-a477-455b-b65b-331ecacc88dd";
        httpClientSpy.delete.and.returnValue(FeatureToggleMgmtServiceMock.deleteFeatureToggle(featureToggleId));
        featureToggleService.deleteFeatureToggle(featureToggleId).subscribe({
            next: () => {done();},
            error: done.fail
        });

        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/featureToggles' + `/${featureToggleId}`, { headers });
    });

    it('should make the proper http calls on createException', (done: DoneFn) => {
        const testException = {
            exception: {
                featureToggleId:'950f47c7-a477-455b-b65b-331ecacc88dd',
                subaccountId:'f5a609c0-8b70-4a10-9dc8-9536bdb5652c',
                status: false
            }
        }

        httpClientSpy.post.and.returnValue(FeatureToggleMgmtServiceMock.createException(testException.exception));
        featureToggleService.createException(testException.exception).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/featureToggleExceptions', testException.exception, {headers});
    });

    it('should make the proper http calls on updateException', (done: DoneFn) => {
        const testException = {
            exception: {
                featureToggleId:'950f47c7-a477-455b-b65b-331ecacc88dd',
                subaccountId:'f5a609c0-8b70-4a10-9dc8-9536bdb5652c',
                status: false
            }
        }

        httpClientSpy.put.and.returnValue(FeatureToggleMgmtServiceMock.updateException(testException.exception));
        featureToggleService.updateException(testException.exception).subscribe({
            next: () => {done();},
            error: done.fail
        });

        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/featureToggleExceptions', testException.exception, { headers });
    }); 

    it('should make the proper http call on deleteException', (done: DoneFn) => {
        const featureToggleId = '950f47c7-a477-455b-b65b-331ecacc88dd';
        const subaccountId = 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c';

        httpClientSpy.delete.and.returnValue(FeatureToggleMgmtServiceMock.deleteException(featureToggleId, subaccountId));
        featureToggleService.deleteException(featureToggleId, subaccountId).subscribe({
            next: () => {done();},
            error: done.fail
        });

        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/featureToggleExceptions', {headers: headers, body: {featureToggleId: featureToggleId, subaccountId: subaccountId} });
    });
});
