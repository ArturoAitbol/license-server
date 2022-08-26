import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DialogServiceMock} from '../../../test/mock/services/dialog.service.mock';
import {AddCustomerAccountModalComponent} from './add-customer-account-modal.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../modules/shared/shared.module';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {SnackBarService} from '../../services/snack-bar.service';
import {SnackBarServiceMock} from '../../../test/mock/services/snack-bar-service.mock';
import {CustomerService} from '../../services/customer.service';
import {CustomerServiceMock} from '../../../test/mock/services/customer-service.mock';
import {SubAccountService} from '../../services/sub-account.service';
import {SubaccountServiceMock} from '../../../test/mock/services/subaccount-service.mock';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

let addCustomerAccountModalComponentInstance: AddCustomerAccountModalComponent;
let fixture: ComponentFixture<AddCustomerAccountModalComponent>;
const dialogServiceMock = new DialogServiceMock();

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
            }
        ]
    }).compileComponents().then(() => {
        fixture = TestBed.createComponent(AddCustomerAccountModalComponent);
        addCustomerAccountModalComponentInstance = fixture.componentInstance;
    });
};

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('should display add customer account modal UI components', () =>{
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
    it('should call dialogRef',  () => {
        console.log('onClose() test');
        spyOn(MatDialogRefMock, 'close');
        addCustomerAccountModalComponentInstance.onCancel();
        expect(MatDialogRefMock.close).toHaveBeenCalled();
    });
});

describe('addCustomer', () => {

});