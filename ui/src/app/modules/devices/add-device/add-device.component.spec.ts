import { ComponentFixture, TestBed } from '@angular/core/testing';
import moment from 'moment';
import { of } from 'rxjs';
import { DevicesServiceMock } from 'src/test/mock/services/devices-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { AddDeviceComponent } from './add-device.component';
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';

let addDeviceComponentTestInstance: AddDeviceComponent;
let fixture: ComponentFixture<AddDeviceComponent>;

const beforeEachFunction = () => {
  const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddDeviceComponent);
  TestBed.configureTestingModule(configBuilder.getConfig());
  fixture = TestBed.createComponent(AddDeviceComponent);
  addDeviceComponentTestInstance = fixture.componentInstance;
}

describe('UI and component verification tests', () => {

  beforeEach(beforeEachFunction);

  it('AddDeviceComponent - should display essential UI and components', () => {
    fixture.detectChanges();
    const h1: HTMLElement = fixture.nativeElement.querySelector('#dialog-title');
    const cancelButton: HTMLElement = fixture.nativeElement.querySelector('#cancel-button');
    const submitButton: HTMLElement = fixture.nativeElement.querySelector('#submit-button');
    const labels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('label'));

    expect(h1.textContent).toBe('Add Device');
    expect(cancelButton.textContent).toBe('Cancel');
    expect(submitButton.textContent).toBe('Submit');
    expect(labels.find(label => label.textContent.includes("Start Date"))).not.toBeUndefined();
    expect(labels.find(label => label.textContent.includes("Is Support Device"))).not.toBeUndefined();
    expect(labels.find(label => label.textContent.includes("Device Type"))).not.toBeUndefined();
    expect(labels.find(label => label.textContent.includes("Vendor"))).not.toBeUndefined();
    expect(labels.find(label => label.textContent.includes("Name"))).not.toBeUndefined();
    expect(labels.find(label => label.textContent.includes("Version"))).not.toBeUndefined();
    expect(labels.find(label => label.textContent.includes("Granularity"))).not.toBeUndefined();
    expect(labels.find(label => label.textContent.includes("Tokens to Consume"))).not.toBeUndefined();
  });
});

describe('FormGroup verification tests', () => {

  beforeEach(beforeEachFunction);

  it('should create a formGroup with the necessary controls', () => {
    expect(addDeviceComponentTestInstance.addDeviceForm.contains('startDate')).toBeTrue();
    expect(addDeviceComponentTestInstance.addDeviceForm.contains('type')).toBeTrue();
    expect(addDeviceComponentTestInstance.addDeviceForm.contains('vendor')).toBeTrue();
    expect(addDeviceComponentTestInstance.addDeviceForm.contains('product')).toBeTrue();
    expect(addDeviceComponentTestInstance.addDeviceForm.contains('version')).toBeTrue();
    expect(addDeviceComponentTestInstance.addDeviceForm.contains('granularity')).toBeTrue();
    expect(addDeviceComponentTestInstance.addDeviceForm.contains('tokensToConsume')).toBeTrue();
    expect(addDeviceComponentTestInstance.addDeviceForm.contains('supportType')).toBeTrue();
  });

  it('should make all the controls required', () => {
    const addDeviceForm = addDeviceComponentTestInstance.addDeviceForm;
    addDeviceForm.setValue({
      startDate: '',
      type: '',
      vendor: '',
      product: '',
      version: '',
      granularity: '',
      tokensToConsume: '',
      supportType: ''
    });

    expect(addDeviceForm.get('startDate').valid).toBeFalse();
    expect(addDeviceForm.get('type').valid).toBeFalse();
    expect(addDeviceForm.get('vendor').valid).toBeFalse();
    expect(addDeviceForm.get('product').valid).toBeFalse();
    expect(addDeviceForm.get('version').valid).toBeFalse();
    expect(addDeviceForm.get('granularity').valid).toBeFalse();
    expect(addDeviceForm.get('tokensToConsume').valid).toBeFalse();
  });
});

describe('Data collection and parsing tests', () => {

  beforeEach(beforeEachFunction);

  it('should make a call to get devices types list', () => {
    spyOn(DevicesServiceMock, 'getDevicesTypesList').and.callThrough();
    fixture.detectChanges();
    expect(DevicesServiceMock.getDevicesTypesList).toHaveBeenCalled();
    expect(addDeviceComponentTestInstance.deviceTypes).toEqual(DevicesServiceMock.deviceTypes.deviceTypes);
  });
});

describe('Calls and interactions', () => {

  beforeEach(beforeEachFunction);

  it('should close the openDialog when calling onCancel()', () => {
    spyOn(addDeviceComponentTestInstance.dialogRef, 'close');
    fixture.detectChanges();
    addDeviceComponentTestInstance.onCancel();
    expect(addDeviceComponentTestInstance.dialogRef.close).toHaveBeenCalled();
  });

  it('should create a device after calling submit()', () => {
    // spyOn(DevicesServiceMock, 'createLicense').and.callThrough();
    spyOn(DevicesServiceMock, 'createDevice').and.callThrough();
    spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
    fixture.detectChanges();
    addDeviceComponentTestInstance.submit();

    expect(DevicesServiceMock.createDevice).toHaveBeenCalled();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Device added successfully!', '');
  });

  it('should show an error when adding Device failed after calling submit()', () => {
    spyOn(DevicesServiceMock, 'createDevice').and.returnValue(of({ error: 'some error message' }));
    spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
    fixture.detectChanges();

    addDeviceComponentTestInstance.submit();

    expect(DevicesServiceMock.createDevice).toHaveBeenCalled();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('some error message', 'Error adding Device!');

  });

  it('should call onChangeDeviceType', () => {
    fixture.detectChanges();
    spyOn(addDeviceComponentTestInstance, 'onChangeDeviceType').and.callThrough();

    fixture.detectChanges();

    addDeviceComponentTestInstance.onChangeDeviceType('PBX');
    expect(addDeviceComponentTestInstance.vendors.length).toBe(28);
    expect(addDeviceComponentTestInstance.isDataLoading).toBeFalse();
  });

  it('should call onStartDateChange', () => {
    fixture.detectChanges();
    spyOn(addDeviceComponentTestInstance, 'onStartDateChange').and.callThrough();
    
    fixture.detectChanges();
    
    addDeviceComponentTestInstance.onStartDateChange('2023-01-06 00:00:00');
    expect(addDeviceComponentTestInstance.deprecatedDateMin).toEqual(new Date('2023-01-07 00:00:00'));
    
  });

  it('should call onRenewalDateChange', () => {
    fixture.detectChanges();
    spyOn(addDeviceComponentTestInstance, 'onRenewalDateChange').and.callThrough();

    fixture.detectChanges();

    addDeviceComponentTestInstance.onRenewalDateChange('2023-01-06 00:00:00');
    expect(addDeviceComponentTestInstance.startDateMax).toEqual(new Date('2023-01-05 00:00:00'));
  });
});
