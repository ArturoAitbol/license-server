import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AddFeatureToggleExceptionModalComponent } from './add-feature-toggle-exception-modal.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SharedModule } from "../../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { SnackBarService } from "../../../services/snack-bar.service";
import { SnackBarServiceMock } from "../../../../test/mock/services/snack-bar-service.mock";
import { HttpClient } from "@angular/common/http";
import { FeatureToggleMgmtService } from "../../../services/feature-toggle-mgmt.service";
import { FeatureToggleMgmtServiceMock } from "../../../../test/mock/services/feature-toggle-mgmt-service.mock";
import { CustomerService } from "../../../services/customer.service";
import { CustomerServiceMock } from "../../../../test/mock/services/customer-service.mock";
import { SubAccountService } from "../../../services/sub-account.service";
import { SubaccountServiceMock } from "../../../../test/mock/services/subaccount-service.mock";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DialogServiceMock } from "../../../../test/mock/services/dialog-service.mock";
import { of, throwError } from "rxjs";
import { MatDialogMock } from "../../../../test/mock/components/mat-dialog.mock";

let testInstance: AddFeatureToggleExceptionModalComponent;
let fixture: ComponentFixture<AddFeatureToggleExceptionModalComponent>;

const RouterMock = {
  navigate: (commands: string[]) => { return }
};

const MatDialogRefMock = {
  close: ()=> {}
};
const dialogMock = new DialogServiceMock();
const beforeEachFunction = async () => {
  TestBed.configureTestingModule({
    declarations: [ AddFeatureToggleExceptionModalComponent ],
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
        provide: HttpClient,
        useValue: HttpClient
      },
      {
        provide: FeatureToggleMgmtService,
        useValue: FeatureToggleMgmtServiceMock
      },
      {
        provide: CustomerService,
        useValue: CustomerServiceMock
      },
      {
        provide: SubAccountService,
        useValue: SubaccountServiceMock
      },
      {
        provide: MatDialogRef,
        useValue: MatDialogRefMock
      },
      {
        provide: MatDialog,
        useValue: MatDialogMock
      },
      {
        provide: MAT_DIALOG_DATA,
        useValue: {
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
        }
      },
    ]
  }).compileComponents().then(() => {
    fixture = TestBed.createComponent(AddFeatureToggleExceptionModalComponent);
    testInstance = fixture.componentInstance;
    testInstance.ngOnInit();
  });
};
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
    spyOn(MatDialogRefMock, 'close');
    testInstance.onCancel();
    expect(MatDialogRefMock.close).toHaveBeenCalled();
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

  it('should display an error message', fakeAsync(() => {
    fixture.detectChanges();
    testInstance.addFeatureToggleExceptionForm.controls['subaccount'].setValue('test subaccount');
    tick(500);
    fixture.detectChanges();
    tick(500);
    expect(testInstance.subaccounts).not.toBeNull();
  }));
});
