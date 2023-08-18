import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { BundleServiceMock } from "src/test/mock/services/bundle-service.mock";
import { CustomerServiceMock } from "src/test/mock/services/customer-service.mock";
import { LicenseServiceMock } from "src/test/mock/services/license-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { AddLicenseComponent } from "./add-license.component";
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';
import { CustomerService } from '../../../../services/customer.service';

let addLicenseComponentTestInstance: AddLicenseComponent;
let fixture: ComponentFixture<AddLicenseComponent>;

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddLicenseComponent);
    configBuilder.addProvider({ provide: CustomerService, useValue: CustomerServiceMock });
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(AddLicenseComponent);
    addLicenseComponentTestInstance = fixture.componentInstance;
}

describe('UI and component verification tests', () => {

    beforeEach(beforeEachFunction);

    it('should display essential UI and components', () => {
        fixture.detectChanges();
        const h1: HTMLElement = fixture.nativeElement.querySelector('#dialog-title');
        const cancelButton: HTMLElement = fixture.nativeElement.querySelector('#cancel-button');
        const submitButton: HTMLElement = fixture.nativeElement.querySelector('#submit-button');
        const labels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('label'));

        expect(h1.textContent).toBe('Add TekVizion 360 Subscription');
        expect(cancelButton.textContent).toBe('Cancel');
        expect(submitButton.textContent).toBe('Submit');
        expect(labels.find(label => label.textContent.includes("Start Date"))).not.toBeUndefined();
        expect(labels.find(label => label.textContent.includes("Renewal Date"))).not.toBeUndefined();
        expect(labels.find(label => label.textContent.includes("Description"))).not.toBeUndefined();
        expect(labels.find(label => label.textContent.includes("Subscription Type"))).not.toBeUndefined();
        expect(labels.find(label => label.textContent.includes("Device Access tekTokens"))).not.toBeUndefined();
        expect(labels.find(label => label.textContent.includes("tekTokens"))).not.toBeUndefined();
    });
});

describe('FormGroup verification tests', () => {

    beforeEach(beforeEachFunction);

    it('should create a formGroup with the necesary controls', () => {
        expect(addLicenseComponentTestInstance.addLicenseForm.contains('startDate')).toBeTrue();
        expect(addLicenseComponentTestInstance.addLicenseForm.contains('description')).toBeTrue();
        expect(addLicenseComponentTestInstance.addLicenseForm.contains('subscriptionType')).toBeTrue();
        expect(addLicenseComponentTestInstance.addLicenseForm.contains('tokensPurchased')).toBeTrue();
        expect(addLicenseComponentTestInstance.addLicenseForm.contains('deviceLimit')).toBeTrue();
        expect(addLicenseComponentTestInstance.addLicenseForm.contains('renewalDate')).toBeTrue();
    });

    it('should make all the controls required', () => {
        const addLicenseForm = addLicenseComponentTestInstance.addLicenseForm;
        addLicenseForm.setValue({
            startDate: '',
            description: '',
            subscriptionType: '',
            tokensPurchased: '',
            deviceLimit: '',
            renewalDate: ''
        });

        expect(addLicenseForm.get('startDate').valid).toBeFalse();
        expect(addLicenseForm.get('description').valid).toBeFalse();
        expect(addLicenseForm.get('subscriptionType').valid).toBeFalse();
        expect(addLicenseForm.get('tokensPurchased').valid).toBeFalse();
        expect(addLicenseForm.get('deviceLimit').valid).toBeFalse();
        expect(addLicenseForm.get('renewalDate').valid).toBeFalse();
    });

    it('should validate that renewalDate is always after startDate', () => {
        const addLicenseForm = addLicenseComponentTestInstance.addLicenseForm;

        addLicenseForm.get('startDate').setValue('2022-06-17');
        addLicenseForm.get('renewalDate').setValue('2022-06-19');
        expect(addLicenseForm.errors).toBeNull();

        addLicenseForm.get('startDate').setValue('2022-06-19');
        addLicenseForm.get('renewalDate').setValue('2022-06-17');
        expect(addLicenseForm.errors).not.toBeNull();
        expect(addLicenseForm.errors.renewalIsBeforeStart).toBeTrue();
    });

});

describe('Data collection and parsing tests', () => {

    beforeEach(beforeEachFunction);

    it('should make a call to get selected Customer and bundles list (types)', () => {
        spyOn(CustomerServiceMock, 'getSelectedCustomer').and.callThrough();
        spyOn(BundleServiceMock, 'getBundleList').and.callThrough();
        fixture.detectChanges();
        expect(CustomerServiceMock.getSelectedCustomer).toHaveBeenCalled();
        expect(BundleServiceMock.getBundleList).toHaveBeenCalled();
        expect(addLicenseComponentTestInstance.types).toEqual(BundleServiceMock.bundleList.bundles);
    });

});

describe('Calls and interactions', () => {

    beforeEach(beforeEachFunction);

    it('should close the openDialog when calling onCancel()', () => {
        spyOn(addLicenseComponentTestInstance.dialogRef, 'close');
        fixture.detectChanges();
        addLicenseComponentTestInstance.onCancel();
        expect(addLicenseComponentTestInstance.dialogRef.close).toHaveBeenCalled();
    });

    it('should create a license after calling submit()', () => {
        spyOn(LicenseServiceMock, 'createLicense').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();
        addLicenseComponentTestInstance.submit();

        expect(LicenseServiceMock.createLicense).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subscription added successfully!', '');
    });

    it('should show an error when adding license failed after calling submit()', () => {
        spyOn(LicenseServiceMock, 'createLicense').and.returnValue(of({ error: 'some error message' }));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();

        addLicenseComponentTestInstance.submit();

        expect(LicenseServiceMock.createLicense).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('some error message', 'Error adding subscription!');

    });

    it('should set the minimun renewalData value and the maximun startDate value so startDate is always before renewalDate', () => {
        addLicenseComponentTestInstance.onStartDateChange('2022-01-06 00:00:00');
        expect(addLicenseComponentTestInstance.renewalDateMin).toEqual(new Date('2022-01-07 00:00:00'));

        addLicenseComponentTestInstance.onRenewalDateChange('2022-01-06 00:00:00');
        expect(addLicenseComponentTestInstance.startDateMax).toEqual(new Date('2022-01-05 00:00:00'));
    });

    it('should modify tokensPurchased and deviceLimit form controls according to the type (bundle) selected when calling onChangeType()', () => {

        const addLicenseForm = addLicenseComponentTestInstance.addLicenseForm;
        //Retrieve existing bundles list
        spyOn(BundleServiceMock, 'getBundleList').and.callThrough();
        fixture.detectChanges();
        expect(BundleServiceMock.getBundleList).toHaveBeenCalled();

        addLicenseComponentTestInstance.onChangeType(BundleServiceMock.customBundle.bundleName);
        expect(addLicenseForm.get('tokensPurchased').enabled).toBeTrue();
        expect(addLicenseForm.get('deviceLimit').enabled).toBeTrue();
        expect(addLicenseForm.get('tokensPurchased').value).toBe(undefined);
        expect(addLicenseForm.get('deviceLimit').value).toBe(undefined);

        addLicenseComponentTestInstance.onChangeType(BundleServiceMock.addonBundle.bundleName);
        expect(addLicenseForm.get('tokensPurchased').enabled).toBeTrue();
        expect(addLicenseForm.get('deviceLimit').enabled).toBeTrue();
        expect(addLicenseForm.get('tokensPurchased').value).toBe(BundleServiceMock.addonBundle.defaultTokens);
        expect(addLicenseForm.get('deviceLimit').value).toBe(BundleServiceMock.addonBundle.defaultDeviceAccessTokens);

        addLicenseComponentTestInstance.onChangeType(BundleServiceMock.basicBundle.bundleName);
        expect(addLicenseForm.get('tokensPurchased').disabled).toBeTrue();
        expect(addLicenseForm.get('deviceLimit').disabled).toBeTrue();
        expect(addLicenseForm.get('tokensPurchased').value).toBe(BundleServiceMock.basicBundle.defaultTokens);
        expect(addLicenseForm.get('deviceLimit').value).toBe(BundleServiceMock.basicBundle.defaultDeviceAccessTokens);
    });

});