import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
import { TestSuitesMock } from 'src/test/mock/services/ctaas-test-suites.service.mock';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { AddTestSuiteComponent} from './add-test-suite.component';
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';

let addTestSuitesComponentTestInstance: AddTestSuiteComponent;
let fixture: ComponentFixture<AddTestSuiteComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddTestSuiteComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(AddTestSuiteComponent);
    addTestSuitesComponentTestInstance = fixture.componentInstance;
};

describe('AddTestSuite Component UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('should display correct UI for add test suit component', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#modal-title');
        const suiteName = fixture.nativeElement.querySelector('#name-label');
        const frequency = fixture.nativeElement.querySelector('#frequency-label');
        const deviceType = fixture.nativeElement.querySelector('#deviceType-name-label');

        expect(h1.textContent).toBe('Add Test Suite');
        expect(suiteName.textContent).toBe('Suite Name');
        expect(frequency.textContent).toBe('Frequency');
        expect(deviceType.textContent).toBe('Service Under Test');
    });
});

describe('add test suite interactions', () => {
    beforeEach(beforeEachFunction);
    it('it should call addTestSuite', () => {
        fixture.detectChanges();
        spyOn(addTestSuitesComponentTestInstance, 'addTestSuite').and.callThrough();
        spyOn(TestSuitesMock, 'createTestSuite').and.callThrough();

        addTestSuitesComponentTestInstance.addTestSuiteForm.get('name').setValue('testName');
        addTestSuitesComponentTestInstance.addTestSuiteForm.get('deviceType').setValue('MS Teams');
        addTestSuitesComponentTestInstance.addTestSuiteForm.get('frequency').setValue('3');
        addTestSuitesComponentTestInstance.addTestSuite();

        expect(TestSuitesMock.createTestSuite).toHaveBeenCalled();
    });

    it('it should cancel addTestSuite', () => {
        fixture.detectChanges();
        spyOn(addTestSuitesComponentTestInstance, 'onCancel').and.callThrough();
        spyOn(dialogService, 'close').and.callThrough();

        addTestSuitesComponentTestInstance.addTestSuite();
        addTestSuitesComponentTestInstance.onCancel();
        fixture.detectChanges(); 

        expect(dialogService.close).toHaveBeenCalled();
        expect(addTestSuitesComponentTestInstance.onCancel).toHaveBeenCalled();
    });
});

describe('display of messages when an error ocurred', () => {
    beforeEach(beforeEachFunction);
    it('should display a message if an error ocurred in addTestSuite', () => {
        fixture.detectChanges();
        const response = {error: 'some error'};
        spyOn(TestSuitesMock, 'createTestSuite').and.returnValue(of(response));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        addTestSuitesComponentTestInstance.addTestSuite();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.error, 'Error adding test suite!');
        expect(addTestSuitesComponentTestInstance.isDataLoading).toBeFalse();
    });

    it('should display a message if an error occurred while modifying test suite', () => {
        fixture.detectChanges();
        const err = {error: 'some error'};
        spyOn(TestSuitesMock, 'createTestSuite').and.returnValue(throwError(err));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        addTestSuitesComponentTestInstance.addTestSuite();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(err.error, 'Error adding test suite!');
    });
});

describe('add test suite FormGroup verifications', () => {
    beforeEach(beforeEachFunction);
    it('should create formGroup with necessary controls', () => {
        fixture.detectChanges();
        expect(addTestSuitesComponentTestInstance.addTestSuiteForm.get('name')).toBeTruthy();
        expect(addTestSuitesComponentTestInstance.addTestSuiteForm.get('deviceType')).toBeTruthy();
        expect(addTestSuitesComponentTestInstance.addTestSuiteForm.get('frequency')).toBeTruthy();
    });

    it('should make all the controls required', () => {
        const addTestSuite = addTestSuitesComponentTestInstance.addTestSuiteForm;
        addTestSuite.setValue({
            name: '',
            deviceType: '',
            frequency: ''
        });
        expect(addTestSuite.get('name').valid).toBeFalse();
        expect(addTestSuite.get('deviceType').valid).toBeFalse();
        expect(addTestSuite.get('frequency').valid).toBeFalse();
    });
    
    it('should enable submit button', () => {
        const addTestSuite = addTestSuitesComponentTestInstance.addTestSuiteForm;
        addTestSuite.setValue({
            name: 'testName',
            deviceType: 'MS Teams',
            frequency: '2'
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submitBtn').disabled).toBeFalse();
    });

    it('should disable submit button', () => {
        const addTestSuite = addTestSuitesComponentTestInstance.addTestSuiteForm;
        addTestSuite.setValue({
            name: '',
            deviceType: 'MS Teams',
            frequency: ''
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submitBtn').disabled).toBeTrue();
    })
});
