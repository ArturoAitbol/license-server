import { of } from "rxjs";
// import { instance, mock, verify, when } from "ts-mockito";
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import { MatDialog} from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogService } from 'src/app/services/dialog.service';
import { MatDialogMock } from 'src/test/mock/components/mat-dialog.mock';
import { MsalServiceMock } from 'src/test/mock/services/msal-service.mock';
import { SharedModule } from '../../modules/shared/shared.module';
import { AdminEmailsComponent } from './admin-emails.component';
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from "src/app/services/customer.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { CustomerServiceMock } from "src/test/mock/services/customer-service.mock";
import { CustomerAdminEmailService } from "src/app/services/customer-admin-email.service";
import { CustomerAdminEmailServiceMock } from "src/test/mock/services/customer-admin-email.service.mock";

let AdminEmailTestInstance: AdminEmailsComponent;
let fixture: ComponentFixture<AdminEmailsComponent>;
const dialogMock = new DialogServiceMock();
const dialogService = new DialogServiceMock();
const RouterMock = {
  navigate: (commands: string[]) => {}
};
const defaultTestBedConfig = {
      declarations: [ AdminEmailsComponent],
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
          provide: SnackBarService,
          useValue: SnackBarServiceMock
      },
      {
          provide: MatSnackBarRef,
          useValue: {}
      },
      {
          provide: DialogService,
          useValue: dialogService
      },
      {
          provide: MsalService,
          useValue: MsalServiceMock
      },
      {   provide: MAT_DIALOG_DATA, 
          useValue: {} 
      },
      {
          provide: HttpClient,
          useValue: HttpClient
      },
      {   provide: MatDialogRef, 
          useValue: dialogMock
      },
      {
        provide: CustomerService,
        useValue: CustomerServiceMock
      },
      {
        provide: CustomerAdminEmailService,
        useValue: CustomerAdminEmailServiceMock
      }
      ]
  };
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
    spyOn(dialogMock, 'close').and.callThrough();
    AdminEmailTestInstance.submit();
    expect(AdminEmailTestInstance.submit).toHaveBeenCalled();

    AdminEmailTestInstance.onCancel();
    expect(AdminEmailTestInstance.onCancel).toHaveBeenCalled();
  });

  it('should click on add button',()=>{
    spyOn(AdminEmailTestInstance, 'addEmailForm').and.callThrough();
    spyOn(dialogMock, 'close').and.callThrough();
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

  it('should show an error when create an adminEmail fails after calling submit()', () => {
    spyOn(AdminEmailTestInstance, 'addEmailForm').and.callThrough();
    AdminEmailTestInstance.addEmailForm();
    
    spyOn(CustomerAdminEmailServiceMock, 'createAdminEmail').and.returnValue(throwError({message: 'error message'}));
    spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
    const adminEmailsForm = AdminEmailTestInstance.adminEmailsForm;
    adminEmailsForm.setValue({name: "test", emails:[{email:"test@email.com"}]});

    fixture.detectChanges();
    AdminEmailTestInstance.submit();

    expect(CustomerAdminEmailServiceMock.createAdminEmail).toHaveBeenCalled();
    // expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('error message', 'Error while editing administrator emails!');
  });

  it('should test deleteEmailForm', () => {
    spyOn(AdminEmailTestInstance, 'deleteEmailForm').and.callThrough();
    AdminEmailTestInstance.deleteEmailForm(0);

    fixture.detectChanges();
    AdminEmailTestInstance.deleteEmailForm(0);

    expect(AdminEmailTestInstance.deleteEmailForm).toHaveBeenCalled();
  });

  // it('should show a message if successfully deleted a email after calling confirmDeleteDialog()', () => {
    

  //   spyOn(CustomerAdminEmailServiceMock, 'deleteAdminEmail').and.callThrough();
  //   spyOn(AdminEmailTestInstance, 'deleteExistingEmail').and.callThrough();

  //   fixture.detectChanges();
  //   AdminEmailTestInstance.deleteExistingEmail(0);

  //   expect(CustomerAdminEmailServiceMock.deleteAdminEmail).toHaveBeenCalled();
  //   expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Customer administrator email deleted');
  // });

});