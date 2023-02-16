import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { CtaasDashboardService } from "src/app/services/ctaas-dashboard.service";
import { CtaasSetupService } from "src/app/services/ctaas-setup.service";
import { FeatureToggleService } from "src/app/services/feature-toggle.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { SubAccountService } from "src/app/services/sub-account.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { CtaasDashboardServiceMock } from "src/test/mock/services/ctaas-dashboard-service.mock";
import { CtaasSetupServiceMock } from "src/test/mock/services/ctaas-setup.service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { FeatureToggleServiceMock } from "src/test/mock/services/feature-toggle-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SubaccountServiceMock } from "src/test/mock/services/subaccount-service.mock";
import { SharedModule } from "../../shared/shared.module";
import { CtaasDashboardComponent } from "./ctaas-dashboard.component";

let ctaasDashboardTestInstance: CtaasDashboardComponent;
let fixture: ComponentFixture<CtaasDashboardComponent>;
const dialogService = new DialogServiceMock();

const RouterMock = {
    navigate: (commands: string[]) => {}
};

const defaultTestBedConfig = {
    declarations: [CtaasDashboardComponent],
    imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, ReactiveFormsModule],
    providers: [
        {
            provide:Router,
            useValue: RouterMock
        },
        {
            provide:MatDialog,
            useValue: MatDialogMock
        },
        {
            provide: SnackBarService,
            useValue: SnackBarServiceMock
        },
        {
            provide: CtaasSetupService,
            useValue: CtaasSetupServiceMock
        },
        {
            provide: CtaasDashboardService,
            useValue: CtaasDashboardServiceMock
        },
        {
            provide: SubAccountService,
            useValue: SubaccountServiceMock
        },
        {
            provide: MsalService,
            useValue: MsalServiceMock
        },
        {
            provide: FeatureToggleService,
            useValue: FeatureToggleServiceMock
        },
        {
            provide: HttpClient,
            useValue: HttpClient
        }
    ]
};

const beforeEachFunction = async () => {
    TestBed.configureTestingModule(defaultTestBedConfig).compileComponents().then(() => {
        fixture = TestBed.createComponent(CtaasDashboardComponent);
        ctaasDashboardTestInstance = fixture.componentInstance;
        ctaasDashboardTestInstance.ngOnInit();
    })
}