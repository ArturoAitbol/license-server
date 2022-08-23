import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SharedModule } from "../../../shared/shared.module";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatDialogMock } from "../../../../../test/mock/components/mat-dialog.mock";
import { SnackBarService } from "../../../../services/snack-bar.service";
import { SnackBarServiceMock } from "../../../../../test/mock/services/snack-bar-service.mock";
import { CustomerService } from "../../../../services/customer.service";
import { CustomerServiceMock } from "../../../../../test/mock/services/customer-service.mock";
import { DialogService } from "../../../../services/dialog.service";
import { MsalService } from "@azure/msal-angular";
import { MsalServiceMock } from "../../../../../test/mock/services/msal-service.mock";
import { HttpClient } from "@angular/common/http";
import { AddLicenseConsumptionComponent } from "./add-license-consumption.component";
import { LicenseConsumptionService } from "../../../../services/license-consumption.service";
import { ConsumptionServiceMock } from "../../../../../test/mock/services/license-consumption-service.mock";
import { ProjectService } from "../../../../services/project.service";
import { ProjectServiceMock } from "../../../../../test/mock/services/project-service.mock";
import { By } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DevicesService } from "../../../../services/devices.service";
import { DevicesServiceMock } from "../../../../../test/mock/services/devices-service.mock";
import moment from "moment";
import { of, throwError } from "rxjs";

let testInstance: AddLicenseConsumptionComponent;
let fixture: ComponentFixture<AddLicenseConsumptionComponent>;

const MatDialogRefMock = {
    close: () => {
        return null
    }
};

const defaultTestBedConfig = {
    declarations: [ AddLicenseConsumptionComponent ],
    imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule ],
    providers: [
        {
            provide: MatDialog,
            useValue: MatDialogMock
        },
        {
            provide: CustomerService,
            useValue: CustomerServiceMock
        },
        {
            provide: DevicesService,
            useValue: DevicesServiceMock
        },
        {
            provide: ProjectService,
            useValue: ProjectServiceMock
        },
        {
            provide: LicenseConsumptionService,
            useValue: ConsumptionServiceMock
        },
        {
            provide: SnackBarService,
            useValue: SnackBarServiceMock
        },
        {
            provide: DialogService,
            useValue: () => {
                return {};
            }
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
            provide: MatDialogRef,
            useValue: MatDialogRefMock
        },
        {
            provide: MAT_DIALOG_DATA,
            useValue: {}
        }
    ]
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule(defaultTestBedConfig);
    fixture = TestBed.createComponent(AddLicenseConsumptionComponent);
    testInstance = fixture.componentInstance;
    spyOn(console, 'log').and.callThrough();
    fixture.detectChanges();
};

describe('add-license-consumption - UI verification tests', () => {
    beforeEach(beforeEachFunction);
    it('should display UI elements correctly', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const cancelButton = fixture.nativeElement.querySelector('#cancel-button');
        const submitButton = fixture.nativeElement.querySelector('#submit-button');
        const newProjectButton = fixture.nativeElement.querySelector('#new-project-button');
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
        addDeviceForm.get('vendor').setValue({vendor: 'TestVendor'});
        addDeviceForm.get('product').setValue({product: 'TestProduct'});
        addSupportForm.get('vendor').setValue({vendor: 'TestVendor'});
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
        addDeviceForm.get('product').setValue('test');
        addSupportForm.get('vendor').setValue('test');
        addSupportForm.get('product').setValue('test');
        expect(addLicenseConsumptionForm.valid).toBeFalse();
        expect(addDeviceForm.valid).toBeFalse();
        expect(addSupportForm.valid).toBeFalse();

        addLicenseConsumptionForm.get('startWeek').setValue(new Date());
        addLicenseConsumptionForm.get('endWeek').setValue(new Date());
        addLicenseConsumptionForm.get('project').setValue({ test: "test" });
        addDeviceForm.get('vendor').setValue({ test: "test" });
        addDeviceForm.get('product').setValue({ test: "test" });
        addSupportForm.get('vendor').setValue({ test: "test" });
        addSupportForm.get('product').setValue({ test: "test" });
        expect(addLicenseConsumptionForm.valid).toBeTrue();
        expect(addDeviceForm.valid).toBeTrue();
        expect(addSupportForm.valid).toBeTrue();
    });
});

describe('add-license-consumption - Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);

    it('should make a call to get device list and project list', () => {
        spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();
        spyOn(ProjectServiceMock, 'getProjectDetailsBySubAccount').and.callThrough();
        testInstance.ngOnInit();
        expect(DevicesServiceMock.getDevicesList).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsBySubAccount).toHaveBeenCalled();
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
        addDeviceForm.get('vendor').setValue({
            "supportType": false,
            "product": "3CX",
            "vendor": "3CX",
            "granularity": "week",
            "id": "ef7a4bcd-fc3f-4f87-bf87-ae934799690b",
            "version": "18.0.1880",
            "tokensToConsume": 2
        });
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
        addSupportForm.get('vendor').setValue({
            "supportType": false,
            "product": "3CX",
            "vendor": "3CX",
            "granularity": "week",
            "id": "ef7a4bcd-fc3f-4f87-bf87-ae934799690b",
            "version": "18.0.1880",
            "tokensToConsume": 2
        });
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
        expect(options.length).toBe(1);
        expect(options[0].nativeElement.textContent).toBe(' Project-Test1 ');
    });

    it('should filter devices on vendor change', () => {
        testInstance.onChangeVendor({ vendor: '3CX' });
        expect(testInstance.models.length).toBe(1);
        expect(testInstance.addDeviceForm.value.product).toBe('');
        expect(testInstance.addDeviceForm.controls.product.enabled).toBeTrue()
    });

    it('should filter support devices on vendor change', () => {
        testInstance.onChangeSupportVendor({ vendor: 'HylaFAX' });
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
        testInstance.onChangeVendor({ vendor: 'Alcatel Lucent' });
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
        testInstance.onChangeVendor({ vendor: 'Test' });
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
        testInstance.onChangeSupportVendor({ vendor: 'HylaFAX' });
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
        testInstance.onChangeSupportVendor({ vendor: 'TestSupport' });
        fixture.detectChanges();
        const inputElement = fixture.nativeElement.querySelector('#support-device-auto-complete');
        inputElement.dispatchEvent(new Event('focusin'));
        testInstance.addSupportForm.get('product').setValue('Test');
        fixture.detectChanges();
        await fixture.whenStable();
        const options = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(options.length).toBe(1);
        expect(options[0].nativeElement.textContent).toBe(' Test (week - 2) ');
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
        TestBed.configureTestingModule(defaultTestBedConfig);
        TestBed.overrideProvider(MAT_DIALOG_DATA, {
            useValue: {
                selectedConsumptions: [
                    {
                        "consumptionDate": "2022-08-21",
                        "product": "KX-NS700",
                        "usageDays": [
                            "Mon"
                        ],
                        "consumption": "2022-08-21 - Week 34",
                        "deviceId": "755955b7-4100-4328-9f6e-7038b92e4a02",
                        "version": "v007.00138",
                        "vendor": "Panasonic",
                        "granularity": "week",
                        "id": "e7874f3c-2b98-4d87-ba8a-f69216d5b35e",
                        "tokensConsumed": 2,
                        "projectName": "Test",
                        "projectId": "9fd20dca-33f0-4bd2-b484-d81dd6423626",
                        "usageType": "Configuration"
                    },
                    {
                        "consumptionDate": "2022-08-02",
                        "product": "HylaFAX Enterprise",
                        "usageDays": [
                            "Mon",
                            "Wed",
                            "Thu"
                        ],
                        "consumption": "2022-08-02 - Week 31",
                        "deviceId": "001ee852-4ab5-4642-85e1-58f5a477fbb3",
                        "version": "6.2",
                        "vendor": "HylaFAX",
                        "granularity": "static",
                        "id": "fdf1a727-67bd-430b-824d-07d49064d0e9",
                        "tokensConsumed": 0,
                        "projectName": "Test",
                        "projectId": "9fd20dca-33f0-4bd2-b484-d81dd6423626",
                        "usageType": "Configuration"
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
            vendor: { test: 'test' },
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
            vendor: { test: 'test' },
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
        fixture.detectChanges();
        testInstance.devicesUsed.push({test: 'test'});
        expect(testInstance.devicesAndSupportInvalid()).toBeFalse();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeTrue()
    });

    it('should disable the submit button on empty form', () => {
        fixture.detectChanges();
        expect(testInstance.devicesAndSupportInvalid()).toBeTrue();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeTrue()
    });
});

