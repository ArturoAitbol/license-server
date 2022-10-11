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
import moment from "moment";
import { of, throwError } from "rxjs";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { CtaasTestSuiteService } from "src/app/services/ctaas-test-suite.service";
import { DialogService } from "src/app/services/dialog.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { SubAccountService } from "src/app/services/sub-account.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { TestSuitesMock } from "src/test/mock/services/ctaas-test-suites.service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog.service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SubaccountServiceMock } from "src/test/mock/services/subaccount-service.mock";
import { ModifyTestSuiteComponent } from "./modify-test-suite.component";

let modifyTestSuitesComponentTestInstance: ModifyTestSuiteComponent;
let fixture: ComponentFixture<ModifyTestSuiteComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const RouterMock = {
    navigate: (commands: string[]) => { }
};
const currentTestSuite = {
    deviceType: "MS Teams",
    subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
    totalExecutions: "2",
    name: "testSuiteV2",
    id: "ca637f77-03eb-4fd1-a473-7bcaaa54302f",
    nextExecution: "2022-10-12 00:00:00",
    frequency: "Weekly"
}

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [ModifyTestSuiteComponent],
        imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule],
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
                provide: CtaasTestSuiteService,
                useValue: TestSuitesMock
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
                provide: FormBuilder
            },
            {
                provide: SubAccountService,
                useValue: SubaccountServiceMock
            },
            {
                provide: MatDialogRef,
                useValue: dialogService
            },
            {
                provide:ModifyTestSuiteComponent,
                useValue: {}
            },
            {
                provide: MAT_DIALOG_DATA,
                useValue: currentTestSuite
            },
        ]
    });
    fixture = TestBed.createComponent(ModifyTestSuiteComponent);
    modifyTestSuitesComponentTestInstance = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    spyOn(console, 'log').and.callThrough();
};

describe('UI verifiaction test', () => {
    beforeEach(beforeEachFunction);
    it('should display the essential UI and components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#modal-title');
        const suiteName = fixture.nativeElement.querySelector('#name-label');
        const serviceSuite = fixture.nativeElement.querySelector('#deviceType-name-label');
        const suiteExecutions = fixture.nativeElement.querySelector('#executions-label');
        const frequency = fixture.nativeElement.querySelector('#frequency-label');
        
        expect(h1.textContent).toBe('Modify Test Suite');
        expect(suiteName.textContent).toBe('Suite Name');
        expect(serviceSuite.textContent).toBe('Service Under Test');
        expect(suiteExecutions.textContent).toBe('Total Executions');
        expect(frequency.textContent).toBe('Frequency');
    });

    it('should enable the submit button', () => {
        fixture.detectChanges();
        const submitButton = fixture.nativeElement.querySelector('#submitBtn');
        spyOn(modifyTestSuitesComponentTestInstance, 'disableSumbitBtn').and.callThrough();
        modifyTestSuitesComponentTestInstance.disableSumbitBtn();
        expect(submitButton.disabled).toBeFalse();
    });
});

describe('modify test suite details interactions', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to modifyTestSuite', () => {
        fixture.detectChanges();
        spyOn(modifyTestSuitesComponentTestInstance, 'modifyTestSuite').and.callThrough();
        spyOn(TestSuitesMock, 'updateTestSuite').and.callThrough();

        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('id').setValue('ca637f77-03eb-4fd1-a473-7bcaaa54302f');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('subaccountId').setValue('fbb2d912-b202-432d-8c07-dce0dad51f7f');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('name').setValue('test');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('deviceType').setValue('MS Teams');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('totalExecutions').setValue('5');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('nextExecution').setValue('2022-10-14 00:00:00');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('frequency').setValue('Monthly');
        fixture.detectChanges();
        modifyTestSuitesComponentTestInstance.modifyTestSuite();

        expect(TestSuitesMock.updateTestSuite).toHaveBeenCalled();
    });

    it('should make a call to modifyTestSuite without a nextExecution', () => {
        fixture.detectChanges();
        spyOn(modifyTestSuitesComponentTestInstance, 'modifyTestSuite').and.callThrough();
        spyOn(TestSuitesMock, 'updateTestSuite').and.callThrough();

        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('id').setValue('ca637f77-03eb-4fd1-a473-7bcaaa54302f');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('subaccountId').setValue('fbb2d912-b202-432d-8c07-dce0dad51f7f');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('name').setValue('test');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('deviceType').setValue('MS Teams');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('totalExecutions').setValue('5');
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('nextExecution').setValue(moment());
        modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('frequency').setValue('Monthly');
        fixture.detectChanges();
        modifyTestSuitesComponentTestInstance.modifyTestSuite();

        expect(TestSuitesMock.updateTestSuite).toHaveBeenCalled();
    });

    it('should cancel modifyTestSuite', () => {
        spyOn(modifyTestSuitesComponentTestInstance, 'modifyTestSuite').and.callThrough();
        spyOn(modifyTestSuitesComponentTestInstance, 'onCancel').and.callThrough();
        spyOn(dialogService, 'close').and.callThrough();

        modifyTestSuitesComponentTestInstance.modifyTestSuite();
        modifyTestSuitesComponentTestInstance.onCancel();

        expect(dialogService.close).toHaveBeenCalled();
        expect(modifyTestSuitesComponentTestInstance.onCancel).toHaveBeenCalled();
    });
});

describe('display of messages', () => {
    beforeEach(beforeEachFunction);
    it('should display a message if an error ocurred in modifyTestSuites', () => {
        const response = {error: "some error"}; 
        spyOn(TestSuitesMock, 'updateTestSuite').and.returnValue(of(response));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        modifyTestSuitesComponentTestInstance.modifyTestSuite();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.error, 'Error modifying test suite!');
    });
    it('should display a message if an errror ocurred while modifing test suite', () => {
        const err = {error: "some error"}
        spyOn(TestSuitesMock, 'updateTestSuite').and.returnValue(throwError(err));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        modifyTestSuitesComponentTestInstance.modifyTestSuite();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(err.error, 'Error modifying test suite!');
    });
});
