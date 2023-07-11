import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConsumptionMatrixComponent } from './consumption-matrix.component';
import { SnackBarServiceMock } from "../../../test/mock/services/snack-bar-service.mock";
import { ConsumptionMatrixServiceMock } from "../../../test/mock/services/consumption-matrix-service.mock";
import { MsalServiceMock } from "../../../test/mock/services/msal-service.mock";
import { TestBedConfigBuilder } from '../../../test/mock/TestBedConfigHelper.mock';
import { of, throwError } from 'rxjs';

let testInstance: ConsumptionMatrixComponent;
let fixture: ComponentFixture<ConsumptionMatrixComponent>;

const beforeEachFunction = waitForAsync(
    () => {
      const config = new TestBedConfigBuilder().useDefaultConfig(ConsumptionMatrixComponent).getConfig();
      TestBed.configureTestingModule(config).compileComponents().then(() => {
        fixture = TestBed.createComponent(ConsumptionMatrixComponent);
        testInstance = fixture.componentInstance;
        testInstance.ngOnInit();
      });
    }
);

describe('Consumption Matrix - UI verification tests', () => {
  beforeEach(beforeEachFunction);
  it('should display page title and loading/request states', () => {
    fixture.detectChanges();
    testInstance.sizeChange();
    const h1 = fixture.nativeElement.querySelector('#page-title');
    expect(h1.textContent).toBe('Consumption Matrix');
    expect(testInstance.isLoadingResults).toBeFalse();
    expect(testInstance.isRequestCompleted).toBeTrue();
  });

  it('should load correct data columns for the subscriptions table', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const callingPlatformColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[0];
    const devicePhoneAta = fixture.nativeElement.querySelectorAll('.mat-header-cell')[1];
    const softClientColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[2];
    const sbcColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[3];
    const ByocColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[4];
    const applicationColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[5];
    const headsetColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[6];
    const videoCollabDeviceROWColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[7];
    const videoCollabDeviceUSColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[8];

    expect(callingPlatformColumn.innerText).toBe('Calling Platform');
    expect(devicePhoneAta.innerText).toBe('Device/Phone/ATA');
    expect(softClientColumn.innerText).toBe('Soft Client/UC Client');
    expect(sbcColumn.innerText).toBe('SBC');
    expect(ByocColumn.innerText).toBe('BYOC');
    expect(applicationColumn.innerText).toBe('Application');
    expect(headsetColumn.innerText).toBe('Headset');
    expect(videoCollabDeviceROWColumn.innerText).toBe('Video Collab Device (ROW)')
    expect(videoCollabDeviceUSColumn.innerText).toBe('Video Collab Device (US)')
  });
});

describe('Consumption Matrix - edit, save and cancel buttons', () => {
  beforeEach(beforeEachFunction);
  beforeEach(() => {
    spyOn(MsalServiceMock.instance,'getActiveAccount').and.returnValue(MsalServiceMock.mockIdTokenClaimsDevicesAdminRole);
  });

  it('should enable editing when edit button is clicked', () => {
    spyOn(testInstance, "enableEditing").and.callThrough();
    fixture.detectChanges();
    const editButton = fixture.nativeElement.querySelector('#edit-button');
    expect(testInstance.isEditing).toBe(false);
    editButton.click();
    fixture.detectChanges();
    expect(testInstance.enableEditing).toHaveBeenCalled();
    expect(testInstance.isEditing).toBe(true);
  });

  it('should save changes when the save button is clicked', async () => {
    spyOn(testInstance, "saveChanges").and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(ConsumptionMatrixServiceMock, "updateConsumptionMatrix").and.callThrough();
    fixture.detectChanges();
    testInstance.isEditing = true;
    fixture.detectChanges();
    const firstCell = fixture.nativeElement.querySelectorAll('input')[0];
    firstCell.dispatchEvent(new Event('change'));
    const saveButton = fixture.nativeElement.querySelector('#save-button');
    saveButton.click();
    expect(testInstance.saveChanges).toHaveBeenCalled();
    expect(testInstance.isEditing).toBe(false);
    expect(ConsumptionMatrixServiceMock.updateConsumptionMatrix).toHaveBeenCalledWith('af4a2ee5-8f1f-4745-83ec-8d6e15fd3f33', { dutType: 'Device/Phone/ATA', callingPlatform: 'PBX', tokens: '2' });
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('The matrix was saved correctly!', '')
  });

  it('should call saveChanges with empty tokens', async () => {
    spyOn(testInstance, "saveChanges").and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(ConsumptionMatrixServiceMock, 'deleteConsumptionEntry').and.callThrough();
    fixture.detectChanges();
    testInstance.isEditing = true;
    fixture.detectChanges();
    const firstCell = fixture.nativeElement.querySelectorAll('input')[2];
    firstCell.dispatchEvent(new Event('change'));
    const saveButton = fixture.nativeElement.querySelector('#save-button');
    saveButton.click();
    expect(testInstance.saveChanges).toHaveBeenCalled();
    expect(testInstance.isEditing).toBe(false);
    expect(ConsumptionMatrixServiceMock.deleteConsumptionEntry).toHaveBeenCalledWith('eea27aa4-f2b7-455a-a8ea-af85ee6ac25e');
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('The matrix was saved correctly!', '');
  });


  it('should call saveChanges with a consumption without a id', async () => {
    spyOn(testInstance, "saveChanges").and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(ConsumptionMatrixServiceMock, 'createConsumptionMatrix').and.callThrough();
    fixture.detectChanges();
    testInstance.isEditing = true;
    fixture.detectChanges();
    const firstCell = fixture.nativeElement.querySelectorAll('input')[4];
    firstCell.dispatchEvent(new Event('change'));
    const saveButton = fixture.nativeElement.querySelector('#save-button');
    saveButton.click();
    expect(testInstance.saveChanges).toHaveBeenCalled();
    expect(testInstance.isEditing).toBe(false);
    expect(ConsumptionMatrixServiceMock.createConsumptionMatrix).toHaveBeenCalledWith({id: undefined, dutType: 'Application', callingPlatform: 'PBX', tokens: '3' })
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('The matrix was saved correctly!', '')
  });

  it('should call saveChanges with a consumption without a id', async () => {
    spyOn(testInstance, "saveChanges").and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(ConsumptionMatrixServiceMock, 'createConsumptionMatrix').and.callThrough();
    fixture.detectChanges();
    testInstance.isEditing = true;
    fixture.detectChanges();
    const firstCell = fixture.nativeElement.querySelectorAll('input')[5];
    firstCell.dispatchEvent(new Event('change'));
    const saveButton = fixture.nativeElement.querySelector('#save-button');
    saveButton.click();
    // expect(testInstance.saveChanges).toHaveBeenCalled();
    // expect(testInstance.isEditing).toBe(false);
    // expect(ConsumptionMatrixServiceMock.createConsumptionMatrix).toHaveBeenCalledWith({id: undefined, dutType: 'Application', callingPlatform: 'PBX', tokens: '3' })
    // expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('The matrix was saved correctly!', '')
  });


  it('should save changes when the save button is clicked', () => {
    spyOn(testInstance, "cancel").and.callThrough();
    fixture.detectChanges();
    testInstance.isEditing = true;
    fixture.detectChanges();
    const cancelButton = fixture.nativeElement.querySelector('#cancel-button');
    cancelButton.click();
    expect(testInstance.cancel).toHaveBeenCalled();
    expect(testInstance.isEditing).toBe(false);
  });
});

describe('Consumption matrix error messages', () => {
  beforeEach(beforeEachFunction);
  beforeEach(() => {
    spyOn(MsalServiceMock.instance,'getActiveAccount').and.returnValue(MsalServiceMock.mockIdTokenClaimsDevicesAdminRole);
  });

  it('should show a error message if something went wrong in save changes', async () => {
    spyOn(testInstance, "saveChanges").and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(ConsumptionMatrixServiceMock, "updateConsumptionMatrix").and.returnValue(of({error:'some error'}));
    fixture.detectChanges();
    testInstance.isEditing = true;
    fixture.detectChanges();
    const firstCell = fixture.nativeElement.querySelectorAll('input')[0];
    firstCell.dispatchEvent(new Event('change'));
    const saveButton = fixture.nativeElement.querySelector('#save-button');
    saveButton.click();
    expect(testInstance.saveChanges).toHaveBeenCalled();
    expect(testInstance.isEditing).toBe(false);
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('An error occurred while saving the matrix', '')
  });
  
  it('should show a error message if something went wrong while saving the matrix', async () => {
    spyOn(testInstance, "saveChanges").and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(ConsumptionMatrixServiceMock, "updateConsumptionMatrix").and.returnValue(throwError('some error'));
    fixture.detectChanges();
    testInstance.isEditing = true;
    fixture.detectChanges();
    const firstCell = fixture.nativeElement.querySelectorAll('input')[0];
    firstCell.dispatchEvent(new Event('change'));
    const saveButton = fixture.nativeElement.querySelector('#save-button');
    saveButton.click();
    expect(testInstance.saveChanges).toHaveBeenCalled();
    expect(testInstance.isEditing).toBe(false);
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('An error occurred while saving the matrix', '')
  });
});