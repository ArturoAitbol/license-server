import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
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
import { UsageDetailServiceMock } from "src/test/mock/services/usage-detail-service.mock";
import { ProjectsComponent } from "../../projects/projects.component";
import { ModifyLicenseConsumptionDetailsComponent } from "./modify-license-consumption-details.component";

let modifyLicenseConsumptionDetailTestInstance: ModifyLicenseConsumptionDetailsComponent;
let fixture: ComponentFixture<ModifyLicenseConsumptionDetailsComponent>;
const dialogService = new DialogServiceMock();

const RouterMock = {
    navigate: (commands: string[]) => {}
};
const currentLicense = {
    usageDays: [2],
    consumption: "2022-08-07 - Week 32",
    deviceId: "001ee852-4ab5-4642-85e1-58f5a477fbb3",
    version: "1.0",
    vendor: "tekVizion",
    granularity: "static",
    id: "1397ed28-543d-477c-871e-06f450831465",
    tokensConsumed: 15,
    projectName: "test",
    projectId: "459cf3ca-7365-47a1-8d9b-1abee381545c",
    usageType: "Configuration",
    consumptionDate: "2022-08-07",
    product: "SIP Trunk Testing Engagement"
}

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [  ModifyLicenseConsumptionDetailsComponent, ProjectsComponent, DataTableComponent  ],
        imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule, ReactiveFormsModule ],
        providers: [
            {
                provide: Router,
                useValue: RouterMock
            },
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

describe('Data collection and parsin test', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to get license consumption details list after initializing', () => {
        fixture.detectChanges();

        expect(DevicesServiceMock.getDevicesList).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsBySubAccount).toHaveBeenCalled();
        expect(UsageDetailServiceMock.getUsageDetailsByConsumptionId).toHaveBeenCalled();
        
    });
});

describe('modify license consumption details interactions', () => {
    beforeEach(beforeEachFunction);
    it('should call submit', () => {
        fixture.detectChanges();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'setChecked').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'submit').and.callThrough();
        spyOn(UsageDetailServiceMock, 'createUsageDetails').and.callThrough();

        modifyLicenseConsumptionDetailTestInstance.setChecked(true, 1);
        expect(modifyLicenseConsumptionDetailTestInstance.setChecked).toHaveBeenCalledOnceWith(true, 1);

        UsageDetailServiceMock.createUsageDetails();
        expect(UsageDetailServiceMock.createUsageDetails).toHaveBeenCalled()

        modifyLicenseConsumptionDetailTestInstance.submit();
        expect(modifyLicenseConsumptionDetailTestInstance.submit).toHaveBeenCalled();
        
    });
});

describe('modify functions interactions', () => {
    beforeEach(beforeEachFunction);
    it('should call modifys functions', () => {
        fixture.detectChanges();
        
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'onCancel').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'onChangeVendor').and.callThrough();
    
        modifyLicenseConsumptionDetailTestInstance.onCancel();
        modifyLicenseConsumptionDetailTestInstance.onChangeVendor("tekVizion");
        
    });
});
