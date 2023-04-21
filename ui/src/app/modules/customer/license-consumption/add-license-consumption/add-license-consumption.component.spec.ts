import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SnackBarServiceMock } from "../../../../../test/mock/services/snack-bar-service.mock";
import { DialogService } from "../../../../services/dialog.service";
import { AddLicenseConsumptionComponent } from "./add-license-consumption.component";
import { ConsumptionServiceMock } from "../../../../../test/mock/services/license-consumption-service.mock";
import { ProjectServiceMock } from "../../../../../test/mock/services/project-service.mock";
import { By } from "@angular/platform-browser";
import { DevicesServiceMock } from "../../../../../test/mock/services/devices-service.mock";
import moment from "moment";
import { of, throwError } from "rxjs";
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';
import { DialogServiceMock } from '../../../../../test/mock/services/dialog-service.mock';

let testInstance: AddLicenseConsumptionComponent;
let fixture: ComponentFixture<AddLicenseConsumptionComponent>;

const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddLicenseConsumptionComponent);
configBuilder.addProvider({ provide: DialogService, useValue: new DialogServiceMock() });
configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: {} });

const beforeEachFunction = () => {
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(AddLicenseConsumptionComponent);
    testInstance = fixture.componentInstance;
    fixture.detectChanges();
};

describe('add-license-consumption - UI verification tests', () => {
    beforeEach(beforeEachFunction);
    it('should display UI elements correctly', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const cancelButton = fixture.nativeElement.querySelector('#cancel-button');
        const submitButton = fixture.nativeElement.querySelector('#submit-button');
        const newProjectButton = fixture.nativeElement.querySelector('#add-new-project-button');
        const addDeviceButton = fixture.nativeElement.querySelector('#add-device-button');
        const addSupportButton = fixture.nativeElement.querySelector('#add-support-button');
        const h2 = fixture.debugElement.queryAll(By.css("h2"));
        expect(h1.textContent).toBe('Add tekToken Consumption');
        expect(cancelButton.textContent).toBe('Cancel');
        expect(submitButton.disabled).toBeTrue();
        expect(submitButton.textContent).toBe('Submit');
        expect(newProjectButton.title).toBe('New Project');
        expect(h2.length).toBeGreaterThanOrEqual(2);
        expect(h2[0].nativeElement.textContent).toBe('Devices Used');
        expect(h2[1].nativeElement.textContent).toBe('Support Used');
        expect(addDeviceButton.disabled).toBeTrue();
        expect(addDeviceButton.title).toBe('New Device');
        expect(addSupportButton.disabled).toBeTrue();
        expect(addSupportButton.title).toBe('New Support');
    });

    it('should display correctly the object selected in the mat-autocompletes', async () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDeviceForm = testInstance.addDeviceForm;
        const addSupportForm = testInstance.addSupportForm;
        const projectInput = fixture.nativeElement.querySelector('#project-auto-complete');
        const vendorInput = fixture.nativeElement.querySelector('#vendor-auto-complete');
        const deviceInput = fixture.nativeElement.querySelector('#device-auto-complete');
        const supportVendorInput = fixture.nativeElement.querySelector('#support-vendor-auto-complete');
        const supportDeviceInput = fixture.nativeElement.querySelector('#support-device-auto-complete');

        projectInput.dispatchEvent(new Event('focus'));
        projectInput.dispatchEvent(new Event('input'));
        vendorInput.dispatchEvent(new Event('focus'));
        vendorInput.dispatchEvent(new Event('input'));
        deviceInput.dispatchEvent(new Event('focus'));
        deviceInput.dispatchEvent(new Event('input'));
        supportVendorInput.dispatchEvent(new Event('focus'));
        supportVendorInput.dispatchEvent(new Event('input'));
        supportDeviceInput.dispatchEvent(new Event('focus'));
        supportDeviceInput.dispatchEvent(new Event('input'));
        addLicenseConsumptionForm.get('project').setValue({projectName: 'TestProject'});
        addDeviceForm.get('vendor').setValue('TestVendor');
        addDeviceForm.get('product').setValue({product: 'TestProduct'});
        addSupportForm.get('vendor').setValue('TestVendor');
        addSupportForm.get('product').setValue({product: 'TestProduct'});

        fixture.detectChanges();

        await fixture.whenStable();

        expect(projectInput.value).toBe('TestProject');
        expect(vendorInput.value).toBe('TestVendor');
        expect(deviceInput.value).toBe('TestProduct');
        expect(supportVendorInput.value).toBe('TestVendor');
        expect(supportDeviceInput.value).toBe('TestProduct');

    });
});

describe('add-license-consumption - FormGroup verification tests', () => {

    beforeEach(beforeEachFunction);

    it('should create a formGroup with the necessary controls', () => {
        fixture.detectChanges();
        expect(testInstance.addLicenseConsumptionForm.get('startWeek')).toBeTruthy();
        expect(testInstance.addLicenseConsumptionForm.get('endWeek')).toBeTruthy();
        expect(testInstance.addLicenseConsumptionForm.get('project')).toBeTruthy();
        expect(testInstance.addDeviceForm.get('vendor')).toBeTruthy();
        expect(testInstance.addDeviceForm.get('product')).toBeTruthy();
        expect(testInstance.addSupportForm.get('vendor')).toBeTruthy();
        expect(testInstance.addSupportForm.get('product')).toBeTruthy();
    });

    it('should make all the controls required', () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDeviceForm = testInstance.addDeviceForm;
        const addSupportForm = testInstance.addSupportForm;
        addLicenseConsumptionForm.setValue({
            startWeek: '',
            endWeek: '',
            project: '',
        });
        addDeviceForm.setValue({
            vendor: '',
            product: ''
        });
        addSupportForm.setValue({
            vendor: '',
            product: ''
        });

        expect(addLicenseConsumptionForm.get('startWeek').valid).toBeFalse();
        expect(addLicenseConsumptionForm.get('endWeek').valid).toBeFalse();
        expect(addLicenseConsumptionForm.get('project').valid).toBeFalse();
        expect(addDeviceForm.get('vendor').valid).toBeFalse();
        expect(addDeviceForm.get('product').valid).toBeFalse();
        expect(addSupportForm.get('vendor').valid).toBeFalse();
        expect(addSupportForm.get('product').valid).toBeFalse();
    });

    it('should validate autocomplete forms are not of type string', () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDeviceForm = testInstance.addDeviceForm;
        const addSupportForm = testInstance.addSupportForm;

        addLicenseConsumptionForm.get('project').setValue('test');
        addDeviceForm.get('vendor').setValue('test');
        addDeviceForm.get('product').enable();
        addDeviceForm.get('product').setValue('test');
        addSupportForm.get('vendor').setValue('test');
        addSupportForm.get('product').enable();
        addSupportForm.get('product').setValue('test');
        fixture.detectChanges();
        expect(addLicenseConsumptionForm.valid).toBeFalse();
        expect(addDeviceForm.valid).toBeFalse();
        expect(addSupportForm.valid).toBeFalse();

        addLicenseConsumptionForm.get('startWeek').setValue(new Date());
        addLicenseConsumptionForm.get('endWeek').setValue(new Date());
        addLicenseConsumptionForm.get('project').setValue({ test: "test" });
        addDeviceForm.get('vendor').setValue("test");
        addDeviceForm.get('product').setValue({ test: "test" });
        addSupportForm.get('vendor').setValue("test");
        addSupportForm.get('product').setValue({ test: "test" });
        expect(addLicenseConsumptionForm.valid).toBeTrue();
        expect(addDeviceForm.valid).toBeTrue();
        expect(addSupportForm.valid).toBeTrue();
    });
});

describe('add-license-consumption - Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);

    it('should make a call to get device list and project list', () => {
        spyOn(DevicesServiceMock, 'getAllDeviceVendors').and.callThrough();
        spyOn(ProjectServiceMock, 'getProjectDetailsByLicense').and.callThrough();
        testInstance.ngOnInit();
        expect(DevicesServiceMock.getAllDeviceVendors).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsByLicense).toHaveBeenCalled();
    });

});

describe('add-license-consumption - Dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);

    it('should close the openDialog when calling onCancel()', () => {
        spyOn(testInstance.dialogRef, 'close');
        fixture.detectChanges();
        testInstance.onCancel();
        expect(testInstance.dialogRef.close).toHaveBeenCalled();
    });

    it('should create a license consumption after calling submit()', () => {
        spyOn(ConsumptionServiceMock, 'addLicenseConsumptionDetails').and.callThrough();
        spyOn(testInstance.dialogRef, 'close');
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        addLicenseConsumptionForm.get('startWeek').setValue(moment());
        testInstance.devicesUsed.push({ test: "test", days: [] });

        fixture.detectChanges();
        testInstance.submit();

        expect(ConsumptionServiceMock.addLicenseConsumptionDetails).toHaveBeenCalled();
        expect(testInstance.dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should show an error when adding license consumption failed after calling submit()', () => {
        spyOn(ConsumptionServiceMock, 'addLicenseConsumptionDetails').and.returnValue(of({ error: 'some error message' }));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        addLicenseConsumptionForm.get('startWeek').setValue(moment());
        testInstance.devicesUsed.push({ test: "test", days: [] });

        fixture.detectChanges();
        testInstance.submit();

        expect(ConsumptionServiceMock.addLicenseConsumptionDetails).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('some error message', 'Error adding license consumption!');

    });

    it('should show an error when adding license consumption failed after calling submit()', () => {
        spyOn(ConsumptionServiceMock, 'addLicenseConsumptionDetails').and.returnValue(throwError('Some error'));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        addLicenseConsumptionForm.get('startWeek').setValue(moment());
        const deviceDays: any = [
            { name: "Sun", used: true, disabled: true },
            { name: "Mon", used: false, disabled: true },
            { name: "Tue", used: false, disabled: true },
            { name: "Wed", used: false, disabled: true },
            { name: "Thu", used: true, disabled: true },
            { name: "Fri", used: false, disabled: true },
            { name: "Sat", used: false, disabled: true },
        ];
        testInstance.devicesUsed.push({ test: "test", days: deviceDays });
        testInstance.supportUsed.push({ test: "test", days: deviceDays });

        fixture.detectChanges();
        testInstance.submit();

        expect(ConsumptionServiceMock.addLicenseConsumptionDetails).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Some error', 'Error adding license consumption!');

    });
});

describe('add-license-consumption - Add device, remove device methods', () => {
    beforeEach(beforeEachFunction);
    beforeEach(() => {
        const addDeviceForm = testInstance.addDeviceForm;
        addDeviceForm.get('product').enable();
        addDeviceForm.get('vendor').setValue("3CX");
        addDeviceForm.get('product').setValue({
            "id": "ef7a4bcd-fc3f-4f87-bf87-ae934799690b",
            "vendor": "3CX",
            "product": "3CX - v.18.0.1880 (week - 2)",
            "days": [
                { "name": "Sun", "used": false, "disabled": true },
                { "name": "Mon", "used": false, "disabled": true },
                { "name": "Tue", "used": false, "disabled": true },
                { "name": "Wed", "used": false, "disabled": true },
                { "name": "Thu", "used": false, "disabled": true },
                { "name": "Fri", "used": false, "disabled": true },
                { "name": "Sat", "used": false, "disabled": true }
            ]
        });
    });

    it('should add a new device when calling addDevice()', () => {
        fixture.detectChanges();
        testInstance.addDevice();
        expect(testInstance.devicesUsed.length).toBe(1);
        expect(testInstance.addDeviceForm.pristine).toBeTrue();
        expect(testInstance.deviceDays.every(day => day.used === false)).toBeTrue();
    });

    it('should remove a device when calling removeDevice()', () => {
        testInstance.addDevice();
        expect(testInstance.devicesUsed.length).toBe(1);
        testInstance.removeDevice(0);
        expect(testInstance.devicesUsed.length).toBe(0);
        expect(testInstance.addDeviceForm.pristine).toBeTrue();
        expect(testInstance.deviceDays.every(day => day.used === false)).toBeTrue();
    });
});

describe('add-license-consumption - Add support, remove support methods', () => {
    beforeEach(beforeEachFunction);
    beforeEach(() => {
        const addSupportForm = testInstance.addSupportForm;
        addSupportForm.get('product').enable();
        addSupportForm.get('vendor').setValue("3CX");
        addSupportForm.get('product').setValue({
            "id": "ef7a4bcd-fc3f-4f87-bf87-ae934799690b",
            "vendor": "3CX",
            "product": "3CX - v.18.0.1880 (week - 2)",
            "days": [
                { "name": "Sun", "used": false, "disabled": true },
                { "name": "Mon", "used": false, "disabled": true },
                { "name": "Tue", "used": false, "disabled": true },
                { "name": "Wed", "used": false, "disabled": true },
                { "name": "Thu", "used": false, "disabled": true },
                { "name": "Fri", "used": false, "disabled": true },
                { "name": "Sat", "used": false, "disabled": true }
            ]
        });
    });
    it('should add a new support when calling addSupport()', () => {
        testInstance.addSupport();
        expect(testInstance.supportUsed.length).toBe(1);
        expect(testInstance.addSupportForm.pristine).toBeTrue();
        expect(testInstance.supportDays.every(day => day.used === false)).toBeTrue();
    });

    it('should remove a support when calling removeSupport()', () => {
        testInstance.addSupport();
        testInstance.removeSupport(0);
        expect(testInstance.supportUsed.length).toBe(0);
        expect(testInstance.addSupportForm.pristine).toBeTrue();
        expect(testInstance.supportDays.every(day => day.used === false)).toBeTrue();
    });
});

describe('add-license-consumption - On event methods', () => {
    beforeEach(beforeEachFunction);

    it('should filter projects on input change', async () => {
        const inputElement = fixture.nativeElement.querySelector('#project-auto-complete');
        inputElement.dispatchEvent(new Event('focusin'));
        testInstance.addLicenseConsumptionForm.get('project').setValue('Test1');
        fixture.detectChanges();
        await fixture.whenStable();
        const options = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(options.length).toBe(2);
        expect(options[0].nativeElement.textContent).toBe(' Project-Test1 ');
    });

    it('should filter devices on vendor change', () => {
        testInstance.onChangeVendor('3CX');
        expect(testInstance.models.length).toBe(1);
        expect(testInstance.addDeviceForm.value.product).toBe('');
        expect(testInstance.addDeviceForm.controls.product.enabled).toBeTrue()
    });

    it('should filter support devices on vendor change', () => {
        testInstance.onChangeSupportVendor('HylaFAX');
        expect(testInstance.supportModels.length).toBe(1);
        expect(testInstance.addSupportForm.value.product).toBe('');
        expect(testInstance.addSupportForm.controls.product.enabled).toBeTrue()
    });

    it('should open AddProjectComponent on click add new project', () => {
        spyOn(testInstance, 'fetchProjects').and.callThrough();
        spyOn(testInstance.updateProjects, 'emit').and.callThrough();

        testInstance.onAddProject();
        expect(testInstance.fetchProjects).toHaveBeenCalledTimes(1);
        expect(testInstance.updateProjects.emit).toHaveBeenCalledTimes(1);
    });

    it('should filter devices on form change', async () => {
        testInstance.onChangeVendor('Alcatel Lucent');
        fixture.detectChanges();
        const inputElement = fixture.nativeElement.querySelector('#device-auto-complete');
        inputElement.dispatchEvent(new Event('focusin'));
        testInstance.addDeviceForm.get('product').setValue('OXO');
        fixture.detectChanges();
        await fixture.whenStable();
        const options = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(options.length).toBe(1);
    });

    it('should filter devices on form change and display only product name when version is null', async () => {
        testInstance.onChangeVendor('Test');
        fixture.detectChanges();
        const inputElement = fixture.nativeElement.querySelector('#device-auto-complete');
        inputElement.dispatchEvent(new Event('focusin'));
        testInstance.addDeviceForm.get('product').setValue('Test');
        fixture.detectChanges();
        await fixture.whenStable();
        const options = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(options.length).toBe(1);
        expect(options[0].nativeElement.textContent).toBe(' Test (week - 2) ');
    });

    it('should filter support on form change', async () => {
        testInstance.onChangeSupportVendor('HylaFAX');
        fixture.detectChanges();
        const inputElement = fixture.nativeElement.querySelector('#support-device-auto-complete');
        inputElement.dispatchEvent(new Event('focusin'));
        testInstance.addSupportForm.get('product').setValue('Enterprise');
        fixture.detectChanges();
        await fixture.whenStable();
        const options = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(options.length).toBe(1);
    });

    it('should filter support on form change and display only product name when version is null', async () => {
        testInstance.onChangeSupportVendor('TestSupport');
        fixture.detectChanges();
        const inputElement = fixture.nativeElement.querySelector('#support-device-auto-complete');
        inputElement.dispatchEvent(new Event('focusin'));
        testInstance.addSupportForm.get('product').setValue('Test');
        fixture.detectChanges();
        await fixture.whenStable();
        const options = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(options.length).toBe(1);
        expect(options[0].nativeElement.textContent).toBe(' Test - v.2.1 (week - 2) ');
    });
});

describe('add-license-consumption - Day toggles', () => {
    beforeEach(beforeEachFunction);
    beforeEach(() => {
        testInstance.deviceDays = [
            { "name": "Sun", "used": true, "disabled": true },
            { "name": "Mon", "used": true, "disabled": true },
            { "name": "Tue", "used": true, "disabled": true },
            { "name": "Wed", "used": true, "disabled": true },
            { "name": "Thu", "used": true, "disabled": true },
            { "name": "Fri", "used": true, "disabled": true },
            { "name": "Sat", "used": true, "disabled": true }
        ];
        testInstance.devicesUsed.push({ days: [ ...testInstance.deviceDays ] });
        testInstance.supportUsed.push({ days: [ ...testInstance.deviceDays ] });
    });

    it('should toggle days according to the week selected', () => {
        testInstance.addLicenseConsumptionForm.get('startWeek').setValue(moment('16-08-2022', 'DDMMYYYY'));
        testInstance.addLicenseConsumptionForm.get('endWeek').setValue(moment('20-08-2022', 'DDMMYYYY'));
        testInstance.pickStartWeek();

        expect(testInstance.deviceDays[0].used).toBeFalse();
        expect(testInstance.deviceDays[1].used).toBeFalse();
        expect(testInstance.deviceDays[2].used).toBeTrue();
        expect(testInstance.deviceDays[3].used).toBeTrue();
        expect(testInstance.deviceDays[4].used).toBeTrue();
        expect(testInstance.deviceDays[5].used).toBeTrue();
        expect(testInstance.deviceDays[6].used).toBeTrue();

        expect(testInstance.devicesUsed[0].days[0].used).toBeFalse();
        expect(testInstance.devicesUsed[0].days[1].used).toBeFalse();
        expect(testInstance.devicesUsed[0].days[2].used).toBeTrue();
        expect(testInstance.devicesUsed[0].days[3].used).toBeTrue();
        expect(testInstance.devicesUsed[0].days[4].used).toBeTrue();
        expect(testInstance.devicesUsed[0].days[5].used).toBeTrue();
        expect(testInstance.devicesUsed[0].days[6].used).toBeTrue();

    });

    it('should toggle days according to the week selected 2', () => {
        testInstance.addLicenseConsumptionForm.get('startWeek').setValue(moment('14-08-2022', 'DDMMYYYY'));
        testInstance.addLicenseConsumptionForm.get('endWeek').setValue(moment('20-08-2022', 'DDMMYYYY'));
        testInstance.pickStartWeek();
        expect(testInstance.deviceDays.every(day => day.used === true)).toBeTrue();
        expect(testInstance.devicesUsed[0].days.every(day => day.used === true)).toBeTrue();
    });

    it('toggle the days of already added devices', () => {
        testInstance.setChecked(false, 0, null);
        expect(testInstance.deviceDays[0].used).toBeFalse();
    });

    it('toggle the days of already added devices', () => {
        testInstance.setSupportDay(false, 0, null);
        expect(testInstance.supportDays[0].used).toBeFalse();
    });

    it('toggle the days of already added devices', () => {
        testInstance.setChecked(false, 0, 0);
        expect(testInstance.devicesUsed[0].days[0].used).toBeFalse();
    });

    it('toggle the days of already added support', () => {
        testInstance.setSupportDay(false, 0, 0);
        expect(testInstance.supportUsed[0].days[0].used).toBeFalse();
    });
});

describe('add-license-consumption - Cloning consumptions', () => {
    beforeEach(() => {
        TestBed.configureTestingModule(configBuilder.getConfig());
        TestBed.overrideProvider(MAT_DIALOG_DATA, {
            useValue: {
                selectedConsumptions:[
                    {
                        "consumptionDate": "2023-04-09",
                        "usageDays": "...",
                        "comment": "",
                        "consumption": "2023-04-09 - Week 15",
                        "id": "ee3ade60-128b-4eb9-9047-494cf764ed66",
                        "tokensConsumed": 0,
                        "projectName": "Project 1",
                        "projectId": "be612704-c26e-48ea-ab9b-19312f03d644",
                        "device": {
                            "supportType": true,
                            "product": "Genesys Pure Cloud",
                            "vendor": "Genesys",
                            "granularity": "static",
                            "id": "422c2998-4553-4d5c-81f3-6e29b66c8788",
                            "type": "CC",
                            "version": "1.0.0.10206"
                        },
                        "usageType": "Configuration",
                        "deviceInfo": "CC: Genesys - Genesys Pure Cloud 1.0.0.10206",
                        "callingPlatformInfo": ""
                    },
                    {
                        "consumptionDate": "2023-04-09",
                        "usageDays": [
                            "Mon",
                            "Tue"
                        ],
                        "comment": "",
                        "consumption": "2023-04-09 - Week 15",
                        "id": "eae05239-bf05-4301-a377-88dbf3aff613",
                        "tokensConsumed": 2,
                        "projectName": "Project 1",
                        "projectId": "be612704-c26e-48ea-ab9b-19312f03d644",
                        "device": {
                            "supportType": false,
                            "product": "3CX",
                            "vendor": "3CX",
                            "granularity": "week",
                            "id": "ef7a4bcd-fc3f-4f87-bf87-ae934799690b",
                            "type": "PBX",
                            "version": "18.0.1880"
                        },
                        "usageType": "Configuration",
                        "deviceInfo": "PBX: 3CX - 3CX 18.0.1880",
                        "callingPlatformInfo": ""
                    }
                ]
            }
        });
        fixture = TestBed.createComponent(AddLicenseConsumptionComponent);
        testInstance = fixture.componentInstance;
    });

    it('should load consumptions to clone and show them in the ui', () => {
        fixture = TestBed.createComponent(AddLicenseConsumptionComponent);
        testInstance = fixture.componentInstance;
        fixture.detectChanges();
        const vendorLabels = fixture.debugElement.queryAll(By.css("label.subtitle"));
        expect(testInstance.devicesUsed.length).toBe(1);
        expect(testInstance.supportUsed.length).toBe(1);
        expect(vendorLabels.length).toBe(4);
        expect(vendorLabels[0].nativeElement.textContent).toBe('Vendor:');
        expect(vendorLabels[2].nativeElement.textContent).toBe('Vendor:');
        expect(vendorLabels[1].nativeElement.textContent).toBe('Device:');
        expect(vendorLabels[3].nativeElement.textContent).toBe('Device:');

    });
});

describe('add-license-consumption - devicesAndSupportInvalid', () => {
    beforeEach(beforeEachFunction);

    it('should enable the submit button on valid device form', () => {
        fixture.detectChanges();
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDeviceForm = testInstance.addDeviceForm;
        const addSupportForm = testInstance.addSupportForm;
        addLicenseConsumptionForm.setValue({
            startWeek: moment('16-08-2022', 'DDMMYYYY'),
            endWeek: moment('20-08-2022', 'DDMMYYYY'),
            project: { test: 'test' },
        });
        addDeviceForm.setValue({
            vendor: 'test',
            product: { test: 'test' }
        });
        addSupportForm.setValue({
            vendor: '',
            product: ''
        });

        expect(testInstance.devicesAndSupportInvalid()).toBeFalse();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeTrue()
    });

    it('should enable the submit button on valid support device form', () => {
        fixture.detectChanges();
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDeviceForm = testInstance.addDeviceForm;
        const addSupportForm = testInstance.addSupportForm;
        addLicenseConsumptionForm.setValue({
            startWeek: moment('16-08-2022', 'DDMMYYYY'),
            endWeek: moment('20-08-2022', 'DDMMYYYY'),
            project: { test: 'test' },
        });
        addSupportForm.setValue({
            vendor: 'test',
            product: { test: 'test' }
        });
        addDeviceForm.setValue({
            vendor: '',
            product: ''
        });

        expect(testInstance.devicesAndSupportInvalid()).toBeFalse();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeTrue()
    });

    it('should enable the submit button on not empty deviceUsed', () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        addLicenseConsumptionForm.setValue({
            startWeek: moment('16-08-2022', 'DDMMYYYY'),
            endWeek: moment('20-08-2022', 'DDMMYYYY'),
            project: { test: 'test' },
        });
        testInstance.devicesUsed.push({test: 'test'});
        fixture.detectChanges();
        expect(testInstance.devicesAndSupportInvalid()).toBeFalse();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeFalse()
    });

    it('should disable the submit button on empty form', () => {
        fixture.detectChanges();
        expect(testInstance.devicesAndSupportInvalid()).toBeTrue();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeTrue()
    });
});

