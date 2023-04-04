import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { of, throwError } from "rxjs";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { UsageDetailServiceMock } from "src/test/mock/services/usage-detail-service.mock";
import { StaticConsumptionDetailsComponent } from "./static-consumption-details.component";
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';
import { MatDialogMock } from '../../../../../test/mock/components/mat-dialog.mock';

let staticConsumptionDetailsComponent: StaticConsumptionDetailsComponent;
let fixture : ComponentFixture<StaticConsumptionDetailsComponent>;

const data = {
    consumption: "2024-02-01 - Week 5",
    consumptionDate: "2024-02-01",
    deviceId: "c49a3148-1e74-4090-9876-d062011d9bcb",
    endLicensePeriod: "2024-03-31",
    granularity: "static",
    id: "483b7876-9be9-4bfa-b097-275bea5ac9a0",
    product: "HylaFAX Enterprise",
    projectId: "a42edf7f-9b38-472f-afa3-10a4632acca1",
    projectName: "Project 2",
    tokensConsumed: 0,
    usageDays: 2,
    usageType: "Configuration",
    vendor: "HylaFAX",
    version: "6.2"
}

const beforeEachFunction = () =>{
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(StaticConsumptionDetailsComponent);
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: data });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: MatDialogMock});
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(StaticConsumptionDetailsComponent);
    staticConsumptionDetailsComponent = fixture.componentInstance;
}

describe('UI verification tests',()=>{

    beforeEach(beforeEachFunction);

    it('should display essential UI and components',()=>{
        fixture.detectChanges();

        const h1: HTMLElement = fixture.nativeElement.querySelector('#dialog-title');
        const closeButton: HTMLElement = fixture.nativeElement.querySelector('#close-button');
        const usageInfoCards : HTMLElement[] = fixture.nativeElement.querySelectorAll('.usage-info');
     
        expect(h1.textContent).toBe('tekToken Usage Details');
        expect(closeButton.textContent).toBe('Close');
        expect(usageInfoCards.length).toBe(data.usageDays);
    });
});

describe('Data collection and parsing tests',()=>{

    beforeEach(beforeEachFunction);

    it('should make a call to get usage details',()=>{
        spyOn(UsageDetailServiceMock,'getUsageDetailsByConsumptionId').and.callThrough();
        fixture.detectChanges();

        expect(UsageDetailServiceMock.getUsageDetailsByConsumptionId).toHaveBeenCalledWith(data.id);
        expect(staticConsumptionDetailsComponent.usageDetailsList).toEqual(UsageDetailServiceMock.usageDetails.usageDays);
    });

    it('should set isAutomationPlatform variable if the usage type is AutomationPlatform',()=>{
        staticConsumptionDetailsComponent.data.usageType = "AutomationPlatform";
        fixture.detectChanges();
        expect(staticConsumptionDetailsComponent.isAutomationPlatform).toBeTrue();

        staticConsumptionDetailsComponent.data.usageType = "Configuration";
        staticConsumptionDetailsComponent.ngOnInit();
        expect(staticConsumptionDetailsComponent.isAutomationPlatform).toBeFalse();
    });
});

describe('Calls and interactions', ()=>{

    beforeEach(beforeEachFunction);

    it('should close the dialog when calling close()',()=>{
        spyOn(staticConsumptionDetailsComponent.dialogRef,'close');
        fixture.detectChanges();
        staticConsumptionDetailsComponent.close();
        expect(staticConsumptionDetailsComponent.dialogRef.close).toHaveBeenCalled();
    });

    it('should delete a usage detail after calling deleteUsageDetails()',()=>{
        spyOn(UsageDetailServiceMock,'deleteUsageDetails').and.callThrough();
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
        fixture.detectChanges();

        staticConsumptionDetailsComponent.deleteUsageDetail(1);

        expect(UsageDetailServiceMock.deleteUsageDetails).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Usage deleted', '');
        const expectedRemainingList = UsageDetailServiceMock.usageDetails.usageDays[0];
        expect(staticConsumptionDetailsComponent.usageDetailsList).toEqual([expectedRemainingList]);
        expect(staticConsumptionDetailsComponent.edited).toBeTrue();
        expect(staticConsumptionDetailsComponent.isDataLoading).toBeFalse();
    });

    it('should show a message if an error occurred while deleting a usage detail after calling deleteUsageDetails()',()=>{
        const response = {error:"some error message"};
        spyOn(UsageDetailServiceMock,'deleteUsageDetails').and.returnValue(of(response));
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
        fixture.detectChanges();

        staticConsumptionDetailsComponent.deleteUsageDetail(1);

        expect(UsageDetailServiceMock.deleteUsageDetails).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.error, 'Error while deleting usage detail!');
        expect(staticConsumptionDetailsComponent.isDataLoading).toBeFalse();
    });

    it('should show a message if an error was thrown while deleting a usage detail after calling deleteUsageDetails()',()=>{
        const error = "some error";
        spyOn(UsageDetailServiceMock,'deleteUsageDetails').and.returnValue(throwError(error));
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
        spyOn(console,'error').and.callThrough();
        fixture.detectChanges();

        staticConsumptionDetailsComponent.deleteUsageDetail(1);

        expect(UsageDetailServiceMock.deleteUsageDetails).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error deleting usage detail!');
        expect(console.error).toHaveBeenCalledWith('Error while deleting usage detail', error);
        expect(staticConsumptionDetailsComponent.isDataLoading).toBeFalse();
    });
});