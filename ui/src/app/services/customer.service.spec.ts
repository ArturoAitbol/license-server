import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {CustomerService} from './customer.service';
import {environment} from '../../environments/environment';
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
});
