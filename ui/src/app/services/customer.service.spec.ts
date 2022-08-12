import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {CustomerService} from './customer.service';
import {environment} from '../../environments/environment';
import {Customer} from "../model/customer.model";
import {CustomerServiceMock} from '../../test/mock/services/customer-service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let customerService: CustomerService;

describe('Customer service http requests test', () => {
    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        customerService = new CustomerService(httpClientSpy);
    });

    it('should return expected customer list', (done: DoneFn) => {
        // raw customer list object
        const expectedCustomers: any = CustomerServiceMock.customerListValue;

        // observable customer list response
        httpClientSpy.get.and.returnValue(CustomerServiceMock.getCustomerList());

        customerService.getCustomerList().subscribe({
            next: customer => {
                expect(customer).toEqual(expectedCustomers);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
    });
    it('should update customer Name and return Customer with updated name', (done: DoneFn) => {
        const updatedCustomer: Customer = {
            customerType: 'Reseller',
            testCustomer: true,
            customerName: 'new test customer s updated',
            id: '19660f52-4f35-489d-ae44-80161cbb7bd4',
            adminEmails: ['samuel-vs6+6@hotmail.com']
        };

        const expectedCustomer: Customer = CustomerServiceMock.updatedMockCustomer;
        httpClientSpy.put.and.returnValue(CustomerServiceMock.updateCustomer(updatedCustomer));
        customerService.updateCustomer(updatedCustomer).subscribe({
            next: customer => {
                expect(customer).toEqual(expectedCustomer);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledTimes(1);
    });
});
