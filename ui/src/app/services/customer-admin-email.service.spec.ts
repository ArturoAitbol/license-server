import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {CustomerAdminEmailService} from './customer-admin-email.service';
import {environment} from '../../environments/environment';
import {CustomerAdminEmailServiceMock} from '../../test/mock/services/customer-admin-email.service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let customerService: CustomerAdminEmailService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Customer service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        customerService = new CustomerAdminEmailService(httpClientSpy);
    });

    it('should make the proper http calls on deleteAdminEmail()', (done: DoneFn) => {
        let adminEmail : {customerAdminEmail:string,customerId:string};
        adminEmail = CustomerAdminEmailServiceMock.customerAdminEmail;
        httpClientSpy.delete.and.returnValue(CustomerAdminEmailServiceMock.deleteAdminEmail());
        customerService.deleteAdminEmail(adminEmail.customerId).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/customerAdminEmails/' + adminEmail.customerId);
    });

    it('should make the proper calls on createAdminEmail()', (done: DoneFn) => {
        let adminEmail : {customerAdminEmail:string,customerId:string};
        adminEmail = CustomerAdminEmailServiceMock.customerAdminEmail;
        httpClientSpy.post.and.returnValue(CustomerAdminEmailServiceMock.createAdminEmail());
        customerService.createAdminEmail(adminEmail).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/customerAdminEmails', adminEmail);
    });
});
