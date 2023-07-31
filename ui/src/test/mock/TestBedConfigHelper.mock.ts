import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { SharedModule } from "../../app/modules/shared/shared.module";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { RouterMock } from "./Router.mock";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { CustomerService } from "../../app/services/customer.service";
import { NoteServiceMock } from './services/ctaas-note-service.mock';
import { ConsumptionServiceMock } from './services/license-consumption-service.mock';
import { BannerService } from '../../app/services/banner.service';
import { BannerServiceMock } from './services/alert-banner-service.mock';
import { FeatureToggleService } from '../../app/services/feature-toggle.service';
import { FeatureToggleServiceMock } from './services/feature-toggle-service.mock';
import { ConsumptionMatrixService } from '../../app/services/consumption-matrix.service';
import { ConsumptionMatrixServiceMock } from './services/consumption-matrix-service.mock';
import { DevicesService } from '../../app/services/devices.service';
import { DevicesServiceMock } from './services/devices-service.mock';
import { UsageDetailService } from '../../app/services/usage-detail.service';
import { UsageDetailServiceMock } from './services/usage-detail-service.mock';
import { BundleService } from '../../app/services/bundle.service';
import { BundleServiceMock } from './services/bundle-service.mock';
import { CustomerServiceMock } from './services/customer-service.mock';
import { FeatureToggleMgmtService } from '../../app/services/feature-toggle-mgmt.service';
import { FeatureToggleMgmtServiceMock } from './services/feature-toggle-mgmt-service.mock';
import { SubscriptionsOverviewService } from '../../app/services/subscriptions-overview.service';
import { SubscriptionsOverviewServiceMock } from './services/subscriptions-overview.service.mock';
import { UserProfileService } from '../../app/services/user-profile.service';
import { UserProfileServiceMock } from './services/user-profile.mock';
import { CallbackService } from "src/app/services/callback.service";
import { CallbackServiceMock } from "./services/callback-service.mock";
import { MapService } from "src/app/services/map.service";
import { MapServiceMock } from "./services/map-service.mock";
import { SpotlightChartsService } from "src/app/services/spotlight-charts.service";
import { SpotlightChartsServiceMock } from "./services/spotlightCharts-service.mock";

export class TestBedConfigBuilder {
    testBedConfig:{declarations:Array<any>, schema?:Array<any>, imports:Array<any>, providers:Array<any>};

    useCustomConfig(customConfig:{declarations:Array<any>, schema?:Array<any>, imports:Array<any>, providers:Array<any>}){
        this.testBedConfig = customConfig;
        return this;
    }

    useDefaultConfig(component) {
        this.testBedConfig = {
            declarations: [component],
            schema: [],
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
                { provide: MapService, useValue: MapServiceMock},
                { provide: SpotlightChartsService, useValue: SpotlightChartsServiceMock},
                { provide: LicenseConsumptionService, useValue: ConsumptionServiceMock },
                { provide: ProjectService, useValue: ProjectServiceMock },
                { provide: CustomerService, useValue: CustomerServiceMock },
                { provide: BannerService, useValue: BannerServiceMock },
                { provide: FeatureToggleService, useValue: FeatureToggleServiceMock},
                { provide: ConsumptionMatrixService, useValue: ConsumptionMatrixServiceMock },
                { provide: DevicesService, useValue: DevicesServiceMock },
                { provide: UsageDetailService, useValue: UsageDetailServiceMock },
                { provide: BundleService, useValue: BundleServiceMock },
                { provide: MatDialogRef, useValue: MatDialogMock },
                { provide: FeatureToggleMgmtService, useValue: FeatureToggleMgmtServiceMock },
                { provide: SubscriptionsOverviewService, useValue: SubscriptionsOverviewServiceMock },
                { provide: UserProfileService, useValue: UserProfileServiceMock },
                { provide: CallbackService, useValue: CallbackServiceMock }
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

    addSchema(schemaData) {
        this.testBedConfig.schema.push(schemaData);
        return this;
    }
}