import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {CustomerService} from './customer.service';
import {environment} from '../../environments/environment';
import {Customer} from "../model/customer.model";
import {CustomerServiceMock} from '../../test/mock/services/customer-service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let customerService: CustomerService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Customer service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        customerService = new CustomerService(httpClientSpy);
    });

    it('should make the proper http calls on getCustomerList', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(CustomerServiceMock.getCustomerList());

        customerService.getCustomerList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/customers', { headers, params });

        params.append('customerName', 'test customer name');
        customerService.getCustomerList('test customer name').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/customers', { headers, params });
    });

    it('should make the proper http calls on updateCustomer()', (done: DoneFn) => {
        const updatedCustomer: any = {
            customerType: 'Reseller',
            testCustomer: true,
            customerName: 'new update customer value',
            id: '19660f52-4f35-489d-ae44-80161cbb7bd4',
            // adminEmails: ['adminEmail@unit-test.com']
        };
        httpClientSpy.put.and.returnValue(CustomerServiceMock.updateCustomer(updatedCustomer));
        customerService.updateCustomer(updatedCustomer).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/customers/' + updatedCustomer.id, updatedCustomer);
    });

    it('should make the proper http calls on deleteCustomer()', (done: DoneFn) => {
        const updatedCustomer: Customer = {
            customerType: 'Reseller',
            testCustomer: true,
            customerName: 'new update customer value',
            id: '19660f52-4f35-489d-ae44-80161cbb7bd4',
            adminEmails: ['adminEmail@unit-test.com']
        };
        httpClientSpy.delete.and.returnValue(CustomerServiceMock.deleteCustomer(updatedCustomer.id));
        customerService.deleteCustomer(updatedCustomer.id).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/customers/' + updatedCustomer.id);
    });

    it('should make the proper calls on createCustomer()', (done: DoneFn) => {
        const customerToCreate: Customer = {
            customerType: 'Reseller',
            testCustomer: true,
            customerName: 'new update customer value',
            id: '19660f52-4f35-489d-ae44-80161cbb7bd4',
            adminEmails: ['adminEmail@unit-test.com']
        };
        httpClientSpy.post.and.returnValue(CustomerServiceMock.createCustomer(customerToCreate));
        customerService.createCustomer(customerToCreate).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/customers', customerToCreate);
    });


    it('should make the proper calls on getCustomerById()', (done: DoneFn) => {
        const expectedCustomer: Customer = {
            customerType: 'Reseller',
            testCustomer: true,
            customerName: 'new update customer value',
            id: '19660f52-4f35-489d-ae44-80161cbb7bd4',
            adminEmails: ['adminEmail@unit-test.com']
        };
        httpClientSpy.get.and.returnValue(CustomerServiceMock.getCustomerById(expectedCustomer.id));
        customerService.getCustomerById(expectedCustomer.id).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/customers/' + expectedCustomer.id, { headers });
    });
});
