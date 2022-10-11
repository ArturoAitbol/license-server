import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { HttpClient } from "@angular/common/http";
import { SafeCall } from "@angular/compiler";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
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
import { ModifyTestSuiteComponent } from "../modify-test-suite/modify-test-suite.component";
import { AddTestSuiteComponent} from "./add-test-suite.component";

let addTestSuitesComponentTestInstance: AddTestSuiteComponent;
let fixture: ComponentFixture<AddTestSuiteComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const RouterMock = {
    navigate: (commands: string[]) => { }
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [AddTestSuiteComponent],
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
            }
        ]
    });
    fixture = TestBed.createComponent(AddTestSuiteComponent);
    addTestSuitesComponentTestInstance = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    spyOn(console, 'log').and.callThrough();
};

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI components', () => {
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

        addTestSuitesComponentTestInstance.addTestSuiteForm.get("name").setValue("testName");
        addTestSuitesComponentTestInstance.addTestSuiteForm.get("deviceType").setValue("MS Teams");
        addTestSuitesComponentTestInstance.addTestSuiteForm.get("frequency").setValue("3");
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
        const response = {error: "some error"};
        spyOn(TestSuitesMock, 'createTestSuite').and.returnValue(of(response));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        addTestSuitesComponentTestInstance.addTestSuite();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.error, 'Error adding test suite!');
        expect(addTestSuitesComponentTestInstance.isDataLoading).toBeFalse();
    });

    it('should display a message if an errror ocurred while modifing test suite', () => {
        fixture.detectChanges();
        const err = {error: "some error"};
        spyOn(TestSuitesMock, 'createTestSuite').and.returnValue(throwError(err));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        addTestSuitesComponentTestInstance.addTestSuite();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(err.error, 'Error adding test suite!');
    });
});
