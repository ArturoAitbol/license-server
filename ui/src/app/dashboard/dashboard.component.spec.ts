import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { CustomerService } from '../services/customer.service';
import { DialogService } from '../services/dialog.service';
import { LicenseService } from '../services/license.service';
import { SubAccountService } from '../services/sub-account.service';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../modules/shared/shared.module';
import { DataTableComponent } from '../generics/data-table/data-table.component';
import { AddCustomerAccountModalComponent } from './add-customer-account-modal/add-customer-account-modal.component';
import { AddSubaccountModalComponent } from './add-subaccount-modal/add-subaccount-modal.component';
import { ModifyCustomerAccountComponent } from './modify-customer-account/modify-customer-account.component';
import { AdminEmailsComponent } from './admin-emails-modal/admin-emails.component';
import { SubaccountAdminEmailsComponent } from './subaccount-admin-emails-modal/subaccount-admin-emails.component';
import { Observable } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

let dashboardComponentTestInstance: DashboardComponent;

let fixture: ComponentFixture<DashboardComponent>;

let licenseServiceMock = {
    getLicenseList: () => {
        return new Observable( (observer) => {
            observer.next(
                {
                    'licences': [
                        {
                            id: '16f4f014-5bed-4166-b10a-808b2e6655e3',
                            subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
                            deviceLimit: 'string',
                            tokensPurchased: 'string',
                            startDate: 'string',
                            renewalDate: 'string',
                            packageType: 'string',
                            status: 'Active',
                            customerName: 'string',
                            subaccountName: 'string',
                            customerType: 'string',
                        },
                        {
                            id: '88888888-8888-8888-8888-888888888888',
                            subaccountId: '99999999-9999-9999-9999-999999999999',
                            deviceLimit: 'string',
                            tokensPurchased: 'string',
                            startDate: 'string',
                            renewalDate: 'string',
                            packageType: 'string',
                            status: 'Expired',
                            customerName: 'string',
                            subaccountName: 'string',
                            customerType: 'string',
                        }
                    ]
                }
            );
            return {
                unsubscribe() {
                    console.log('unsubscribed from LicenseService Observable');
                }
            };
        });
    }
};

let subAccountServiceMock = {
    getSubAccountList: () => {
        return new Observable( (observer) => {
            observer.next({
                'subaccounts':
                    [
                        {
                            id: '99999999-9999-9999-9999-999999999999',
                            customerId: '11111111-1111-1111-1111-111111111111',
                            name: 'Customer 1111 subaccount',
                            subaccountAdminEmails: [],
                        },
                        {
                            id: '77777777-7777-7777-7777-777777777777',
                            customerId: '22222222-2222-2222-2222-222222222222',
                            name: 'Customer 2222 subaccount',
                            subaccountAdminEmails: [],
                        }
                    ]
            });
            return {
                unsubscribe() {
                    console.log('unsubscribed from getAccountListObservable');
                }
            };
        });
    }
};

let customerServiceMock = {
    getCustomerList: () => {
        return new Observable( (observer) => {
            observer.next(
            {
                    "customers": [
                        {
                            'customerName': 'Non Test Customer',
                            'customerType': 'MSP',
                            'testCustomer': false,
                            'id': '11111111-1111-1111-1111-111111111111',
                            'adminEmails': []
                        },
                        {
                            'customerName': 'Test Customer',
                            'customerType': 'MSP',
                            'testCustomer': true,
                            'id': '22222222-2222-2222-2222-222222222222',
                            'adminEmails': []
                        }
                    ]
                }
            );
            return {
                unsubscribe() {
                    console.log('unsubscribed from getCustomerList Observable');
                }
            };
        });
    }
};

beforeEach(() => {
    TestBed.configureTestingModule({
        declarations: [DashboardComponent, DataTableComponent, AddCustomerAccountModalComponent, AddSubaccountModalComponent, ModifyCustomerAccountComponent, AdminEmailsComponent, SubaccountAdminEmailsComponent],
        imports: [BrowserAnimationsModule, MatDialogModule, MatSnackBarModule, SharedModule],
        providers: [
            {
               provide: Router,
               useValue: {}
            },
            {
                provide: MatDialogRef,
                useValue: {}
            },
            {
                provide: MatSnackBarRef,
                useValue: {}
            },
            {
                provide: CustomerService,
                useValue: customerServiceMock
            },
            {
                provide: DialogService,
                useValue: () => {
                    console.log('DialogService Mock')
                    return {};
                }
            },
            {
                provide: LicenseService,
                useValue: licenseServiceMock
            },
            {
                provide: SubAccountService,
                useValue: subAccountServiceMock
            },
            {
                provide: MsalService,
                useValue: {
                    instance: {
                        getActiveAccount: () => {
                            return {
                                'homeAccountId': '4bd8345a-b441-4791-91ff-af23e4b02e02.e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
                                'environment': 'login.windows.net',
                                'tenantId': 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
                                'username': 'lvelarde@tekvizionlabs.com',
                                'localAccountId': '4bd8345a-b441-4791-91ff-af23e4b02e02',
                                'name': 'Leonardo Velarde',
                                idTokenClaims: {
                                    'aud': 'e643fc9d-b127-4883-8b80-2927df90e275',
                                    'iss': 'https://login.microsoftonline.com/e3a46007-31cb-4529-b8cc-1e59b97ebdbd/v2.0',
                                    'iat': 1657823518,
                                    'nbf': 1657823518,
                                    'exp': 1657827418,
                                    'name': 'Leonardo Velarde',
                                    'nonce': '41279ac2-8254-4f82-a11b-38fd27248c57',
                                    'oid': '4bd8345a-b441-4791-91ff-af23e4b02e02',
                                    'preferred_username': 'lvelarde@tekvizionlabs.com',
                                    'rh': '0.ARMAB2Ck48sxKUW4zB5ZuX69vZ38Q-YnsYNIi4ApJ9-Q4nUTAEs.',
                                    roles: [
                                        'tekvizion.FullAdmin'
                                    ],
                                    'sub': 'q_oqvIR8gLozdXv-rtEYPNfPc0y4AfLlR_LiKUxZSy0',
                                    'tid': 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
                                    'uti': 'GwgRbk67AECociiD7H0SAA',
                                    'ver': '2.0'
                                }
                            };
                        }
                    }
                }
            },
            {
                provide: HttpClient,
                useValue: HttpClient
            }
        ]
    });
    fixture = TestBed.createComponent(DashboardComponent);
    dashboardComponentTestInstance = fixture.componentInstance;
    dashboardComponentTestInstance.ngOnInit();
    spyOn(console, 'log').and.callThrough();
    spyOn(customerServiceMock, 'getCustomerList').and.callThrough();
    spyOn(licenseServiceMock, 'getLicenseList').and.callThrough();
    spyOn(subAccountServiceMock, 'getSubAccountList').and.callThrough();
});

describe('UI verification tests', () => {
    it('should display essential UI and components', () => {
        fixture.detectChanges();
        let h1 = fixture.nativeElement.querySelector('#page-title');
        let addCustomerButton = fixture.nativeElement.querySelector('#add-customer-button');
        let addSubaccountButton = fixture.nativeElement.querySelector('#add-subaccount-button');
        expect(h1.textContent).toBe('Customers');
        expect(addCustomerButton.textContent).toBe('Add Customer');
        expect(addSubaccountButton.textContent).toBe('Add Subaccount');
    });

    it('should load correct data columns for the table', () => {
        fixture.detectChanges();
        let customerColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[0];
        let subAccountColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[1];
        let typeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[2];
        let statusColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[3];
        expect(customerColumn.innerText).toBe('Customer');
        expect(subAccountColumn.innerText).toBe('Subaccount');
        expect(typeColumn.innerText).toBe('Type');
        expect(statusColumn.innerText).toBe('Status');
    });
});

describe('Data collection and parsing tests', () => {
    it('should make a call to get customer list after initializing', () => {
        fixture.detectChanges();
        expect(customerServiceMock.getCustomerList).toHaveBeenCalled();
        expect(licenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(subAccountServiceMock.getSubAccountList).toHaveBeenCalled();
    });
});


describe('Navigation', () => {
    it('should make a call to get customer list after initializing', () => {
        fixture.detectChanges();
        expect(customerServiceMock.getCustomerList).toHaveBeenCalled();
        expect(licenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(subAccountServiceMock.getSubAccountList).toHaveBeenCalled();
    });
});
