import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { Device } from "src/app/model/device.model";
import { DevicesService } from "src/app/services/devices.service";
import { DialogService } from "src/app/services/dialog.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { DevicesServiceMock } from 'src/test/mock/services/devices-service.mock';
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SharedModule } from "../../shared/shared.module";
import { ModifyDeviceComponent } from "./modify-device.component";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { of } from "rxjs";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';
import { AddDeviceComponent } from '../add-device/add-device.component';

let modifyDeviceComponentTestInstance: ModifyDeviceComponent;
let fixture: ComponentFixture<ModifyDeviceComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const RouterMock = {
    navigate: (commands: string[]) => { }
};

const currentDevice: Device = {
    id: "001ee852-4ab5-4642-85e1-58f5a477fbb3",
    vendor: "HylaFAX",
    product: "HylaFAX Enterprise",
    version: "6.2",
    type: "PBX",
    granularity: "static",
    tokensToConsume: 0,
    deprecatedDate: "",
    startDate: new Date(),
    subaccountId: "",
    supportType: true
}

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(ModifyDeviceComponent);
    configBuilder.addProvider({provide: MAT_DIALOG_DATA, useValue: currentDevice});
    configBuilder.addProvider({provide: DialogService, useValue: dialogService});
    configBuilder.addProvider({provide: ModifyDeviceComponent, useValue: {}});
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(ModifyDeviceComponent);
    modifyDeviceComponentTestInstance = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
};

describe('ModifyDeviceComponent - UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('ModifyDeviceComponent - should display the essential UI and components', () => {

        fixture.detectChanges();
        const h1: HTMLElement = fixture.nativeElement.querySelector('#dialog-title');
        const startDate: HTMLElement = fixture.nativeElement.querySelector("#start-date-label");
        const deprecatedDate: HTMLElement = fixture.nativeElement.querySelector("#deprecated-date-label");
        const deviceType: HTMLElement = fixture.nativeElement.querySelector("#device-type-label");
        const deviceVendor: HTMLElement = fixture.nativeElement.querySelector("#device-vendor-label");
        const deviceName: HTMLElement = fixture.nativeElement.querySelector("#device-name-label");
        const deviceVersion: HTMLElement = fixture.nativeElement.querySelector("#device-version-label");
        const granularity: HTMLElement = fixture.nativeElement.querySelector('#granularity-label');
        const tokensConsumption: HTMLElement = fixture.nativeElement.querySelector('#tokens-consumption-label');

        expect(h1.textContent).toBe('Modify Device');
        expect(startDate.textContent).toBe("Start Date");
        expect(deprecatedDate.textContent).toBe("Deprecated Date");
        expect(deviceType.textContent).toBe("Device Type");
        expect(deviceVendor.textContent).toBe("Vendor");
        expect(deviceName.textContent).toBe("Name");
        expect(deviceVersion.textContent).toBe("Version");
        expect(granularity.textContent).toBe("Granularity");
        expect(tokensConsumption.textContent).toBe("Tokens to Consume");
    });

    it('should enable the submit button', () => {
        fixture.detectChanges();
        const submitButton = fixture.nativeElement.querySelector('#submit-button');
        spyOn(modifyDeviceComponentTestInstance, 'disableSubmitBtn').and.callThrough();
        modifyDeviceComponentTestInstance.disableSubmitBtn();
        expect(submitButton.disabled).toBeFalse();
    });
});

describe('modify device details interactions', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to modifyDevice', () => {
        fixture.detectChanges();
        spyOn(modifyDeviceComponentTestInstance, 'modifyDevice').and.callThrough();
        spyOn(DevicesServiceMock, 'updateDevice').and.callThrough();

        modifyDeviceComponentTestInstance.modifyDeviceForm.get('id').setValue('001ee852-4ab5-4642-85e1-58f5a477fbb3');
        modifyDeviceComponentTestInstance.modifyDeviceForm.get('startDate').setValue(new Date());
        modifyDeviceComponentTestInstance.modifyDeviceForm.get('deprecatedDate').setValue('');
        modifyDeviceComponentTestInstance.modifyDeviceForm.get('type').setValue('PBX');
        modifyDeviceComponentTestInstance.modifyDeviceForm.get('vendor').setValue('HylaFAX');
        modifyDeviceComponentTestInstance.modifyDeviceForm.get('product').setValue('HylaFAX Enterprise Updated');
        modifyDeviceComponentTestInstance.modifyDeviceForm.get('version').setValue('6.2');
        modifyDeviceComponentTestInstance.modifyDeviceForm.get('granularity').setValue('static');
        modifyDeviceComponentTestInstance.modifyDeviceForm.get('tokensToConsume').setValue('2');
        modifyDeviceComponentTestInstance.modifyDeviceForm.get('supportType').setValue(true);
        fixture.detectChanges();
        modifyDeviceComponentTestInstance.modifyDevice();

        expect(DevicesServiceMock.updateDevice).toHaveBeenCalled();
    });

    it('should cancel modifyDevice', () => {
        spyOn(modifyDeviceComponentTestInstance, 'modifyDevice').and.callThrough();
        spyOn(modifyDeviceComponentTestInstance, 'onCancel').and.callThrough();
        spyOn(MatDialogMock, 'close').and.callThrough();

        modifyDeviceComponentTestInstance.modifyDevice();
        modifyDeviceComponentTestInstance.onCancel();

        expect(MatDialogMock.close).toHaveBeenCalled();
        expect(modifyDeviceComponentTestInstance.onCancel).toHaveBeenCalled();
    });
});

describe('display of messages', () => {
    beforeEach(beforeEachFunction);
    it('should display a message if an error ocurred in modifyDevices', () => {
        const response = { error: "some error" };
        spyOn(DevicesServiceMock, 'updateDevice').and.returnValue(of(response));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        modifyDeviceComponentTestInstance.modifyDevice();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.error, 'Error updating Device!');
    });
});

describe('modify device FormGroup verifications', () => {
    beforeEach(beforeEachFunction);
    it('should create formGroup with necessary controls', () => {
        fixture.detectChanges();

        expect(modifyDeviceComponentTestInstance.modifyDeviceForm.get('id')).toBeTruthy();
        expect(modifyDeviceComponentTestInstance.modifyDeviceForm.get('startDate')).toBeTruthy();
        expect(modifyDeviceComponentTestInstance.modifyDeviceForm.get('type')).toBeTruthy();
        expect(modifyDeviceComponentTestInstance.modifyDeviceForm.get('vendor')).toBeTruthy();
        expect(modifyDeviceComponentTestInstance.modifyDeviceForm.get('product')).toBeTruthy();
        expect(modifyDeviceComponentTestInstance.modifyDeviceForm.get('version')).toBeTruthy();
        expect(modifyDeviceComponentTestInstance.modifyDeviceForm.get('granularity')).toBeTruthy();
        expect(modifyDeviceComponentTestInstance.modifyDeviceForm.get('tokensToConsume')).toBeTruthy();


    });

    it('should make all the controls required', () => {
        const modifyDevice = modifyDeviceComponentTestInstance.modifyDeviceForm;
        modifyDevice.setValue({
            id: "",
            vendor: "",
            product: "",
            version: "",
            type: "",
            granularity: "",
            tokensToConsume: 0,
            deprecatedDate: "",
            startDate: "",
            supportType: true
        });
        expect(modifyDevice.get('id').valid).toBeFalse();
        expect(modifyDevice.get('vendor').valid).toBeFalse();
        expect(modifyDevice.get('product').valid).toBeFalse();
        expect(modifyDevice.get('version').valid).toBeFalse();
        expect(modifyDevice.get('type').valid).toBeFalse();
        expect(modifyDevice.get('granularity').valid).toBeFalse();
        expect(modifyDevice.get('tokensToConsume').valid).toBeTrue();
        expect(modifyDevice.get('deprecatedDate').valid).toBeTrue();
        expect(modifyDevice.get('startDate').valid).toBeFalse();
        expect(modifyDevice.get('supportType').valid).toBeTrue();
    });

    it('should enable the submit button', () => {
        const modifyDevice = modifyDeviceComponentTestInstance.modifyDeviceForm;
        modifyDevice.setValue({
            id: "001ee852-4ab5-4642-85e1-58f5a477fbb3",
            vendor: "HylaFAX",
            product: "HylaFAX Enterprise",
            version: "6.2",
            type: "PBX",
            granularity: "static",
            tokensToConsume: 0,
            deprecatedDate: "",
            startDate: new Date(),
            supportType: true
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeFalse();
    });
});
