import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import moment from "moment";
import { of, throwError } from "rxjs";
import { DialogService } from "src/app/services/dialog.service";
import { TestSuitesMock } from "src/test/mock/services/ctaas-test-suites.service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { ModifyTestSuiteComponent } from "./modify-test-suite.component";
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';

let modifyTestSuitesComponentTestInstance: ModifyTestSuiteComponent;
let fixture: ComponentFixture<ModifyTestSuiteComponent>;
const dialogService = new DialogServiceMock();

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
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(ModifyTestSuiteComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: currentTestSuite });
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(ModifyTestSuiteComponent);
    modifyTestSuitesComponentTestInstance = fixture.componentInstance;
};

describe('UI verification test', () => {
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

describe('modify test suite FormGroup verifications', () => {
    beforeEach(beforeEachFunction);
    it('should create formGroup with necessary controls', () => {
        fixture.detectChanges();
        expect(modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('id')).toBeTruthy();
        expect(modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('subaccountId')).toBeTruthy();
        expect(modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('name')).toBeTruthy();
        expect(modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('deviceType')).toBeTruthy();
        expect(modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('totalExecutions')).toBeTruthy();
        expect(modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('nextExecution')).toBeTruthy();
        expect(modifyTestSuitesComponentTestInstance.updateTestSuiteForm.get('frequency')).toBeTruthy();
    });

    it('should make all the controls required', () => {
        const modifyTestSuite = modifyTestSuitesComponentTestInstance.updateTestSuiteForm;
        modifyTestSuite.setValue({
            id: '',
            subaccountId: '',
            name: '',
            deviceType: '',
            totalExecutions: '',
            nextExecution: '',
            frequency: ''
        });
        expect(modifyTestSuite.get('id').valid).toBeFalse();
        expect(modifyTestSuite.get('subaccountId').valid).toBeFalse();
        expect(modifyTestSuite.get('name').valid).toBeFalse();
        expect(modifyTestSuite.get('deviceType').valid).toBeFalse();
        expect(modifyTestSuite.get('totalExecutions').valid).toBeFalse();
        expect(modifyTestSuite.get('nextExecution').valid).toBeTrue();
        expect(modifyTestSuite.get('frequency').valid).toBeFalse();
    });

    it('should enable the submit button', () => {
        const modifyTestSuite = modifyTestSuitesComponentTestInstance.updateTestSuiteForm;
        modifyTestSuite.setValue({
            id: 'ca637f77-03eb-4fd1-a473-7bcaaa54302f',
            subaccountId: 'fbb2d912-b202-432d-8c07-dce0dad51f7f',
            name: 'testSuiteV2',
            deviceType: 'MS Teams',
            totalExecutions: '2',
            nextExecution: '2022-10-12 00:00:00',
            frequency: 'Monthly'
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submitBtn').disabled).toBeFalse();
    });
});
