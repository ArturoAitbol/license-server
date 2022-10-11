import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { of } from "rxjs";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { DialogService } from "src/app/services/dialog.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { StakeHolderService } from "src/app/services/stake-holder.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { StakeHolderServiceMock } from "src/test/mock/services/ctaas-stakeholder-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog.service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { UpdateStakeHolderComponent } from "./update-stake-holder.component";

let modifyStakeholderComponentTestInstance: UpdateStakeHolderComponent;
let fixture: ComponentFixture<UpdateStakeHolderComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const RouterMock = {
    navigate: (commands: string[]) => { }
};
const currentStakeHolder = {
    companyName: "testCompany",
    email: "teststakeholder11@gmail.com",
    jobTitle: "test",
    name: "testName",
    notifications: 'Weekly Reports,Monthly Summaries',
    phoneNumber: "2222222222",
    subaccountId: "f6c0e45e-cfdc-4c1a-820e-bef6a856aaea",
    type: "High level"
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [UpdateStakeHolderComponent],
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
                provide: MAT_DIALOG_DATA,
                useValue: currentStakeHolder
            }
        ]
    });
    fixture = TestBed.createComponent(UpdateStakeHolderComponent);
    modifyStakeholderComponentTestInstance = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    spyOn(console, 'log').and.callThrough();
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
        const mobileNumberLabel = fixture.nativeElement.querySelector('#mobile-number-label');

        expect(h1.textContent).toBe('Update Stakeholder')
        expect(name.textContent).toBe(' Name');
        expect(jobTitleLabel.textContent).toBe('Job Title');
        expect(companyNameLabel.textContent).toBe('Company Name');
        expect(emailLabel.textContent).toBe('Email');
        expect(mobileNumberLabel.textContent).toBe('Phone Number')
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
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('type').setValue('Detailed');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('notifications').setValue([true, true, false]);
       
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
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('type').setValue('Detailed');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('notifications').setValue([true, true, false]);

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
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('type').setValue('Detailed');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('notifications').setValue([false, false, false]);
       
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

describe('modify stakeholder - FromGroup verification test', () => {
    beforeEach(beforeEachFunction);
    it('should make all the controls required', () => {
        fixture.detectChanges();
        const modifyStakeholder = modifyStakeholderComponentTestInstance.updateStakeholderForm

        modifyStakeholder.setValue({
            name: '',
            jobTitle:'',
            companyName:'',
            subaccountAdminEmail:'',
            phoneNumber:'',
            type:'',
            notifications: ['','','']
        });
        expect(modifyStakeholder.get('name').valid).toBeFalse();
        expect(modifyStakeholder.get('jobTitle').valid).toBeFalse();
        expect(modifyStakeholder.get('companyName').valid).toBeFalse();
        expect(modifyStakeholder.get('subaccountAdminEmail').valid).toBeFalse();
        expect(modifyStakeholder.get('phoneNumber').valid).toBeFalse();
        expect(modifyStakeholder.get('type').valid).toBeFalse();
        expect(modifyStakeholder.get('notifications').valid).toBeTrue();
    });

    it('it should enable the submit button', () => {
        fixture.detectChanges();
        const modifyStakeholder = modifyStakeholderComponentTestInstance.updateStakeholderForm;

        modifyStakeholder.setValue({
            name:'testNf',
            jobTitle:'testJf',
            companyName:'testCf',
            subaccountAdminEmail:'teststakeholder11@gmail.com',
            phoneNumber:'+919898989809',
            type:'Detailed',
            notifications:[true, true, false],
        });
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('subaccountAdminEmail').enable();
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('subaccountAdminEmail').setValue('teststakeholder11@gmail.com');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-stakeholder-button').disabled).toBeFalse();
    });

    it('it should disable the submit button', () => {
        fixture.detectChanges();
        const modifyStakeholder = modifyStakeholderComponentTestInstance.updateStakeholderForm;

        modifyStakeholder.setValue({
            name:'',
            jobTitle:'',
            companyName:'',
            subaccountAdminEmail:'',
            phoneNumber:'',
            type:'',
            notifications:['', '', ''],
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-stakeholder-button').disabled).toBeTrue();
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