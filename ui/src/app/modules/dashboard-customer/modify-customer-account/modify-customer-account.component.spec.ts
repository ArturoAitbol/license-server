import { HttpBackend } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ComponentFixture, TestBed} from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerServiceMock } from 'src/test/mock/services/customer-service.mock';
import { ModifyCustomerAccountComponent } from './modify-customer-account.component';
import { CurrentCustomerServiceMock } from "src/test/mock/services/current-customer-service.mock";
import { tekVizionServices } from 'src/app/helpers/tekvizion-services';
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';

let CustomerComponentTestInstance: ModifyCustomerAccountComponent;
let fixture: ComponentFixture<ModifyCustomerAccountComponent>;
const data = CurrentCustomerServiceMock.getSelectedCustomer()

const beforeEachFunction = () => {
  const configBuilder = new TestBedConfigBuilder().useDefaultConfig(ModifyCustomerAccountComponent);
  configBuilder.addProvider({ provide: HttpBackend, useValue: HttpBackend });
  configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: data });
  TestBed.configureTestingModule(configBuilder.getConfig());
  fixture = TestBed.createComponent(ModifyCustomerAccountComponent);
  CustomerComponentTestInstance = fixture.componentInstance;
  CustomerComponentTestInstance.ngOnInit();
};

describe('UI verification test', () => {
  beforeEach(beforeEachFunction);
  it('should display UI components', () =>{
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('#modal-title');
    const name = fixture.nativeElement.querySelector('#customer-name');
    const type = fixture.nativeElement.querySelector('#customer-type');
    // const subaccount = fixture.nativeElement.querySelector('#customer-subaccount');
    const cancel = fixture.nativeElement.querySelector('#cancel-button');
    const submit = fixture.nativeElement.querySelector('#submitBtn');

    expect(title.textContent).toBe('Edit Customer Account');
    expect(name.textContent).toBe('Customer Name');
    expect(type.textContent).toBe('Customer Type');
    // expect(subaccount.textContent).toBe('Subaccount');
    expect(submit.textContent).toBe('Submit');
    expect(cancel.textContent).toBe('Cancel');
  });

  it('should enable submit button when fields are correct',()=>{
    const updateCustomerForm = CustomerComponentTestInstance.updateCustomerForm;
    
    updateCustomerForm.get('name').setValue('customerName');
    updateCustomerForm.get('customerType').setValue('Reseller');
    updateCustomerForm.get('subaccountName').setValue('subaccountName');
    updateCustomerForm.get('testCustomer').setValue(true);
    updateCustomerForm.get('services').get(tekVizionServices.SpotLight).setValue(true);
    updateCustomerForm.get('services').get(tekVizionServices.tekTokenConstumption).setValue(false);

    expect(updateCustomerForm.errors).toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#submitBtn').disabled).toBeFalsy();
  });
  it('should execute diablebutton()', () => {
    spyOn(CustomerComponentTestInstance, 'disableSumbitBtn').and.callThrough();

    CustomerComponentTestInstance.disableSumbitBtn()
    expect(CustomerComponentTestInstance.disableSumbitBtn).toHaveBeenCalled();

  });
});

describe('modify customers flow', () => {
  beforeEach(beforeEachFunction);
  it('should execute submit action', () => {
    spyOn(CustomerComponentTestInstance, 'submit').and.callThrough();
    spyOn(CustomerComponentTestInstance, 'onCancel').and.callThrough();
    CustomerComponentTestInstance.submit();
    expect(CustomerComponentTestInstance.submit).toHaveBeenCalled();

    CustomerComponentTestInstance.onCancel();
    expect(CustomerComponentTestInstance.onCancel).toHaveBeenCalled();
  });

  it('should edit subaccount name',()=>{
    const updateCustomerForm = CustomerComponentTestInstance.updateCustomerForm;
    CustomerComponentTestInstance.data = CurrentCustomerServiceMock;
    updateCustomerForm.patchValue(CustomerComponentTestInstance.data);
    updateCustomerForm.get('name').setValue('customerName');
    updateCustomerForm.get('customerType').setValue('Reseller');
    updateCustomerForm.get('subaccountName').setValue('subaccountName');
    updateCustomerForm.get('testCustomer').setValue(true);
    expect(updateCustomerForm.errors).toBeNull();
    CustomerComponentTestInstance.ngOnInit();
    updateCustomerForm.get('subaccountName').setValue('subaccountNameModified');
    spyOn(CustomerComponentTestInstance, 'submit').and.callThrough();
    CustomerComponentTestInstance.submit();
    expect(CustomerComponentTestInstance.submit).toHaveBeenCalled();
    expect(fixture.debugElement.nativeElement.querySelector('#submitBtn').disabled).toBeFalsy();
  });

  it('should edit services of a subaccount', () => {
    const updateCustomerForm = CustomerComponentTestInstance.updateCustomerForm;
    CustomerComponentTestInstance.data = CurrentCustomerServiceMock;
    updateCustomerForm.patchValue(CustomerComponentTestInstance.data);
    updateCustomerForm.get('services').get(tekVizionServices.SpotLight).setValue(true);
    updateCustomerForm.get('services').get(tekVizionServices.tekTokenConstumption).setValue(false);
    expect(updateCustomerForm.errors).toBeNull();
    CustomerComponentTestInstance.ngOnInit();
    updateCustomerForm.get('subaccountName').setValue('subaccountNameModified');
    spyOn(CustomerComponentTestInstance, 'submit').and.callThrough();
    CustomerComponentTestInstance.submit();
    expect(CustomerComponentTestInstance.submit).toHaveBeenCalled();
    expect(fixture.debugElement.nativeElement.querySelector('#submitBtn').disabled).toBeFalsy();
  });
});

describe('display of error messages', () => {
  beforeEach(beforeEachFunction);
  it('should display error messages if submit fails', () =>{
    fixture.detectChanges();
    spyOn(CustomerServiceMock, 'updateCustomer').and.returnValue(throwError('some error'));
    spyOn(console, 'error').and.callThrough();

    fixture.detectChanges();

    CustomerComponentTestInstance.submit();

    expect(CustomerServiceMock.updateCustomer).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('error while updating customer information row', 'some error')
    expect(CustomerComponentTestInstance.isDataLoading).toBeFalse();
  });
});
