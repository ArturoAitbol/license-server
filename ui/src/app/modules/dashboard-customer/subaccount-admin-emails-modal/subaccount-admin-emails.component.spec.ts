import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SubaccountAdminEmailsComponent} from './subaccount-admin-emails.component';
import {SharedModule} from '../../shared/shared.module';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SnackBarService} from '../../../services/snack-bar.service';
import {SnackBarServiceMock} from '../../../../test/mock/services/snack-bar-service.mock';
import {SubAccountService} from '../../../services/sub-account.service';
import {SubaccountServiceMock} from '../../../../test/mock/services/subaccount-service.mock';
import {FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {MsalService} from '@azure/msal-angular';
import {MsalServiceMock} from '../../../../test/mock/services/msal-service.mock';
import {SubaccountAdminEmailServiceMock} from '../../../../test/mock/services/subaccount-admin-email-service.mock';
import {SubaccountAdminEmailService} from '../../../services/subaccount-admin-email.service';
import { Observable, of } from 'rxjs';

let subaccountModalComponentInstance: SubaccountAdminEmailsComponent;
let fixture: ComponentFixture<SubaccountAdminEmailsComponent>;

const RouterMock = {
    navigate: (commands: string[]) => {}
};
const MatDialogRefMock = {
    close: ()=> {}
};
const defaultTestBedConfig = {
        declarations: [SubaccountAdminEmailsComponent],
        imports: [CommonModule, SharedModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, HttpClientModule],
        providers: [
            {
                provide: Router,
                useValue: RouterMock
            },
            {
                provide: FormBuilder,
            },
            {
                provide: SnackBarService,
                useValue: SnackBarServiceMock
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
                provide: MAT_DIALOG_DATA,
                useValue: { subaccountId: SubaccountServiceMock.testSubaccount1.id }
            },
            {
                provide: MsalService,
                useValue: MsalServiceMock
            },
            {
                provide: SubaccountAdminEmailService,
                useValue: SubaccountAdminEmailServiceMock
            }
        ]  
};

const beforeEachFunction = async () =>{
    TestBed.configureTestingModule(defaultTestBedConfig).compileComponents().then(() => {
        fixture = TestBed.createComponent(SubaccountAdminEmailsComponent);
        subaccountModalComponentInstance = fixture.componentInstance;
    })
}

describe('UnitTest', () => {
    describe('simple functions', () => {
        beforeEach(beforeEachFunction);
        it('onCancel()',  () => {
            spyOn(MatDialogRefMock, 'close');
            subaccountModalComponentInstance.onCancel();
            expect(MatDialogRefMock.close).toHaveBeenCalled();
        });
        it('emailForms()',  () => {
            fixture.detectChanges();
            const mockValue = {} as FormArray;
            subaccountModalComponentInstance.adminEmailsForm.controls["emails"] = mockValue;
            expect(subaccountModalComponentInstance.emailForms).toBe(mockValue);
        });
        it('addEmailForm()',  () => {
            fixture.detectChanges();
            expect(subaccountModalComponentInstance.emailForms.length).toBe(0);
            subaccountModalComponentInstance.addEmailForm();
            expect(subaccountModalComponentInstance.emailForms.length).toBe(1);
        });
        it('deleteEmailForm()',  () => {
            fixture.detectChanges();
            subaccountModalComponentInstance.emailForms.push(new FormBuilder().group({ email: ['', [Validators.required, Validators.email]] }));
            subaccountModalComponentInstance.emailForms.push(new FormBuilder().group({ email: ['', [Validators.required, Validators.email]] }));
            expect(subaccountModalComponentInstance.emailForms.length).toBe(2);
            subaccountModalComponentInstance.deleteEmailForm(0);
            expect(subaccountModalComponentInstance.emailForms.length).toBe(1);
        });
    });

    describe('onInit()', () => {
        beforeEach(beforeEachFunction);
        it('should set initial config', () => {
            spyOn(subaccountModalComponentInstance.adminEmailsForm.controls.subaccountName, 'disable');
            spyOn(SubaccountServiceMock, 'getSubAccountDetails').and.callThrough();
            subaccountModalComponentInstance.data = false;
            subaccountModalComponentInstance.ngOnInit();
            expect(subaccountModalComponentInstance.adminEmailsForm.controls.subaccountName.disable).toHaveBeenCalledTimes(1);
            subaccountModalComponentInstance.data = {
                subaccountId: SubaccountServiceMock.subAccountListValue.subaccounts[0].id
            };
            subaccountModalComponentInstance.ngOnInit();
            expect(SubaccountServiceMock.getSubAccountDetails).toHaveBeenCalled();
            expect(subaccountModalComponentInstance.adminEmailsForm.controls.subaccountName.disable).toHaveBeenCalledTimes(2);
        });
    });

    describe('deleteExistingEmail()', () => {
        beforeEach(beforeEachFunction);
        it('should call subaccountAdminEmailService to delete admin email', () => {
            spyOn(SubaccountAdminEmailServiceMock, 'deleteAdminEmail').and.callThrough();
            const adminEmails = ['testSubaccountAdminEmail1@email.one', 'testSubaccountAdminEmail2@email.two'];
            fixture.detectChanges();
            expect(subaccountModalComponentInstance.adminEmails).toEqual(adminEmails);
            subaccountModalComponentInstance.deleteExistingEmail(0);
            expect(SubaccountAdminEmailServiceMock.deleteAdminEmail).toHaveBeenCalledWith(adminEmails[0]);
            expect(subaccountModalComponentInstance.adminEmails).toEqual([adminEmails[1]]);
        });
        it('should show error on snackbar for a service call failure', () => {
            spyOn(SubaccountAdminEmailServiceMock, 'deleteAdminEmail').and.callFake(SubaccountAdminEmailServiceMock.errorResponse);
            fixture.detectChanges();
            spyOn(SnackBarServiceMock, 'openSnackBar');
            spyOn(console, 'error');
            subaccountModalComponentInstance.deleteExistingEmail(0);
            expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith( 'Error deleting administrator email!' );
            expect(console.error).toHaveBeenCalledWith( 'Error while deleting administrator email',
                { error: 'Expected subaccount admin emails response error' }
            );
        });

        it('should show error on snackbar for a successful API call returning with error message', () => {
            spyOn(SubaccountAdminEmailServiceMock, 'deleteAdminEmail').and.callFake(SubaccountAdminEmailServiceMock.apiErrorResponse);
            fixture.detectChanges();
            spyOn(SnackBarServiceMock, 'openSnackBar');
            subaccountModalComponentInstance.deleteExistingEmail(0);
            expect(SnackBarServiceMock.openSnackBar)
                .toHaveBeenCalledWith( 'Expected create subaccount admin email error', 'Error while deleting administrator email!' );
        });
        it('should throw a null response while delating a email', () => {
            const res = null;
            spyOn(SubaccountAdminEmailServiceMock, 'deleteAdminEmail').and.returnValue(of(res));
            fixture.detectChanges();
            subaccountModalComponentInstance.deleteExistingEmail(0);
            expect(SubaccountAdminEmailServiceMock.deleteAdminEmail).toHaveBeenCalled();
        });
    });

    describe('submit()', () => {
        beforeEach(beforeEachFunction);
        it('should display snackbar message if the service call is successful', () => {
            spyOn(SubaccountAdminEmailServiceMock, 'createAdminEmail').and.callThrough();
            spyOn(SnackBarServiceMock, 'openSnackBar');
            fixture.detectChanges();
            subaccountModalComponentInstance.emailForms.push(new FormBuilder().group({ email: ['', [Validators.required, Validators.email]] }));
            subaccountModalComponentInstance.emailForms.push(new FormBuilder().group({ email: ['', [Validators.required, Validators.email]] }));
            subaccountModalComponentInstance.submit();
            expect(SubaccountAdminEmailServiceMock.createAdminEmail).toHaveBeenCalledTimes(2);
            expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Customer admin emails edited successfully! ', '');
        });

        it('should display snackbar error message if the service call fails', () => {
            spyOn(SubaccountAdminEmailServiceMock, 'createAdminEmail').and.callFake(SubaccountAdminEmailServiceMock.apiErrorResponse);
            spyOn(SnackBarServiceMock, 'openSnackBar');
            fixture.detectChanges();
            subaccountModalComponentInstance.emailForms.push(new FormBuilder().group({ email: ['', [Validators.required, Validators.email]] }));
            subaccountModalComponentInstance.emailForms.push(new FormBuilder().group({ email: ['', [Validators.required, Validators.email]] }));
            subaccountModalComponentInstance.submit();
            expect(SubaccountAdminEmailServiceMock.createAdminEmail).toHaveBeenCalledTimes(2);
            expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledTimes(2);
            expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Expected create subaccount admin email error',
                'Error while editing administrator emails!');
        });

        it('should display console error message if the service call fails', () => {
            spyOn(SubaccountAdminEmailServiceMock, 'createAdminEmail').and.callFake(SubaccountAdminEmailServiceMock.errorResponse);
            spyOn(console, 'error');
            fixture.detectChanges();
            subaccountModalComponentInstance.emailForms.push(new FormBuilder().group({ email: ['', [Validators.required, Validators.email]] }));
            subaccountModalComponentInstance.submit();
            expect(console.error).toHaveBeenCalledWith('error while editing administrator emails',
                { error: 'Expected subaccount admin emails response error' });
        });


        it('should close dialog if email form is empty', () => {
            spyOn(SubaccountAdminEmailServiceMock, 'createAdminEmail').and.callFake(SubaccountAdminEmailServiceMock.apiErrorResponse);
            spyOn(MatDialogRefMock, 'close');
            fixture.detectChanges();
            subaccountModalComponentInstance.submit();
            expect(MatDialogRefMock.close).toHaveBeenCalled();
        });
    });

    describe('should fetch data without a subaccounts', () => {
        beforeEach(() => {
            TestBed.configureTestingModule(defaultTestBedConfig)
            TestBed.overrideProvider(SubAccountService, {
                useValue:{
                    getSubAccountDetails: (subAccountId: string) => {
                        return new Observable( (observer) => {
                            observer.next(
                                {
                                    subaccounts: [ null ]
                                }
                            );
                            observer.complete();
                            return {
                                unsubscribe() { }
                            };
                        });
                    },
                }
            })
            fixture = TestBed.createComponent(SubaccountAdminEmailsComponent);
            subaccountModalComponentInstance = fixture.componentInstance;
        });
        it('should fetch data without a subaccount', () => {
            spyOn(SubaccountServiceMock, 'getSubAccountDetails').and.callThrough();
            fixture.detectChanges();
            expect(subaccountModalComponentInstance.adminEmails).toBe(undefined);
        });
    });
});
