import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { of, throwError } from "rxjs";
import { DialogService } from "src/app/services/dialog.service";
import { CtaasDashboardServiceMock } from "src/test/mock/services/ctaas-dashboard-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";
import { DetailedReportsComponent } from "./ctaas-detailed-reports.component";

let onboardWizardComponentInstance: DetailedReportsComponent;
let fixture : ComponentFixture<DetailedReportsComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(DetailedReportsComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addProvider({provide: ActivatedRoute, useValue: {
        queryParams: of({
            type: 'Daily-FeatureFunctionality',
            param1: "value1",
        })
    }})
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(DetailedReportsComponent);
    onboardWizardComponentInstance = fixture.componentInstance;
    fixture.detectChanges();
}

describe (' UI test of ctaas-detailed-reports component', () => {
    beforeEach(beforeEachFunction)

    it('should throw a error message if something went wrong while fetching data from dashboard', () => {
        spyOn(CtaasDashboardServiceMock, 'getCtaasDashboardDetailedReport').and.callThrough();
        spyOn(console, 'error').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        onboardWizardComponentInstance.types = null;
        fixture.detectChanges();
        onboardWizardComponentInstance.fetchDashboardReportDetails();

        expect(onboardWizardComponentInstance.types).toEqual(null);
    });

    it('it should set variables when reports are empty', () => {
        const response = {response:{report:[]}}
        spyOn(CtaasDashboardServiceMock, 'getCtaasDashboardDetailedReport').and.returnValue(of(response));

        fixture.detectChanges();
        onboardWizardComponentInstance.fetchDashboardReportDetails();

        expect(onboardWizardComponentInstance.hasDashboardDetails).toBeFalse();
        expect(onboardWizardComponentInstance.reportResponse).toEqual({})
    });

    it('it should set variables when endpoints are empty',() => {
        spyOn(CtaasDashboardServiceMock, 'getCtaasDashboardDetailedReport').and.returnValue(of(CtaasDashboardServiceMock.dashboardDetailedReportsWithEmptyEndpoints));
        
        fixture.detectChanges();
        onboardWizardComponentInstance.fetchDashboardReportDetails();

        expect(onboardWizardComponentInstance.reportResponse.endpoints).toEqual([]);
    });

    it('it should set variables when results are empty',() => {
        spyOn(CtaasDashboardServiceMock, 'getCtaasDashboardDetailedReport').and.returnValue(of(CtaasDashboardServiceMock.dashboardDetailedReportsWithMissingAttributes));
        
        fixture.detectChanges();
        onboardWizardComponentInstance.fetchDashboardReportDetails();
    });
});

describe ('on more details table actions', () => {
    beforeEach(beforeEachFunction);
    it('should set the steps of the table with key "from" ', () => {
        spyOn(onboardWizardComponentInstance, 'setStep').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.setStep('from',1,0);

        expect(onboardWizardComponentInstance.setStep).toHaveBeenCalled()
        expect(onboardWizardComponentInstance.detailedTestReport[0].fromnoDataFoundFlag).toBeFalse();
    });

    it('should set the steps of the table with key "from" ', () => {
        spyOn(onboardWizardComponentInstance, 'setStep').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.setStep('from',1,1);

        expect(onboardWizardComponentInstance.setStep).toHaveBeenCalled()
        expect(onboardWizardComponentInstance.detailedTestReport[1].fromnoDataFoundFlag).toBeTrue();
    });

    it('should set the steps of the table with key "to"', () => {
        spyOn(onboardWizardComponentInstance, 'setStep').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.setStep('to',2,0);

        expect(onboardWizardComponentInstance.setStep).toHaveBeenCalled()
        expect(onboardWizardComponentInstance.detailedTestReport[0].tonoDataFoundFlag ).toBeFalse();
    });

    it('should set the steps of the table with key "to"', () => {
        spyOn(onboardWizardComponentInstance, 'setStep').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.setStep('to',2,1);

        expect(onboardWizardComponentInstance.setStep).toHaveBeenCalled()
        expect(onboardWizardComponentInstance.detailedTestReport[1].tonoDataFoundFlag ).toBeTrue();
    });

    it('should set the steps of the table with key "any"', () => {
        spyOn(onboardWizardComponentInstance, 'setStep').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.setStep('any',3+0,0);

        expect(onboardWizardComponentInstance.setStep).toHaveBeenCalled()
        expect(onboardWizardComponentInstance.detailedTestReport[0].otherPartynoDataFoundFlag ).toBeFalse();
    });
    it('should set the steps of the table with key "any"', () => {
        spyOn(onboardWizardComponentInstance, 'setStep').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.setStep('any',3+0,1);

        expect(onboardWizardComponentInstance.setStep).toHaveBeenCalled()
        expect(onboardWizardComponentInstance.detailedTestReport[1].otherPartynoDataFoundFlag ).toBeTrue();
    });

    it('should call getIconByType with true', () => {
        spyOn(onboardWizardComponentInstance, 'getIconByType').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.getIconByType(true);

        expect(onboardWizardComponentInstance.getIconByType).toHaveBeenCalled();
    });

    it('should call getIconByType with false', () => {
        spyOn(onboardWizardComponentInstance, 'getIconByType').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.getIconByType(false);

        expect(onboardWizardComponentInstance.getIconByType).toHaveBeenCalled();
    });
});

describe ('triggered methods', () => {
    beforeEach(beforeEachFunction);
    it('should call open when mat expasion panel is opened', () => {
        spyOn(onboardWizardComponentInstance, 'open').and.callThrough();
        spyOn(onboardWizardComponentInstance, 'setOtherPartiesPanelStatus').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.open(0);

        expect(onboardWizardComponentInstance.open).toHaveBeenCalled();
        expect(onboardWizardComponentInstance.setOtherPartiesPanelStatus).toHaveBeenCalled();
        expect(onboardWizardComponentInstance.detailedTestReport[0].frompanelOpenState).toBeTrue();
        expect(onboardWizardComponentInstance.detailedTestReport[0].topanelOpenState).toBeTrue();
    });

    it('should call close when expasion panel is closed', () => {
        spyOn(onboardWizardComponentInstance, 'close').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.detailedTestReport = CtaasDashboardServiceMock.reportDetailedWithOneResult.results;
        onboardWizardComponentInstance.close(0);
        
        expect(onboardWizardComponentInstance.detailedTestReport[0].closeKey).toBeTrue();
        expect(onboardWizardComponentInstance.detailedTestReport[0].panelOpenState).toBeTrue();
        expect(onboardWizardComponentInstance.detailedTestReport[0].topanelOpenState ).toBeTrue();
        expect(onboardWizardComponentInstance.detailedTestReport[0].frompanelOpenState ).toBeTrue();
    });

    it('should call subpanelOpenState', () => {
        spyOn(onboardWizardComponentInstance, 'subpanelOpenState').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.subpanelOpenState("from",0,0);

        expect(onboardWizardComponentInstance.detailedTestReport[0].topanelOpenState ).toBeTrue();
    });

    it('should call subpanelOpenState', () => {
        spyOn(onboardWizardComponentInstance, 'subpanelOpenState').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.subpanelOpenState("to",0,0);

        expect(onboardWizardComponentInstance.detailedTestReport[0].frompanelOpenState  ).toBeTrue();
    });

    it('should call subpanelOpenState', () => {
        spyOn(onboardWizardComponentInstance, 'subpanelOpenState').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.subpanelOpenState("other",0,0);

        expect(onboardWizardComponentInstance.detailedTestReport[0].topanelOpenState ).toBeTrue();
    });
});

describe ('download detailed test reports', () => {
    beforeEach(beforeEachFunction);
    it('it should call downloadDetailedTestReportByType', () => {
       spyOn(onboardWizardComponentInstance, 'downloadDetailedTestReportByType').and.callThrough();
       spyOn(CtaasDashboardServiceMock, 'downloadCtaasDashboardDetailedReport').and.callThrough();
       fixture.detectChanges();
       onboardWizardComponentInstance.downloadDetailedTestReportByType();
        
       expect(onboardWizardComponentInstance.downloadDetailedTestReportByType).toHaveBeenCalled();
       expect(CtaasDashboardServiceMock.downloadCtaasDashboardDetailedReport).toHaveBeenCalled();
    });
});

describe ('testing errors thrown by functions', () => {
    beforeEach(beforeEachFunction);
    it('should throw a error message if something went wrong while download test reports', () => {
        spyOn(CtaasDashboardServiceMock, 'downloadCtaasDashboardDetailedReport').and.returnValue(throwError({error:"some error"}));
        spyOn(console, 'error').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.downloadDetailedTestReportByType();

        expect(console.error).toHaveBeenCalledWith('Error with download report request: ' + 'some error');
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error loading downloading report', 'Ok');
    });

    it('should throw error message if something went wrong fetching data for download test reports', () => {
        spyOn(CtaasDashboardServiceMock, 'getDetailedReportyObject').and.returnValue(null);
        spyOn(console, 'error').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.downloadDetailedTestReportByType();
        expect(console.error).toHaveBeenCalledWith("Error while downloading report:TypeError: Cannot read properties of null (reading 'summary')");
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error loading downloading report', 'Ok');
    });

    it('should throw a error message if something went wrong while fetching data from dashboard', () => {
        spyOn(CtaasDashboardServiceMock, 'getCtaasDashboardDetailedReport').and.returnValue(throwError({error:"some error"}));
        spyOn(console, 'error').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        fixture.detectChanges();
        onboardWizardComponentInstance.fetchDashboardReportDetails();
        expect(onboardWizardComponentInstance.hasDashboardDetails).toBeFalse();
        expect(onboardWizardComponentInstance.isLoadingResults).toBeFalse();
        expect(onboardWizardComponentInstance.isRequestCompleted).toBeTrue();
        expect(console.error).toHaveBeenCalledWith("Error while fetching dashboard report: " + "some error");
    });
});
