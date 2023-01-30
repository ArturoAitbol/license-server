import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionMatrixComponent } from './consumption-matrix.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SharedModule } from "../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { SnackBarService } from "../../services/snack-bar.service";
import { SnackBarServiceMock } from "../../../test/mock/services/snack-bar-service.mock";
import { HttpClient } from "@angular/common/http";
import { ConsumptionMatrixService } from "../../services/consumption-matrix.service";
import { ConsumptionMatrixServiceMock } from "../../../test/mock/services/consumption-matrix-service.mock";
import { MsalService } from "@azure/msal-angular";
import { MsalServiceMock } from "../../../test/mock/services/msal-service.mock";

let testInstance: ConsumptionMatrixComponent;
let fixture: ComponentFixture<ConsumptionMatrixComponent>;


const RouterMock = {
  navigate: (commands: string[]) => { return }
};

const beforeEachFunction = async () => {
  TestBed.configureTestingModule({
    declarations: [ ConsumptionMatrixComponent ],
    imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule ],
    providers: [
      {
        provide: Router,
        useValue: RouterMock
      },
      {
        provide: SnackBarService,
        useValue: SnackBarServiceMock
      },
      {
        provide: ConsumptionMatrixService,
        useValue: ConsumptionMatrixServiceMock
      },
      {
        provide: MsalService,
        useValue: MsalServiceMock
      },
      {
        provide: HttpClient,
        useValue: HttpClient
      }
    ]
  }).compileComponents().then(() => {
    fixture = TestBed.createComponent(ConsumptionMatrixComponent);
    testInstance = fixture.componentInstance;
    testInstance.ngOnInit();
  });
};

describe('Consumption Matrix - UI verification tests', () => {
  beforeEach(beforeEachFunction);
  it('should display essential UI and components', () => {
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
    const applicationColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[1];
    const ByocColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[2];
    const devicePhoneAta = fixture.nativeElement.querySelectorAll('.mat-header-cell')[3];
    const headsetColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[4];
    const sbcColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[5];
    const softClientColumn = fixture.nativeElement.querySelectorAll('.mat-header-cell')[6];

    expect(callingPlatformColumn.innerText).toBe('Calling Platform');
    expect(applicationColumn.innerText).toBe('Application');
    expect(ByocColumn.innerText).toBe('BYOC');
    expect(devicePhoneAta.innerText).toBe('Device/Phone/ATA');
    expect(headsetColumn.innerText).toBe('Headset');
    expect(sbcColumn.innerText).toBe('SBC');
    expect(softClientColumn.innerText).toBe('Soft Client/UC Client');
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
    expect(ConsumptionMatrixServiceMock.updateConsumptionMatrix).toHaveBeenCalledWith('ea00b987-0f14-4888-a0ce-f963d1eb7592', { dutType: 'Application', callingPlatform: 'CCaaS', tokens: '3' });
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('The matrix was saved correctly!', '')
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
