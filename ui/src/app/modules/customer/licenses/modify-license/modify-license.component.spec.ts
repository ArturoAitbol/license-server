import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { of, throwError } from "rxjs";
import { BundleServiceMock } from "src/test/mock/services/bundle-service.mock";
import { LicenseServiceMock } from "src/test/mock/services/license-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { ModifyLicenseComponent } from "./modify-license.component";
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';

let modifyLicenseComponentTestInstance: ModifyLicenseComponent;
let fixture : ComponentFixture<ModifyLicenseComponent>;

const data = {
    deviceLimit: "5000",
    id: "1871a604-4e88-4999-bf20-4403468dfc68",
    subscriptionType: "Basic",
    description: "Description",
    renewalDate: "2022-06-10",
    startDate: "2022-06-01",
    status: "Active",
    subaccountId: "70e77c75-c972-4c0b-94cc-2fd04f726341",
    tokensPurchased: "55"
};

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(ModifyLicenseComponent);
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: data });
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(ModifyLicenseComponent);
    modifyLicenseComponentTestInstance = fixture.componentInstance;
};

describe('modify-license.component - UI and component verification tests',()=> {

    beforeEach(beforeEachFunction);

    it('modify-license.component - should display essential UI and components',()=> {
        fixture.detectChanges();
        const h1: HTMLElement = fixture.nativeElement.querySelector('#dialog-title');
        const cancelButton: HTMLElement = fixture.nativeElement.querySelector('#cancel-button');
        const submitButton: HTMLElement = fixture.nativeElement.querySelector('#submit-button');
        const labels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('label'));

        expect(h1.textContent).toBe('Edit TekVizion 360 Subscription');
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

describe('modify-license.component - FormGroup verification tests',()=> {

    beforeEach(beforeEachFunction);
    
    it('should create a formGroup with the necesary controls',()=> {
        expect(modifyLicenseComponentTestInstance.updateCustomerForm.contains('startDate')).toBeTrue();
        expect(modifyLicenseComponentTestInstance.updateCustomerForm.contains('description')).toBeTrue();
        expect(modifyLicenseComponentTestInstance.updateCustomerForm.contains('subscriptionType')).toBeTrue();
        expect(modifyLicenseComponentTestInstance.updateCustomerForm.contains('tokensPurchased')).toBeTrue();
        expect(modifyLicenseComponentTestInstance.updateCustomerForm.contains('deviceLimit')).toBeTrue();
        expect(modifyLicenseComponentTestInstance.updateCustomerForm.contains('renewalDate')).toBeTrue();
    });
    
    it('should make all the controls required',()=> {
        const updateCustomerForm = modifyLicenseComponentTestInstance.updateCustomerForm;
        updateCustomerForm.setValue({
            startDate:'',
            description:'',
            subscriptionType:'',
            tokensPurchased:'',
            deviceLimit:'',
            renewalDate:''
        });

        expect(updateCustomerForm.get('startDate').valid).toBeFalse();
        expect(updateCustomerForm.get('description').valid).toBeFalse();
        expect(updateCustomerForm.get('subscriptionType').valid).toBeFalse();
        expect(updateCustomerForm.get('tokensPurchased').valid).toBeFalse();
        expect(updateCustomerForm.get('deviceLimit').valid).toBeFalse();
        expect(updateCustomerForm.get('renewalDate').valid).toBeFalse();
    });

    it('should validate that renewalDate is always after startDate',()=> {
        const updateCustomerForm = modifyLicenseComponentTestInstance.updateCustomerForm;

        updateCustomerForm.get('startDate').setValue('2022-06-17');
        updateCustomerForm.get('renewalDate').setValue('2022-06-19');
        expect(updateCustomerForm.errors).toBeNull();

        updateCustomerForm.get('startDate').setValue('2022-06-19');
        updateCustomerForm.get('renewalDate').setValue('2022-06-17');
        expect(updateCustomerForm.errors).not.toBeNull();
        expect(updateCustomerForm.errors.renewalIsBeforeStart).toBeTrue();
    });

});

describe('modify-license.component - Data collection and parsing tests',()=> {
    beforeEach(beforeEachFunction);

    it('should make a call to bundles list (subscriptionTypes)',()=> {
        spyOn(BundleServiceMock,'getBundleList').and.callThrough();
        fixture.detectChanges();
        expect(BundleServiceMock.getBundleList).toHaveBeenCalled();
        expect(modifyLicenseComponentTestInstance.subscriptionTypes).toEqual(BundleServiceMock.bundleList.bundles);
    });

});

describe('modify-license.component - Calls and interactions', ()=> {
    beforeEach(beforeEachFunction);

    it('should keep submit button disabled if data does not change',()=> {
        fixture.detectChanges();
        expect(modifyLicenseComponentTestInstance.disableSumbitBtn()).toBeTrue();

        const updateCustomerForm: FormGroup = modifyLicenseComponentTestInstance.updateCustomerForm; 
        updateCustomerForm.get('subscriptionType').setValue('Small');
        expect(modifyLicenseComponentTestInstance.disableSumbitBtn()).toBeFalse();
    });

    it('should close the dialog when calling onCancel()',()=> {
        spyOn(modifyLicenseComponentTestInstance.dialogRef,'close');
        fixture.detectChanges();
        modifyLicenseComponentTestInstance.onCancel();
        expect(modifyLicenseComponentTestInstance.dialogRef.close).toHaveBeenCalled();
    });

    it('should update a license after calling submit()',()=> {
        spyOn(LicenseServiceMock,'updateLicenseDetails').and.callThrough();
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
        spyOn(modifyLicenseComponentTestInstance.dialogRef,'close');
        fixture.detectChanges();
        modifyLicenseComponentTestInstance.submit();

        expect(LicenseServiceMock.updateLicenseDetails).toHaveBeenCalled();
        expect(modifyLicenseComponentTestInstance.dialogRef.close).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subscription edited successfully!', '');
    });

    it('should update a license after calling submit() - New Status: Active',()=> {
        spyOn(LicenseServiceMock,'updateLicenseDetails').and.callThrough();
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
        spyOn(modifyLicenseComponentTestInstance.dialogRef,'close');
        fixture.detectChanges();
        const newDate = new Date();
        newDate.setDate(newDate.getDate()+1);
        modifyLicenseComponentTestInstance.updateCustomerForm.get('renewalDate').setValue(newDate);
        modifyLicenseComponentTestInstance.submit();

        expect(LicenseServiceMock.updateLicenseDetails).toHaveBeenCalled();
        expect(modifyLicenseComponentTestInstance.dialogRef.close).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subscription edited successfully!', '');
    });

    it('should show an error when updating license failed after calling submit()',()=> {
        spyOn(LicenseServiceMock,'updateLicenseDetails').and.returnValue(of({error:'some error message'}));
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
        fixture.detectChanges();
        
        modifyLicenseComponentTestInstance.submit();

        expect(LicenseServiceMock.updateLicenseDetails).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('some error message', 'Error updating subscription!');

    });

    it('should close the dialog when updating license throws an error after calling submit()',()=> {
        const error = "some error";
        spyOn(LicenseServiceMock,'updateLicenseDetails').and.returnValue(throwError(error));
        spyOn(modifyLicenseComponentTestInstance.dialogRef,'close');
        spyOn(console, 'error').and.callThrough();
        fixture.detectChanges();
        
        modifyLicenseComponentTestInstance.submit();

        expect(LicenseServiceMock.updateLicenseDetails).toHaveBeenCalled();
        expect(modifyLicenseComponentTestInstance.isDataLoading).toBeFalse();
        expect(modifyLicenseComponentTestInstance.dialogRef.close).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('error while updating subscription information row', error);
    });

    it('should set the minimun renewalData value and the maximun startDate value so startDate is always before renewalDate',()=> {
        modifyLicenseComponentTestInstance.onStartDateChange('2022-01-06 00:00:00');
        expect(modifyLicenseComponentTestInstance.renewalDateMin).toEqual(new Date('2022-01-07 00:00:00'));

        modifyLicenseComponentTestInstance.onRenewalDateChange('2022-01-06 00:00:00');
        expect(modifyLicenseComponentTestInstance.startDateMax).toEqual(new Date('2022-01-05 00:00:00'));
    });

    it('should modify tokensPurchased and deviceLimit form controls according to the subscriptionType when calling onChangeType()',()=> {
        modifyLicenseComponentTestInstance.subscriptionTypes = BundleServiceMock.bundleList.bundles;
        const updateCustomerForm = modifyLicenseComponentTestInstance.updateCustomerForm;
        let subscriptionType : {id:string,bundleName:string,defaultTokens?:string,defaultDeviceAccessTokens?:string};
        
        subscriptionType = BundleServiceMock.customBundle;
        modifyLicenseComponentTestInstance.onChangeType(subscriptionType.bundleName);
        expect(updateCustomerForm.get('tokensPurchased').enabled).toBeTrue();
        expect(updateCustomerForm.get('deviceLimit').enabled).toBeTrue();

        subscriptionType = BundleServiceMock.addonBundle;
        modifyLicenseComponentTestInstance.onChangeType(subscriptionType.bundleName);
        expect(updateCustomerForm.get('tokensPurchased').enabled).toBeTrue();
        expect(updateCustomerForm.get('deviceLimit').enabled).toBeTrue();
        expect(updateCustomerForm.get('tokensPurchased').value).toBe(subscriptionType.defaultTokens);
        expect(updateCustomerForm.get('deviceLimit').value).toBe(subscriptionType.defaultDeviceAccessTokens);
        
        subscriptionType = BundleServiceMock.basicBundle;
        modifyLicenseComponentTestInstance.onChangeType(subscriptionType.bundleName);
        expect(updateCustomerForm.get('tokensPurchased').disabled).toBeTrue();
        expect(updateCustomerForm.get('deviceLimit').disabled).toBeTrue();
        expect(updateCustomerForm.get('tokensPurchased').value).toBe(subscriptionType.defaultTokens);
        expect(updateCustomerForm.get('deviceLimit').value).toBe(subscriptionType.defaultDeviceAccessTokens);
    });

});