import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AddCustomerAccountModalComponent} from './add-customer-account-modal.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../shared/shared.module';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {SnackBarService} from '../../../services/snack-bar.service';
import {SnackBarServiceMock} from '../../../../test/mock/services/snack-bar-service.mock';
import {CustomerService} from '../../../services/customer.service';
import {CustomerServiceMock} from '../../../../test/mock/services/customer-service.mock';
import {SubAccountService} from '../../../services/sub-account.service';
import {SubaccountServiceMock} from '../../../../test/mock/services/subaccount-service.mock';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { MsalServiceMock } from 'src/test/mock/services/msal-service.mock';
import { FeatureToggleHelper } from 'src/app/helpers/feature-toggle.helper';
import { Features } from 'src/app/helpers/features';
import { tekVizionServices } from 'src/app/helpers/tekvizion-services';

let addCustomerAccountModalComponentInstance: AddCustomerAccountModalComponent;
let fixture: ComponentFixture<AddCustomerAccountModalComponent>;

const RouterMock = {
    navigate: (commands: string[]) => {}
};
const MatDialogRefMock = {
    close: ()=> {}
};
const beforeEachFunction = async () => {
    TestBed.configureTestingModule({
        declarations: [AddCustomerAccountModalComponent],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [CommonModule, SharedModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
        providers: [
            {
                provide: Router,
                useValue: RouterMock
            },
            {
                provide: FormBuilder
            },
            {
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            },
            {
                provide: CustomerService,
                useValue: CustomerServiceMock
            },
            {
                provide: SubAccountService,
                useValue: SubaccountServiceMock
            },
            {
                provide: MatDialogRef,
                useValue: MatDialogRefMock
            },
            {
                provide: MsalService,
                useValue: MsalServiceMock
            }
        ]
    }).compileComponents().then(() => {
        fixture = TestBed.createComponent(AddCustomerAccountModalComponent);
        addCustomerAccountModalComponentInstance = fixture.componentInstance;
    });
};

describe('UI verification test for add customer account', () => {
    beforeEach(beforeEachFunction);
    it('should display add customer account modal label text correctly', () =>{
        fixture.detectChanges();
        const modalTitle = fixture.nativeElement.querySelector('#modal-title');
        const customerNameLabel = fixture.nativeElement.querySelector('#customer-name-label');
        const customerTypeLabel = fixture.nativeElement.querySelector('#customer-type-label');
        const adminEmailLabel = fixture.nativeElement.querySelector('#admin-email-label');
        const subaccountLabel = fixture.nativeElement.querySelector('#subaccount-label');
        const subaccountAdminEmailLabel = fixture.nativeElement.querySelector('#subaccount-admin-email-label');
        const testCustomerCheckbox = fixture.nativeElement.querySelector('#test-customer-checkbox');
        const cancelBtn = fixture.nativeElement.querySelector('#cancelBtn');
        const submitBtn = fixture.nativeElement.querySelector('#submitBtn');

        expect(modalTitle.textContent).toBe('Add Customer Account');
        expect(customerNameLabel.textContent).toBe('Customer Name');
        expect(customerTypeLabel.textContent).toBe('Customer Type');
        expect(adminEmailLabel.textContent).toBe('Administrator Email');
        expect(subaccountLabel.textContent).toBe('Subaccount');
        expect(subaccountAdminEmailLabel.textContent).toBe('Subaccount Administrator Email');
        expect(testCustomerCheckbox.textContent).toBe('\xa0Test Customer'); // \xa0 = nbsp
        expect(cancelBtn.textContent).toBe('Cancel');
        expect(submitBtn.textContent).toBe('Submit');
    });
});

describe('onCancel', () => {
    beforeEach(beforeEachFunction);
    it('should call dialogRef.close at onCancel()',  () => {
        spyOn(MatDialogRefMock, 'close');
        addCustomerAccountModalComponentInstance.onCancel();
        expect(MatDialogRefMock.close).toHaveBeenCalled();
    });
});

describe('addCustomer', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to customerService.create customer and display a success message on snackbar',  () => {
        const addCustomerForm = addCustomerAccountModalComponentInstance.addCustomerForm;
        const customerToAdd: any = {
            customerName: 'test customer name',
            customerType: 'test customer type',
            customerAdminEmail: 'test customer admin email',
            subaccountName: 'test subAccount name',
            subaccountAdminEmail: '',
            testCustomer: true
        };
        const customerToCompare: any = {
            customerName: customerToAdd.customerName,
            customerType: customerToAdd.customerType,
            customerAdminEmail: customerToAdd.customerAdminEmail,
            subaccountAdminEmail: customerToAdd.subaccountAdminEmail,
            test: 'true'
        };
        addCustomerForm.patchValue({
            customerName: customerToAdd.customerName,
            customerType: customerToAdd.customerType,
            adminEmail: customerToAdd.customerAdminEmail,
            subaccountName: customerToAdd.subaccountName,
            testCustomer: customerToAdd.testCustomer,
        });
        const expectedCustomerCall: any = {
            customerId: '12341234-1234-1234-1234-123412341234',
            subaccountName: customerToAdd.subaccountName,
            subaccountAdminEmail: ''
        }
        if (FeatureToggleHelper.isFeatureEnabled(Features.CTaaS_Feature)){
            expectedCustomerCall.services = tekVizionServices.tekTokenConstumption;
            customerToAdd.services = tekVizionServices.tekTokenConstumption;
            addCustomerAccountModalComponentInstance.addCustomerForm['services'] = customerToAdd.services;
        }
        spyOn(CustomerServiceMock, 'createCustomer').and.callThrough();
        spyOn(SubaccountServiceMock, 'createSubAccount').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(addCustomerAccountModalComponentInstance, 'createSubAccount');

        addCustomerAccountModalComponentInstance.addCustomer();

        expect(CustomerServiceMock.createCustomer).toHaveBeenCalledWith(customerToCompare);
        expect(addCustomerAccountModalComponentInstance.createSubAccount).toHaveBeenCalledWith(expectedCustomerCall);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Customer added successfully!', '' );
    });

    it('should make a call to customerService.create customer and display an error message on snackbar',  () => {
        const customerToAdd: any = {
            customerName: '',
            customerType: '',
            customerAdminEmail: '',
            subaccountName: '',
            subaccountAdminEmail: '',
            testCustomer: false
        };
        const customerToCompare: any = {
            customerName: customerToAdd.customerName,
            customerType: customerToAdd.customerType,
            customerAdminEmail: customerToAdd.customerAdminEmail,
            subaccountAdminEmail: customerToAdd.subaccountAdminEmail,
            test: 'false'
        };
        spyOn(CustomerServiceMock, 'createCustomer').and.returnValue(CustomerServiceMock.errorResponse());
        spyOn(SubaccountServiceMock, 'createSubAccount').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar');
        spyOn(addCustomerAccountModalComponentInstance, 'createSubAccount');
        spyOn(console, 'error');
        addCustomerAccountModalComponentInstance.addCustomer();
        expect(CustomerServiceMock.createCustomer).toHaveBeenCalledWith(customerToCompare);
        expect(addCustomerAccountModalComponentInstance.createSubAccount).toHaveBeenCalledTimes(0);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Expected customer response error', 'Error adding customer!');
        expect(console.error).toHaveBeenCalledWith('error while adding a new customer', { error: 'Expected customer response error' });
    });

    it('should make a call to customerService.create customer and display an error message on snackbar',  () => {
        spyOn(CustomerServiceMock, 'createCustomer').and.returnValue(CustomerServiceMock.createCustomerWithError());
        spyOn(SnackBarServiceMock, 'openSnackBar');
        spyOn(addCustomerAccountModalComponentInstance, 'createSubAccount');
        spyOn(console, 'error');
        addCustomerAccountModalComponentInstance.addCustomer();
        expect(CustomerServiceMock.createCustomer).toHaveBeenCalled();
        expect(addCustomerAccountModalComponentInstance.createSubAccount).toHaveBeenCalledTimes(0);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Expected create customer error', 'Error adding customer!');
    });
});

describe('createSubAccount', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to subaccountService.create customer and display a success message on snackbar', () => {
        const subaccountDetails: any = {
            customerId: 'test customer id',
            subaccountName: 'test subaccount name',
            subaccountAdminEmail: 'test subaccount admin email',
        };
        if (FeatureToggleHelper.isFeatureEnabled(Features.CTaaS_Feature)){
            subaccountDetails.services = tekVizionServices.tekTokenConstumption + ',' + tekVizionServices.SpotLight;
        }
        spyOn(SubaccountServiceMock, 'createSubAccount').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar');
        spyOn(MatDialogRefMock, 'close');
        addCustomerAccountModalComponentInstance.createSubAccount(subaccountDetails);
        expect(SubaccountServiceMock.createSubAccount).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount added successfully!', '');
        expect(MatDialogRefMock.close).toHaveBeenCalled();
    });

    it('should make a call to subaccountService.create customer and display an error message on snackbar if the service returns an error', () => {
        const subaccountDetails: any = {
            customerId: 'test customer id',
            subaccountName: 'test subaccount name',
            subaccountAdminEmail: 'test subaccount admin email',
        };
        spyOn(SubaccountServiceMock, 'createSubAccount').and.returnValue(SubaccountServiceMock.createSubAccountWithError());
        spyOn(SnackBarServiceMock, 'openSnackBar');
        spyOn(MatDialogRefMock, 'close');
        addCustomerAccountModalComponentInstance.createSubAccount(subaccountDetails);
        expect(SubaccountServiceMock.createSubAccount).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Expected create subaccount error', 'Error adding subaccount!');
        expect(MatDialogRefMock.close).toHaveBeenCalled();
    });

    it('should make a call to subaccountService.create customer and display an error message on snackbar if an error is thrown', () => {
        const subaccountDetails: any = {
            customerId: 'test customer id',
            subaccountName: 'test subaccount name',
            subaccountAdminEmail: 'test subaccount admin email',
        };
        spyOn(SubaccountServiceMock, 'createSubAccount').and.returnValue(SubaccountServiceMock.errorResponse());
        spyOn(SnackBarServiceMock, 'openSnackBar');
        spyOn(MatDialogRefMock, 'close');
        addCustomerAccountModalComponentInstance.createSubAccount(subaccountDetails);
        expect(SubaccountServiceMock.createSubAccount).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Expected subaccount response error', 'Error adding subaccount!');
        expect(MatDialogRefMock.close).toHaveBeenCalled();
    });
})