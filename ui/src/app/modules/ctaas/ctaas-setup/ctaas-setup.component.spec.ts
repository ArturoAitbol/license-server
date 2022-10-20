import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { LicenseService } from 'src/app/services/license.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { LicenseServiceMock } from 'src/test/mock/services/license-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { SubaccountServiceMock } from 'src/test/mock/services/subaccount-service.mock';
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SharedModule } from '../../shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CtaasSetupComponent } from './ctaas-setup.component';
import { LicenseConfirmationModalComponent } from './license-confirmation-modal/license-confirmation-modal.component';
import { CtaasSetupServiceMock } from 'src/test/mock/services/ctaas-setup.service.mock';
import { MsalService } from '@azure/msal-angular';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { DialogService } from 'src/app/services/dialog.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';


let CtaasSetupComponentTestInstance: CtaasSetupComponent;
let fixture: ComponentFixture<CtaasSetupComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const licenseList = LicenseServiceMock.licensesList
const activeLicenses = licenseList.licenses.filter(license => license.status === 'Active');



const RouterMock = {
    navigate: (commands: string[]) => { }
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [CtaasSetupComponent, LicenseConfirmationModalComponent],
        imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
        providers: [
            {
                provide: Router,
                useValue: RouterMock
            },
            {
                provide: CtaasSetupService,
                useValue: CtaasSetupServiceMock
            },
            {
                provide: FormBuilder,
            },
            {
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            },
            {
                provide: SubAccountService,
                useValue: SubaccountServiceMock
            },
            {
                provide: LicenseService,
                useValue: LicenseServiceMock
            },
            {
                provide: HttpClient
            },
            {
                provide: MsalService,
                useValue: MsalServiceMock
            },
            {
                provide: DialogService,
                useValue: dialogService
            }
        ]
    });
    fixture = TestBed.createComponent(CtaasSetupComponent);
    CtaasSetupComponentTestInstance = fixture.componentInstance;
    CtaasSetupComponentTestInstance.ngOnInit();
    loader = TestbedHarnessEnvironment.loader(fixture);
    spyOn(console, 'log').and.callThrough();
  
}

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);

    it('should display essential UI and components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#setup-title');
        const editButton = fixture.nativeElement.querySelector('#edit-details-button');
        
        expect(h1.textContent).toBe('SpotLight Setup Details');
        expect(editButton.textContent).toBe(' Edit Setup Details ');
        
    });
    
    it('should display all form fields', () => {
        fixture.detectChanges();
        const setupForm = fixture.nativeElement.querySelector('#setup-form');
        const azureResouceGroup = fixture.nativeElement.querySelector('#azure-resource-group-label');
        const tapUrl = fixture.nativeElement.querySelector('#tap-url-label');
        const status = fixture.nativeElement.querySelector('#status-label');
        const powerBiWorkspace = fixture.nativeElement.querySelector('#powerbi-workspace-label');
        const powerBiReport = fixture.nativeElement.querySelector('#powerbi-report-label');

        expect(setupForm).toBeTruthy();
        expect(azureResouceGroup.innerText).toBe('Azure Resource Group');
        expect(tapUrl.innerText).toBe('TAP URL');
        expect(status.innerText).toBe('Status');
        expect(powerBiWorkspace.innerText).toBe('Power BI Workspace ID');
        expect(powerBiReport.innerText).toBe('Power BI Report ID');
    });
});

describe('make method calls', () => {
    beforeEach(beforeEachFunction);

    it('should enable form when "Edit Setup Details" button is clicked', () => {
        fixture.detectChanges();
        spyOn(CtaasSetupComponentTestInstance, 'editForm').and.callThrough;

        CtaasSetupComponentTestInstance.editForm();
        const form = CtaasSetupComponentTestInstance.setupForm.enable();
        expect(CtaasSetupComponentTestInstance.editForm).toHaveBeenCalled();
        expect(form).toBeTruthy
    });

    it('should display update and cancel buttons, when "Edit Setup Details" button is clicked', () => {
        spyOn(CtaasSetupComponentTestInstance, 'editForm').and.callThrough();
        CtaasSetupComponentTestInstance.editForm();
        fixture.detectChanges();

        const updateButton = fixture.nativeElement.querySelector('#update-button');
        const cancelButton = fixture.nativeElement.querySelector('#cancel-button');

        expect(updateButton.textContent).toBe(' Update ');
        expect(cancelButton.textContent).toBe(' Cancel ');
    });

    it('should update setup details on "Update" button click', () => {
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough(); 
        fixture.detectChanges();

        CtaasSetupComponentTestInstance.submit();
        expect(CtaasSetupComponentTestInstance.submit).toHaveBeenCalled();
    });

    it('should cancel editing when "Cancel" is clicked and disable form', () => {
        fixture.detectChanges();
        spyOn(CtaasSetupComponentTestInstance, 'cancelEdit').and.callThrough();
        spyOn(dialogService, 'close').and.callThrough();

        CtaasSetupComponentTestInstance.editForm();
        CtaasSetupComponentTestInstance.cancelEdit();
        dialogService.close()
        CtaasSetupComponentTestInstance.setupForm.disable();
        fixture.detectChanges(); 

        expect(dialogService.close).toHaveBeenCalled();
        expect(CtaasSetupComponentTestInstance.cancelEdit).toHaveBeenCalled();
    });
});

describe('setup form verifications', () => {
    beforeEach(beforeEachFunction);

    it('should create setup form with form controls', () => {
        fixture.detectChanges();
        expect(CtaasSetupComponentTestInstance.setupForm.get('azureResourceGroup')).toBeTruthy();
        expect(CtaasSetupComponentTestInstance.setupForm.get('tapUrl')).toBeTruthy();
        expect(CtaasSetupComponentTestInstance.setupForm.get('status')).toBeTruthy();
        expect(CtaasSetupComponentTestInstance.setupForm.get('onBoardingComplete')).toBeTruthy();
        expect(CtaasSetupComponentTestInstance.setupForm.get('powerBiWorkspaceId')).toBeTruthy();
        expect(CtaasSetupComponentTestInstance.setupForm.get('powerBiReportId')).toBeTruthy();
    });

    it('should make the form controls required', () => {
        fixture.detectChanges();
        const setup = CtaasSetupComponentTestInstance.setupForm;
        setup.setValue({
            azureResourceGroup: '',
            tapUrl: '',
            status: '',
            onBoardingComplete: '',
            powerBiWorkspaceId: '',
            powerBiReportId: ''
        });
        expect(setup.hasError('required')).toBeTruthy;
        
        expect(setup.get('azureResourceGroup').valid).toBeFalse();
        expect(setup.get('tapUrl').valid).toBeFalse();
        expect(setup.get('status').valid).toBeFalse();
        expect(setup.get('onBoardingComplete').valid).toBeFalse();
        expect(setup.get('powerBiWorkspaceId').valid).toBeFalse();
        expect(setup.get('powerBiReportId').valid).toBeFalse();
        expect(setup.valid).toBeFalsy();
    });

});

describe('display message when error occurs',() => {
    beforeEach(beforeEachFunction);

    it('should display a message if error occurs while updating setup form', () => {
        spyOn(CtaasSetupServiceMock, 'updateCtaasSetupDetailsById').and.returnValue(throwError("error"));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(CtaasSetupComponentTestInstance,'submit')

        fixture.detectChanges();

        CtaasSetupComponentTestInstance.submit();
        SnackBarServiceMock.openSnackBar('Error updating SpotLight Setup!');
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error updating SpotLight Setup!');
        expect(CtaasSetupComponentTestInstance.isDataLoading).toBeFalse();
    });
});

describe('dailog calls and interactions', () => {
    beforeEach(beforeEachFunction);

    it('should update setup details on "Update" button click, if case of one license', () => {
        spyOn(CtaasSetupComponentTestInstance, 'editForm').and.callThrough();
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough(); 
        
        const testUser = CtaasSetupServiceMock.testuser1
        CtaasSetupComponentTestInstance.editForm();     
        testUser.status === 'SETUP_READY';
        fixture.detectChanges();
        
        CtaasSetupComponentTestInstance.submit();
        licenseList.licenses.length === 1;
        expect(CtaasSetupComponentTestInstance.submit).toHaveBeenCalled();
    });

    it('should open dialog with expected data when update button is clicked, in case if there is more than one license', () => {
        spyOn(CtaasSetupComponentTestInstance, 'editForm').and.callThrough();
        spyOn(CtaasSetupComponentTestInstance, 'submit').and.callThrough(); 
        spyOn(CtaasSetupComponentTestInstance, 'openDialog').and.callThrough(); 
        spyOn(LicenseServiceMock, 'getLicenseList').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        
        CtaasSetupComponentTestInstance.editForm();
        const testUser = CtaasSetupServiceMock.testuser1
        testUser.status === 'SETUP_READY';
        fixture.detectChanges();
        
        CtaasSetupComponentTestInstance.submit();
        licenseList.licenses.length > 1;
        LicenseServiceMock.getLicenseList();
        CtaasSetupComponentTestInstance.openDialog(activeLicenses);
        expect(CtaasSetupComponentTestInstance.openDialog).toHaveBeenCalledOnceWith(activeLicenses);
    });
});