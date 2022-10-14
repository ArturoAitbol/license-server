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
import { DialogServiceMock } from 'src/test/mock/services/dialog.service.mock';
import { DialogService } from 'src/app/services/dialog.service';


let CtaasSetupComponentTestInstance: CtaasSetupComponent;
let fixture: ComponentFixture<CtaasSetupComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [CtaasSetupComponent, LicenseConfirmationModalComponent],
        imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
        providers: [
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
    fixture.detectChanges();
}

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);

    it('should display essential UI and components', () => {
        const h1 = fixture.nativeElement.querySelector('#setup-title');
        const editButton = fixture.nativeElement.querySelector('#edit-details-button');
        
        expect(h1.textContent).toBe('SpotLight Setup Details');
        expect(editButton.textContent).toBe(' Edit Setup Details ');
        
    });
    
    it('should display all form fields', () => {
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

describe('Make method calls', () => {
    beforeEach(beforeEachFunction);

    it('should enable form when "Edit Setup Details" button is clicked', () => {
        spyOn(CtaasSetupComponentTestInstance, 'editForm').and.callThrough;

        CtaasSetupComponentTestInstance.editForm();
        expect(CtaasSetupComponentTestInstance.editForm).toHaveBeenCalled();
    });

    it('should display update and cancel buttons, when "Edit Setup Details" button is clicked', () => {
        const editButton = fixture.nativeElement.querySelector('#edit-details-button');
        editButton.isEditing = true;
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            const updateButton = fixture.nativeElement.querySelector('#update-button');
            const cancelButton = fixture.nativeElement.querySelector('#cancel-button');
            expect(updateButton.textContent).toBe(' Update ');
            expect(cancelButton.textContent).toBe(' Cancel ');
        });
    });

    

    it('should cancel editing when "Cancel" is clicked and disable form', () => {
        fixture.detectChanges();
        spyOn(CtaasSetupComponentTestInstance, 'cancelEdit').and.callThrough();
        spyOn(dialogService, 'close').and.callThrough();

        CtaasSetupComponentTestInstance.editForm();
        CtaasSetupComponentTestInstance.cancelEdit();
        dialogService.close()
        fixture.detectChanges(); 

        expect(dialogService.close).toHaveBeenCalled();
        expect(CtaasSetupComponentTestInstance.cancelEdit).toHaveBeenCalled();
    });
})