import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from "rxjs";
import { DialogService } from "src/app/services/dialog.service";
import { SubAccountService } from "src/app/services/sub-account.service";
import { StakeHolderServiceMock } from "src/test/mock/services/ctaas-stakeholder-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { AddStakeHolderComponent } from "./add-stake-holder.component";
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';

let addStakeholderComponentTestInstance: AddStakeHolderComponent;
let fixture: ComponentFixture<AddStakeHolderComponent>;
const dialogService = new DialogServiceMock();

const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddStakeHolderComponent)
    .addProvider({ provide: DialogService, useValue: dialogService })
    .addProvider({ provide: MatDialogRef, useValue: dialogService });

const beforeEachFunction = () => {
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(AddStakeHolderComponent);
    addStakeholderComponentTestInstance = fixture.componentInstance;
    fixture.detectChanges();
};

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI and components', () => {
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const name = fixture.nativeElement.querySelector('#name-label');
        const jobTitleLabel = fixture.nativeElement.querySelector('#job-title-label');
        const companyNameLabel = fixture.nativeElement.querySelector('#company-name-label');
        const emailLabel = fixture.nativeElement.querySelector('#email-label');

        expect(h1.textContent).toBe('Add Stakeholder');
        expect(name.textContent).toBe(' Name');
        expect(jobTitleLabel.textContent).toBe('Job Title');
        expect(companyNameLabel.textContent).toBe('Company Name');
        expect(emailLabel.textContent).toBe('Email');
    });

    it('should enable the submit button', () => {
        const addStakholder = addStakeholderComponentTestInstance.addStakeholderForm;
        const submitButton = fixture.nativeElement.querySelector('#submit-stakeholder-button');
        addStakholder.setValue({
            name:'testName11',
            jobTitle:'testJob11',
            companyName:'testComp11',
            subaccountAdminEmail:'tests1takeholder@gmail.com',
            phoneNumber:{
                countryCode:"US",
                dialCode: "+1",
                e164Number: "+19198989898",
                internationalNumber: "+1 919-898-9898",
                nationalNumber: "(919) 898-9898",
                number: "+19198989898"
            }
        });
        fixture.detectChanges();
        expect(submitButton.disabled).toBeFalse();
    });

    it('should disable the submit button', () => {
        const addStakholder = addStakeholderComponentTestInstance.addStakeholderForm;
        const submitButton = fixture.nativeElement.querySelector('#submit-stakeholder-button');
        addStakholder.setValue({
            name:'',
            jobTitle:'',
            companyName:'',
            subaccountAdminEmail:'',
            phoneNumber:''
        });
        expect(submitButton.disabled).toBeTrue();
    });

    it('should make the necessary checks for Name and Email', () => {
        fixture.detectChanges();
        const modifyStakeholder = addStakeholderComponentTestInstance.addStakeholderForm

        modifyStakeholder.setValue({
            name: '',
            jobTitle:'',
            companyName:'',
            subaccountAdminEmail:'',
            phoneNumber:'',
        });
        expect(modifyStakeholder.get('name').valid).toBeFalse();
        expect(modifyStakeholder.get('jobTitle').valid).toBeTrue();
        expect(modifyStakeholder.get('companyName').valid).toBeTrue();
        expect(modifyStakeholder.get('subaccountAdminEmail').valid).toBeFalse();
        expect(modifyStakeholder.get('phoneNumber').valid).toBeTrue();
    });
});

describe('add stakeholder interactions', () => {
    beforeEach(beforeEachFunction);
    it('should add a stakeholder', () => {
        spyOn(addStakeholderComponentTestInstance, 'addStakeholder').and.callThrough();
        spyOn(StakeHolderServiceMock, 'createStakeholder').and.callThrough();
        
        addStakeholderComponentTestInstance.addStakeholderForm.get('name').setValue('testN');
        addStakeholderComponentTestInstance.addStakeholderForm.get('jobTitle').setValue('testJ');
        addStakeholderComponentTestInstance.addStakeholderForm.get('companyName').setValue('testC');
        addStakeholderComponentTestInstance.addStakeholderForm.get('subaccountAdminEmail').setValue('vb@gmail.com');
        addStakeholderComponentTestInstance.addStakeholderForm.get('phoneNumber').setValue({
            countryCode:"US",
            dialCode: "+1",
            e164Number: "+19198989898",
            internationalNumber: "+1 919-898-9898",
            nationalNumber: "(919) 898-9898",
            number: "+19198989898"
        });

        addStakeholderComponentTestInstance.addStakeholder();

        expect(StakeHolderServiceMock.createStakeholder).toHaveBeenCalled();

    });

    it('should add a stakeholder without notifications', () => {
        spyOn(addStakeholderComponentTestInstance, 'addStakeholder').and.callThrough();
        spyOn(StakeHolderServiceMock, 'createStakeholder').and.callThrough();

        addStakeholderComponentTestInstance.addStakeholderForm.get('name').setValue('testN');
        addStakeholderComponentTestInstance.addStakeholderForm.get('jobTitle').setValue('testJ');
        addStakeholderComponentTestInstance.addStakeholderForm.get('companyName').setValue('testC');
        addStakeholderComponentTestInstance.addStakeholderForm.get('subaccountAdminEmail').setValue('vb@gmail.com');
        addStakeholderComponentTestInstance.addStakeholderForm.get('phoneNumber').setValue({
            countryCode:"US",
            dialCode: "+1",
            e164Number: "+19198989898",
            internationalNumber: "+1 919-898-9898",
            nationalNumber: "(919) 898-9898",
            number: "+19198989898"
        });

        addStakeholderComponentTestInstance.addStakeholder();

        expect(StakeHolderServiceMock.createStakeholder).toHaveBeenCalled();
    });
});

describe('display of error messages', () => {
    beforeEach(beforeEachFunction);
    it('should display an error message whe adding a stakeholder', () => {
        const err = {error:"some error"}
        spyOn(StakeHolderServiceMock, 'createStakeholder').and.returnValue(throwError(err))
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(addStakeholderComponentTestInstance, 'addStakeholder').and.callThrough();

        addStakeholderComponentTestInstance.addStakeholder();

        expect(StakeHolderServiceMock.createStakeholder).toHaveBeenCalled(); 
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(err.error, 'Error adding stakeholder');
    });
    it('should display an error if the response have error', () => {
        const response = {error:"some error"}
        spyOn(StakeHolderServiceMock, 'createStakeholder').and.returnValue(of(response));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(addStakeholderComponentTestInstance, 'addStakeholder').and.callThrough();

        addStakeholderComponentTestInstance.addStakeholder();

        expect(StakeHolderServiceMock.createStakeholder).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.error, 'Error adding stakeholder');
    });

    it('should display an error message if an error occurred in addStakeholder()', () => {
        spyOn(addStakeholderComponentTestInstance, 'addStakeholder').and.callThrough();
        spyOn(console, 'error').and.callThrough();

        addStakeholderComponentTestInstance.userprofileDetails = null;
        addStakeholderComponentTestInstance.addStakeholder();

        expect(console.error).toHaveBeenCalledWith('error while creating stakeholder | ', jasmine.any(TypeError));
    })
});

describe('addStakeholder - without subaccount id', () => {
    beforeEach(() =>{
        TestBed.configureTestingModule(configBuilder.getConfig());
        TestBed.overrideProvider(SubAccountService, {
            useValue:{
            getSelectedSubAccount:() => {
                    return{ 
                        name: 'testSub',
                        customerId: 'bc632667-705f-441c-9317-5323d906dc73',
                        services: "tokenConsumption, spotlight"
                    }
                }
            }
        });
        fixture = TestBed.createComponent(AddStakeHolderComponent);
        addStakeholderComponentTestInstance = fixture.componentInstance;
    });
    
    it('should add a stakeholder without a subaccount id', () => {
        fixture = TestBed.createComponent(AddStakeHolderComponent);
        addStakeholderComponentTestInstance = fixture.componentInstance;
        spyOn(addStakeholderComponentTestInstance, 'addStakeholder').and.callThrough();
        spyOn(StakeHolderServiceMock, 'createStakeholder').and.callThrough();
        fixture.detectChanges();

        addStakeholderComponentTestInstance.addStakeholderForm.get('name').setValue('testN');
        addStakeholderComponentTestInstance.addStakeholderForm.get('jobTitle').setValue('testJ');
        addStakeholderComponentTestInstance.addStakeholderForm.get('companyName').setValue('testC');
        addStakeholderComponentTestInstance.addStakeholderForm.get('subaccountAdminEmail').setValue('vb@gmail.com');
        addStakeholderComponentTestInstance.addStakeholderForm.get('phoneNumber').setValue({
            countryCode:"US",
            dialCode: "+1",
            e164Number: "+19198989898",
            internationalNumber: "+1 919-898-9898",
            nationalNumber: "(919) 898-9898",
            number: "+19198989898"
        });

        addStakeholderComponentTestInstance.addStakeholder();

        expect(StakeHolderServiceMock.createStakeholder).toHaveBeenCalled();
    });
});
