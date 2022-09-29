import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {SubaccountAdminEmailService} from './subaccount-admin-email.service';
import {environment} from '../../environments/environment';
import {SubaccountAdminEmailServiceMock} from '../../test/mock/services/subaccount-admin-email.service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let subaccountAdminEmailService: SubaccountAdminEmailService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Customer service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        subaccountAdminEmailService = new SubaccountAdminEmailService(httpClientSpy);
    });

    it('should make the proper http calls on deleteAdminEmail()', (done: DoneFn) => {
        let subaccountAdminEmail : {subaccountAdminEmail:string,subaccountId:string};
        subaccountAdminEmail = SubaccountAdminEmailServiceMock.subaccountAdminEmail;
        httpClientSpy.delete.and.returnValue(SubaccountAdminEmailServiceMock.deleteAdminEmail());
        subaccountAdminEmailService.deleteAdminEmail(subaccountAdminEmail.subaccountId).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccountAdminEmails/' + subaccountAdminEmail.subaccountId);
    });

    it('should make the proper calls on createAdminEmail()', (done: DoneFn) => {
        let newAdminEmail: {
            subaccountAdminEmail: string; 
            // name: string; 
            subaccountId: string;
        };
        newAdminEmail = SubaccountAdminEmailServiceMock.subaccountAdminEmail;
        httpClientSpy.post.and.returnValue(SubaccountAdminEmailServiceMock.createAdminEmail());
        subaccountAdminEmailService.createAdminEmail(newAdminEmail).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccountAdminEmails', newAdminEmail);
    });
});
