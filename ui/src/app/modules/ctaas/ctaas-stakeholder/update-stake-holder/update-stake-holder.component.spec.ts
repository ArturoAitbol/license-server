import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
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
    notifications: "Daily reports",
    phoneNumber: "",
    subaccountId: "f6c0e45e-cfdc-4c1a-820e-bef6a856aaea",
    type: "HIGH TIER"
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
            },
        ]
    });
    fixture = TestBed.createComponent(UpdateStakeHolderComponent);
    modifyStakeholderComponentTestInstance = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    spyOn(console, 'log').and.callThrough();
};

fdescribe('UI verification test', () => {
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
        expect(mobileNumberLabel.textContent).toBe('Mobile Number')
    });
});

fdescribe('modify stakeholder interactions', () => {
    it('it should update an stakeholder', () => {
        spyOn(modifyStakeholderComponentTestInstance, 'updateStakeholderDetails').and.callThrough();

        modifyStakeholderComponentTestInstance.updateStakeholderDetails();
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('name').setValue('testName');
        modifyStakeholderComponentTestInstance.updateStakeholderForm.get('notifications').setValue([true, false, true]);

        expect(modifyStakeholderComponentTestInstance.updateStakeholderDetails).toHaveBeenCalled();
        expect(fixture.debugElement.nativeElement.querySelector('#submit-project-button').disabled).toBeTrue();
    });

    it('it shuold cancel the update of a stakeholder', () => {
        spyOn(modifyStakeholderComponentTestInstance, 'updateStakeholderDetails').and.callThrough();
        spyOn(dialogService, 'close').and.callThrough();

        modifyStakeholderComponentTestInstance.updateStakeholderDetails();
        modifyStakeholderComponentTestInstance.onCancel();

        expect(dialogService.close).toHaveBeenCalled();
    });

    it('should check the report checkbox', () => {
        spyOn(modifyStakeholderComponentTestInstance, 'onChangeReportCheckbox').and.callThrough();

        modifyStakeholderComponentTestInstance.onChangeReportCheckbox(true,1);

        expect(modifyStakeholderComponentTestInstance.onChangeReportCheckbox).toHaveBeenCalled();
    });
});