import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {SubAccountService} from './sub-account.service';
import {environment} from '../../environments/environment';
import {SubAccount} from "../model/subaccount.model";
import {SubaccountServiceMock} from '../../test/mock/services/subaccount-service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let subAccountService: SubAccountService;
const headers = new HttpHeaders().append('Content-Type', 'application/json');

describe('Customer service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        subAccountService = new SubAccountService(httpClientSpy);
    });

    it('should make the proper http calls on getSubAccountList()', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(SubaccountServiceMock.getSubAccountList());

        subAccountService.getSubAccountList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccounts', { headers, params });

        params.append('customerId', 'b566c90f-3671-47e3-b01e-c44684e28f99');
        params.append('customerName', 'Default');
        subAccountService.getSubAccountList('b566c90f-3671-47e3-b01e-c44684e28f99','Default').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccounts', { headers, params });

        subAccountService.getSubAccountList(null,'Default').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccounts', { headers, params });
    });

    it('should make the proper http calls on getSubAccountDetails()', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(SubaccountServiceMock.getSubAccountDetails());

        subAccountService.getSubAccountList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccounts', { headers, params });

        params.append('subaccountId', 'eea5f3b8-37eb-41fe-adad-5f94da124a5a');
        subAccountService.getSubAccountDetails('eea5f3b8-37eb-41fe-adad-5f94da124a5a').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccounts', { headers, params });
    });

    it('should make the proper http calls on updateSubAccount()', (done: DoneFn) => {
        const updatedSubaccount: SubAccount = {
            name: 'Default',
            customerId: 'b566c90f-3671-47e3-b01e-c44684e28f99',
            id: '89ef7e6a-367f-48c8-b69e-c52bf16a4e05',
            subaccountAdminEmails: ['adminEmail@unit-test.com']
        };
        httpClientSpy.put.and.returnValue(SubaccountServiceMock.updateSubAccount(updatedSubaccount));
        subAccountService.updateSubAccount(updatedSubaccount).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccounts/' + updatedSubaccount.id, updatedSubaccount);
    });

    it('should make the proper http calls on deleteSubAccount()', (done: DoneFn) => {
        const updatedSubaccount: SubAccount = {
            name: 'Default',
            customerId: 'b566c90f-3671-47e3-b01e-c44684e28f99',
            id: '89ef7e6a-367f-48c8-b69e-c52bf16a4e05',
            subaccountAdminEmails: ['adminEmail@unit-test.com']
        };
        httpClientSpy.delete.and.returnValue(SubaccountServiceMock.deleteSubAccount(updatedSubaccount.id));
        subAccountService.deleteSubAccount(updatedSubaccount.id).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccounts/' + updatedSubaccount.id);
    });

    it('should make the proper calls on createSubAccount()', (done: DoneFn) => {
        const subaccountToCreate: SubAccount = {
            name: 'Default',
            customerId: 'b566c90f-3671-47e3-b01e-c44684e28f99',
            id: '89ef7e6a-367f-48c8-b69e-c52bf16a4e05',
            subaccountAdminEmails: ['adminEmail@unit-test.com']
        };
        httpClientSpy.post.and.returnValue(SubaccountServiceMock.createSubAccount(subaccountToCreate));
        subAccountService.createSubAccount(subaccountToCreate).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccounts', subaccountToCreate);
    });
});
