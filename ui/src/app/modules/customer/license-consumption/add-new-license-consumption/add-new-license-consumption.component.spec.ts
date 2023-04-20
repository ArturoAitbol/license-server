import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { DialogService } from 'src/app/services/dialog.service';
import { DevicesServiceMock } from 'src/test/mock/services/devices-service.mock';
import { ConsumptionServiceMock } from 'src/test/mock/services/license-consumption-service.mock';
import { ProjectServiceMock } from 'src/test/mock/services/project-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { AddNewLicenseConsumptionComponent } from './add-new-license-consumption.component';
import moment from "moment";
import { of, throwError } from "rxjs";
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';

let testInstance: AddNewLicenseConsumptionComponent;
let fixture: ComponentFixture<AddNewLicenseConsumptionComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddNewLicenseConsumptionComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: {} });
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(AddNewLicenseConsumptionComponent);
    testInstance = fixture.componentInstance;
    fixture.detectChanges();
};

describe('add-new-license-consumption - UI verification tests', () => {
    beforeEach(beforeEachFunction);
    it('should display UI elements correctly', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const cancelButton = fixture.nativeElement.querySelector('#cancel-button');
        const submitButton = fixture.nativeElement.querySelector('#submit-button');
        const newProjectButton = fixture.nativeElement.querySelector('#add-new-project-button');
        const addDeviceButton = fixture.nativeElement.querySelector('#add-device-button');
        const h2 = fixture.debugElement.queryAll(By.css("h2"));
        const labels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('label'));

        expect(h1.textContent).toBe('Add tekToken Consumption');
        expect(cancelButton.textContent).toBe('Cancel');
        expect(submitButton.disabled).toBeTrue();
        expect(submitButton.textContent).toBe('Submit');
        expect(newProjectButton.title).toBe('New Project');
        expect(h2.length).toBeGreaterThanOrEqual(3);
        expect(h2[0].nativeElement.textContent).toBe('DUT');
        expect(h2[1].nativeElement.textContent).toBe('Calling Platform Type');
        expect(h2[2].nativeElement.textContent).toBe('Other Devices');
        expect(addDeviceButton.disabled).toBeTrue();
        expect(addDeviceButton.title).toBe('New Device');
        expect(labels.find(label => label.textContent.includes("Comment"))).not.toBeUndefined();

    });

    it('should display correctly the object selected in the mat-autocompletes', async () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const projectInput = fixture.nativeElement.querySelector('#project-auto-complete');

        const addDutForm = testInstance.addDutForm;
        const addCallingPlatformForm = testInstance.addCallingPlatformForm;
        const addDeviceForm = testInstance.addDeviceForm;

        const dutInput = fixture.nativeElement.querySelector('#dut-auto-complete');
        const dutVendorInput = fixture.nativeElement.querySelector('#dut-vendor-auto-complete');
        const dutDeviceInput = fixture.nativeElement.querySelector('#dut-device-auto-complete');

        const callingPlatformInput = fixture.nativeElement.querySelector('#calling-platform-auto-complete');
        const callingPlatformVendorInput = fixture.nativeElement.querySelector('#calling-platform-vendor-auto-complete');
        const callingPlatformDeviceInput = fixture.nativeElement.querySelector('#calling-platform-device-auto-complete');

        const othersVendorInput = fixture.nativeElement.querySelector('#vendor-auto-complete');
        const otherDeviceInput = fixture.nativeElement.querySelector('#device-auto-complete');

        projectInput.dispatchEvent(new Event('focus'));
        projectInput.dispatchEvent(new Event('input'));

        dutInput.dispatchEvent(new Event('focus'));
        dutInput.dispatchEvent(new Event('input'));
        dutVendorInput.dispatchEvent(new Event('focus'));
        dutVendorInput.dispatchEvent(new Event('input'));
        dutDeviceInput.dispatchEvent(new Event('focus'));
        dutDeviceInput.dispatchEvent(new Event('input'));

        callingPlatformInput.dispatchEvent(new Event('focus'));
        callingPlatformInput.dispatchEvent(new Event('input'));
        callingPlatformVendorInput.dispatchEvent(new Event('focus'));
        callingPlatformVendorInput.dispatchEvent(new Event('input'));
        callingPlatformDeviceInput.dispatchEvent(new Event('focus'));
        callingPlatformDeviceInput.dispatchEvent(new Event('input'));

        othersVendorInput.dispatchEvent(new Event('focus'));
        othersVendorInput.dispatchEvent(new Event('input'));
        otherDeviceInput.dispatchEvent(new Event('focus'));
        otherDeviceInput.dispatchEvent(new Event('input'));

        addLicenseConsumptionForm.get('project').setValue({ projectName: 'TestProject' });

        addDutForm.get('type').setValue('TestDUT');
        addDutForm.get('vendor').setValue('TestDUTVendor');
        addDutForm.get('product').setValue({ product: 'TestDUTProduct' });

        addCallingPlatformForm.get('type').setValue('TestCallingPlatform');
        addCallingPlatformForm.get('vendor').setValue('TestCallingPlatformVendor');
        addCallingPlatformForm.get('product').setValue({ product: 'TestCallingPlatformProduct' });

        addDeviceForm.get('type').setValue('TestDevice');
        addDeviceForm.get('vendor').setValue('TestVendor');
        addDeviceForm.get('product').setValue({ product: 'TestProduct' });

        fixture.detectChanges();
        await fixture.whenStable();

        expect(projectInput.value).toBe('TestProject');

        expect(dutInput.value).toBe('TestDUT');
        expect(dutVendorInput.value).toBe('TestDUTVendor');
        expect(dutDeviceInput.value).toBe('TestDUTProduct');

        expect(callingPlatformInput.value).toBe('TestCallingPlatform');
        expect(callingPlatformVendorInput.value).toBe('TestCallingPlatformVendor');
        expect(callingPlatformDeviceInput.value).toBe('TestCallingPlatformProduct');

        expect(othersVendorInput.value).toBe('TestVendor');
        expect(otherDeviceInput.value).toBe('TestProduct');

    });
});

describe('add-new-license-consumption - FormGroup verification tests', () => {

    beforeEach(beforeEachFunction);

    it('should create a formGroup with the necessary controls', () => {
        fixture.detectChanges();
        expect(testInstance.addLicenseConsumptionForm.get('startWeek')).toBeTruthy();
        expect(testInstance.addLicenseConsumptionForm.get('endWeek')).toBeTruthy();
        expect(testInstance.addLicenseConsumptionForm.get('project')).toBeTruthy();
        expect(testInstance.addLicenseConsumptionForm.get('comment')).toBeTruthy();
        expect(testInstance.addDutForm.get('type')).toBeTruthy();
        expect(testInstance.addDutForm.get('vendor')).toBeTruthy();
        expect(testInstance.addDutForm.get('product')).toBeTruthy();
        expect(testInstance.addCallingPlatformForm.get('type')).toBeTruthy();
        expect(testInstance.addCallingPlatformForm.get('vendor')).toBeTruthy();
        expect(testInstance.addCallingPlatformForm.get('product')).toBeTruthy();
        expect(testInstance.addDeviceForm.get('type')).toBeTruthy();
        expect(testInstance.addDeviceForm.get('vendor')).toBeTruthy();
        expect(testInstance.addDeviceForm.get('product')).toBeTruthy();

    });

    it('should make all the controls required', () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDutForm = testInstance.addDutForm;
        const addCallingPlatformForm = testInstance.addCallingPlatformForm;
        const addDeviceForm = testInstance.addDeviceForm;

        addLicenseConsumptionForm.setValue({
            startWeek: '',
            endWeek: '',
            project: '',
            comment:''
        });

        addDutForm.setValue({
            type: '',
            vendor: '',
            product: ''
        });

        addCallingPlatformForm.setValue({
            type: '',
            vendor: '',
            product: ''
        });

        addDeviceForm.setValue({
            type: '',
            vendor: '',
            product: ''
        });

        expect(addLicenseConsumptionForm.get('startWeek').valid).toBeFalse();
        expect(addLicenseConsumptionForm.get('endWeek').valid).toBeFalse();
        expect(addLicenseConsumptionForm.get('project').valid).toBeFalse();
        expect(addLicenseConsumptionForm.get('comment').valid).toBeTrue();
        expect(addDutForm.get('type').valid).toBeFalse();
        expect(addDutForm.get('vendor').valid).toBeFalse();
        expect(addDutForm.get('product').valid).toBeFalse();
        expect(addCallingPlatformForm.get('type').valid).toBeFalse();
        expect(addCallingPlatformForm.get('vendor').valid).toBeFalse();
        expect(addCallingPlatformForm.get('product').valid).toBeFalse();
        expect(addDeviceForm.get('type').valid).toBeFalse();
        expect(addDeviceForm.get('vendor').valid).toBeFalse();
        expect(addDeviceForm.get('product').valid).toBeFalse();

    });

    it('should validate autocomplete forms are not of type string', () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDutForm = testInstance.addDutForm;
        const addCallingPlatformForm = testInstance.addCallingPlatformForm;
        const addDeviceForm = testInstance.addDeviceForm;


        addLicenseConsumptionForm.get('project').setValue('test');
        addDutForm.get('type').setValue('DUTName');
        addDutForm.get('vendor').enable();
        addDutForm.get('vendor').setValue('DUTVendor');
        addDutForm.get('product').enable();
        addDutForm.get('product').setValue('DUTProduct');

        addCallingPlatformForm.get('type').setValue('CPName');
        addCallingPlatformForm.get('vendor').enable();
        addCallingPlatformForm.get('vendor').setValue('CPVendor');
        addCallingPlatformForm.get('product').enable();
        addCallingPlatformForm.get('product').setValue('CPProduct');

        addDeviceForm.get('type').setValue('TestDevice');
        addDeviceForm.get('vendor').setValue('test');
        addDeviceForm.get('product').enable();
        addDeviceForm.get('product').setValue('test');

        fixture.detectChanges();
        expect(addLicenseConsumptionForm.valid).toBeFalse();
        expect(addDutForm.valid).toBeFalse();
        expect(addCallingPlatformForm.valid).toBeFalse();
        expect(addDeviceForm.valid).toBeFalse();

        addLicenseConsumptionForm.get('startWeek').setValue(new Date());
        addLicenseConsumptionForm.get('endWeek').setValue(new Date());
        addLicenseConsumptionForm.get('project').setValue({ test: "test" });
        addLicenseConsumptionForm.get('comment').setValue("Single comment");

        addDutForm.get('type').setValue('DUTName');
        addDutForm.get('vendor').setValue('DUTVendor');
        addDutForm.get('product').setValue({ test: 'DUTProduct' });

        addCallingPlatformForm.get('type').setValue('CPName');
        addCallingPlatformForm.get('vendor').setValue('CPVendor');
        addCallingPlatformForm.get('product').setValue({ test: 'CPProduct' });

        addDeviceForm.get('type').setValue('TestDevice');
        addDeviceForm.get('vendor').setValue("test");
        addDeviceForm.get('product').setValue({ test: "test" });

        expect(addLicenseConsumptionForm.valid).toBeTrue();
        expect(addDutForm.valid).toBeTrue();
        expect(addCallingPlatformForm.valid).toBeTrue();
        expect(addDeviceForm.valid).toBeTrue();

    });
});

describe('add-new-license-consumption - Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);

    it('should make a call to get device list, device types and project list', () => {
        spyOn(DevicesServiceMock, 'getAllDeviceVendors').and.callThrough();
        spyOn(DevicesServiceMock, 'getDevicesTypesList').and.callThrough();
        spyOn(ProjectServiceMock, 'getProjectDetailsByLicense').and.callThrough();
        testInstance.ngOnInit();
        expect(DevicesServiceMock.getAllDeviceVendors).toHaveBeenCalled();
        expect(DevicesServiceMock.getDevicesTypesList).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsByLicense).toHaveBeenCalled();
    });

});

describe('add-new-license-consumption - Dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);

    it('should close the openDialog when calling onCancel()', () => {
        spyOn(testInstance.dialogRef, 'close');
        fixture.detectChanges();
        testInstance.onCancel();
        expect(testInstance.dialogRef.close).toHaveBeenCalled();
    });
});

describe('diplay of data and interactions', () => {
    beforeEach(beforeEachFunction);
    it('add new license consumption - should fecth projects', () => {
        spyOn(testInstance, 'onAddProject').and.callThrough();
        spyOn(dialogService, 'afterClosed').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();
        spyOn(testInstance, 'fetchProjects').and.callThrough();
        fixture.detectChanges();

        testInstance.onAddProject();
        dialogService.afterClosed();

        expect(testInstance.fetchProjects).toHaveBeenCalled();
        expect(testInstance.isDataLoading).toBeFalse();
    });

    it('should make a call to onChangeDutType', () => {
        spyOn(testInstance, 'onChangeDutType').and.callThrough();
        spyOn(DevicesServiceMock, 'getAllDeviceVendors').and.callThrough();

        fixture.detectChanges();
        testInstance.onChangeDutType("Soft Client/UC Client");

        expect(DevicesServiceMock.getAllDeviceVendors).toHaveBeenCalled();
        expect(testInstance.isDataLoading).toBeFalse();
        expect(testInstance.vendors).toEqual(DevicesServiceMock.vendorList.vendors)
    });

    it('should make a call to onChangeCallingPlatformType', () => {
        spyOn(testInstance, 'onChangeCallingPlatformType').and.callThrough();
        spyOn(DevicesServiceMock, 'getAllDeviceVendors').and.callThrough();

        fixture.detectChanges();
        testInstance.onChangeCallingPlatformType("PBX");

        expect(testInstance.selectedCallingPlatformType).toBe("PBX");
        expect(DevicesServiceMock.getAllDeviceVendors).toHaveBeenCalled();
        expect(testInstance.callingPlatformVendors).toEqual(DevicesServiceMock.vendorList.vendors)
    });

    it('should make a call to onChangeDeviceType', () => {
        spyOn(testInstance, 'onChangeDeviceType').and.callThrough();
        spyOn(DevicesServiceMock, 'getAllDeviceVendors').and.callThrough();

        fixture.detectChanges();
        testInstance.onChangeDeviceType("PBX");

        expect(testInstance.selectedDeviceType).toBe("PBX");
        expect(DevicesServiceMock.getAllDeviceVendors).toHaveBeenCalled();
        expect(testInstance.deviceVendors).toEqual(DevicesServiceMock.vendorList.vendors)
    });

    it('should make a call to onChangeVendor', () => {
        spyOn(testInstance, 'onChangeVendor').and.callThrough();
        spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();

        fixture.detectChanges();
        testInstance.onChangeVendor("TestSupport");

        expect(DevicesServiceMock.getDevicesList).toHaveBeenCalled();
        expect(testInstance.isDataLoading).toBeFalse();
    });

    it('should make a call to onChangeVendor', () => {
        spyOn(testInstance, 'onChangeVendor').and.callThrough();
        spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();

        fixture.detectChanges();
        testInstance.onChangeVendor("Test");

        expect(DevicesServiceMock.getDevicesList).toHaveBeenCalled();
        expect(testInstance.isDataLoading).toBeFalse();
    });
    
    it('should make a call to onChangeCallingPlatformVendor', () => {
        spyOn(testInstance, 'onChangeCallingPlatformVendor').and.callThrough();
        spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();

        fixture.detectChanges();
        testInstance.onChangeCallingPlatformVendor("Test");

        expect(DevicesServiceMock.getDevicesList).toHaveBeenCalled();
        expect(testInstance.isDataLoading).toBeFalse();
    });

    it('should make a call to onChangeCallingPlatformVendor', () => {
        spyOn(testInstance, 'onChangeCallingPlatformVendor').and.callThrough();
        spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();

        fixture.detectChanges();
        testInstance.onChangeCallingPlatformVendor("TestSupport");

        expect(DevicesServiceMock.getDevicesList).toHaveBeenCalled();
        expect(testInstance.isDataLoading).toBeFalse();
    });
    it('should make a call to onChangeDeviceVendor', () => {
        spyOn(testInstance, 'onChangeDeviceVendor').and.callThrough();
        spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();

        fixture.detectChanges();
        testInstance.onChangeDeviceVendor("Mitel");

        expect(DevicesServiceMock.getDevicesList).toHaveBeenCalled();
        expect(testInstance.isDataLoading).toBeFalse();
    });

    it('should make a call to pickStartWeek', () => {
        spyOn(testInstance, 'toggleUsageDays').and.callThrough();
        fixture.detectChanges();
        testInstance.addDeviceForm.value.product = DevicesServiceMock.device;
        testInstance.addDevice();
        testInstance.addLicenseConsumptionForm.get('startWeek').setValue(moment());
        testInstance.addLicenseConsumptionForm.get('endWeek').setValue(moment());

        testInstance.pickStartWeek();

        expect(testInstance.toggleUsageDays).toHaveBeenCalled();
    });

    it('should make a call to setChecked with null device index', () => {
        spyOn(testInstance, 'setChecked').and.callThrough();

        testInstance.setChecked(true,0,undefined);
        fixture.detectChanges();

        expect(testInstance.deviceDays[0].used).toBeTrue();
    });

    it('should make a call to setChecked with a device index', () => {
        spyOn(testInstance, 'setChecked').and.callThrough();
        spyOn(testInstance, 'addDevice').and.callThrough();
        testInstance.addDeviceForm.value.product = DevicesServiceMock.device;
        testInstance.addDevice();
        testInstance.setChecked(true,0,0);
        fixture.detectChanges();

        expect(testInstance.otherDevicesUsed[0].days[0].used).toBeTrue();
    });

    it('should call to setConsumption and set consumptionsDays', () => {
        spyOn(testInstance, 'setConsumptionDays').and.callThrough();

        fixture.detectChanges();
        testInstance.setConsumptionDays(true,0);

        expect(testInstance.consumptionDays[0].used).toBeTrue();
    });

    it('should make a call to submit', () => {
        spyOn(testInstance, 'submit').and.callThrough();
        spyOn(testInstance, 'addDut').and.callThrough();
        spyOn(testInstance, 'setChecked').and.callThrough();
        spyOn(testInstance, 'addCallingPlatform').and.callThrough();
        spyOn(testInstance, 'setConsumptionDays').and.callThrough();
        spyOn(ConsumptionServiceMock, 'addLicenseConsumptionEvent').and.callThrough();
        testInstance.addLicenseConsumptionForm.value.startWeek = moment();
        testInstance.addDeviceForm.value.product = DevicesServiceMock.device;
        testInstance.addDutForm.value.product = DevicesServiceMock.device;
        testInstance.addCallingPlatformForm.value.product = DevicesServiceMock.device;

        testInstance.setConsumptionDays(true,0);
        testInstance.setChecked(true,0);
        testInstance.addDevice();
        testInstance.addDut();
        testInstance.addCallingPlatform();

        fixture.detectChanges();
        testInstance.submit();


        expect(ConsumptionServiceMock.addLicenseConsumptionEvent).toHaveBeenCalled();
    });

    it('should make a call to submit with empty otherDevicesUsed', () => {
        spyOn(testInstance, 'submit').and.callThrough();
        spyOn(testInstance, 'addDut').and.callThrough();
        spyOn(testInstance, 'addCallingPlatform').and.callThrough();
        spyOn(testInstance, 'setConsumptionDays').and.callThrough();
        spyOn(ConsumptionServiceMock, 'addLicenseConsumptionEvent').and.callThrough();
        testInstance.addLicenseConsumptionForm.value.startWeek = moment();

        testInstance.addDutForm.value.product =[];
        testInstance.addCallingPlatformForm.value.product = [];
        
        fixture.detectChanges();
        testInstance.otherDevicesUsed = []
        testInstance.submit();


        expect(testInstance.isDataLoading ).toBeFalse();
    });

    it('should call filters of vendors, device vendors and models', fakeAsync(() => {
        spyOn(testInstance, 'fetchData').and.callThrough();
        spyOn(testInstance, 'onChangeCallingPlatformType').and.callThrough();
        spyOn(testInstance, 'onChangeDutType').and.callThrough();
        spyOn(testInstance, 'onChangeDeviceType').and.callThrough();
        spyOn(DevicesServiceMock, 'getAllDeviceVendors').and.callThrough();
        spyOn(testInstance, 'onChangeVendor').and.callThrough();
        spyOn(testInstance, 'onChangeDeviceVendor').and.callThrough();
        spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();
        testInstance.models = [{
            "id": "eb2e8d89-b5a0-4e6c-8b11-83aad3674d7f",
            "vendor": "TestSupport",
            "product": "Test"
        }]
        testInstance.deviceModels = [{
            "supportType": false,
            "product": "Test",
            "vendor": "TestSupport",
            "granularity": "week",
            "id": "eb2e8d89-b5a0-4e6c-8b11-83aad2674d7f",
            "version": null,
            "tokensToConsume": 2
        }];

        tick(200);
        fixture.detectChanges();
        testInstance.addCallingPlatformForm.controls['product'].setValue('Test');
        testInstance.addDutForm.controls['product'].setValue("Test");
        testInstance.onChangeVendor("Test");
        testInstance.onChangeDeviceVendor("Test");
        testInstance.onChangeDutType("Soft Client/UC Client");
        testInstance.addDutForm.controls['vendor'].setValue("Test");
        testInstance.addDeviceForm.controls['vendor'].setValue("TestSupport");
        testInstance.addDeviceForm.controls['product'].setValue("Test");
        tick(200);
        fixture.detectChanges();
        testInstance.removeDevice(2);

        expect(testInstance.filteredVendors).not.toBeNull();
        expect(testInstance.deviceModels).not.toBeNull();
        expect(testInstance.models).not.toBeNull();
    }));

    it('should call filters of vendors, device vendors and models', fakeAsync(() => {
        spyOn(testInstance, 'fetchData').and.callThrough();
        spyOn(testInstance, 'onChangeCallingPlatformType').and.callThrough();
        spyOn(testInstance, 'onChangeDutType').and.callThrough();
        spyOn(testInstance, 'onChangeDeviceType').and.callThrough();
        spyOn(DevicesServiceMock, 'getAllDeviceVendors').and.callThrough();
        spyOn(testInstance, 'onChangeVendor').and.callThrough();
        spyOn(testInstance, 'onChangeDeviceVendor').and.callThrough();
        spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();
        testInstance.models = [{
            "id": "eb2e8d89-b5a0-4e6c-8b11-83aad2674d7f",
            "vendor": "Test",
            "product": "TestSupport"
        }]
        testInstance.deviceModels = [{
            "supportType": false,
            "product": "Test",
            "vendor": "TestSupport",
            "granularity": "week",
            "id": "eb2e8d89-b5a0-4e6c-8b11-83aad2674d7f",
            "version": '2.1',
            "tokensToConsume": 2
        }];

        tick(200);
        fixture.detectChanges();
        testInstance.addCallingPlatformForm.controls['product'].setValue('Test');
        testInstance.addDutForm.controls['product'].setValue(1);
        testInstance.onChangeVendor("Test");
        testInstance.onChangeDeviceVendor("Test");
        testInstance.onChangeDutType("Soft Client/UC Client");
        testInstance.addDutForm.controls['vendor'].setValue("Test");
        testInstance.addDeviceForm.controls['vendor'].setValue("Test");
        testInstance.addDeviceForm.controls['product'].setValue(1);
        tick(200);
        fixture.detectChanges();
        testInstance.removeDevice(2);

        expect(testInstance.filteredVendors).not.toBeNull();
        expect(testInstance.deviceModels).not.toBeNull();
        expect(testInstance.models).not.toBeNull();
    }));

    it('should make a call to dutCallingAnddeviceInvalid', async () => {
        spyOn(testInstance, 'dutCallingAndDeviceInvalid').and.callThrough();

        fixture.detectChanges();
        await fixture.whenStable();
        const value = testInstance.dutCallingAndDeviceInvalid();

        expect(value).toBeTrue();
    });
});

describe('add new license consumption - testing errors thrown by functions', () => {
    beforeEach(beforeEachFunction);
    it('should throw an error if something wrong happened in submit', () => {
        const response = {error: 'some error'}
        spyOn(testInstance, 'submit').and.callThrough();
        spyOn(testInstance, 'addDut').and.callThrough();
        spyOn(testInstance, 'addCallingPlatform').and.callThrough();
        spyOn(ConsumptionServiceMock, 'addLicenseConsumptionDetails').and.returnValue(of(response));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        testInstance.addLicenseConsumptionForm.value.startWeek = moment();
        testInstance.addDeviceForm.value.product = DevicesServiceMock.device;
        testInstance.addDutForm.value.product = DevicesServiceMock.device;
        testInstance.addCallingPlatformForm.value.product = DevicesServiceMock.device;

        testInstance.addDevice();
        testInstance.addDut();
        testInstance.addCallingPlatform();

        fixture.detectChanges();
        testInstance.submit();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith("some error",'Error adding some devices for this license consumption!');
    });

    it('should throw an error if something wrong happened in submit', () => {
        spyOn(testInstance, 'submit').and.callThrough();
        spyOn(testInstance, 'addDut').and.callThrough();
        spyOn(testInstance, 'addCallingPlatform').and.callThrough();
        spyOn(ConsumptionServiceMock, 'addLicenseConsumptionDetails').and.returnValue(throwError('some error'));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        testInstance.addLicenseConsumptionForm.value.startWeek = moment();
        testInstance.addDeviceForm.value.product = DevicesServiceMock.device;
        testInstance.addDutForm.value.product = DevicesServiceMock.device;
        testInstance.addCallingPlatformForm.value.product = DevicesServiceMock.device;

        testInstance.addDevice();
        testInstance.addDut();
        testInstance.addCallingPlatform();

        fixture.detectChanges();
        testInstance.submit();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith("some error",'Error adding some devices for this license consumption!');
    });

    it('should throw an error if something wrong happened in submit', () => {
        spyOn(testInstance, 'submit').and.callThrough();
        spyOn(testInstance, 'addDut').and.callThrough();
        spyOn(testInstance, 'addCallingPlatform').and.callThrough();
        spyOn(ConsumptionServiceMock, 'addLicenseConsumptionEvent').and.returnValue(throwError('some error'));
        spyOn(console, 'log');
        testInstance.addLicenseConsumptionForm.value.startWeek = moment();
        testInstance.addDeviceForm.value.product = DevicesServiceMock.device;
        testInstance.addDutForm.value.product = DevicesServiceMock.device;
        testInstance.addCallingPlatformForm.value.product = DevicesServiceMock.device;

        testInstance.addDevice();
        testInstance.addDut();
        testInstance.addCallingPlatform();

        fixture.detectChanges();
        testInstance.submit();

        expect(console.log).toHaveBeenCalledWith('some error');
        expect(testInstance.isDataLoading).toBeFalse();
    });

    it('should throw an error if something wrong happened in submit', () => {
        const response = {error: 'some error'}
        spyOn(testInstance, 'submit').and.callThrough();
        spyOn(testInstance, 'addDut').and.callThrough();
        spyOn(testInstance, 'addCallingPlatform').and.callThrough();
        spyOn(ConsumptionServiceMock, 'addLicenseConsumptionEvent').and.returnValue(of(response));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        testInstance.addLicenseConsumptionForm.value.startWeek = moment();
        testInstance.addDeviceForm.value.product = DevicesServiceMock.device;
        testInstance.addDutForm.value.product = DevicesServiceMock.device;
        testInstance.addCallingPlatformForm.value.product = DevicesServiceMock.device;

        testInstance.addDevice();
        testInstance.addDut();
        testInstance.addCallingPlatform();

        fixture.detectChanges();
        testInstance.submit();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.error, 'Error adding license consumption!');
        expect(testInstance.isDataLoading).toBeFalse();
    });
});