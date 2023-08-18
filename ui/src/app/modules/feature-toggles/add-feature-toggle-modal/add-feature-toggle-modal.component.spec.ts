import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SnackBarServiceMock } from "../../../../test/mock/services/snack-bar-service.mock";
import { FeatureToggleMgmtServiceMock } from "../../../../test/mock/services/feature-toggle-mgmt-service.mock";
import { DialogServiceMock } from "../../../../test/mock/services/dialog-service.mock";
import { of, throwError } from "rxjs";
import { AddFeatureToggleModalComponent } from "./add-feature-toggle-modal.component";
import { MatDialogMock } from "../../../../test/mock/components/mat-dialog.mock";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';
let testInstance: AddFeatureToggleModalComponent;
let fixture: ComponentFixture<AddFeatureToggleModalComponent>;

const dialogMock = new DialogServiceMock();
const beforeEachFunction = waitForAsync(() => {
  const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddFeatureToggleModalComponent);
  TestBed.configureTestingModule(configBuilder.getConfig()).compileComponents().then(() => {
      fixture = TestBed.createComponent(AddFeatureToggleModalComponent);
      testInstance = fixture.componentInstance;
    });
  }
);
describe('AddFeatureToggleModalComponent - UI verification tests', () => {
  beforeEach(beforeEachFunction);
  it('should display essential UI and components', () => {
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('#page-title');
    expect(h1.textContent).toBe('Add Feature Toggle');
  });
  it('should display form labels text correctly', () =>{
    fixture.detectChanges();
    const featureToggleLabel = fixture.nativeElement.querySelector('#name-label');
    const descriptionLabel = fixture.nativeElement.querySelector('#description-label');
    const enabledToggle = fixture.nativeElement.querySelector('#enabled-toggle');
    const cancelBtn = fixture.nativeElement.querySelector('#cancelBtn');
    const submitBtn = fixture.nativeElement.querySelector('#submitBtn');

    expect(featureToggleLabel.textContent).toBe('Name');
    expect(descriptionLabel.textContent).toBe('Description');
    expect(enabledToggle.textContent).toBe(' Enabled');
    expect(cancelBtn.textContent).toBe('Cancel');
    expect(submitBtn.textContent).toBe('Submit');
  });
});

describe('AddFeatureToggleModalComponent - Basic functionality', () => {
  beforeEach(beforeEachFunction);
  it('should call dialogRef.close at onCancel()',  () => {
    spyOn(MatDialogMock, 'close');
    testInstance.onCancel();
    expect(MatDialogMock.close).toHaveBeenCalled();
  });

  it('should execute submit action', () => {
    spyOn(testInstance, 'submit').and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, 'createFeatureToggle').and.callThrough();
    spyOn(dialogMock, 'close').and.callThrough();
    testInstance.submit();
    expect(testInstance.submit).toHaveBeenCalled();
    expect(FeatureToggleMgmtServiceMock.createFeatureToggle).toHaveBeenCalled();
  });

  it('should display a success message', () => {
    spyOn(testInstance, 'submit').and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    testInstance.submit();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Feature toggle created', '');
  });
  it('should display an error message with the error', () => {
    spyOn(testInstance, 'submit').and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, 'createFeatureToggle').and.returnValue(of({ error: "Test error" }));
    testInstance.submit();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Test error', 'Error while creating feature toggle!');
  });
  it('should display an error message', () => {
    spyOn(testInstance, 'submit').and.callThrough();
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, 'createFeatureToggle').and.returnValue(throwError("Test error"));
    testInstance.submit();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error while creating feature toggle!');
  });
});

