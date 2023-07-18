import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LicenseServiceMock } from 'src/test/mock/services/license-service.mock';
import { CtaasSetupComponent } from '../ctaas-setup.component';
import { LicenseConfirmationModalComponent } from '../license-confirmation-modal/license-confirmation-modal.component';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { DialogService } from 'src/app/services/dialog.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';

let licenseComponentTestInstance: LicenseConfirmationModalComponent;
let fixture: ComponentFixture<LicenseConfirmationModalComponent>;
const dialogService = new DialogServiceMock();

const licenseList = JSON.parse(JSON.stringify(LicenseServiceMock.licensesList));
const activeLicenses = licenseList.licenses.filter(license => license.status === 'Active');

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(LicenseConfirmationModalComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: activeLicenses });
    configBuilder.addDeclaration(CtaasSetupComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(LicenseConfirmationModalComponent);
    licenseComponentTestInstance = fixture.componentInstance;
};

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

    it('should update form on submit button click', () => {
        const license = licenseComponentTestInstance.form.get('license');
        spyOn(licenseComponentTestInstance, 'submit').and.callThrough();
        license.setValue(activeLicenses[0]);
        licenseComponentTestInstance.submit();
        fixture.detectChanges();
        const submitBtn = fixture.nativeElement.querySelector('#submit-button');
        expect(submitBtn.disabled).toBeFalsy();
        expect(licenseComponentTestInstance.submit).toHaveBeenCalled();
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
