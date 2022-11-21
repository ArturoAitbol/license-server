import { HarnessLoader } from "@angular/cdk/testing";
import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { of, throwError } from "rxjs";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { DialogService } from "src/app/services/dialog.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { StakeHolderService } from "src/app/services/stake-holder.service";
import { SubAccountService } from "src/app/services/sub-account.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { StakeHolderServiceMock } from "src/test/mock/services/ctaas-stakeholder-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SubaccountServiceMock } from "src/test/mock/services/subaccount-service.mock";
import { AddStakeHolderComponent } from "./add-stake-holder.component";

let addStakeholderComponentTestInstance: AddStakeHolderComponent;
let fixture: ComponentFixture<AddStakeHolderComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const RouterMock = {
    navigate: (commands: string[]) => { }
};

const defaultTestBedConfig = {
    declarations: [AddStakeHolderComponent],
        imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, ReactiveFormsModule],
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
                provide: StakeHolderService,
                useValue: StakeHolderServiceMock
            },
            {
                provide: DialogService,
                useValue: dialogService
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
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            },
            {
                provide: MatDialogRef,
                useValue: dialogService
            },
            {
                provide: FormBuilder
            },
            {
                provide: SubAccountService,
                useValue: SubaccountServiceMock
            }
        ]
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule(defaultTestBedConfig)
    fixture = TestBed.createComponent(AddStakeHolderComponent);
    addStakeholderComponentTestInstance = fixture.componentInstance;
    spyOn(console, 'log').and.callThrough();
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
        const mobileNumberLabel = fixture.nativeElement.querySelector('#mobile-number-label');

        expect(h1.textContent).toBe('Add Stakeholder');
        expect(name.textContent).toBe(' Name');
        expect(jobTitleLabel.textContent).toBe('Job Title');
        expect(companyNameLabel.textContent).toBe('Company Name');
        expect(emailLabel.textContent).toBe('Email');
        expect(mobileNumberLabel.textContent).toBe('Phone Number');
    });

    it('should enable the submit button', () => {
        const addStakholder = addStakeholderComponentTestInstance.addStakeholderForm;
        const submitButton = fixture.nativeElement.querySelector('#submit-stakeholder-button');
        addStakholder.setValue({
            name:'testName11',
            jobTitle:'testJob11',
            companyName:'testComp11',
            subaccountAdminEmail:'tests1takeholder@gmail.com',
            phoneNumber:'+919898989809'
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
        addStakeholderComponentTestInstance.addStakeholderForm.get('phoneNumber').setValue('1111111111');

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
        addStakeholderComponentTestInstance.addStakeholderForm.get('phoneNumber').setValue('1111111111');

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

        expect(console.error).toHaveBeenCalledWith('error while creating stake holder | ', jasmine.any(TypeError));
    })
});

describe('addStakeholder - without subaccount id', () => {
    beforeEach(() =>{
        TestBed.configureTestingModule(defaultTestBedConfig);
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
        addStakeholderComponentTestInstance.addStakeholderForm.get('phoneNumber').setValue('1111111111');

        addStakeholderComponentTestInstance.addStakeholder();

        expect(StakeHolderServiceMock.createStakeholder).toHaveBeenCalled();
    });
});
