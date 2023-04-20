import { Observable, of, throwError } from 'rxjs';
import { ComponentFixture, TestBed} from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogService } from 'src/app/services/dialog.service';
import { AdminEmailsComponent } from './admin-emails.component';
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { CustomerService } from "src/app/services/customer.service";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { CustomerServiceMock } from "src/test/mock/services/customer-service.mock";
import { CustomerAdminEmailService } from "src/app/services/customer-admin-email.service";
import { CustomerAdminEmailServiceMock } from "src/test/mock/services/customer-admin-email.service.mock";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';

let AdminEmailTestInstance: AdminEmailsComponent;
let fixture: ComponentFixture<AdminEmailsComponent>;
const dialogService = new DialogServiceMock();

const defaultTestBedConfig = new TestBedConfigBuilder()
    .useDefaultConfig(AdminEmailsComponent)
    .addProvider({ provide: DialogService, useValue: dialogService })
    .addProvider({ provide: MatDialogRef, useValue: dialogService })
    .addProvider({ provide: CustomerAdminEmailService, useValue: CustomerAdminEmailServiceMock })
    .addProvider({ provide: MAT_DIALOG_DATA, useValue: {id: CustomerServiceMock.emailCustomer.id}})
    .getConfig();
const beforeEachFunction = () => {
  TestBed.configureTestingModule(defaultTestBedConfig);
  fixture = TestBed.createComponent(AdminEmailsComponent);
  AdminEmailTestInstance = fixture.componentInstance;
  fixture.detectChanges();
};

describe('UI verification test', () => {
  beforeEach(beforeEachFunction);
  it('should display UI components', () =>{
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('#modal-title');
    const addButton = fixture.nativeElement.querySelector('#addButton');
    const cancel = fixture.nativeElement.querySelector('#cancel-button');
    const submit = fixture.nativeElement.querySelector('#submit-button');
    expect(title.textContent).toBe('Customer Administrator Emails');
    expect(addButton.textContent).toBe('add');
    expect(submit.textContent).toBe('Submit');
    expect(cancel.textContent).toBe('Cancel');
  });
});

describe('add admin email flow', () => {
  beforeEach(beforeEachFunction);

  it('should execute submit action', () => {
    spyOn(AdminEmailTestInstance, 'submit').and.callThrough();
    spyOn(AdminEmailTestInstance, 'onCancel').and.callThrough();
    AdminEmailTestInstance.submit();
    expect(AdminEmailTestInstance.submit).toHaveBeenCalled();

    AdminEmailTestInstance.onCancel();
    expect(AdminEmailTestInstance.onCancel).toHaveBeenCalled();
  });

  it('should click on add button',()=>{
    spyOn(AdminEmailTestInstance, 'addEmailForm').and.callThrough();
    AdminEmailTestInstance.addEmailForm();
    expect(AdminEmailTestInstance.addEmailForm).toHaveBeenCalled();
  });

  it('should create a formGroup with the necessary controls', () => {
    fixture.detectChanges();
    expect(AdminEmailTestInstance.adminEmailsForm.get('name')).toBeTruthy();
    expect(AdminEmailTestInstance.adminEmailsForm.get('emails')).toBeTruthy();
  });
  
  it('should create an adminEmail after calling submit()', () => {
    spyOn(AdminEmailTestInstance, 'addEmailForm').and.callThrough();
    AdminEmailTestInstance.addEmailForm();

    spyOn(CustomerAdminEmailServiceMock, 'createAdminEmail').and.callThrough();
    spyOn(AdminEmailTestInstance, 'submit').and.callThrough();
    spyOn(AdminEmailTestInstance.dialogRef, 'close').and.callThrough();

    const adminEmailsForm = AdminEmailTestInstance.adminEmailsForm;
    adminEmailsForm.setValue({name: "test", emails:[{email:"test@email.com"}]});

    fixture.detectChanges();
    AdminEmailTestInstance.submit();

    expect(CustomerAdminEmailServiceMock.createAdminEmail).toHaveBeenCalled();
    expect(AdminEmailTestInstance.dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should show a message if an error ocurred while editing an administrator email', () => {
    spyOn(AdminEmailTestInstance, 'addEmailForm').and.callThrough();
    AdminEmailTestInstance.addEmailForm();
    spyOn(CustomerAdminEmailServiceMock, 'createAdminEmail').and.returnValue(throwError('some error'));
    spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
    spyOn(console, 'error').and.callThrough();
    const adminEmailsForm = AdminEmailTestInstance.adminEmailsForm;
    adminEmailsForm.setValue({name: "test", emails:[{email:"test@email.com"}]});

    fixture.detectChanges();
    AdminEmailTestInstance.submit();

    expect(CustomerAdminEmailServiceMock.createAdminEmail).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('error while editing administrator emails', 'some error');
    expect(AdminEmailTestInstance.isDataLoading).toBeFalse();
  });

  it('should test deleteEmailForm', () => {
    spyOn(AdminEmailTestInstance, 'deleteEmailForm').and.callThrough();
    AdminEmailTestInstance.deleteEmailForm(0);

    fixture.detectChanges();
    AdminEmailTestInstance.deleteEmailForm(0);

    expect(AdminEmailTestInstance.deleteEmailForm).toHaveBeenCalled();
  });

  it('should delete a email after calling deleteExistingEmail()', () => {
    

    spyOn(CustomerAdminEmailServiceMock, 'deleteAdminEmail').and.callThrough();
    spyOn(AdminEmailTestInstance, 'deleteExistingEmail').and.callThrough();
    spyOn( dialogService,'setExpectedConfirmDialogValue').and.callThrough();
    dialogService.setExpectedConfirmDialogValue(true);

    fixture.detectChanges();
    AdminEmailTestInstance.deleteExistingEmail(0);

    expect(CustomerAdminEmailServiceMock.deleteAdminEmail).toHaveBeenCalled();
  });
  it('should show a message if successfully deleted a email after calling deleteExistingEmail()', () => {
    

    spyOn(CustomerAdminEmailServiceMock, 'deleteAdminEmail').and.returnValue(throwError({message: 'error message'}));
    spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
    spyOn(AdminEmailTestInstance, 'deleteExistingEmail').and.callThrough();
    spyOn( dialogService,'setExpectedConfirmDialogValue').and.callThrough();
    dialogService.setExpectedConfirmDialogValue(true);

    fixture.detectChanges();
    AdminEmailTestInstance.deleteExistingEmail(0);

    expect(CustomerAdminEmailServiceMock.deleteAdminEmail).toHaveBeenCalled();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error deleting administrator email!');
  });

  it('should show a message if an error ocurred while deleting an administrator email', () => {
    const res = {error: "some error"};
    spyOn(CustomerAdminEmailServiceMock, 'deleteAdminEmail').and.returnValue(of(res));
    spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
    spyOn(AdminEmailTestInstance, 'deleteExistingEmail').and.callThrough();
    spyOn( dialogService,'setExpectedConfirmDialogValue').and.callThrough();
    dialogService.setExpectedConfirmDialogValue(true);

    fixture.detectChanges();
    AdminEmailTestInstance.deleteExistingEmail(0);

    expect(CustomerAdminEmailServiceMock.deleteAdminEmail).toHaveBeenCalled();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(res.error, 'Error while deleting administrator email!');
  });

  it('should get an null response', () => {
    const res = null;
    spyOn(CustomerAdminEmailServiceMock, 'deleteAdminEmail').and.returnValue(of(res));
    spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
    spyOn(AdminEmailTestInstance, 'deleteExistingEmail').and.callThrough();
    spyOn( dialogService,'setExpectedConfirmDialogValue').and.callThrough();
    dialogService.setExpectedConfirmDialogValue(true);

    fixture.detectChanges();
    AdminEmailTestInstance.deleteExistingEmail(0);

    expect(CustomerAdminEmailServiceMock.deleteAdminEmail).toHaveBeenCalled();
  });
});

describe('calls without customer list', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(defaultTestBedConfig);
    TestBed.overrideProvider(CustomerService, {
      useValue:{
        getCustomerById: (customerId?: string) => {
          return new Observable((observer) => {
              observer.next({customers:[null]});
              observer.complete();
              return {
                  unsubscribe() { }
              };
          });
      },
      }
    })
    fixture = TestBed.createComponent(AdminEmailsComponent)
    AdminEmailTestInstance = fixture.componentInstance;
  });
  
  it('should not fetch any customer', () => {
    AdminEmailTestInstance.ngOnInit();
    expect(AdminEmailTestInstance.adminEmails).toEqual(undefined);
  })
});
