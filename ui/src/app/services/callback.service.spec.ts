import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { CallbackService } from "./callback.service";
import { CallbackServiceMock } from "src/test/mock/services/callback-service.mock";
import { environment } from "src/environments/environment";

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let callbackService: CallbackService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Callback service http request test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        callbackService = new CallbackService(httpClientSpy);
    });

    it('should make the proper http calls on createCallback', (done:DoneFn) => {
        const params = new HttpParams();
        const userData: any = {
            "subaccountId": "2c8e386b-d1bd-48b3-b73a-12bfa5d00805",
            "role": "customer.SubaccountAdmin",
            "phoneNumber": "+1111111111",
            "jobTitle": "Subaccount Admin",
            "companyName": "TekVizion",
            "name": "TestSub",
            "email": "test-customer-subaccount-admin@tekvizionlabs.com",
            "notifications": "TYPE:Detailed,DAILY_REPORTS"
        };
        httpClientSpy.post.and.returnValue(CallbackServiceMock.createCallback(userData));
        callbackService.createCallback(userData).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/callback', userData);
    })
});