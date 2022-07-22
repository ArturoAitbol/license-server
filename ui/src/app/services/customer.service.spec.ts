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

it('should return expected heroes (HttpClient called once)', (done: DoneFn) => {
    const expectedHeroes: Customer[] = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];

    httpClientSpy.get.and.returnValue(of(expectedHeroes));

    customerService.getCustomerList().subscribe({
        next: heroes => {
            expect(heroes)
                .withContext('expected heroes')
                .toEqual(expectedHeroes);
            done();
        },
        error: done.fail
    });
    expect(httpClientSpy.get.calls.count())
        .withContext('one call')
        .toBe(1);
});

it('should return an error when the server returns a 404', (done: DoneFn) => {
    const errorResponse = new HttpErrorResponse({
        error: 'test 404 error',
        status: 404, statusText: 'Not Found'
    });

    httpClientSpy.get.and.returnValue(of(errorResponse));

    customerService.getCustomerList().subscribe({
        next: heroes => done.fail('expected an error, not heroes'),
        error: error  => {
            expect(error.message).toContain('test 404 error');
            done();
        }
    });
});
