import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { Sort } from "@angular/material/sort";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { throwError } from "rxjs";
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
import { SharedModule } from "../../shared/shared.module";
import { AddTestSuiteComponent } from "./add-test-suite/add-test-suite.component";
import { CtaasTestSuitesComponent } from "./ctaas-test-suites.component";
import { ModifyTestSuiteComponent } from "./modify-test-suite/modify-test-suite.component";

let ctaasTestSuitesComponentTestInstance: CtaasTestSuitesComponent;
let fixture: ComponentFixture<CtaasTestSuitesComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const RouterMock = {
    navigate: (commands: string[]) => { }
};


const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [CtaasTestSuitesComponent,AddTestSuiteComponent],
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
                useValue: {}
            }
        ]
    });
    fixture = TestBed.createComponent(CtaasTestSuitesComponent);
    ctaasTestSuitesComponentTestInstance = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    spyOn(console, 'log').and.callThrough();
};

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('should display the essential UI and components', () => {
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

    it('should sort data ofthe table', () => {
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
    it('shold make a call to fetchDataToDisplay()', () => {
        spyOn(TestSuitesMock, 'getTestSuitesBySubAccount').and.callThrough();
        fixture.detectChanges();

        expect(TestSuitesMock.getTestSuitesBySubAccount).toHaveBeenCalled();
    });
    it('shold no load data if an error occured in fetchDataToDisplay()', () => {
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