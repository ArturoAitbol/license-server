import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import moment from 'moment';
import { throwError } from 'rxjs';
import { Device } from 'src/app/model/device.model';
import { DialogService } from 'src/app/services/dialog.service';
import { MatDialogMock } from 'src/test/mock/components/mat-dialog.mock';
import { DevicesServiceMock } from 'src/test/mock/services/devices-service.mock';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { MsalServiceMock } from 'src/test/mock/services/msal-service.mock';
import { AddDeviceComponent } from './add-device/add-device.component';
import { DevicesComponent } from './devices.component';
import { ModifyDeviceComponent } from './modify-device/modify-device.component';
import { TestBedConfigBuilder } from '../../../test/mock/TestBedConfigHelper.mock';

let devicesComponentTestInstance: DevicesComponent;
let fixture: ComponentFixture<DevicesComponent>;

const dialogServiceMock = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(DevicesComponent);
    configBuilder.addProvider({provide: DialogService, useValue: dialogServiceMock});
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(DevicesComponent);
    devicesComponentTestInstance = fixture.componentInstance;
};

describe('DevicesComponent - UI verification tests', () => {
    beforeEach(beforeEachFunction);
    it('DevicesComponent - should display essential UI and components', () => {
        fixture.detectChanges();
        devicesComponentTestInstance.sizeChange();
        const h1: HTMLElement = fixture.nativeElement.querySelector('#page-title');
        const nameFilterLabel = fixture.nativeElement.querySelector('#name-filter-label');
        const typeFilterLabel = fixture.nativeElement.querySelector('#type-filter-label');
        const vendorFilterLabel = fixture.nativeElement.querySelector('#vendor-filter-label');
        const dateFilterLabel = fixture.nativeElement.querySelector('#date-filter-label');

        expect(h1.textContent).toBe('Devices');
        expect(nameFilterLabel.textContent).toBe('Name Filter');
        expect(typeFilterLabel.textContent).toBe('Device Type');
        expect(vendorFilterLabel.textContent).toBe('Device Vendor');
        expect(dateFilterLabel.textContent).toBe('Start Date Range Filter');

    });

    it('should display Add Device button for devices admin', () => {
        spyOn(MsalServiceMock.instance, 'getActiveAccount').and.returnValue(MsalServiceMock.mockIdTokenClaimsDevicesAdminRole);
        fixture.detectChanges();
        devicesComponentTestInstance.sizeChange();
        const addDeviceButton: HTMLElement = fixture.nativeElement.querySelector('#add-device-button');
        expect(addDeviceButton.textContent).toBe('Add Device');

    });

    it('sould load correct data columns for the table', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const headers: HTMLElement[] = fixture.nativeElement.querySelectorAll('.mat-sort-header-content');
        expect(headers[0].innerText).toBe('Start Date');
        expect(headers[1].innerText).toBe('Type');
        expect(headers[2].innerText).toBe('Vendor');
        expect(headers[3].innerText).toBe('Device Name');
    });

    it('should sort the data table',() => {
        fixture.detectChanges();
        devicesComponentTestInstance.devicesBk = DevicesServiceMock.unsortedDeviceList.devices;
        devicesComponentTestInstance.devices = DevicesServiceMock.unsortedDeviceList.devices;
        devicesComponentTestInstance.sortData({active: "vendor", direction:'asc'});
        expect(devicesComponentTestInstance.devicesBk).toEqual(DevicesServiceMock.ascSortedList.devices);
        
        devicesComponentTestInstance.sortData({active: "vendor", direction:'desc'});
        expect(devicesComponentTestInstance.devicesBk).toEqual(DevicesServiceMock.descSortedList.devices);
        
        devicesComponentTestInstance.sortData({active: "tokensToConsume", direction:'asc'});
        expect(devicesComponentTestInstance.devicesBk).toEqual(DevicesServiceMock.tokenAscSortedList.devices);
        
        devicesComponentTestInstance.devicesBk = DevicesServiceMock.unsortedDeviceList.devices;
        devicesComponentTestInstance.devices = DevicesServiceMock.unsortedDeviceList.devices;
        devicesComponentTestInstance.sortData({active: "tokensToConsume", direction:'desc'});
        expect(devicesComponentTestInstance.devicesBk).toEqual(DevicesServiceMock.tokenDescSortedList.devices);
        
        devicesComponentTestInstance.sortData({active: "vendor", direction:""});
        expect(devicesComponentTestInstance.devicesBk).toEqual(DevicesServiceMock.unsortedDeviceList.devices);
    });
});


describe('Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);

    it('should make a call to get selected Customer, devices and actionMenuOptions', () => {
        spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();
        spyOn(MsalServiceMock.instance, 'getActiveAccount').and.callThrough();

        fixture.detectChanges();

        expect(DevicesServiceMock.getDevicesList).toHaveBeenCalled();
        expect(MsalServiceMock.instance.getActiveAccount).toHaveBeenCalled();
        expect(devicesComponentTestInstance.actionMenuOptions).toEqual(['Edit', 'Delete']);
    });

    it('should change the loading-related variables if getdevices() got an error', () => {
        spyOn(DevicesServiceMock, 'getDevicesList').and.returnValue(throwError("error"));

        fixture.detectChanges();

        expect(devicesComponentTestInstance.isLoadingResults).toBeFalse();
        expect(devicesComponentTestInstance.isRequestCompleted).toBeTrue();
    });

    it('should remove the Edit and Delete options if the selected customer is not a Devices admin', () => {
        spyOn(MsalServiceMock.instance, 'getActiveAccount').and.returnValue(MsalServiceMock.mockIdTokenClaimsSubaccountRole);
        fixture.detectChanges();

        expect(devicesComponentTestInstance.actionMenuOptions).not.toContain('Delete');
        expect(devicesComponentTestInstance.actionMenuOptions).not.toContain('Edit');
    });

    it('should display the Edit and Delete options if the selected customer is a Devices admin', () => {
        spyOn(MsalServiceMock.instance, 'getActiveAccount').and.returnValue(MsalServiceMock.mockIdTokenClaimsDevicesAdminRole);
        fixture.detectChanges();

        expect(devicesComponentTestInstance.actionMenuOptions).toContain('Delete');
        expect(devicesComponentTestInstance.actionMenuOptions).toContain('Edit');
    });
});
describe('Dialog calls and interactions', () => {

    beforeEach(beforeEachFunction);

    it('should execute rowAction() with expected data given set arguments', () => {
        spyOn(devicesComponentTestInstance, 'openDialog');
        spyOn(devicesComponentTestInstance, 'onDelete');
        const device: Device = DevicesServiceMock.mockDeviceA;
        const selectedTestData = { selectedRow: device, selectedOption: undefined, selectedIndex: 'selectedTestItem' };


        selectedTestData.selectedOption = devicesComponentTestInstance.MODIFY_DEVICE;
        devicesComponentTestInstance.rowAction(selectedTestData);
        expect(devicesComponentTestInstance.openDialog).toHaveBeenCalledWith(ModifyDeviceComponent, selectedTestData.selectedRow);

        selectedTestData.selectedOption = devicesComponentTestInstance.DELETE_DEVICE;
        devicesComponentTestInstance.rowAction(selectedTestData);
        expect(devicesComponentTestInstance.onDelete).toHaveBeenCalledWith(device);

    });

    it('should openDialog with AddDeviceComponent when calling onNewdevice()', () => {
        spyOn(devicesComponentTestInstance, 'openDialog');
        devicesComponentTestInstance.addDevice();
        expect(devicesComponentTestInstance.openDialog).toHaveBeenCalledWith(AddDeviceComponent);
    });

    it('should openDialog with expected data for given arguments', () => {
        spyOn(MatDialogMock, 'open').and.callThrough();
        spyOn(devicesComponentTestInstance, 'fetchDevices');
        const expectedArgument = { width: 'auto', data: undefined, disableClose: true };

        devicesComponentTestInstance.openDialog(AddDeviceComponent);
        expect(MatDialogMock.open).toHaveBeenCalledWith(AddDeviceComponent, expectedArgument);
        expect(devicesComponentTestInstance.fetchDevices).toHaveBeenCalled();

        const selectedItemTestData = { testProperty: 'testValue' };
        expectedArgument.data = selectedItemTestData;
        devicesComponentTestInstance.openDialog(ModifyDeviceComponent, selectedItemTestData);
        expect(MatDialogMock.open).toHaveBeenCalledWith(ModifyDeviceComponent, expectedArgument);
        expect(devicesComponentTestInstance.fetchDevices).toHaveBeenCalled();
    });

    it('should delete device if the operation is confirmed in confirmDialog after calling onDelete()', () => {
        spyOn(dialogServiceMock, 'confirmDialog').and.callThrough();
        spyOn(DevicesServiceMock, 'deleteDevice').and.callThrough();
        spyOn(devicesComponentTestInstance, 'fetchDevices');
        const device: Device = DevicesServiceMock.mockDeviceA;

        dialogServiceMock.setExpectedConfirmDialogValue(true);
        devicesComponentTestInstance.onDelete(device);

        expect(dialogServiceMock.confirmDialog).toHaveBeenCalled();
        expect(DevicesServiceMock.deleteDevice).toHaveBeenCalledWith(device.id);
        expect(devicesComponentTestInstance.fetchDevices).toHaveBeenCalled();
    });


    it('should not delete device if the operation is NOT confirmed in confirmDialog after calling onDelete()', () => {
        spyOn(dialogServiceMock, 'confirmDialog').and.callThrough();
        spyOn(DevicesServiceMock, 'deleteDevice').and.callThrough();
        spyOn(devicesComponentTestInstance, 'fetchDevices');

        dialogServiceMock.setExpectedConfirmDialogValue(false);
        devicesComponentTestInstance.onDelete(DevicesServiceMock.mockDeviceA);

        expect(dialogServiceMock.confirmDialog).toHaveBeenCalled();
        expect(DevicesServiceMock.deleteDevice).not.toHaveBeenCalled();
        expect(devicesComponentTestInstance.fetchDevices).not.toHaveBeenCalled();
    });

    it('should call the filters and filter the list', async () => {
        devicesComponentTestInstance.loadFilters();

        devicesComponentTestInstance.filterForm.get('vendorFilterControl').setValue('HylaFAX');
        devicesComponentTestInstance.filterForm.get('nameFilterControl').setValue('HylaFAX Enterprise');
        devicesComponentTestInstance.filterForm.get('typeFilterControl').setValue('PBX');
        devicesComponentTestInstance.filterForm.get('startDateFilterControl').setValue(moment());
        devicesComponentTestInstance.filterForm.get('endDateFilterControl').setValue(moment());

        fixture.detectChanges();
        await fixture.whenStable();

        expect(devicesComponentTestInstance.devicesBk.length).toBe(0);
    })

    it('should call the endDatefilter and filter the list', fakeAsync(() => {
        devicesComponentTestInstance.loadFilters();
        tick(500);
        devicesComponentTestInstance.filterForm.get('endDateFilterControl').setValue(moment());

        fixture.detectChanges();
        tick(500);
        

        expect(devicesComponentTestInstance.devicesBk.length).toBe(3);
    }))
});
