import { of } from "rxjs";
// import { instance, mock, verify, when } from "ts-mockito";
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed} from '@angular/core/testing';
import { MatDialog} from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { DialogService } from 'src/app/services/dialog.service';
import { MatDialogMock } from 'src/test/mock/components/mat-dialog.mock';
import { MsalServiceMock } from 'src/test/mock/services/msal-service.mock';
import { SharedModule } from '../../modules/shared/shared.module';
import { AdminEmailsComponent } from './admin-emails.component';
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { ReactiveFormsModule } from '@angular/forms';
import { Input } from "@angular/core";
import {By} from "@angular/platform-browser";
import { FormBuilder } from '@angular/forms';
import { truncateSync } from "fs";

let AdminEmailTestInstance: AdminEmailsComponent;
let fixture: ComponentFixture<AdminEmailsComponent>;

const RouterMock = {
  navigate: (commands: string[]) => {}
};
const beforeEachFunction = () => {
  TestBed.configureTestingModule({
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
          provide: MatSnackBarRef,
          useValue: {}
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
          useValue: {} 
      }
      ]
  });
  fixture = TestBed.createComponent(AdminEmailsComponent);
  AdminEmailTestInstance = fixture.componentInstance;
  AdminEmailTestInstance.ngOnInit();
};

describe('UI verification test', () => {
  beforeEach(beforeEachFunction);
  it('should display UI components', () =>{
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('#modal-title');
    const name = fixture.nativeElement.querySelector('#customer-name');
    const clearButton = fixture.nativeElement.querySelector('#clearButton');
    const addButton = fixture.nativeElement.querySelector('#addButton');
    const cancel = fixture.nativeElement.querySelector('#cancel-button');
    const submit = fixture.nativeElement.querySelector('#submit-button');

    expect(title.textContent).toBe('Customer Administrator Emails');
    expect(clearButton.textContent).toBe('clear');
    expect(addButton.textContent).toBe('add');
    expect(name.textContent).toBe('Customer Name');
    expect(submit.textContent).toBe('Submit');
    expect(cancel.textContent).toBe('Cancel');
  });

  // it('should enable submit button when fields are correct',()=>{
  //   const updateCustomerForm = AdminEmailTestInstance.adminEmailsForm;

  //   updateCustomerForm.get('name').setValue('customerName');
  //   updateCustomerForm.get('customerType').setValue('Reseller');
  //   updateCustomerForm.get('subaccountName').setValue('subaccountName');
  //   updateCustomerForm.get('testCustomer').setValue(true);
  //   expect(updateCustomerForm.errors).toBeNull();
  //   expect(fixture.debugElement.nativeElement.querySelector('#submit-button').disabled).toBeFalsy();
  // });
});
// describe('add admin email flow', () => {
//   beforeEach(beforeEachFunction);
//   it('should execute submit action', () => {
//     spyOn(AdminEmailTestInstance, 'submit').and.callThrough();
//     spyOn(AdminEmailTestInstance, 'onCancel').and.callThrough();
//     spyOn(dialogMock, 'close').and.callThrough();
//     AdminEmailTestInstance.submit();
//     expect(AdminEmailTestInstance.submit).toHaveBeenCalled();

//     AdminEmailTestInstance.onCancel();
//     expect(AdminEmailTestInstance.onCancel).toHaveBeenCalled();
//   });
//   it('should click on add button',()=>{
//     spyOn(AdminEmailTestInstance, 'addEmailForm').and.callThrough();
//     spyOn(dialogMock, 'close').and.callThrough();
//     AdminEmailTestInstance.addEmailForm();
//     expect(AdminEmailTestInstance.addEmailForm).toHaveBeenCalled();
//   });
//  it('should click on delete button',()=>{
//     spyOn(AdminEmailTestInstance, 'deleteExistingEmail').and.callThrough();
//     spyOn(dialogMock, 'close').and.callThrough();
//     AdminEmailTestInstance.deleteExistingEmail(0);
//     expect(AdminEmailTestInstance.deleteExistingEmail).toHaveBeenCalled();
//   });
// });


