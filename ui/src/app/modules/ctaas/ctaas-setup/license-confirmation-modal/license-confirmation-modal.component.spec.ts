import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { SharedModule } from '../../../shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CtaasSetupComponent } from '../ctaas-setup.component';
import { LicenseConfirmationModalComponent } from '../license-confirmation-modal/license-confirmation-modal.component';
import { CtaasSetupServiceMock } from 'src/test/mock/services/ctaas-setup.service.mock';
import { MsalService } from '@azure/msal-angular';
import { DialogServiceMock } from 'src/test/mock/services/dialog.service.mock';
import { DialogService } from 'src/app/services/dialog.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';


let licenseComponentTestInstance: LicenseConfirmationModalComponent;
let fixture: ComponentFixture<LicenseConfirmationModalComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const activeLicenses = [
    {
    id : 'd973456e-049a-4490-ad4c-c3fc9205d50d',
    license : ['Test License 1']
    },
    {
    id : 'a973456c-049a-4490-ad4c-c3fc9205d50d',
    license : 'Test License 2'
    },
    {
    id : 'f973456d-049c-4490-ad4c-c3fc9205d50d',
    license : 'Test License 3'
    },
];


const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [LicenseConfirmationModalComponent, CtaasSetupComponent],
        imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
        providers: [
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
            },
            {
                provide: MatDialogRef,
                useValue: dialogService
            },
            {
                provide: MAT_DIALOG_DATA,
                useValue: activeLicenses
            },
        ]
    });
    fixture = TestBed.createComponent(LicenseConfirmationModalComponent);
    licenseComponentTestInstance = fixture.componentInstance;
    
}

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);

    it('should display essential UI and components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#modal-title');
        
        expect(h1.textContent).toBe('Select a license to use');
    });
    
    it('should display all fields', () => {
        fixture.detectChanges();
        const form = fixture.nativeElement.querySelector('#form')
        const status = fixture.nativeElement.querySelector('#status-label');

        expect(form).toBeTruthy();
        expect(status.innerText).toBe('Status');
    });

    it('should create form group', () => {
        fixture.detectChanges();
        const license = licenseComponentTestInstance.form.get('license');
        expect(license).toBeTruthy();
    });

    it('should make the form controls required', () => {
        fixture.detectChanges();
        const license = licenseComponentTestInstance.form.get('license');
        license.setValue('');

        expect(license.valid).toBeFalsy();
    });

    it('should disable submit button', () => {
        const license = licenseComponentTestInstance.form.get('license');
        license.setValue('');
        fixture.detectChanges();

        const submitBtn = fixture.nativeElement.querySelector('#submit-button');
        expect(submitBtn.disabled).toBeTruthy();
    });

    it('should enable submit button', () => {
        const license = licenseComponentTestInstance.form.get('license');
        license.setValue(activeLicenses[0]);
        fixture.detectChanges();

        const submitBtn = fixture.nativeElement.querySelector('#submit-button');
        expect(submitBtn.disabled).toBeFalsy();
    });

    it('should cancel when "Cancel" is clicked', () => {
        fixture.detectChanges();
        spyOn(licenseComponentTestInstance, 'onCancel').and.callThrough();
        spyOn(dialogService, 'close').and.callThrough();

        dialogService.close();
        licenseComponentTestInstance.onCancel();
        fixture.detectChanges(); 

        expect(dialogService.close).toHaveBeenCalled();
        expect(licenseComponentTestInstance.onCancel).toHaveBeenCalled();
    });
});

