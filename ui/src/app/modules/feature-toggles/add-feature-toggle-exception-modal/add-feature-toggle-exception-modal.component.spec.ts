import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { AddFeatureToggleExceptionModalComponent } from './add-feature-toggle-exception-modal.component';
import { SnackBarServiceMock } from "../../../../test/mock/services/snack-bar-service.mock";
import { FeatureToggleMgmtServiceMock } from "../../../../test/mock/services/feature-toggle-mgmt-service.mock";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DialogServiceMock } from "../../../../test/mock/services/dialog-service.mock";
import { of, throwError } from "rxjs";
import { MatDialogMock } from "../../../../test/mock/components/mat-dialog.mock";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';
import { DialogService } from '../../../services/dialog.service';

let testInstance: AddFeatureToggleExceptionModalComponent;
let fixture: ComponentFixture<AddFeatureToggleExceptionModalComponent>;

const DIALOG_DATA = {
  featureToggle: {
    name: "testFT",
    description: "Test FT",
    id: "df6f5bc2-2687-49df-8dc0-beff88012235",
    exceptions: [
      {
        subaccountId: "31d81e5c-a916-470b-aabe-6860f8464211",
        customerId: "b566c90f-3671-47e3-b01e-c44684e28f99",
        subaccountName: "Test Subaccount",
        customerName: "Test Subaccount",
        status: false
      }
    ],
    status: true
  }
};

const MatDialogRefMock = {
  close: ()=> {}
};
const dialogMock = new DialogServiceMock();
const beforeEachFunction = waitForAsync(
    () => {
      const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddFeatureToggleExceptionModalComponent);
      configBuilder.addProvider({provide: DialogService, useValue: dialogMock});
      configBuilder.addProvider({provide: MAT_DIALOG_DATA, useValue: DIALOG_DATA});
      TestBed.configureTestingModule(configBuilder.getConfig()).compileComponents().then(() => {
        fixture = TestBed.createComponent(AddFeatureToggleExceptionModalComponent);
        testInstance = fixture.componentInstance;
        testInstance.ngOnInit();
      });
    }
);
describe('AddFeatureToggleExceptionModalComponent - UI verification tests', () => {
  beforeEach(beforeEachFunction);
  it('should display essential UI and components', () => {
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('#page-title');
    expect(h1.textContent).toBe('Add Feature Toggle Exception');
    expect(testInstance.isDataLoading).toBeFalse();
  });
  it('should display form labels text correctly', () =>{
    fixture.detectChanges();
    const featureToggleLabel = fixture.nativeElement.querySelector('#feature-toggle-label');
    const descriptionLabel = fixture.nativeElement.querySelector('#subaccount-label');
    const enabledToggle = fixture.nativeElement.querySelector('#enabled-toggle');
    const cancelBtn = fixture.nativeElement.querySelector('#cancelBtn');
    const submitBtn = fixture.nativeElement.querySelector('#submitBtn');

    expect(featureToggleLabel.textContent).toBe('Feature Toggle');
    expect(descriptionLabel.textContent).toBe('Subaccount');
    expect(enabledToggle.textContent).toBe(' Enabled');
    expect(cancelBtn.textContent).toBe('Cancel');
    expect(submitBtn.textContent).toBe('Submit');
  });
});

describe('AddFeatureToggleExceptionModalComponent - Basic functionality', () => {
  beforeEach(beforeEachFunction);
  it('should call dialogRef.close at onCancel()',  () => {
    spyOn(MatDialogMock, 'close');
    testInstance.onCancel();
    expect(MatDialogMock.close).toHaveBeenCalled();
  });

  it('should execute submit action', () => {
    spyOn(testInstance, 'submit').and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, 'createException').and.callThrough();
    spyOn(dialogMock, 'close').and.callThrough();
    testInstance.submit();
    expect(testInstance.submit).toHaveBeenCalled();
    expect(FeatureToggleMgmtServiceMock.createException).toHaveBeenCalled();
  });

  it('should display a success message', () => {
    spyOn(testInstance, 'submit').and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    testInstance.submit();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Feature toggle exception created', '');
  });
  it('should display an error message with the error', () => {
    spyOn(testInstance, 'submit').and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, 'createException').and.returnValue(of({ error: "Test error" }));
    testInstance.submit();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Test error', 'Error while creating feature toggle exception!');
  });
  it('should display an error message', () => {
    spyOn(testInstance, 'submit').and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, 'createException').and.returnValue(throwError("Test error"));
    testInstance.submit();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error while creating feature toggle exception!');
  });

  it('should filter the given subaccont', fakeAsync(() => {
    fixture.detectChanges();
    testInstance.addFeatureToggleExceptionForm.controls['subaccount'].setValue('TestCustomer - testcust');
    tick(100);
    fixture.detectChanges();
    tick(100);
    expect(testInstance.subaccounts).not.toBeNull();
  }));

  it('should filter the given numerical subaccount', fakeAsync(() => {
    fixture.detectChanges();
    testInstance.addFeatureToggleExceptionForm.controls['subaccount'].setValue(1);
    tick(100);
    fixture.detectChanges();
    tick(100);
    expect(testInstance.subaccounts).not.toBeNull();
  }));

  it('should return the subaccout name calling displayFnProject', () => {
    spyOn(testInstance, 'displayFnProject').and.callThrough();
    let subaccountName = testInstance.displayFnProject({
      "name": "Cloud9 Technologies - Cloud9 - 360 Small",
      "customerId": "aed14150-7807-425e-b858-50e1b5f15e9e",
      "id": "0d916dcc-515f-47b5-b8c3-4f7884d274f5"
    });

    expect(subaccountName).toEqual("Cloud9 Technologies - Cloud9 - 360 Small")
  });
});
