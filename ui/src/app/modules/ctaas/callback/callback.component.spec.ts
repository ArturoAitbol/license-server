import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CallbackComponent } from "./callback.component";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";
import { DialogService } from "src/app/services/dialog.service";
import { BannerComponent } from "../banner/banner.component";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { StakeHolderService } from "src/app/services/stake-holder.service";
import { StakeHolderServiceMock } from "src/test/mock/services/ctaas-stakeholder-service.mock";
import { SubaccountServiceMock } from "src/test/mock/services/subaccount-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { CallbackServiceMock } from "src/test/mock/services/callback-service.mock";

let ctaasCallbackComponent: CallbackComponent;
let fixture: ComponentFixture<CallbackComponent>;
const dialogMock = new DialogServiceMock();

const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CallbackComponent);
configBuilder.addProvider({ provide: DialogService, useValue: dialogMock });
configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: {
    name: 'testDemoR',
    email: 'testdemo.r@tekvizion.com',
    companyName: 'tekVizion',
    jobTitle: 'Engineer',
    phoneNumber: '9012345680',
    subaccountId: '6b06ef8d-5eb6-44c3-bf61-e78f8644767e',
    notifications: ['TYPE:High level', 'DAILY_REPORTS', 'MONTHLY_REPORTS']} 
});

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

fdescribe('Callback function', () => {
    beforeEach(beforeEachFunction);
    it('should make a callback to "myself"', () => {
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(CallbackServiceMock, 'createCallback').and.callThrough();
        spyOn(dialogMock, 'close').and.callThrough();
        spyOn(dialogMock, 'confirmDialog').and.callThrough();
        const confirm = fixture.nativeElement.querySelector('#confirm');


        ctaasCallbackComponent.option = 'myself';
        confirm.click();
        dialogMock.setExpectedConfirmDialogValue(true);

        expect(CallbackServiceMock.createCallback).toHaveBeenCalled();
        //expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Call request has been made!', '');
    });
});