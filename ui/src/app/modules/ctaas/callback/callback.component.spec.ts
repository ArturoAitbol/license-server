import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { CallbackComponent } from "./callback.component";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";
import { DialogService } from "src/app/services/dialog.service";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { StakeHolderServiceMock } from "src/test/mock/services/ctaas-stakeholder-service.mock";
import { SubaccountServiceMock } from "src/test/mock/services/subaccount-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { CallbackServiceMock } from "src/test/mock/services/callback-service.mock";
import { of, throwError } from "rxjs";

let ctaasCallbackComponent: CallbackComponent;
let fixture: ComponentFixture<CallbackComponent>;
const dialogMock = new DialogServiceMock();
const user ={
    "subaccountId": "2c8e386b-d1bd-48b3-b73a-12bfa5d00805",
    "role": "customer.SubaccountAdmin",
    "phoneNumber": "+1111111111",
    "jobTitle": "Subaccount Admin",
    "companyName": "TekVizion",
    "name": "TestSub",
    "email": "test-customer-subaccount-admin@tekvizionlabs.com",
    "notifications": "TYPE:Detailed,DAILY_REPORTS"
} 
const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CallbackComponent);
configBuilder.addProvider({ provide: DialogService, useValue: dialogMock });
configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: user});

const defaultTestBedConfig = configBuilder.getConfig();
const beforeEachFunction = () => {
    TestBed.configureTestingModule(defaultTestBedConfig);
    fixture = TestBed.createComponent(CallbackComponent);
    ctaasCallbackComponent = fixture.componentInstance;
    ctaasCallbackComponent.ngOnInit();
    spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.returnValue({
            id: "eea5f3b8-37eb-41fe-adad-5f94da124a5a",
            name: "testv2Demo",
            customerId: "157fdef0-c28e-4764-9023-75c06daad09d",
            services: "tokenConsumption,spotlight",
            testCustomer: false,
            companyName:"testComp",
            customerName:"testName"
        });
}

describe('Callback calls to respective users', () => {
    beforeEach(beforeEachFunction);
    it('should make a callback to myself', () => {
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(ctaasCallbackComponent, 'radioChange').and.callThrough();
        spyOn(CallbackServiceMock, 'createCallback').and.callThrough();
        spyOn(ctaasCallbackComponent, 'callbackFunction').and.callThrough();
        const confirm = fixture.nativeElement.querySelector('#confirm');

        ctaasCallbackComponent.option = 'myself';
        ctaasCallbackComponent.radioChange('myself');
        confirm.click();

        expect(CallbackServiceMock.createCallback).toHaveBeenCalled();
        expect(ctaasCallbackComponent.callbackFunction).toHaveBeenCalledWith(user)
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Call request has been made!', '');
    });

    it('should make a callback to another user', () => {
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(ctaasCallbackComponent, 'radioChange').and.callThrough();
        spyOn(ctaasCallbackComponent, 'onSelectedStakeholder').and.callThrough();
        spyOn(CallbackServiceMock, 'createCallback').and.callThrough();
        spyOn(ctaasCallbackComponent, 'callbackFunction').and.callThrough();
        const confirm = fixture.nativeElement.querySelector('#confirm');

        ctaasCallbackComponent.option = 'stakeholders';
        ctaasCallbackComponent.radioChange('stakeholders');
        ctaasCallbackComponent.onSelectedStakeholder(user);
        ctaasCallbackComponent.callbackFunction(user);
        confirm.click();

        expect(CallbackServiceMock.createCallback).toHaveBeenCalled();
        expect(ctaasCallbackComponent.callbackFunction).toHaveBeenCalledWith(user)
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Call request has been made!', '');
    });
});

describe("Callback error tests", () => {
    beforeEach(beforeEachFunction);
    it('should make call to callback function and thorw an error', async () => {
        const res = {error:"some error"}
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(CallbackServiceMock, 'createCallback').and.returnValue(of(res));
        spyOn(ctaasCallbackComponent, 'callbackFunction').and.callThrough();

        fixture.detectChanges()
        ctaasCallbackComponent.option = 'myself';
        ctaasCallbackComponent.radioChange('myself');
        ctaasCallbackComponent.callbackFunction(user);
        
        await fixture.whenStable();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error requesting call!', '');
    });
});

describe("Callback with users missing data", () => {
    const userEmptyData = {
        id: "eea5f3b8-37eb-41fe-adad-5f94da124a5a",
        name: null,
        customerId: "157fdef0-c28e-4764-9023-75c06daad09d",
        services: "tokenConsumption,spotlight",
        testCustomer: false,
        companyName:"testComp",
        customerName:"testName"
    }

    beforeEach(() =>{
        TestBed.configureTestingModule(configBuilder.getConfig());
        fixture = TestBed.createComponent(CallbackComponent);
        ctaasCallbackComponent = fixture.componentInstance;
    });

    it('should make call to openDialogForSpecificRole with stakeholder', () => {
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(ctaasCallbackComponent, 'radioChange').and.callThrough();
        spyOn(ctaasCallbackComponent, 'onSelectedStakeholder').and.callThrough();
        spyOn(CallbackServiceMock, 'createCallback').and.callThrough();
        spyOn(ctaasCallbackComponent, 'callbackFunction').and.callThrough();
        spyOn(ctaasCallbackComponent, 'openDialogForSpecificRole').and.callThrough();
        const confirm = fixture.nativeElement.querySelector('#confirm');

        ctaasCallbackComponent.option = 'stakeholders';
        ctaasCallbackComponent.radioChange('stakeholders');
        ctaasCallbackComponent.callbackFunction(userEmptyData);
        confirm.click();

        expect(ctaasCallbackComponent.openDialogForSpecificRole).toHaveBeenCalled();
    });

    it('should make call to openDialogForSpecificRole with myself', () => {
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.callThrough();
        spyOn(ctaasCallbackComponent, 'radioChange').and.callThrough();
        spyOn(CallbackServiceMock, 'createCallback').and.callThrough();
        spyOn(ctaasCallbackComponent, 'callbackFunction').and.callThrough();
        spyOn(ctaasCallbackComponent, 'openDialogForSpecificRole').and.callThrough();
        const confirm = fixture.nativeElement.querySelector('#confirm');

        ctaasCallbackComponent.option = 'myself';
        ctaasCallbackComponent.radioChange('myself');
        ctaasCallbackComponent.callbackFunction(userEmptyData);
        confirm.click();

        expect(ctaasCallbackComponent.openDialogForSpecificRole).toHaveBeenCalled();
    });
});
