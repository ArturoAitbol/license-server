// import { instance, mock, verify, when } from "ts-mockito";
import { HttpBackend, HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ComponentFixture, TestBed} from '@angular/core/testing';
import { MatDialog} from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';
import { MatDialogMock } from 'src/test/mock/components/mat-dialog.mock';
import { MsalServiceMock } from 'src/test/mock/services/msal-service.mock';
import { CustomerServiceMock } from 'src/test/mock/services/customer-service.mock';
import { SharedModule } from '../../shared/shared.module';
import { ModifyCustomerAccountComponent } from './modify-customer-account.component';
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { ReactiveFormsModule } from '@angular/forms';
import { CurrentCustomerServiceMock } from "src/test/mock/services/current-customer-service.mock";
import { SubaccountServiceMock } from 'src/test/mock/services/subaccount-service.mock';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { tekVizionServices } from 'src/app/helpers/tekvizion-services';

let CustomerComponentTestInstance: ModifyCustomerAccountComponent;
const dialogMock = new DialogServiceMock();
let fixture: ComponentFixture<ModifyCustomerAccountComponent>;
const data = CurrentCustomerServiceMock.getSelectedCustomer()
const RouterMock = {
  navigate: (commands: string[]) => {}
};
const beforeEachFunction = () => {
  TestBed.configureTestingModule({
      declarations: [ ModifyCustomerAccountComponent],
      imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule, ReactiveFormsModule],
      providers: [
        {
          provide: Router,
          useValue: RouterMock
      },
      {
          provide: MatDialog,
          useValue: MatDialogMock
      },
      {
          provide: MatSnackBarRef,
          useValue: {}
      },
      {
          provide: CustomerService,
          useValue: CustomerServiceMock
      },
      {
          provide: MsalService,
          useValue: MsalServiceMock
      },
      {
          provide: HttpClient,
          useValue: HttpClient
      },
      {
          provide: MatDialogRef,
          useValue: dialogMock
      },
      {
          provide: MAT_DIALOG_DATA,
          useValue: data
      },
      {
        provide: SubAccountService,
        useValue: SubaccountServiceMock
      },
      {
          provide: HttpBackend,
          useValue: HttpBackend
      }
    ]
  });
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
    spyOn(dialogMock, 'close').and.callThrough();
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
