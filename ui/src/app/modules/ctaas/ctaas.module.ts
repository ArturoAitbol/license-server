import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CtaasRoutingModule } from './ctaas-routing.module';
import { CtaasDashboardComponent } from './ctaas-dashboard/ctaas-dashboard.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { OnboardWizardComponent } from './ctaas-onboard-wizard/ctaas-onboard-wizard.component';
import { CtaasTestSuitesComponent } from './ctaas-test-suites/ctaas-test-suites.component';
import { CtaasStakeholderComponent } from './ctaas-stakeholder/ctaas-stakeholder.component';
import { CtaasNotesComponent } from './ctaas-notes/ctaas-notes.component';
import { AddStakeHolderComponent } from './ctaas-stakeholder/add-stake-holder/add-stake-holder.component';
import { UpdateStakeHolderComponent } from './ctaas-stakeholder/update-stake-holder/update-stake-holder.component';
import { AddTestSuiteComponent } from './ctaas-test-suites/add-test-suite/add-test-suite.component';
import { CtaasSetupComponent } from "./ctaas-setup/ctaas-setup.component";
import { LicenseConfirmationModalComponent } from './ctaas-setup/license-confirmation-modal/license-confirmation-modal.component';
import { ModifyTestSuiteComponent } from './ctaas-test-suites/modify-test-suite/modify-test-suite.component';
import { BannerComponent } from './banner/banner.component';
import {AddNotesComponent} from './ctaas-notes/add-notes/add-notes.component';
import { CtaasHistoricalDashboardComponent } from './ctaas-historical-dashboard/ctaas-historical-dashboard.component';
import { DetailedReportsCompoment } from './ctaas-detailed-reports/ctaas-detailed-reports.component';
import { CtaasTestReportsComponent } from './ctaas-test-reports/ctaas-test-reports.component';
import { SearchConsolidatedReportComponent } from './ctaas-test-reports/search-consolidated-report/search-consolidated-report.component';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { DashboardPocComponent } from './dashboard-poc/dashboard-poc.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { NetworkQualityTrendsComponent } from './dashboard-poc/network-quality-trends/network-quality-trends.component';
import { CallbackComponent } from './callback/callback.component';
import { MapPocComponent } from './map-poc/map-poc.component';
import { CallbackTimerComponent } from './callback/callback-timer/callback-timer.component';


@NgModule({
  declarations: [
    CtaasDashboardComponent,
    OnboardWizardComponent,
    CtaasTestSuitesComponent,
    CtaasStakeholderComponent,
    AddStakeHolderComponent,
    UpdateStakeHolderComponent,
    AddTestSuiteComponent,
    CtaasSetupComponent,
    LicenseConfirmationModalComponent,
    ModifyTestSuiteComponent,
    BannerComponent,
    CtaasNotesComponent,
    AddNotesComponent,
    CtaasHistoricalDashboardComponent,
    DetailedReportsCompoment,
    CtaasTestReportsComponent,
    SearchConsolidatedReportComponent,
    DashboardPocComponent,
    NetworkQualityTrendsComponent,
    CallbackComponent,
    MapPocComponent,
    CallbackTimerComponent,
  ],
  imports: [
    CommonModule,
    CtaasRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    FormsModule,
    NgxMatTimepickerModule,
    NgApexchartsModule,
  ],
  entryComponents: [
    OnboardWizardComponent,
    AddStakeHolderComponent,
    UpdateStakeHolderComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CtaasModule { }
