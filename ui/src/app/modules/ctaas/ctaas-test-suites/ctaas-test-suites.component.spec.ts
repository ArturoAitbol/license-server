import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material/dialog";
import { Sort } from "@angular/material/sort";
import { throwError } from "rxjs";
import { DialogService } from "src/app/services/dialog.service";
import { TestSuitesMock } from "src/test/mock/services/ctaas-test-suites.service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { AddTestSuiteComponent } from "./add-test-suite/add-test-suite.component";
import { CtaasTestSuitesComponent } from "./ctaas-test-suites.component";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';

let ctaasTestSuitesComponentTestInstance: CtaasTestSuitesComponent;
let fixture: ComponentFixture<CtaasTestSuitesComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CtaasTestSuitesComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addDeclaration(AddTestSuiteComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(CtaasTestSuitesComponent);
    ctaasTestSuitesComponentTestInstance = fixture.componentInstance;
};

describe('UI verification test test suites component', () => {
    beforeEach(beforeEachFunction);
    it('should display the test suite UI', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const submitButton = fixture.nativeElement.querySelector('#add-test-suite-button');

        expect(h1.textContent).toBe('Test Suites');
        expect(submitButton.textContent).toBe('Add Test Suite');
    });

    it('should load de correct data columns for the table', () => {
        spyOn(ctaasTestSuitesComponentTestInstance, 'initColumns').and.callThrough();
        spyOn(ctaasTestSuitesComponentTestInstance, 'sizeChange').and.callThrough();
        fixture.detectChanges();
        ctaasTestSuitesComponentTestInstance.sizeChange();
        
        const headers: HTMLElement[] = fixture.nativeElement.querySelectorAll('.mat-sort-header-content');
        expect(headers[0].innerText).toBe('Suite Name');
        expect(headers[1].innerText).toBe('Service Under Test');
        expect(headers[2].innerText).toBe('Total Executions');
        expect(headers[3].innerText).toBe('Next Execution');
        expect(headers[4].innerText).toBe('Frequency');
        expect(ctaasTestSuitesComponentTestInstance.initColumns).toHaveBeenCalled();
        expect(ctaasTestSuitesComponentTestInstance.sizeChange).toHaveBeenCalled();
    });

    it('should sort data of the table', () => {
        fixture.detectChanges();

        const sort: Sort = { active: 'name', direction: 'desc' }
        
        spyOn(ctaasTestSuitesComponentTestInstance, 'sortData').and.callThrough();
        
        ctaasTestSuitesComponentTestInstance.sortData(sort);
        expect(ctaasTestSuitesComponentTestInstance.sortData).toHaveBeenCalledWith(sort);
        
        sort.direction = 'asc';
        ctaasTestSuitesComponentTestInstance.sortData(sort);
        
        sort.direction = '';
        ctaasTestSuitesComponentTestInstance.sortData(sort);
    });
});

describe('Data collection test', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to fetchDataToDisplay()', () => {
        spyOn(TestSuitesMock, 'getTestSuitesBySubAccount').and.callThrough();
        fixture.detectChanges();

        expect(TestSuitesMock.getTestSuitesBySubAccount).toHaveBeenCalled();
    });
    it('should no load data if an error occurred in fetchDataToDisplay()', () => {
        spyOn(TestSuitesMock, 'getTestSuitesBySubAccount').and.returnValue(throwError(""));
        fixture.detectChanges();

        expect(ctaasTestSuitesComponentTestInstance.isLoadingResults).toBeFalse();;
        expect(ctaasTestSuitesComponentTestInstance.isRequestCompleted).toBeTrue();
    });
});

describe('dailog calls and interactions', () => {
    beforeEach(beforeEachFunction);
    it('it should execute openDialog with expected data', () => {
        const selectedTestData = {selectedRow:{id:'testId',
            subaccountId: 'testSubId',
            suiteName: 'testName',
            service: 'testService',
            totalExecutions: 'testExecutions',
            nextExecution: 'testNexExcecution',
            frequency: 'testFrequency'}, 
        selectedOption: 'selectedOption', selectedIndex: '0' }
        fixture.detectChanges();
        spyOn(ctaasTestSuitesComponentTestInstance, 'openDialog').and.callThrough();
        spyOn(ctaasTestSuitesComponentTestInstance, 'onDelete').and.callThrough();
        spyOn(TestSuitesMock, 'deleteTestSuite').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();

        ctaasTestSuitesComponentTestInstance.addTestSuite();
        expect(ctaasTestSuitesComponentTestInstance.openDialog).toHaveBeenCalledOnceWith('add-test-suite');

        selectedTestData.selectedOption = 'Edit';
        ctaasTestSuitesComponentTestInstance.rowAction(selectedTestData);
        expect(ctaasTestSuitesComponentTestInstance.openDialog).toHaveBeenCalledWith(selectedTestData.selectedOption, selectedTestData.selectedRow);

        selectedTestData.selectedOption = 'Delete';
        dialogService.setExpectedConfirmDialogValue(true);
        ctaasTestSuitesComponentTestInstance.rowAction(selectedTestData);
        expect(ctaasTestSuitesComponentTestInstance.onDelete).toHaveBeenCalledWith(selectedTestData.selectedRow);
        expect(TestSuitesMock.deleteTestSuite).toHaveBeenCalled();
    });
});