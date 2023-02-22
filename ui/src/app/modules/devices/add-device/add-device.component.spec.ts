import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DevicesService } from 'src/app/services/devices.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { DevicesServiceMock } from 'src/test/mock/services/devices-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { SharedModule } from '../../shared/shared.module';

import { AddDeviceComponent } from './add-device.component';

let addDeviceComponentTestInstance: AddDeviceComponent;
let fixture: ComponentFixture<AddDeviceComponent>;

const MatDialogRefMock = {
  close: () => { return null }
}

const beforeEachFunction = () => {
  TestBed.configureTestingModule({
    declarations: [AddDeviceComponent],
    imports: [CommonModule, SharedModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
    providers: [
      {
        provide: DevicesService,
        useValue: DevicesServiceMock
      },
      {
        provide: SnackBarService,
        useValue: SnackBarServiceMock
      },
      {
        provide: MatDialogRef,
        useValue: MatDialogRefMock
      },
      {
        provide: HttpClient,
        useValue: HttpClient
      }
    ]
  });

  fixture = TestBed.createComponent(AddDeviceComponent);
  addDeviceComponentTestInstance = fixture.componentInstance;
}

describe('UI and component verification tests', () => {

  beforeEach(beforeEachFunction);

  it('should display essential UI and components', () => {
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
    expect(labels.find(label => label.textContent.includes("Comment"))).not.toBeUndefined();
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
    expect(addDeviceComponentTestInstance.addDeviceForm.contains('comment')).toBeTrue();
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
      comment: '',
      supportType: ''
    });

    expect(addDeviceForm.get('startDate').valid).toBeFalse();
    expect(addDeviceForm.get('type').valid).toBeFalse();
    expect(addDeviceForm.get('vendor').valid).toBeFalse();
    expect(addDeviceForm.get('product').valid).toBeFalse();
    expect(addDeviceForm.get('version').valid).toBeFalse();
    expect(addDeviceForm.get('granularity').valid).toBeFalse();
    expect(addDeviceForm.get('comment').valid).toBeTrue();
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
});