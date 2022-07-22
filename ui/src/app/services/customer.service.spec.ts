import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {of} from 'rxjs';
import {CustomerService} from './customer.service';
import {Customer} from '../model/customer.model';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let customerService: CustomerService;

beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    customerService = new CustomerService(httpClientSpy);
});

it('should return expected customer (HttpClient called once)', (done: DoneFn) => {
    const expectedCustomers: any = {
        customers: [
            {
                customerType: 'MSP',
                testCustomer: true,
                name: 'Test Customer v1',
                id: '1111-1111-1111-1111-1111'
            },
            {
                customerType: 'MSP',
                testCustomer: true,
                name: 'Test Customer v1',
                id: '2222-2222-2222-2222-2222'
            }
        ]
    };

    httpClientSpy.get.and.returnValue(of(expectedCustomers));

    customerService.getCustomerList().subscribe({
        next: customer => {
            expect(customer)
                .withContext('expected customer')
                .toEqual(expectedCustomers);
            done();
        },
        error: done.fail
    });
});

it('should return an error when the server returns a 404', (done: DoneFn) => {
    const errorResponse = new HttpErrorResponse({
        error: 'test 404 error',
        status: 404, statusText: 'Not Found'
    });

    httpClientSpy.get.and.returnValue(of(errorResponse));

    customerService.getCustomerList().subscribe({
        next: customer => done.fail('expected an error, not customer'),
        error: error  => {
            expect(error.message).toContain('test 404 error');
            done();
        }
    });
});
