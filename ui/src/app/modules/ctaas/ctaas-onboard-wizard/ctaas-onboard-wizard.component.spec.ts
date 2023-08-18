import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { of, throwError } from "rxjs";
import { Constants } from "src/app/helpers/constants";
import { DialogService } from "src/app/services/dialog.service";
import { StakeHolderService } from "src/app/services/stake-holder.service";
import { UserProfileService } from "src/app/services/user-profile.service";
import { CtaasSetupServiceMock } from "src/test/mock/services/ctaas-setup.service.mock";
import { StakeHolderServiceMock } from "src/test/mock/services/ctaas-stakeholder-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SubaccountServiceMock } from "src/test/mock/services/subaccount-service.mock";
import { UserProfileServiceMock } from "src/test/mock/services/user-profile.mock";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";
import { OnboardWizardComponent } from "./ctaas-onboard-wizard.component";
import { FeatureToggleServiceMock } from "src/test/mock/services/feature-toggle-service.mock";


let onboardWizardComponentInstance: OnboardWizardComponent;
let fixture : ComponentFixture<OnboardWizardComponent>;
const dialogService = new DialogServiceMock();

const userData = {
    ctaasSetupId:'1e22eb0d-e499-4dbc-8f68-3dff5a42086b',
   ctaasSetupSubaccountId:'fbb2d912-b202-432d-8c07-dce0dad51f7f'
}

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(OnboardWizardComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addProvider({ provide: UserProfileService, useValue: UserProfileServiceMock});
    configBuilder.addProvider({ provide:StakeHolderService, useValue: StakeHolderServiceMock }) 
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: userData})
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(OnboardWizardComponent);
    onboardWizardComponentInstance = fixture.componentInstance;
    fixture.detectChanges();
}

describe('onboard-wizard options', () => {
    beforeEach(beforeEachFunction);
    it('onboard - should call onClickButton with confirm', () => {
        spyOn(onboardWizardComponentInstance, 'onClickBtn').and.callThrough();

        fixture.detectChanges();

        onboardWizardComponentInstance.onClickBtn('confirm');
        expect(onboardWizardComponentInstance.userInteraction).toBeTrue();
        expect(onboardWizardComponentInstance.interaction).toEqual('2');
    });
    
    it('onboard - should call onClickButton default case', () => {
        spyOn(onboardWizardComponentInstance, 'onClickBtn').and.callThrough();

        fixture.detectChanges();

        onboardWizardComponentInstance.onClickBtn('');
        expect(onboardWizardComponentInstance.userInteraction).toBeFalse()
        expect(onboardWizardComponentInstance.interaction).toEqual('-1');
    })
});

describe('onboard - user interactions', () => {
    beforeEach(beforeEachFunction);
    it('should call to on onConfigureUserPorfile and update it', async () => {
        fixture.detectChanges();
        spyOn(onboardWizardComponentInstance, 'onConfigureUserprofile').and.callThrough();
        spyOn(UserProfileServiceMock, 'updateUserProfile').and.callThrough();
        const updateForm = onboardWizardComponentInstance.userProfileForm;
        updateForm.setValue({
            name: 'test name',
            jobTitle: 'test job',
            companyName: 'test company',
            email: 'test@testemail.com',
            phoneNumber: '+1111111111111'
        });
        onboardWizardComponentInstance.onConfigureUserprofile();
        const updateButton = fixture.nativeElement.querySelector('#update-data-button');
        await fixture.whenStable();
        //expect(updateButton.disable).toBeFalse();
        expect(onboardWizardComponentInstance.onConfigureUserprofile).toHaveBeenCalled();
    });

    it('onboard - should call addStakeholdersConfirmation', async () => {
        spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.callThrough();

        fixture.detectChanges();
        await fixture.whenStable();
        onboardWizardComponentInstance.addStakeholdersConfirmation('yes');

        expect(StakeHolderServiceMock.getStakeholderList).toHaveBeenCalled();
        expect(onboardWizardComponentInstance.addAnotherStakeHolder).toBeTrue();
        expect(onboardWizardComponentInstance.interaction).toEqual('4');
        expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
    });

    it('onboard - should call addStakeholdersConfirmation with "yes" ', async () => {
        spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.callThrough();

        fixture.detectChanges();
        await fixture.whenStable();
        onboardWizardComponentInstance.addStakeholdersConfirmation('yes');

        expect(StakeHolderServiceMock.getStakeholderList).toHaveBeenCalled();
        expect(onboardWizardComponentInstance.addAnotherStakeHolder).toBeTrue();
        expect(onboardWizardComponentInstance.interaction).toEqual('4');
        expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
    });

    it('onboard - should call addStakeholdersConfirmation with default value', async () => {
        spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
        spyOn(onboardWizardComponentInstance, 'onCancel').and.callThrough();

        fixture.detectChanges();
        await fixture.whenStable();
        onboardWizardComponentInstance.addStakeholdersConfirmation('');

        expect(onboardWizardComponentInstance.addAnotherStakeHolder).toBeFalse();
        expect(onboardWizardComponentInstance.interaction).toEqual('-1');
        expect(onboardWizardComponentInstance.onCancel).toHaveBeenCalledWith('closed');
        expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
    });

    it('should add a stakeholder', () => {
        const addStakeholderForm = onboardWizardComponentInstance.stakeholderForm; 
        spyOn(StakeHolderServiceMock, 'createStakeholder').and.callThrough();

        addStakeholderForm.setValue({
            name: 'test name stakeholder',
            jobTitle: 'test job stakeholder',
            companyName: 'test company stakeholder',
            subaccountAdminEmail: 'test@stakeholder.com',
            phoneNumber: '+22222222222222222'
        })
        fixture.detectChanges();

        onboardWizardComponentInstance.addStakeholder();

        expect(StakeHolderServiceMock.createStakeholder).toHaveBeenCalled();
    });

    it('should set errorCreatingStakeholder to tru if an error ocurred while creating a stakeholder', () => {
        const response = {error: "some error"}
        const addStakeholderForm = onboardWizardComponentInstance.stakeholderForm; 
        spyOn(StakeHolderServiceMock, 'createStakeholder').and.returnValue(of(response));

        addStakeholderForm.setValue({
            name: 'test name stakeholder',
            jobTitle: 'test job stakeholder',
            companyName: 'test company stakeholder',
            subaccountAdminEmail: 'test@stakeholder.com',
            phoneNumber: '+22222222222222222'
        })
        fixture.detectChanges();

        onboardWizardComponentInstance.addStakeholder();

        expect(onboardWizardComponentInstance.errorCreatingStakeholder).toBeTrue();
    });
});

describe('testing the error thrown by the functions', () => {
    beforeEach(beforeEachFunction);
    it('should call to on onConfigureUserPorfile and throw error ',() => {
        const response = {error: "some error"}
        spyOn(UserProfileServiceMock, 'updateUserProfile').and.returnValue(of(response));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.onConfigureUserprofile();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error updating User profile details !', '');
    });

    it('should thorw a error if something went wrong in updateOnboardingStatus', () => {
        const response = {error: "some error"}
        fixture.detectChanges();
        spyOn(onboardWizardComponentInstance, 'onConfigureUserprofile').and.callThrough();
        spyOn(UserProfileServiceMock, 'updateUserProfile').and.callThrough();
        spyOn(CtaasSetupServiceMock, 'updateSubaccountCtaasDetails').and.returnValue(of(response))
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        const updateForm = onboardWizardComponentInstance.userProfileForm;
        updateForm.setValue({
            name: 'test name',
            jobTitle: 'test job',
            companyName: 'test company',
            email: 'test@testemail.com',
            phoneNumber: '+1111111111111'
        });
        onboardWizardComponentInstance.onConfigureUserprofile();
       
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error updating the onboarding status !', '');
    });

    it('onboard - should throw a message if the amount of stakeholders created was exceeded', async () => {
        const response = {stakeHolders:[{},{},{},{},{},{},{},{},{},{},{}]}
        spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.returnValue(of(response));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(FeatureToggleServiceMock, "isFeatureEnabled").and.callFake((ftName, subaccountId) => {
            if (ftName === 'multitenant-demo-subaccount')
                return false;
        });

        fixture.detectChanges();
        await fixture.whenStable();
        onboardWizardComponentInstance.addStakeholdersConfirmation('yes');

        expect(StakeHolderServiceMock.getStakeholderList).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('The maximum amount of users (' + Constants.STAKEHOLDERS_LIMIT_PER_SUBACCOUNT + ') has been reached', '');
    });

    it('should thorw a error if something went wrong in updateOnboardingStatus', () => {
        const response = null
        fixture.detectChanges();
        spyOn(onboardWizardComponentInstance, 'onConfigureUserprofile').and.callThrough();
        spyOn(UserProfileServiceMock, 'updateUserProfile').and.callThrough();
        spyOn(CtaasSetupServiceMock, 'updateSubaccountCtaasDetails').and.returnValue(of(response))
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        const updateForm = onboardWizardComponentInstance.userProfileForm;
        updateForm.setValue({
            name: 'test name',
            jobTitle: 'test job',
            companyName: 'test company',
            email: 'test@testemail.com',
            phoneNumber: '+1111111111111'
        });
        onboardWizardComponentInstance.onConfigureUserprofile();
        //expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error updating the onboarding status !', '');
    });
})