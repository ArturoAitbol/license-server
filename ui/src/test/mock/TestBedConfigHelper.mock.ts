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
import {CtaasSetupService} from "../../app/services/ctaas-setup.service";
import {CtaasSetupServiceMock} from "./services/ctaas-setup.service.mock";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {NoteServiceMock} from "./services/ctaas-note-service.mock";
import {CtaasDashboardServiceMock} from "./services/ctaas-dashboard-service.mock";
import {NoteService} from "../../app/services/notes.service";
import {CtaasDashboardService} from "../../app/services/ctaas-dashboard.service";

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
                { provide: HttpClient, useValue: HttpClient },
                { provide: SnackBarService, useValue: SnackBarServiceMock },
                { provide: FormBuilder },
                { provide: SubAccountService, useValue: SubaccountServiceMock },
                { provide: MatSnackBarRef, useValue: {} },
                { provide: CtaasTestSuiteService, useValue: TestSuitesMock },
                { provide: CtaasSetupService, useValue: CtaasSetupServiceMock },
                { provide: CtaasDashboardService, useValue: CtaasDashboardServiceMock },
                { provide: NoteService, useValue: NoteServiceMock },
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
