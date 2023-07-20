import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { Constants } from "src/app/helpers/constants";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { CtaasDashboardServiceMock } from "src/test/mock/services/ctaas-dashboard-service.mock";
import { CtaasSetupServiceMock } from "src/test/mock/services/ctaas-setup.service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { BannerComponent } from "../banner/banner.component";
import { OnboardWizardComponent } from "../ctaas-onboard-wizard/ctaas-onboard-wizard.component";
import { CtaasDashboardComponent } from "./ctaas-dashboard.component";
import { BannerServiceMock } from "../../../../test/mock/services/alert-banner-service.mock";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';

let ctaasDashboardTestInstance: CtaasDashboardComponent;
let fixture: ComponentFixture<CtaasDashboardComponent>;

const RouterMock = {
    navigate: (commands: string[]) => {},
    url:('/visualization')
};

const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CtaasDashboardComponent).addDeclaration(BannerComponent);
const defaultTestBedConfig = configBuilder.getConfig();
const beforeEachFunction = waitForAsync(
    () => {
        TestBed.configureTestingModule(defaultTestBedConfig).compileComponents().then(() => {
            TestBed.overrideProvider(Router, {useValue: RouterMock});
            fixture = TestBed.createComponent(CtaasDashboardComponent);
            ctaasDashboardTestInstance = fixture.componentInstance;
        });
    }
) ;

describe('ctaas-dashboard - fetch the details', () => {
    beforeEach(beforeEachFunction);
    it('should fetch the data of the setup', () => {
        spyOn(CtaasSetupServiceMock, 'getSubaccountCtaasSetupDetails').and.callThrough();
        spyOn(ctaasDashboardTestInstance, 'setupCustomerOnboardDetails').and.callThrough();
        fixture.detectChanges();
        expect(ctaasDashboardTestInstance.isOnboardingComplete).toBeFalse()
        expect(ctaasDashboardTestInstance.onboardSetupStatus).toBe('SETUP_INPROGRESS');
        expect(CtaasSetupServiceMock.getSubaccountCtaasSetupDetails).toHaveBeenCalledWith('fbb2d912-b202-432d-8c07-dce0dad51f7f');
    });

    it('should open dialog with onboarding wizard component', () => {
        spyOn(ctaasDashboardTestInstance, 'setupCustomerOnboardDetails').and.callThrough();
        spyOn(MatDialogMock,'open').and.callThrough();
        spyOn(MsalServiceMock.instance, 'getActiveAccount').and.callThrough();
        ctaasDashboardTestInstance.loggedInUserRoles.push(Constants.SUBACCOUNT_ADMIN)
        fixture.detectChanges();
        expect(MatDialogMock.open).toHaveBeenCalledWith(OnboardWizardComponent, { width: '700px', maxHeight: '80vh', disableClose: true,
        data: { ctaasSetupId: '1e22eb0d-e499-4dbc-8f68-3dff5a42086b', ctaasSetupSubaccountId: 'fbb2d912-b202-432d-8c07-dce0dad51f7f' }});
    });

    // it('should call to clickMoreDetails with Feature Functionality', () => {
    //     spyOn(ctaasDashboardTestInstance, 'onClickMoreDetails').and.callThrough();
    //     spyOn(window, 'open').and.returnValue(null);
    //     spyOn(window, 'close').and.returnValue(null);
    //     fixture.detectChanges();
    //     ctaasDashboardTestInstance.onClickMoreDetails('0')
    //     expect(ctaasDashboardTestInstance.onClickMoreDetails).toHaveBeenCalledWith('0');
    // });

    // it('should call to clickMoreDetails with calling reliability', () => {
    //     spyOn(ctaasDashboardTestInstance, 'onClickMoreDetails').and.callThrough();
    //     spyOn(window, 'open').and.returnValue(null);
    //     spyOn(window, 'close').and.returnValue(null);
    //     fixture.detectChanges();
    //     ctaasDashboardTestInstance.onClickMoreDetails('1');
    //     expect(ctaasDashboardTestInstance.onClickMoreDetails).toHaveBeenCalledWith('1');
    // });

    // it('should call to clickMoreDetails with empty reportType', () => {
    //     spyOn(ctaasDashboardTestInstance, 'onClickMoreDetails').and.callThrough();
    //     spyOn(window, 'open').and.returnValue(null);
    //     spyOn(window, 'close').and.returnValue(null);
    //     fixture.detectChanges();
    //     ctaasDashboardTestInstance.resultantImagesList[0].imagesList['1'].reportType = ''
    //     ctaasDashboardTestInstance.onClickMoreDetails('1');
    //     expect(ctaasDashboardTestInstance.onClickMoreDetails).toHaveBeenCalledWith('1');
    // });

    // it('should return error if something went wrong while fetching data of the reports', fakeAsync(() => {
    //     fixture.detectChanges();
    //     spyOn(ctaasDashboardTestInstance, 'fetchSpotlightPowerBiDashboardDetailsBySubaccount').and.callThrough();
    //     spyOn(CtaasDashboardServiceMock, 'getCtaasPowerBiDashboardDetails').and.returnValue(throwError("some error"));
    //     spyOn(console, 'error').and.callThrough();

    //     ctaasDashboardTestInstance.fetchSpotlightPowerBiDashboardDetailsBySubaccount().catch((errorMsj) => {
    //         console.log(errorMsj);
    //     });
    //     tick();

    //     expect(ctaasDashboardTestInstance.hasDashboardDetails).toBeFalse();
    //     expect(ctaasDashboardTestInstance.isLoadingResults).toBeFalse();
    //     expect(console.error).toHaveBeenCalledWith('Error while loading embedded powerbi report: ','some error');
    //     discardPeriodicTasks();
    // }));

    it('should call onChangePowerBiButtonToggle ', () => {
        spyOn(ctaasDashboardTestInstance, 'onChangePowerBiButtonToggle').and.callThrough();

        fixture.detectChanges();
        ctaasDashboardTestInstance.onChangePowerBiButtonToggle();

        expect(ctaasDashboardTestInstance.featureToggleKey).toEqual('daily')
        expect(ctaasDashboardTestInstance.onChangePowerBiButtonToggle).toHaveBeenCalled();
    });
});

// describe('should return errors if something went wrong in the functions', () => {
//     beforeEach(beforeEachFunction);
//     it('should thorw errors is something went wrong in fetchCtaasDasboadDetailsBySubaccount',() => {
//         const e = {error:"some error"}
//         spyOn(CtaasDashboardServiceMock, 'getCtaasDashboardDetails').and.returnValue(throwError(e));
//         spyOn(console, 'error').and.callThrough();
//         spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
//         fixture.detectChanges();
//         expect(ctaasDashboardTestInstance.isLoadingResults).toBeFalse();
//         expect(console.error).toHaveBeenCalledWith('Error loading dashboard reports | ', e.error);
//         expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error loading dashboard, please contact your TekVizion 360 admin', 'Ok');
//     });
// });

describe('test without report-dashboard route', () => {
    const RouterMock2 = {
        navigate: (commands: string[]) => {},
        url:('')
    };
    beforeEach(() => {
        TestBed.configureTestingModule(defaultTestBedConfig);
        TestBed.overrideProvider(Router, {
            useValue: RouterMock2
        });
        fixture = TestBed.createComponent(CtaasDashboardComponent);
        ctaasDashboardTestInstance = fixture.componentInstance;
    });

    it('should make a call to fetch data without report dashboard route', () => {
        spyOn(CtaasSetupServiceMock, 'getSubaccountCtaasSetupDetails').and.callThrough();
        spyOn(ctaasDashboardTestInstance, 'setupCustomerOnboardDetails').and.callThrough();
        spyOn(CtaasDashboardServiceMock, 'getCtaasPowerBiDashboardDetails').and.callThrough();
        fixture.detectChanges();
        expect(ctaasDashboardTestInstance.isOnboardingComplete).toBeFalse();
        expect(ctaasDashboardTestInstance.onboardSetupStatus).toBe('SETUP_INPROGRESS');
        expect(CtaasSetupServiceMock.getSubaccountCtaasSetupDetails).toHaveBeenCalledWith('fbb2d912-b202-432d-8c07-dce0dad51f7f');
        expect(CtaasDashboardServiceMock.getCtaasPowerBiDashboardDetails).toHaveBeenCalled();
    });

    it('should change the powerBi button into weekly',() => {
        spyOn(ctaasDashboardTestInstance, 'onChangeButtonToggle').and.callThrough();
        spyOn(ctaasDashboardTestInstance, 'viewDashboardByMode').and.callThrough();
        ctaasDashboardTestInstance.featureToggleKey = ctaasDashboardTestInstance.WEEKLY;
        fixture.detectChanges();
        ctaasDashboardTestInstance.onChangeButtonToggle();
        expect(ctaasDashboardTestInstance.onChangeButtonToggle).toHaveBeenCalled();
        expect(ctaasDashboardTestInstance.viewDashboardByMode).toHaveBeenCalled();
    });

});

describe('Ctaas Dashboard - maintenance mode', () => {
    beforeEach(beforeEachFunction);
    it('should open an alert banner when maintenance mode is enabled',fakeAsync(() => {
        spyOn(CtaasSetupServiceMock, "getSubaccountCtaasSetupDetails").and.returnValue(of({ ctaasSetups: [CtaasSetupServiceMock.testSetupMaintenance] }));
        spyOn(BannerServiceMock, "open").and.callThrough();
        fixture.detectChanges();
        tick();
        expect(BannerServiceMock.open).toHaveBeenCalledWith('ALERT', Constants.MAINTENANCE_MODE_ALERT, jasmine.any(Object), "alert");
        discardPeriodicTasks();
    }));
});
