import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {BundleService} from './bundle.service';
import {environment} from '../../environments/environment';
import {Bundle} from "../model/bundle.model";
import {BundleServiceMock} from '../../test/mock/services/bundle-service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let customerService: BundleService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Customer service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        customerService = new BundleService(httpClientSpy);
    });

    it('should make the proper http calls on getBundleList', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(BundleServiceMock.getBundleList());

        customerService.getBundleList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/bundles', { headers });

        params.append('bundleName', 'Basic');
        customerService.getBundleList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/bundles', { headers });
    });

    it('should make the proper calls on getBundleDetails()', (done: DoneFn) => {
        const expectedBundle: Bundle = {
            name: "Custom",
            id: "26fbe6a2-fe72-4c1e-9728-b1777038b9c8"
        };
        httpClientSpy.get.and.returnValue(BundleServiceMock.getBundleDetails(expectedBundle.id));
        customerService.getBundleDetails(expectedBundle.id).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/bundles/' + expectedBundle.id, { headers });
    });
});
