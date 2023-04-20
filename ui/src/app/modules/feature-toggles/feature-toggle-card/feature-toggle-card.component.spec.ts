import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SnackBarServiceMock } from "../../../../test/mock/services/snack-bar-service.mock";
import { FeatureToggleMgmtServiceMock } from "../../../../test/mock/services/feature-toggle-mgmt-service.mock";
import { of, throwError } from "rxjs";
import { FeatureToggleCardComponent } from "./feature-toggle-card.component";
import { MatDialogMock } from "../../../../test/mock/components/mat-dialog.mock";
import { AddFeatureToggleExceptionModalComponent } from "../add-feature-toggle-exception-modal/add-feature-toggle-exception-modal.component";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';

let testInstance: FeatureToggleCardComponent;
let fixture: ComponentFixture<FeatureToggleCardComponent>;

const beforeEachFunction = waitForAsync(
    () => {
      const configBuilder = new TestBedConfigBuilder().useDefaultConfig(FeatureToggleCardComponent);
      TestBed.configureTestingModule(configBuilder.getConfig()).compileComponents().then(() => {
        fixture = TestBed.createComponent(FeatureToggleCardComponent);
        testInstance = fixture.componentInstance;
        testInstance.featureToggle = {
          name: "testFT",
          description: "Test FT",
          id: "df6f5bc2-2687-49df-8dc0-beff88012235",
          author: "Test",
          exceptions: [
            {
              subaccountId: "96234b32-32d3-45a4-af26-4c912c0d6a06",
              customerId: "f1b695b5-b7d9-4245-86ca-9a2a9ccbe460",
              subaccountName: "Test Subaccount",
              customerName: "Test customer",
              status: false
            }
          ],
          status: true
        };
      });
    }
);

describe('Feature Toggle Card - UI verification tests', () => {
  beforeEach(beforeEachFunction);
  it('should display form labels text correctly', () =>{
    fixture.detectChanges();
    const authorLabel = fixture.nativeElement.querySelector('#author-label');
    const exceptionsTitle = fixture.nativeElement.querySelector('#exceptions-title');
    const customerLabel = fixture.nativeElement.querySelector('#customer-label');
    const subaccountLabel = fixture.nativeElement.querySelector('#subaccount-label');
    const name = fixture.nativeElement.querySelector('#name');
    const description = fixture.nativeElement.querySelector('#description');
    const author = fixture.nativeElement.querySelector('#author');
    const customerName = fixture.nativeElement.querySelector('#customer-name');
    const subaccountName = fixture.nativeElement.querySelector('#subaccount-name');
    const ftDot = fixture.nativeElement.querySelector('#ft-dot');
    const exceptionDot = fixture.nativeElement.querySelector('#exception-dot');

    expect(authorLabel.textContent).toBe('Author:');
    expect(exceptionsTitle.textContent).toBe('Exceptions');
    expect(customerLabel.textContent).toBe('Customer:');
    expect(subaccountLabel.textContent).toBe('Subaccount:');
    expect(name.textContent).toBe('testFT');
    expect(description.textContent).toBe('Test FT');
    expect(author.textContent).toBe(' Test');
    expect(customerName.textContent).toBe(' Test customer');
    expect(subaccountName.textContent).toBe(' Test Subaccount');
    expect(ftDot).toHaveClass('ft-semi-enabled');
    expect(exceptionDot).not.toHaveClass('ft-enabled');
  });
});
describe('Feature Toggle Card - Basic FT toggling functionality', () => {
  beforeEach(beforeEachFunction);
  it('should toggle the FT when the slider is clicked', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "modifyFeatureToggle").and.callThrough();
    fixture.detectChanges();
    const ftToggle = fixture.nativeElement.querySelector('mat-slide-toggle input');
    ftToggle.click();
    expect(FeatureToggleMgmtServiceMock.modifyFeatureToggle).toHaveBeenCalledWith({
      name: 'testFT',
      description: 'Test FT',
      id: 'df6f5bc2-2687-49df-8dc0-beff88012235',
      author: 'Test',
      exceptions: [ {
        subaccountId: '96234b32-32d3-45a4-af26-4c912c0d6a06',
        customerId: 'f1b695b5-b7d9-4245-86ca-9a2a9ccbe460',
        subaccountName: 'Test Subaccount',
        customerName: 'Test customer',
        status: false
      } ],
      status: false
    });
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Feature toggle updated');
  });

  it('should display an error message', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "modifyFeatureToggle").and.returnValue(of({ error: "test error" }));
    fixture.detectChanges();
    const ftToggle = fixture.nativeElement.querySelector('mat-slide-toggle input');
    ftToggle.click();
    expect(FeatureToggleMgmtServiceMock.modifyFeatureToggle).toHaveBeenCalledWith({
      name: 'testFT',
      description: 'Test FT',
      id: 'df6f5bc2-2687-49df-8dc0-beff88012235',
      author: 'Test',
      exceptions: [ {
        subaccountId: '96234b32-32d3-45a4-af26-4c912c0d6a06',
        customerId: 'f1b695b5-b7d9-4245-86ca-9a2a9ccbe460',
        subaccountName: 'Test Subaccount',
        customerName: 'Test customer',
        status: false
      } ],
      status: false
    });
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('test error', 'Error while updating feature toggle!');
  });

  it('should display a generic error message', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "modifyFeatureToggle").and.returnValue(throwError("Test error"));
    fixture.detectChanges();
    const ftToggle = fixture.nativeElement.querySelector('mat-slide-toggle input');
    ftToggle.click();
    expect(FeatureToggleMgmtServiceMock.modifyFeatureToggle).toHaveBeenCalledWith({
      name: 'testFT',
      description: 'Test FT',
      id: 'df6f5bc2-2687-49df-8dc0-beff88012235',
      author: 'Test',
      exceptions: [ {
        subaccountId: '96234b32-32d3-45a4-af26-4c912c0d6a06',
        customerId: 'f1b695b5-b7d9-4245-86ca-9a2a9ccbe460',
        subaccountName: 'Test Subaccount',
        customerName: 'Test customer',
        status: false
      } ],
      status: false
    });
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error while updating feature toggle!');
  });
});

describe('Feature Toggle Card - Basic FT deleting functionality', () => {
  beforeEach(beforeEachFunction);
  it('should delete the FT when the button is clicked', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "deleteFeatureToggle").and.callThrough();
    fixture.detectChanges();
    const deleteBtn = fixture.nativeElement.querySelector('#deleteFtBtn');
    deleteBtn.click();
    expect(FeatureToggleMgmtServiceMock.deleteFeatureToggle).toHaveBeenCalledWith('df6f5bc2-2687-49df-8dc0-beff88012235');
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Feature toggle deleted');
  });

  it('should display an error message', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "deleteFeatureToggle").and.returnValue(of({ error: 'test error' }));
    fixture.detectChanges();
    const deleteBtn = fixture.nativeElement.querySelector('#deleteFtBtn');
    deleteBtn.click();
    expect(FeatureToggleMgmtServiceMock.deleteFeatureToggle).toHaveBeenCalledWith('df6f5bc2-2687-49df-8dc0-beff88012235');
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('test error', 'Error while deleting feature toggle!');
  });

  it('should display a generic error message', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "deleteFeatureToggle").and.returnValue(throwError("test error"));
    fixture.detectChanges();
    const deleteBtn = fixture.nativeElement.querySelector('#deleteFtBtn');
    deleteBtn.click();
    expect(FeatureToggleMgmtServiceMock.deleteFeatureToggle).toHaveBeenCalledWith('df6f5bc2-2687-49df-8dc0-beff88012235');
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error while deleting feature toggle!');
  });
});

describe('Feature Toggle Card - Basic add FT exception functionality', () => {
  beforeEach(beforeEachFunction);
  it('should open the add exception modal when button is clicked', () =>{
    spyOn(MatDialogMock, "open").and.callThrough();
    spyOn(testInstance.reloadFeatureToggles, "emit").and.callThrough();
    fixture.detectChanges();
    const addFtExBtn = fixture.nativeElement.querySelector('#addButton');
    addFtExBtn.click();
    expect(MatDialogMock.open).toHaveBeenCalledWith(AddFeatureToggleExceptionModalComponent, {
      width: '400px',
      disableClose: true,
      autoFocus: false,
      data: { featureToggle: testInstance.featureToggle }
    });
    expect(testInstance.reloadFeatureToggles.emit).toHaveBeenCalled();
  });
});

describe('Feature Toggle Card - Basic FT exception toggling functionality', () => {
  beforeEach(beforeEachFunction);
  it('should toggle the FT exception when the slider is clicked', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "updateException").and.callThrough();
    fixture.detectChanges();
    const ftExToggle = fixture.nativeElement.querySelectorAll('mat-slide-toggle input')[1];
    ftExToggle.click();
    expect(FeatureToggleMgmtServiceMock.updateException).toHaveBeenCalledWith({
      featureToggleId: 'df6f5bc2-2687-49df-8dc0-beff88012235',
      subaccountId: '96234b32-32d3-45a4-af26-4c912c0d6a06',
      status: true
    });
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Feature toggle exception updated');
  });

  it('should display an error message', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "updateException").and.returnValue(of({ error: "test error" }));
    fixture.detectChanges();
    const ftExToggle = fixture.nativeElement.querySelectorAll('mat-slide-toggle input')[1];
    ftExToggle.click();
    expect(FeatureToggleMgmtServiceMock.updateException).toHaveBeenCalledWith({
      featureToggleId: 'df6f5bc2-2687-49df-8dc0-beff88012235',
      subaccountId: '96234b32-32d3-45a4-af26-4c912c0d6a06',
      status: true
    });
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('test error', 'Error while updating feature toggle exception!');
  });

  it('should display a generic error message', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "updateException").and.returnValue(throwError("Test error"));
    fixture.detectChanges();
    const ftExToggle = fixture.nativeElement.querySelectorAll('mat-slide-toggle input')[1];
    ftExToggle.click();
    expect(FeatureToggleMgmtServiceMock.updateException).toHaveBeenCalledWith({
      featureToggleId: 'df6f5bc2-2687-49df-8dc0-beff88012235',
      subaccountId: '96234b32-32d3-45a4-af26-4c912c0d6a06',
      status: true
    });
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error while updating feature toggle exception!');
  });
});

describe('Feature Toggle Card - Basic FT exception deleting functionality', () => {
  beforeEach(beforeEachFunction);
  it('should delete the FT exception when the button is clicked', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "deleteException").and.callThrough();
    fixture.detectChanges();
    const deleteBtn = fixture.nativeElement.querySelector('#deleteExBtn');
    deleteBtn.click();
    expect(FeatureToggleMgmtServiceMock.deleteException).toHaveBeenCalledWith( 'df6f5bc2-2687-49df-8dc0-beff88012235', '96234b32-32d3-45a4-af26-4c912c0d6a06');
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Feature toggle exception deleted');
  });

  it('should display an error message', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "deleteException").and.returnValue(of({ error: 'test error' }));
    fixture.detectChanges();
    const deleteBtn = fixture.nativeElement.querySelector('#deleteExBtn');
    deleteBtn.click();
    expect(FeatureToggleMgmtServiceMock.deleteException).toHaveBeenCalledWith( 'df6f5bc2-2687-49df-8dc0-beff88012235', '96234b32-32d3-45a4-af26-4c912c0d6a06');
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('test error', 'Error while deleting feature toggle exception!');
  });

  it('should display a generic error message', () =>{
    spyOn(SnackBarServiceMock, "openSnackBar").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "deleteException").and.returnValue(throwError("test error"));
    fixture.detectChanges();
    const deleteBtn = fixture.nativeElement.querySelector('#deleteExBtn');
    deleteBtn.click();
    expect(FeatureToggleMgmtServiceMock.deleteException).toHaveBeenCalledWith( 'df6f5bc2-2687-49df-8dc0-beff88012235', '96234b32-32d3-45a4-af26-4c912c0d6a06');
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error while deleting feature toggle exception!');
  });
});

