import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { of } from "rxjs";
import { DialogService } from "src/app/services/dialog.service";
import { StakeHolderServiceMock } from "src/test/mock/services/ctaas-stakeholder-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { UpdateStakeHolderComponent } from "./update-stake-holder.component";
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';
import { CtaasStakeholderComponent } from '../ctaas-stakeholder.component';

let modifyStakeholderComponentTestInstance: UpdateStakeHolderComponent;
let fixture: ComponentFixture<UpdateStakeHolderComponent>;
const dialogService = new DialogServiceMock();

const currentStakeHolder = {
    companyName: "testCompany",
    email: "teststakeholder11@gmail.com",
    jobTitle: "test",
    name: "testName",
    notifications: 'Weekly Reports,Monthly Summaries',
    phoneNumber: "+2222222222",
    subaccountId: "f6c0e45e-cfdc-4c1a-820e-bef6a856aaea",
    type: "High level"
};

const incompleteStakeHolder = {
    companyName: "",
    email: "teststakeholder11@gmail.com",
    jobTitle: "",
    name: "testName",
    notifications: 'Weekly Reports,Monthly Summaries',
    phoneNumber: "",
    subaccountId: "f6c0e45e-cfdc-4c1a-820e-bef6a856aaea",
    type: "High level"
};

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CtaasStakeholderComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: currentStakeHolder });
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(UpdateStakeHolderComponent);
    modifyStakeholderComponentTestInstance = fixture.componentInstance;
};

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI and components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title')
        const name = fixture.nativeElement.querySelector('#name-label');
        const jobTitleLabel = fixture.nativeElement.querySelector('#job-title-label');
        const companyNameLabel = fixture.nativeElement.querySelector('#company-name-label');
        const emailLabel = fixture.nativeElement.querySelector('#email-label');

        expect(h1.textContent).toBe('Update Stakeholder')
        expect(name.textContent).toBe(' Name');
        expect(jobTitleLabel.textContent).toBe('Job Title');
        expect(companyNameLabel.textContent).toBe('Company Name');
        expect(emailLabel.textContent).toBe('Email');
    });
});

describe('modify stakeholder interactions', () => {
    beforeEach(beforeEachFunction)
    it('it should update an stakeholder', async () => {
        spyOn(modifyStakeholderComponentTestInstance, 'updateStakeholderDetails').and.callThrough();
        spyOn(StakeHolderServiceMock, 'updateStakeholderDetails').and.callThrough();
        fixture.detectChanges();
        
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('name').setValue('testN');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('jobTitle').setValue('testJ');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('companyName').setValue('testC');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('subaccountAdminEmail').setValue('vb@gmail.com');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('phoneNumber').setValue('1111111111');
       
        modifyStakeholderComponentTestInstance.updateStakeholderDetails();
        await fixture.whenStable();
        expect(StakeHolderServiceMock.updateStakeholderDetails).toHaveBeenCalled();
    });

    it('should cancel the update of a stakeholder', () => {
        spyOn(modifyStakeholderComponentTestInstance, 'updateStakeholderDetails').and.callThrough();
        spyOn(dialogService, 'close').and.callThrough();
        fixture.detectChanges();

        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('name').setValue('testN');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('jobTitle').setValue('testJ');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('companyName').setValue('testC');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('subaccountAdminEmail').setValue('vb@gmail.com');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('phoneNumber').setValue('1111111111');

        modifyStakeholderComponentTestInstance.updateStakeholderDetails();
        modifyStakeholderComponentTestInstance.onCancel();

        expect(dialogService.close).toHaveBeenCalled();
    });

    it('it should update an stakeholder without notifications', async () => {
        spyOn(modifyStakeholderComponentTestInstance, 'updateStakeholderDetails').and.callThrough();
        spyOn(StakeHolderServiceMock, 'updateStakeholderDetails').and.callThrough();
        fixture.detectChanges();
        
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('name').setValue('testN');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('jobTitle').setValue('testJ');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('companyName').setValue('testC');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('subaccountAdminEmail').setValue('vb@gmail.com');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('phoneNumber').setValue('1111111111');
       
        modifyStakeholderComponentTestInstance.updateStakeholderDetails();
        await fixture.whenStable();
        expect(StakeHolderServiceMock.updateStakeholderDetails).toHaveBeenCalled();
    });
    it('should display an error message if an error ocurred in initializeForm', () => {
        spyOn(modifyStakeholderComponentTestInstance, 'initializeForm').and.callThrough();
        spyOn(console, 'error').and.callThrough();

        modifyStakeholderComponentTestInstance.data = null
        modifyStakeholderComponentTestInstance.initializeForm();

        expect(console.error).toHaveBeenCalledWith('some error | ',jasmine.any(TypeError))
    })
});

describe('modify incomplete stakeholder - FromGroup verification test', () => {
    beforeEach(() => {
        const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CtaasStakeholderComponent);
        configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
        configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
        configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: incompleteStakeHolder });
        TestBed.configureTestingModule(configBuilder.getConfig());
        fixture = TestBed.createComponent(UpdateStakeHolderComponent);
        modifyStakeholderComponentTestInstance = fixture.componentInstance;
    });

    it('should make the necessary checks for Name and Email only', () => {
        fixture.detectChanges();
        const modifyStakeholder = modifyStakeholderComponentTestInstance.updateStakeholderForm

        modifyStakeholder.setValue({
            name: '',
            jobTitle:'',
            companyName:'',
            subaccountAdminEmail:'',
            phoneNumber:'',
            role: '',
        });
        expect(modifyStakeholder.get('name').valid).toBeFalse();
        expect(modifyStakeholder.get('jobTitle').valid).toBeTrue();
        expect(modifyStakeholder.get('companyName').valid).toBeTrue();
        expect(modifyStakeholder.get('subaccountAdminEmail').valid).toBeFalse();
        expect(modifyStakeholder.get('phoneNumber').valid).toBeTrue();
    });
});

describe('modify stakeholder - FromGroup verification test', () => {
    beforeEach(beforeEachFunction);
    it('should make the necessary checks for all fields and disabled submit button', () => {
        fixture.detectChanges();
        const modifyStakeholder = modifyStakeholderComponentTestInstance.updateStakeholderForm

        modifyStakeholder.setValue({
            name: '',
            jobTitle:'',
            companyName:'',
            subaccountAdminEmail:'',
            phoneNumber:'',
            role: '',
        });
        expect(modifyStakeholder.get('name').valid).toBeFalse();
        expect(modifyStakeholder.get('jobTitle').valid).toBeFalse();
        expect(modifyStakeholder.get('companyName').valid).toBeFalse();
        expect(modifyStakeholder.get('subaccountAdminEmail').valid).toBeFalse();
        expect(modifyStakeholder.get('phoneNumber').valid).toBeFalse();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-stakeholder-button').disabled).toBeTrue();
    });

    it('it should enable the submit button', () => {
        fixture.detectChanges();
        const modifyStakeholder = modifyStakeholderComponentTestInstance.updateStakeholderForm;

        modifyStakeholder.setValue({
            name:'testNf',
            jobTitle:'testJf',
            companyName:'testCf',
            subaccountAdminEmail:'teststakeholder11@gmail.com',
            phoneNumber:{e164Number: '+919898989809'},
            role: '',
        });
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('subaccountAdminEmail').enable();
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('subaccountAdminEmail').setValue('teststakeholder11@gmail.com');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-stakeholder-button').disabled).toBeFalse();
    });
})

describe('dialog calls', () => {
    beforeEach(beforeEachFunction);
    it('should show a message if an error ocurred while updating stakeholder',() => {
        const response = {error: "some error message"};
        fixture.detectChanges();

        spyOn(modifyStakeholderComponentTestInstance,'updateStakeholderDetails').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(StakeHolderServiceMock, 'updateStakeholderDetails').and.returnValue(of(response));

        modifyStakeholderComponentTestInstance.updateStakeholderDetails();

        expect(StakeHolderServiceMock.updateStakeholderDetails).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledOnceWith(response.error, 'Error while updating stake holder');
    });
});
