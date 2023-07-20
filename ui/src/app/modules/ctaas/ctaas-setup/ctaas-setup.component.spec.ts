import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LicenseServiceMock } from 'src/test/mock/services/license-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { CtaasSetupComponent } from './ctaas-setup.component';
import { LicenseConfirmationModalComponent } from './license-confirmation-modal/license-confirmation-modal.component';
import { CtaasSetupServiceMock } from 'src/test/mock/services/ctaas-setup.service.mock';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { DialogService } from 'src/app/services/dialog.service';
import { Observable, of, throwError } from 'rxjs';
import { FeatureToggleServiceMock } from "../../../../test/mock/services/feature-toggle-service.mock";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';
import { CtaasSupportEmailService } from 'src/app/services/ctaas-support-email.service';
import { CtaasSupportEmailServiceMock } from 'src/test/mock/services/ctaas-support-email.service.mock';

let CtaasSetupComponentTestInstance: CtaasSetupComponent;
let fixture: ComponentFixture<CtaasSetupComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CtaasSetupComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({provide: CtaasSupportEmailService, useValue: CtaasSupportEmailServiceMock})
    configBuilder.addDeclaration(LicenseConfirmationModalComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(CtaasSetupComponent);
    CtaasSetupComponentTestInstance = fixture.componentInstance;
    CtaasSetupComponentTestInstance.ngOnInit();
}

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);

    //test 1
    it('should display essential UI and components', () => {
        fixture.detectChanges();
        const setupTitle = fixture.nativeElement.querySelector('#setup-title');
        const supportEmailsTitle = fixture.nativeElement.querySelector('#support-emails-title');
        const addEmailButton = fixture.nativeElement.querySelector("#add-email-button");
        const updateButton = fixture.nativeElement.querySelector("#update-button");
        const cancelButton = fixture.nativeElement.querySelector("#cancel-button");

        expect(setupTitle.textContent).toBe('UCaaS Continuous Testing Setup Details');
        expect(supportEmailsTitle.textContent).toBe('Support Emails');
        expect(addEmailButton).not.toBe(null);
        expect(updateButton).not.toBe(null);
        expect(cancelButton).not.toBe(null);
    });

    //test 2
    it('should display all form fields', () => {
        fixture.detectChanges();
        const setupForm = fixture.nativeElement.querySelector('#setup-form');
        const azureResouceGroup = fixture.nativeElement.querySelector('#azure-resource-group-label');
        const tapUrl = fixture.nativeElement.querySelector('#tap-url-label');
        const status = fixture.nativeElement.querySelector('#status-label');

        expect(setupForm).toBeTruthy();
        expect(azureResouceGroup.innerText).toBe('Azure Resource Group');
        expect(tapUrl.innerText).toBe('TAP URL');
        expect(status.innerText).toBe('Status');
    });
});

describe('make method calls', () => {
    beforeEach(beforeEachFunction);
    // test 5    
    it('should update setup details on "Update" button click', () => {
        dialogService.expectedConfirmDialogValue = true;
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();

        const setupDetails = CtaasSetupServiceMock.testSetup2
        const form = CtaasSetupComponentTestInstance.setupForm;
        form.patchValue(setupDetails);
        fixture.detectChanges();

        CtaasSetupComponentTestInstance.submit();
        expect(CtaasSetupComponentTestInstance.submit).toHaveBeenCalled();
    });
});

describe('setup form verifications', () => {
    beforeEach(beforeEachFunction);

    // test 7
    it('should create form group with necessary form controls', () => {
        fixture.detectChanges();
        expect(CtaasSetupComponentTestInstance.setupForm.get('azureResourceGroup')).toBeTruthy();
        expect(CtaasSetupComponentTestInstance.setupForm.get('tapUrl')).toBeTruthy();
        expect(CtaasSetupComponentTestInstance.setupForm.get('status')).toBeTruthy();
        expect(CtaasSetupComponentTestInstance.setupForm.get('onBoardingComplete')).toBeTruthy();
        expect(CtaasSetupComponentTestInstance.setupForm.get('maintenance')).toBeTruthy();
    });

    // test 8
    it('should make necessary form controls required', () => {
        fixture.detectChanges();
        const setup = CtaasSetupComponentTestInstance.setupForm;
        setup.setValue({
            azureResourceGroup: '',
            tapUrl: '',
            status: '',
            onBoardingComplete: '',
            maintenance: ''
        });
        expect(setup.hasError('required')).toBeTruthy;

        expect(setup.get('azureResourceGroup').valid).toBeFalse();
        expect(setup.get('tapUrl').valid).toBeFalse();
        expect(setup.get('status').valid).toBeFalse();
        expect(setup.get('onBoardingComplete').valid).toBeFalse();
        expect(setup.get('maintenance').valid).toBeFalse();
        expect(setup.valid).toBeFalsy();
    });

});

describe('dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);

    // test 9
    it('should update setup details on "Update" button click, in case of one license', () => {
        dialogService.expectedConfirmDialogValue = true;
        const response = { ctaasSetups: [CtaasSetupServiceMock.testSetup1] };
        spyOn(CtaasSetupServiceMock, 'getSubaccountCtaasSetupDetails').and.returnValue(of(response));

        spyOn(LicenseServiceMock, 'getLicenseList').and.callFake(() => {
            return new Observable((observer) => {
                observer.next({
                    licenses: [LicenseServiceMock.mockLicenseA]
                });
                observer.complete();
                return {
                    unsubscribe() { }
                };
            });
        });
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();
        fixture.detectChanges();

        const form = CtaasSetupComponentTestInstance.setupForm;
        form.value.status = 'SETUP_READY';
        fixture.detectChanges();
        CtaasSetupComponentTestInstance.submit();
        expect(CtaasSetupServiceMock.getSubaccountCtaasSetupDetails).toHaveBeenCalled();
        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(CtaasSetupComponentTestInstance.submit).toHaveBeenCalled();
    });

    // test 10
    it('should update setup details on "Update" button click, in case of more the one license', () => {
        dialogService.expectedConfirmDialogValue = true;
        spyOn(LicenseServiceMock, 'getLicenseList').and.callFake(() => {
            return new Observable((observer) => {
                observer.next({
                    licenses: [LicenseServiceMock.mockLicenseB, LicenseServiceMock.mockLicenseC]
                });
                observer.complete();
                return {
                    unsubscribe() { }
                };
            });
        });
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();
        fixture.detectChanges();

        // const ctaasSetups = CtaasSetupServiceMock.usersListValue.setups;
        // ctaasSetups.find(setup => setup.subaccountId === subaccount.id);

        const form = CtaasSetupComponentTestInstance.setupForm
        form.value.status = 'SETUP_READY';
        fixture.detectChanges();
        CtaasSetupComponentTestInstance.submit();
        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(CtaasSetupComponentTestInstance.submit).toHaveBeenCalled();
    });

    // test 11
    it('should show error message in case there is no license', () => {
        dialogService.expectedConfirmDialogValue = true;
        spyOn(LicenseServiceMock, 'getLicenseList').and.callFake(() => {
            return new Observable((observer) => {
                observer.next({
                    licenses: []
                });
                observer.complete();
                return {
                    unsubscribe() { }
                };
            });
        });
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();

        const form = CtaasSetupComponentTestInstance.setupForm
        form.value.status = 'SETUP_READY';
        fixture.detectChanges();
        CtaasSetupComponentTestInstance.submit();
        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith("No active subscriptions found", 'Error selecting a subscription');
    });


    it('should make a call to maintenanceToggle and call it with enable', () => {
        dialogService.expectedConfirmDialogValue = true;
        spyOn(FeatureToggleServiceMock, "isFeatureEnabled").and.callThrough();
        spyOn(CtaasSetupComponentTestInstance, 'maintenanceToggle').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();

        CtaasSetupComponentTestInstance.maintenanceToggle('enable');

        expect(dialogService.confirmDialog).toHaveBeenCalledWith({
            title: 'Confirm Maintenance Mode',
            message: 'Enabling this mode triggers an email notification to the customer, and a corresponding alert will be displayed on both the dashboard and mobile app.',
            confirmCaption: 'Confirm',
            cancelCaption: 'Cancel',
        });
    });

    it('should make a call to maintenanceToggle and call it with disable', () => {
        dialogService.expectedConfirmDialogValue = true;
        spyOn(FeatureToggleServiceMock, "isFeatureEnabled").and.callThrough();
        spyOn(CtaasSetupComponentTestInstance, 'maintenanceToggle').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();

        CtaasSetupComponentTestInstance.maintenanceToggle('disable');

        expect(dialogService.confirmDialog).toHaveBeenCalledWith({
            title: 'Disable Maintenance Mode',
            message: 'Before you disable the maintenance mode, please make sure that everything is operational and running smoothly.',
            confirmCaption: 'Confirm',
            cancelCaption: 'Cancel',
        });
    });
});

describe('check for error and success messages', () => {
    beforeEach(beforeEachFunction);

    // test 12
    it('should display message when an error occured while fetching setup details', () => {
        const response = { ctaasSetups: [] };
        const errorResponse = { error: 'No initial setup found' };
        spyOn(CtaasSetupServiceMock, 'getSubaccountCtaasSetupDetails').and.returnValue(of(response));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();

        expect(CtaasSetupServiceMock.getSubaccountCtaasSetupDetails).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(errorResponse.error, 'Error getting UCaaS Continuous Testing Setup!');
    });

    // test 13
    it('should display a message when an error occured while updating setup details', () => {
        dialogService.expectedConfirmDialogValue = true;
        const errorResponse = { error: 'some error' };
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();
        spyOn(CtaasSetupServiceMock, 'updateCtaasSetupDetailsById').and.returnValue(of(errorResponse));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();

        CtaasSetupComponentTestInstance.submit();
        expect(CtaasSetupServiceMock.updateCtaasSetupDetailsById).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(errorResponse.error, 'Error updating UCaaS Continuous Testing Setup!');
    });

    it('should make a call to maintenanceToggle with disable and return error message', () => {
        dialogService.expectedConfirmDialogValue = true;
        const errorResponse = { error: 'some error' };
        spyOn(FeatureToggleServiceMock, "isFeatureEnabled").and.callThrough();
        spyOn(CtaasSetupServiceMock, 'updateCtaasSetupDetailsById').and.returnValue(of(errorResponse));
        spyOn(CtaasSetupComponentTestInstance, 'maintenanceToggle').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        CtaasSetupComponentTestInstance.maintenanceToggle('disable');

        expect(dialogService.confirmDialog).toHaveBeenCalledWith({
            title: 'Disable Maintenance Mode',
            message: 'Before you disable the maintenance mode, please make sure that everything is operational and running smoothly.',
            confirmCaption: 'Confirm',
            cancelCaption: 'Cancel',
        });

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(errorResponse.error,'Error while disabling maintenance mode');
    });

    it('should make a call to maintenanceToggle with enable and return error message', () => {
        dialogService.expectedConfirmDialogValue = true;
        const errorResponse = { error: 'some error' };
        spyOn(FeatureToggleServiceMock, "isFeatureEnabled").and.callThrough();
        spyOn(CtaasSetupServiceMock, 'updateCtaasSetupDetailsById').and.returnValue(of(errorResponse));
        spyOn(CtaasSetupComponentTestInstance, 'maintenanceToggle').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        CtaasSetupComponentTestInstance.maintenanceToggle('enable');

        expect(dialogService.confirmDialog).toHaveBeenCalledWith({
            title: 'Confirm Maintenance Mode',
            message: 'Enabling this mode triggers an email notification to the customer, and a corresponding alert will be displayed on both the dashboard and mobile app.',
            confirmCaption: 'Confirm',
            cancelCaption: 'Cancel',
        });
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(errorResponse.error,'Error while enabling maintenance mode' );
    });

    it('should make a call to maintenanceToggle and return a null response', () => {
        dialogService.expectedConfirmDialogValue = true;
        const errorResponse = null;
        spyOn(FeatureToggleServiceMock, "isFeatureEnabled").and.callThrough();
        spyOn(CtaasSetupServiceMock, 'updateCtaasSetupDetailsById').and.returnValue(of(errorResponse));
        spyOn(CtaasSetupComponentTestInstance, 'maintenanceToggle').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        CtaasSetupComponentTestInstance.maintenanceToggle('disable');

        expect(dialogService.confirmDialog).toHaveBeenCalledWith({
            title: 'Disable Maintenance Mode',
            message: 'Before you disable the maintenance mode, please make sure that everything is operational and running smoothly.',
            confirmCaption: 'Confirm',
            cancelCaption: 'Cancel',
        });

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Maintenance mode disabled successfully', '');
    });
    // test 14
    it('should display a message when update is successful', () => {
        dialogService.expectedConfirmDialogValue = true;
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();
        spyOn(CtaasSetupServiceMock, 'updateCtaasSetupDetailsById').and.callFake(() => {
            return new Observable((observer) => {
                observer.next({
                    licenses: [CtaasSetupServiceMock.testSetup1]
                });
                observer.complete();
                return {
                    unsubscribe() { }
                };
            });
        });
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();

        CtaasSetupComponentTestInstance.submit();
        expect(CtaasSetupServiceMock.updateCtaasSetupDetailsById).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('UCaaS Continuous Testing Setup edited successfully!', '');
    });

    it('should display a message when update is successful and the response is null', () => {
        dialogService.expectedConfirmDialogValue = true;
        const testResponse = null;
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();
        spyOn(CtaasSetupServiceMock, 'updateCtaasSetupDetailsById').and.returnValue(of(testResponse));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();

        CtaasSetupComponentTestInstance.submit();
        expect(CtaasSetupServiceMock.updateCtaasSetupDetailsById).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('UCaaS Continuous Testing Setup edited successfully!', '');
    });
});

describe('add support email flow', () => {
    beforeEach(beforeEachFunction);

    it('should create a formGroup with the necessary controls', () => {
      fixture.detectChanges();
      expect(CtaasSetupComponentTestInstance.supportEmailsForm.get('emails')).toBeTruthy();
    });
  
    it('should add a new formControl after calling addEmailForm()',()=>{
      spyOn(CtaasSetupComponentTestInstance, 'addEmailForm').and.callThrough();
      const emailFormsInitialQuantity = CtaasSetupComponentTestInstance.emailForms.length;
      CtaasSetupComponentTestInstance.addEmailForm();
      expect(CtaasSetupComponentTestInstance.emailForms.length).toBe(emailFormsInitialQuantity+1);
    });

    it('should create a support email after calling addSupportEmails()', () => {
      spyOn(CtaasSetupComponentTestInstance, 'addEmailForm').and.callThrough();
      spyOn(CtaasSupportEmailServiceMock, 'createSupportEmail').and.callThrough();
      spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
      fixture.detectChanges();

      CtaasSetupComponentTestInstance.addEmailForm();
      CtaasSetupComponentTestInstance.emailForms.controls[0].get('email').setValue('test@example.com');
      CtaasSetupComponentTestInstance.addSupportEmails();
  
  
      expect(CtaasSupportEmailServiceMock.createSupportEmail).toHaveBeenCalled();
      expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Support emails added successfully!');
      expect(CtaasSetupComponentTestInstance.isDataLoading).toBeFalse();
    });
  
    it('should show a message if an error ocurred while adding a support email', () => {
      spyOn(CtaasSetupComponentTestInstance, 'addEmailForm').and.callThrough();
      spyOn(CtaasSupportEmailServiceMock, 'createSupportEmail').and.returnValue(throwError({error:'some error'}));
      spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
      fixture.detectChanges();

      CtaasSetupComponentTestInstance.addEmailForm();
      const supportEmailsForm = CtaasSetupComponentTestInstance.supportEmailsForm;
      supportEmailsForm.setValue({emails:[{email:"test@email.com"}]});
      
      CtaasSetupComponentTestInstance.addSupportEmails();
  
      expect(CtaasSupportEmailServiceMock.createSupportEmail).toHaveBeenCalled();
      expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('some error','Error while adding support email!');
      expect(CtaasSetupComponentTestInstance.isDataLoading).toBeFalse();
    });
  
    it('should delete an email after calling deleteExistingEmail()', () => {
      spyOn(CtaasSupportEmailServiceMock, 'deleteSupportEmail').and.callThrough();
      spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
      dialogService.setExpectedConfirmDialogValue(true);
      fixture.detectChanges();
      
      CtaasSetupComponentTestInstance.supportEmails = ['test@example.com','test@example.com'];
      const supportEmails = CtaasSetupComponentTestInstance.supportEmails.length;

      CtaasSetupComponentTestInstance.deleteExistingEmail(0);
  
      expect(CtaasSupportEmailServiceMock.deleteSupportEmail).toHaveBeenCalled();
      expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Support email deleted');
      expect(CtaasSetupComponentTestInstance.supportEmails.length).toBe(supportEmails-1);
      expect(CtaasSetupComponentTestInstance.isDataLoading).toBeFalse();
    });

    it('should show a message if an error ocurred while deleting a support email', () => {
      spyOn(CtaasSupportEmailServiceMock, 'deleteSupportEmail').and.returnValue(throwError({error: 'error message'}));
      spyOn(CtaasSetupComponentTestInstance,'deleteExistingEmail').and.callThrough();
      spyOn( dialogService,'setExpectedConfirmDialogValue').and.callThrough();
      spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
      dialogService.setExpectedConfirmDialogValue(true);

      fixture.detectChanges();

      CtaasSetupComponentTestInstance.deleteExistingEmail(0);
  
      expect(CtaasSupportEmailServiceMock.deleteSupportEmail).toHaveBeenCalled();
      expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('error message','Error while deleting support email!');
    });

    it('should remove a emailForm when calling deleteEmailForm()', () => {
        CtaasSetupComponentTestInstance.addEmailForm();
        CtaasSetupComponentTestInstance.addEmailForm();
        CtaasSetupComponentTestInstance.deleteEmailForm(1);
        expect(CtaasSetupComponentTestInstance.emailForms.controls.length).toBe(1);
    });

      
    it('should remove all the emailForms when calling clearNewSupportEmails()', () => {
        CtaasSetupComponentTestInstance.addEmailForm();
        CtaasSetupComponentTestInstance.addEmailForm();
        CtaasSetupComponentTestInstance.clearNewSupportEmails();
        expect(CtaasSetupComponentTestInstance.emailForms.controls.length).toBe(0);
    });
  });
