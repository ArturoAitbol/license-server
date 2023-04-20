import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SnackBarServiceMock } from "../../../../../test/mock/services/snack-bar-service.mock";
import { DialogService } from "../../../../services/dialog.service";
import { AddOtherConsumptionComponent } from "./add-other-consumption.component";
import { ConsumptionServiceMock } from "../../../../../test/mock/services/license-consumption-service.mock";
import { ProjectServiceMock } from "../../../../../test/mock/services/project-service.mock";
import { By } from "@angular/platform-browser";
import moment from "moment";
import { of, throwError } from "rxjs";
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';
import { DialogServiceMock } from '../../../../../test/mock/services/dialog-service.mock';

let testInstance: AddOtherConsumptionComponent;
let fixture: ComponentFixture<AddOtherConsumptionComponent>;

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddOtherConsumptionComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: new DialogServiceMock() });
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: {} });
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(AddOtherConsumptionComponent);
    testInstance = fixture.componentInstance;
    fixture.detectChanges();
};

describe('add-other-consumption - UI verification tests', () => {
    beforeEach(beforeEachFunction);
    it('should display UI elements correctly', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const cancelButton = fixture.nativeElement.querySelector('#cancel-button');
        const submitButton = fixture.nativeElement.querySelector('#submit-button');
        const newProjectButton = fixture.nativeElement.querySelector('#add-new-project-button');
        const addDeviceButton = fixture.nativeElement.querySelector('#add-device-button');
        const h2 = fixture.debugElement.queryAll(By.css("h2"));
        expect(h1.textContent).toBe('Add Other Consumption');
        expect(cancelButton.textContent).toBe('Cancel');
        expect(submitButton.disabled).toBeTrue();
        expect(submitButton.textContent).toBe('Submit');
        expect(newProjectButton.title).toBe('New Project');
        expect(h2.length).toBeGreaterThanOrEqual(1);
        expect(h2[0].nativeElement.textContent).toBe('Devices Used');
        expect(addDeviceButton.disabled).toBeTrue();
        expect(addDeviceButton.title).toBe('New Device');
    });

    it('should display correctly the object selected in the mat-autocompletes', async () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDeviceForm = testInstance.addDeviceForm;
        const projectInput = fixture.nativeElement.querySelector('#project-auto-complete');
        const vendorInput = fixture.nativeElement.querySelector('#vendor-auto-complete');
        const deviceInput = fixture.nativeElement.querySelector('#device-auto-complete');

        projectInput.dispatchEvent(new Event('focus'));
        projectInput.dispatchEvent(new Event('input'));
        vendorInput.dispatchEvent(new Event('focus'));
        vendorInput.dispatchEvent(new Event('input'));
        deviceInput.dispatchEvent(new Event('focus'));
        deviceInput.dispatchEvent(new Event('input'));
        addLicenseConsumptionForm.get('project').setValue({projectName: 'TestProject'});
        addDeviceForm.get('deviceType').setValue("CERT");
        addDeviceForm.get('vendor').setValue('TestVendor');
        addDeviceForm.get('product').setValue({product: 'TestProduct'});

        fixture.detectChanges();

        await fixture.whenStable();

        expect(projectInput.value).toBe('TestProject');
        expect(vendorInput.value).toBe('TestVendor');
        expect(deviceInput.value).toBe('TestProduct');

    });
});

describe('add-other-consumption - FormGroup verification tests', () => {

    beforeEach(beforeEachFunction);

    it('should create a formGroup with the necessary controls', () => {
        fixture.detectChanges();
        expect(testInstance.addLicenseConsumptionForm.get('startWeek')).toBeTruthy();
        expect(testInstance.addLicenseConsumptionForm.get('endWeek')).toBeTruthy();
        expect(testInstance.addLicenseConsumptionForm.get('project')).toBeTruthy();
        expect(testInstance.addDeviceForm.get('deviceType')).toBeTruthy();
        expect(testInstance.addDeviceForm.get('vendor')).toBeTruthy();
        expect(testInstance.addDeviceForm.get('product')).toBeTruthy();
        expect(testInstance.addDeviceForm.get('comment')).toBeTruthy();
    });

    it('should make all the controls required', () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDeviceForm = testInstance.addDeviceForm;
        addLicenseConsumptionForm.setValue({
            startWeek: '',
            endWeek: '',
            project: '',
        });
        addDeviceForm.setValue({
            deviceType: '',
            vendor: '',
            product: '',
            comment:''
        });

        expect(addLicenseConsumptionForm.get('startWeek').valid).toBeFalse();
        expect(addLicenseConsumptionForm.get('endWeek').valid).toBeFalse();
        expect(addLicenseConsumptionForm.get('project').valid).toBeFalse();
        expect(addDeviceForm.get('deviceType').valid).toBeFalse();
        expect(addDeviceForm.get('vendor').valid).toBeFalse();
        expect(addDeviceForm.get('product').valid).toBeFalse();
        expect(addDeviceForm.get('comment').valid).toBeTrue();
    });

    it('should validate autocomplete forms are not of type string', () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDeviceForm = testInstance.addDeviceForm;

        addLicenseConsumptionForm.get('project').setValue('test');
        addDeviceForm.get('deviceType').setValue("CERT");
        addDeviceForm.get('vendor').setValue('CERT');
        addDeviceForm.get('product').enable();
        addDeviceForm.get('product').setValue('CERT');
        addDeviceForm.get('comment').setValue('Comment A');
        fixture.detectChanges();
        expect(addLicenseConsumptionForm.valid).toBeFalse();
        expect(addDeviceForm.valid).toBeFalse();

        addLicenseConsumptionForm.get('startWeek').setValue(new Date());
        addLicenseConsumptionForm.get('endWeek').setValue(new Date());
        addLicenseConsumptionForm.get('project').setValue({ test: "test" });
        addDeviceForm.get('deviceType').setValue("CERT");
        addDeviceForm.get('vendor').setValue("CERT");
        addDeviceForm.get('product').setValue({ test: "CERT" });
        addDeviceForm.get('comment').setValue('Comment A');
        expect(addLicenseConsumptionForm.valid).toBeTrue();
        expect(addDeviceForm.valid).toBeTrue();
    });
});

describe('add-other-consumption - Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);

    it('should make a call to get project list', () => {
        spyOn(ProjectServiceMock, 'getProjectDetailsByLicense').and.callThrough();
        testInstance.ngOnInit();
        expect(ProjectServiceMock.getProjectDetailsByLicense).toHaveBeenCalled();
    });

});

describe('add-other-consumption - Dialog calls and interactions', () => {
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
        testInstance.devicesUsed.push({ test: "CERT", days: [] });

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
        testInstance.devicesUsed.push({ test: "CERT", days: [] });

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
        testInstance.devicesUsed.push({ test: "CERT", days: deviceDays });

        fixture.detectChanges();
        testInstance.submit();

        expect(ConsumptionServiceMock.addLicenseConsumptionDetails).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Some error', 'Error adding license consumption!');

    });
});

describe('add-other-consumption - Add device, remove device methods', () => {
    beforeEach(beforeEachFunction);
    beforeEach(() => {
        const addDeviceForm = testInstance.addDeviceForm;
        addDeviceForm.get('product').enable();
        addDeviceForm.get('deviceType').setValue("CERT");
        addDeviceForm.get('vendor').setValue("3CX");
        addDeviceForm.get('comment').setValue('Comment A');
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

describe('add-other-consumption - On event methods', () => {
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
        testInstance.onChangeVendor('CERT');
        fixture.detectChanges();
        const inputElement = fixture.nativeElement.querySelector('#device-auto-complete');
        inputElement.dispatchEvent(new Event('focusin'));
        testInstance.addDeviceForm.get('product').setValue('CERT');
        fixture.detectChanges();
        await fixture.whenStable();
        const options = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(options.length).toBeGreaterThan(0);
    });
});

describe('add-other-consumption - Day toggles', () => {
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
        testInstance.setChecked(false, 0, 0);
        expect(testInstance.devicesUsed[0].days[0].used).toBeFalse();
    });
});

describe('add-other-consumption - deviceInvalid', () => {
    beforeEach(beforeEachFunction);

    it('should enable the submit button on valid device form', () => {
        fixture.detectChanges();
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        const addDeviceForm = testInstance.addDeviceForm;
        addLicenseConsumptionForm.setValue({
            startWeek: moment('16-08-2022', 'DDMMYYYY'),
            endWeek: moment('20-08-2022', 'DDMMYYYY'),
            project: { test: 'test' },
        });
        addDeviceForm.setValue({
            deviceType: 'CERT',
            vendor: 'CERT',
            product: { test: 'CERT' },
            comment:'Comment A'
        });

        expect(testInstance.deviceInvalid()).toBeFalse();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeTrue()
    });

    it('should enable the submit button on not empty deviceUsed', () => {
        const addLicenseConsumptionForm = testInstance.addLicenseConsumptionForm;
        addLicenseConsumptionForm.setValue({
            startWeek: moment('16-08-2022', 'DDMMYYYY'),
            endWeek: moment('20-08-2022', 'DDMMYYYY'),
            project: { test: 'CERT' },
        });
        testInstance.devicesUsed.push({test: 'CERT'});
        fixture.detectChanges();
        expect(testInstance.deviceInvalid()).toBeFalse();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeFalse()
    });

    it('should disable the submit button on empty form', () => {
        fixture.detectChanges();
        expect(testInstance.deviceInvalid()).toBeTrue();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeTrue()
    });
});

