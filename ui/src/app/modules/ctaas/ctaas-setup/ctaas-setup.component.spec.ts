import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LicenseServiceMock } from 'src/test/mock/services/license-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { CtaasSetupComponent } from './ctaas-setup.component';
import { LicenseConfirmationModalComponent } from './license-confirmation-modal/license-confirmation-modal.component';
import { CtaasSetupServiceMock } from 'src/test/mock/services/ctaas-setup.service.mock';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { DialogService } from 'src/app/services/dialog.service';
import { Observable, of } from 'rxjs';
import { FeatureToggleServiceMock } from "../../../../test/mock/services/feature-toggle-service.mock";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';

let CtaasSetupComponentTestInstance: CtaasSetupComponent;
let fixture: ComponentFixture<CtaasSetupComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CtaasSetupComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
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
        const h1 = fixture.nativeElement.querySelector('#setup-title');
        const editButton = fixture.nativeElement.querySelector('#edit-details-button');

        expect(h1.textContent).toBe('Spotlight Setup Details');
        expect(editButton.textContent).toBe(' Edit Setup Details ');

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

    // test 3
    it('should enable form when "Edit Setup Details" button is clicked', () => {
        fixture.detectChanges();
        spyOn(CtaasSetupComponentTestInstance, 'editForm').and.callThrough;

        CtaasSetupComponentTestInstance.editForm();
        const form = CtaasSetupComponentTestInstance.setupForm.enable();
        expect(CtaasSetupComponentTestInstance.editForm).toHaveBeenCalled();
        expect(form).toBeTruthy
    });

    // test 4
    it('should display update and cancel buttons, when "Edit Setup Details" button is clicked', () => {
        spyOn(CtaasSetupComponentTestInstance, 'editForm').and.callThrough();
        CtaasSetupComponentTestInstance.editForm();
        fixture.detectChanges();

        const updateButton = fixture.nativeElement.querySelector('#update-button');
        const cancelButton = fixture.nativeElement.querySelector('#cancel-button');

        expect(updateButton.textContent).toBe(' Update ');
        expect(cancelButton.textContent).toBe(' Cancel ');
    });
    // test 5    
    it('should update setup details on "Update" button click', () => {
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();

        CtaasSetupComponentTestInstance.editForm();
        const setupDetails = CtaasSetupServiceMock.testSetup2
        const form = CtaasSetupComponentTestInstance.setupForm;
        form.patchValue(setupDetails);
        fixture.detectChanges();

        CtaasSetupComponentTestInstance.submit();
        expect(CtaasSetupComponentTestInstance.submit).toHaveBeenCalled();
    });

    // test 6
    it('should cancel editing and disable form when "Cancel" button is clicked', () => {
        fixture.detectChanges();
        spyOn(CtaasSetupComponentTestInstance, 'cancelEdit').and.callThrough();
        spyOn(dialogService, 'close').and.callThrough();

        CtaasSetupComponentTestInstance.editForm();
        CtaasSetupComponentTestInstance.cancelEdit();
        dialogService.close();
        CtaasSetupComponentTestInstance.setupForm.disable();
        fixture.detectChanges();

        expect(dialogService.close).toHaveBeenCalled();
        expect(CtaasSetupComponentTestInstance.cancelEdit).toHaveBeenCalled();
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
        spyOn(CtaasSetupComponentTestInstance, 'editForm').and.callThrough();
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();
        fixture.detectChanges();

        CtaasSetupComponentTestInstance.editForm();

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
        spyOn(CtaasSetupComponentTestInstance, 'editForm').and.callThrough();
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();
        fixture.detectChanges();

        // const ctaasSetups = CtaasSetupServiceMock.usersListValue.setups;
        // ctaasSetups.find(setup => setup.subaccountId === subaccount.id);
        CtaasSetupComponentTestInstance.editForm();

        const form = CtaasSetupComponentTestInstance.setupForm
        form.value.status = 'SETUP_READY';
        fixture.detectChanges();
        CtaasSetupComponentTestInstance.submit();
        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(CtaasSetupComponentTestInstance.submit).toHaveBeenCalled();
    });

    // test 11
    it('should show error message in case there is no license', () => {
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

        CtaasSetupComponentTestInstance.editForm();
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
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(errorResponse.error, 'Error getting Spotlight Setup!');
    });

    // test 13
    it('should display a message when an error occured while updating setup details', () => {
        const errorResponse = { error: 'some error' };
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();
        spyOn(CtaasSetupServiceMock, 'updateCtaasSetupDetailsById').and.returnValue(of(errorResponse));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();

        CtaasSetupComponentTestInstance.editForm();
        CtaasSetupComponentTestInstance.submit();
        expect(CtaasSetupComponentTestInstance.submit).toHaveBeenCalled();
        expect(CtaasSetupServiceMock.updateCtaasSetupDetailsById).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(errorResponse.error, 'Error updating Spotlight Setup!');
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

        CtaasSetupComponentTestInstance.editForm();
        CtaasSetupComponentTestInstance.submit();
        expect(CtaasSetupComponentTestInstance.submit).toHaveBeenCalled();
        expect(CtaasSetupServiceMock.updateCtaasSetupDetailsById).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Spotlight Setup edited successfully!', '');
    });

    it('should display a message when update is successful and the response is null', () => {
        const testResponse = null;
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough();
        spyOn(CtaasSetupServiceMock, 'updateCtaasSetupDetailsById').and.returnValue(of(testResponse));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();

        CtaasSetupComponentTestInstance.editForm();
        CtaasSetupComponentTestInstance.submit();
        expect(CtaasSetupComponentTestInstance.submit).toHaveBeenCalled();
        expect(CtaasSetupServiceMock.updateCtaasSetupDetailsById).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Spotlight Setup edited successfully!', '');
    });
});
