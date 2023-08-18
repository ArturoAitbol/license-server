import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AddSubaccountModalComponent } from './add-subaccount-modal.component';
import { SnackBarServiceMock } from '../../../../test/mock/services/snack-bar-service.mock';
import { SubaccountServiceMock } from '../../../../test/mock/services/subaccount-service.mock';
import { CustomerServiceMock } from '../../../../test/mock/services/customer-service.mock';
import { tekVizionServices } from 'src/app/helpers/tekvizion-services';
import { HttpBackend } from "@angular/common/http";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';
import { MatDialogMock } from '../../../../test/mock/components/mat-dialog.mock';

let addSubaccountModalComponentInstance: AddSubaccountModalComponent;
let fixture: ComponentFixture<AddSubaccountModalComponent>;

const beforeEachFunction = waitForAsync( () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddSubaccountModalComponent);
    configBuilder.addProvider({ provide: HttpBackend, useValue: HttpBackend });
    TestBed.configureTestingModule(configBuilder.getConfig()).compileComponents().then(() => {
        fixture = TestBed.createComponent(AddSubaccountModalComponent);
        addSubaccountModalComponentInstance = fixture.componentInstance;
    });
});

describe('UI verification test for add subaccount modal', () => {
    beforeEach(beforeEachFunction);
    it('should display add customer account modal label text correctly', () =>{
        fixture.detectChanges();
        const modalTitle = fixture.nativeElement.querySelector('#modal-title');
        const customerNameLabel = fixture.nativeElement.querySelector('#customer-name-label');
        const subaccountNameLabel = fixture.nativeElement.querySelector('#subaccount-name-label');
        const subaccountAdminEmailLabel = fixture.nativeElement.querySelector('#subaccount-admin-email-label');
        const cancelBtn = fixture.nativeElement.querySelector('#cancelBtn');
        const submitBtn = fixture.nativeElement.querySelector('#submitBtn');

        expect(modalTitle.textContent).toBe('Add Customer Subaccount');
        expect(customerNameLabel.textContent).toBe('Customer Name');
        expect(subaccountNameLabel.textContent).toBe('Subaccount');
        expect(subaccountAdminEmailLabel.textContent).toBe('Subaccount Administrator Email');
        expect(cancelBtn.textContent).toBe('Cancel');
        expect(submitBtn.textContent).toBe('Submit');
    });
});

describe('onInit', () => {
    beforeEach(beforeEachFunction);
    it('should display snackbar error if customer service fails', () =>{
        spyOn(CustomerServiceMock, 'getCustomerList').and.returnValue(CustomerServiceMock.errorResponse());
        spyOn(SnackBarServiceMock, 'openSnackBar');
        spyOn(console, 'error');
        fixture.detectChanges();
        expect(CustomerServiceMock.getCustomerList).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Expected customer response error', 'Error retrieving customers!');
        expect(console.error).toHaveBeenCalledWith('error while retrieving customers', { error: 'Expected customer response error' });
    });
});

describe('onCancel()', () => {
    beforeEach(beforeEachFunction);
    it('should call dialogRef at onCancel()',  () => {
        spyOn(MatDialogMock, 'close');
        addSubaccountModalComponentInstance.onCancel();
        expect(MatDialogMock.close).toHaveBeenCalled();
    });
});

describe('createSubAccount', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to subaccountService.createSubAccount customer and display a success message on snackbar', () => {
        const subaccountDetails: any = {
            customerId: 'test customer id',
            subaccountName: 'test subaccount name',
            subaccountAdminEmail: 'test subaccount admin email'
        };
        spyOn(SubaccountServiceMock, 'createSubAccount').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar');
        spyOn(MatDialogMock, 'close');
        addSubaccountModalComponentInstance.addSubaccountForm.patchValue({
            customer: subaccountDetails.customerId,
            subaccountName: subaccountDetails.subaccountName,
            subaccountAdminEmail: subaccountDetails.subaccountAdminEmail
        });
        subaccountDetails.services = tekVizionServices.tekTokenConstumption;
        addSubaccountModalComponentInstance.addSubaccountForm['services'] = subaccountDetails.services;
        addSubaccountModalComponentInstance.addSubaccount();
        expect(SubaccountServiceMock.createSubAccount).toHaveBeenCalledWith(subaccountDetails);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount added successfully!', '');
        expect(MatDialogMock.close).toHaveBeenCalled();
    });

    it('should make a call to subaccountService.createSubAccount customer and display an error message on snackbar if the service returns an error', () => {

        spyOn(SubaccountServiceMock, 'createSubAccount').and.returnValue(SubaccountServiceMock.createSubAccountWithError());
        spyOn(SnackBarServiceMock, 'openSnackBar');
        spyOn(MatDialogMock, 'close');
        addSubaccountModalComponentInstance.addSubaccount();
        expect(SubaccountServiceMock.createSubAccount).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Expected create subaccount error', 'Error adding subaccount!');
        expect(MatDialogMock.close).toHaveBeenCalled();
    });

    it('should call setChecked creating a subaccount with services', () => {
        spyOn(addSubaccountModalComponentInstance, 'setChecked').and.callThrough();

        addSubaccountModalComponentInstance.setChecked(true, 1);

        expect(addSubaccountModalComponentInstance.setChecked).toHaveBeenCalled();
    });

    it('should make a call to subaccountService.createSubAccount customer and display an error message on snackbar if an error is thrown', () => {  
        const subaccountDetails: any = {
            customerId: 'test customer id',
            subaccountName: 'test subaccount name',
            subaccountAdminEmail: 'test subaccount admin email'
        };  
        spyOn(SubaccountServiceMock, 'createSubAccount').and.returnValue(SubaccountServiceMock.errorResponse());
        spyOn(SnackBarServiceMock, 'openSnackBar');
        spyOn(MatDialogMock, 'close');
        addSubaccountModalComponentInstance.addSubaccountForm.patchValue({
            customer: subaccountDetails.customerId,
            subaccountName: subaccountDetails.subaccountName,
            subaccountAdminEmail: subaccountDetails.subaccountAdminEmail,
        });
        subaccountDetails.services = tekVizionServices.tekTokenConstumption + ',' + tekVizionServices.SpotLight;
        addSubaccountModalComponentInstance.addSubaccountForm['services'] = subaccountDetails.services
        addSubaccountModalComponentInstance.addSubaccount();
        expect(SubaccountServiceMock.createSubAccount).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Expected subaccount response error', 'Error adding subaccount!');
    });
});
