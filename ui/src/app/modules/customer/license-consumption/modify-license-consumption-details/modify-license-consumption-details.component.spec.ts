import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MsalService } from "@azure/msal-angular";
import { of } from "rxjs";
import { DataTableComponent } from "src/app/generics/data-table/data-table.component";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { CustomerService } from "src/app/services/customer.service";
import { DevicesService } from "src/app/services/devices.service";
import { DialogService } from "src/app/services/dialog.service";
import { LicenseConsumptionService } from "src/app/services/license-consumption.service";
import { ProjectService } from "src/app/services/project.service";
import { UsageDetailService } from "src/app/services/usage-detail.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { CurrentCustomerServiceMock } from "src/test/mock/services/current-customer-service.mock";
import { CustomerServiceMock } from "src/test/mock/services/customer-service.mock";
import { DevicesServiceMock } from "src/test/mock/services/devices-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { ConsumptionServiceMock } from "src/test/mock/services/license-consumption-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { ProjectServiceMock } from "src/test/mock/services/project-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { UsageDetailServiceMock } from "src/test/mock/services/usage-detail-service.mock";
import { ProjectsComponent } from "../../projects/projects.component";
import { ModifyLicenseConsumptionDetailsComponent } from "./modify-license-consumption-details.component";
import { SnackBarService } from "../../../../services/snack-bar.service";

let modifyLicenseConsumptionDetailTestInstance: ModifyLicenseConsumptionDetailsComponent;
let fixture: ComponentFixture<ModifyLicenseConsumptionDetailsComponent>;
const dialogService = new DialogServiceMock();

const currentLicense = {
    usageDays: [0],
    consumption: "2022-08-07 - Week 32",
    deviceId: "eb2e8d89-b5a0-4e6c-8b11-83aad2674d7f",
    version: "1.0",
    vendor: "Opentext",
    granularity: "static",
    id: "1397ed28-543d-477c-871e-06f450831465",
    tokensConsumed: 15,
    projectName: "test",
    projectId: "459cf3ca-7365-47a1-8d9b-1abee381545c",
    usageType: "Configuration",
    consumptionDate: "2022-08-07",
    product: "SIP Trunk Testing Engagement",
    consDate: new Date(),
    endLicensePeriod: "2021-12-30",
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [  ModifyLicenseConsumptionDetailsComponent, ProjectsComponent, DataTableComponent  ],
        imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule, ReactiveFormsModule ],
        providers: [
            {
                provide: MatDialog,
                useValue: MatDialogMock
            },
            {
                provide: MatSnackBarRef,
                useValue: {}
            },
            {
                provide: ProjectService,
                useValue: ProjectServiceMock
            },
            {
                provide: LicenseConsumptionService,
                useValue: ConsumptionServiceMock
            },
            {
                provide: UsageDetailService,
                useValue: UsageDetailServiceMock
            },
            {
                provide: DialogService,
                useValue: dialogService
            },
            {
                provide: CustomerService,
                useValue: CurrentCustomerServiceMock
            },
            {
                provide: MsalService,
                useValue: MsalServiceMock
            },
            {
                provide: HttpClient,
                useValue: HttpClient
            },
            {
                provide: DevicesService,
                useValue: DevicesServiceMock
            },
            {
                provide: MatDialogRef,
                useValue: dialogService
            },
            {
                provide: MAT_DIALOG_DATA,
                useValue: currentLicense
            },
            {
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            }
        ]
    });
    fixture = TestBed.createComponent(ModifyLicenseConsumptionDetailsComponent);
    modifyLicenseConsumptionDetailTestInstance = fixture.componentInstance;
    modifyLicenseConsumptionDetailTestInstance.ngOnInit();
    spyOn(CurrentCustomerServiceMock, 'getSelectedCustomer').and.callThrough();
    spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();
    spyOn(ProjectServiceMock, 'getProjectDetailsBySubAccount').and.callThrough();
    spyOn(CustomerServiceMock, 'getSelectedCustomer').and.callThrough();
    spyOn(UsageDetailServiceMock, 'getUsageDetailsByConsumptionId').and.callThrough();

};

describe('Data collection and parsing test', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to get license consumption details list after initializing', () => {
        fixture.detectChanges();

        expect(DevicesServiceMock.getDevicesList).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsBySubAccount).toHaveBeenCalled();
        expect(UsageDetailServiceMock.getUsageDetailsByConsumptionId).toHaveBeenCalled();

        modifyLicenseConsumptionDetailTestInstance.updateForm.get('project').setValue({name: "testA"});
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('vendor').setValue({vendor: "testB"});
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('device').setValue({product: "testC"});
        
    });
});

describe('modify license consumption details interactions', () => {
    beforeEach(beforeEachFunction);
    it('should call submit', () => {
        fixture.detectChanges();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'setChecked').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'submit').and.callThrough();

        modifyLicenseConsumptionDetailTestInstance.setChecked(true, 0);
        expect(modifyLicenseConsumptionDetailTestInstance.setChecked).toHaveBeenCalledWith(true, 0);
        
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('project').setValue({name: "testA"});
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('vendor').setValue({vendor: "testB"});
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('device').setValue({product: "testC"});
        modifyLicenseConsumptionDetailTestInstance.submit();
        expect(modifyLicenseConsumptionDetailTestInstance.submit).toHaveBeenCalled();
    });
});

describe('modify functions interactions', () => {
    beforeEach(beforeEachFunction);
    it('should call modifys functions', () => {
        fixture.detectChanges();
        
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'onChangeVendor').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'disableSumbitBtn').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'getErrorMessage').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'onCancel').and.callThrough();
    
        modifyLicenseConsumptionDetailTestInstance.onChangeVendor({vendor:"Opentext"});
        modifyLicenseConsumptionDetailTestInstance.disableSumbitBtn();
        modifyLicenseConsumptionDetailTestInstance.getErrorMessage();
        modifyLicenseConsumptionDetailTestInstance.onCancel();

        expect(modifyLicenseConsumptionDetailTestInstance.disableSumbitBtn).toHaveBeenCalled();
        expect(modifyLicenseConsumptionDetailTestInstance.onChangeVendor).toHaveBeenCalledWith({vendor:"Opentext"});
        expect(modifyLicenseConsumptionDetailTestInstance.getErrorMessage).toHaveBeenCalled();
        
    });

    it('should call onChangeVendor and change the value of vendor', () => {
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'onChangeVendor').and.callThrough();

        modifyLicenseConsumptionDetailTestInstance.onChangeVendor({vendor:"Test"});

        expect(modifyLicenseConsumptionDetailTestInstance.onChangeVendor).toHaveBeenCalledWith({vendor:"Test"});
    })


    it('should call the deleteUsageDetails', () => {
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'submit').and.callThrough();
        fixture.detectChanges();
        modifyLicenseConsumptionDetailTestInstance.setChecked(false, 4);

        modifyLicenseConsumptionDetailTestInstance.submit();

        expect(modifyLicenseConsumptionDetailTestInstance.submit).toHaveBeenCalled();
    });

    it('should return error message to the user', () => {
        spyOn(UsageDetailServiceMock, 'deleteUsageDetails').and.returnValue(of({error: "Some error"}));
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'submit').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();

        modifyLicenseConsumptionDetailTestInstance.setChecked(false, 4);
        modifyLicenseConsumptionDetailTestInstance.submit();

        expect(modifyLicenseConsumptionDetailTestInstance.submit).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledOnceWith("Some error", 'Error editing license consumption!');
    });
});
