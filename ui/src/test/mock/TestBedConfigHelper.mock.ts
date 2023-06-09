import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { SharedModule } from "../../app/modules/shared/shared.module";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { RouterMock } from "./Router.mock";
import { MatDialog } from "@angular/material/dialog";
import { MatDialogMock } from "./components/mat-dialog.mock";
import { MsalService } from "@azure/msal-angular";
import { MsalServiceMock } from "./services/msal-service.mock";
import { HttpClient } from "@angular/common/http";
import { SnackBarService } from "../../app/services/snack-bar.service";
import { SnackBarServiceMock } from "./services/snack-bar-service.mock";
import { SubAccountService } from "../../app/services/sub-account.service";
import { SubaccountServiceMock } from "./services/subaccount-service.mock";
import { CtaasTestSuiteService } from "../../app/services/ctaas-test-suite.service";
import { TestSuitesMock } from "./services/ctaas-test-suites.service.mock";
import { CtaasSetupService } from "../../app/services/ctaas-setup.service";
import { CtaasSetupServiceMock } from "./services/ctaas-setup.service.mock";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CtaasDashboardServiceMock } from "./services/ctaas-dashboard-service.mock";
import { NoteService } from "../../app/services/notes.service";
import { CtaasDashboardService } from "../../app/services/ctaas-dashboard.service";
import { StakeHolderService } from "../../app/services/stake-holder.service";
import { StakeHolderServiceMock } from "./services/ctaas-stakeholder-service.mock";
import { LicenseService } from "../../app/services/license.service";
import { LicenseServiceMock } from "./services/license-service.mock";
import { LicenseConsumptionService } from "../../app/services/license-consumption.service";
import { ProjectServiceMock } from "./services/project-service.mock";
import { ProjectService } from "../../app/services/project.service";
import { DialogService } from "../../app/services/dialog.service";
import { CustomerService } from "../../app/services/customer.service";
import { CurrentCustomerServiceMock } from "./services/current-customer-service.mock";
import { NoteServiceMock } from './services/ctaas-note-service.mock';
import { ConsumptionServiceMock } from './services/license-consumption-service.mock';
import { BannerService } from '../../app/services/alert-banner.service';
import { BannerServiceMock } from './services/alert-banner-service.mock';
import { FeatureToggleService } from '../../app/services/feature-toggle.service';
import { FeatureToggleServiceMock } from './services/feature-toggle-service.mock';
import { ConsumptionMatrixService } from '../../app/services/consumption-matrix.service';
import { ConsumptionMatrixServiceMock } from './services/consumption-matrix-service.mock';

export class TestBedConfigBuilder {
    testBedConfig:{declarations:Array<any>, imports:Array<any>, providers:Array<any>};

    useCustomConfig(customConfig:{declarations:Array<any>, imports:Array<any>, providers:Array<any>}){
        this.testBedConfig = customConfig;
        return this;
    }

    useDefaultConfig(component) {
        this.testBedConfig = {
            declarations: [component],
            imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
            providers: [
                { provide: Router, useValue: RouterMock },
                { provide: MatDialog, useValue: MatDialogMock },
                { provide: CtaasTestSuiteService, useValue: TestSuitesMock },
                { provide: MsalService, useValue: MsalServiceMock },
                { provide: HttpClient },
                { provide: SnackBarService, useValue: SnackBarServiceMock },
                { provide: FormBuilder },
                { provide: SubAccountService, useValue: SubaccountServiceMock },
                { provide: MatSnackBarRef, useValue: {} },
                { provide: CtaasTestSuiteService, useValue: TestSuitesMock },
                { provide: CtaasSetupService, useValue: CtaasSetupServiceMock },
                { provide: CtaasDashboardService, useValue: CtaasDashboardServiceMock },
                { provide: NoteService, useValue: NoteServiceMock },
                { provide: StakeHolderService, useValue: StakeHolderServiceMock },
                { provide: LicenseService, useValue: LicenseServiceMock },
                { provide: LicenseConsumptionService, useValue: ConsumptionServiceMock },
                { provide: ProjectService, useValue: ProjectServiceMock },
                { provide: CustomerService, useValue: CurrentCustomerServiceMock },
                { provide: BannerService, useValue: BannerServiceMock },
                { provide: FeatureToggleService, useValue: FeatureToggleServiceMock},
                { provide: ConsumptionMatrixService, useValue: ConsumptionMatrixServiceMock },
            ]};
        return this;
    }
    addProvider(providerObject:{provide, useValue}) {
        this.testBedConfig.providers.push(providerObject)
        return this;
    }

    addDeclaration(declarationObject) {
        this.testBedConfig.declarations.push(declarationObject)
        return this;
    }

    addImport(importObject) {
        this.testBedConfig.imports.push(importObject)
        return this;
    }

    getConfig(){
        return this.testBedConfig;
    }
}