import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CtaasRoutingModule } from './ctaas-routing.module';
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
import { DetailedReportsComponent } from './ctaas-detailed-reports/ctaas-detailed-reports.component';
import { CtaasTestReportsComponent } from './ctaas-test-reports/ctaas-test-reports.component';
import { SearchConsolidatedReportComponent } from './ctaas-test-reports/search-consolidated-report/search-consolidated-report.component';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { SpotlightDashboardComponent } from './spotlight-dashboard/spotlight-dashboard.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { NetworkQualityComponent } from './spotlight-dashboard/network-quality/network-quality.component';
import { CallbackComponent } from './callback/callback.component';
import { CallbackTimerComponent } from './callback/callback-timer/callback-timer.component';
import { NodeDetailComponent } from './map/node-detail/node-detail.component';
import { LineDetailComponent } from './map/line-detail/line-detail.component';
import { MapComponent } from './map/map.component';
import { PolqaGraphsComponent } from './spotlight-dashboard/network-quality/polqa-graphs/polqa-graphs.component';
import { NetworkTrendsComponent } from './spotlight-dashboard/network-quality/network-trends/network-trends.component';
import { LoadingSpinnerComponent } from '../../generics/loading-spinner/loading-spinner.component';


@NgModule({
  declarations: [
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
    DetailedReportsComponent,
    CtaasTestReportsComponent,
    SearchConsolidatedReportComponent,
    SpotlightDashboardComponent,
    NetworkQualityComponent,
    CallbackComponent,
    MapComponent,
    CallbackTimerComponent,
    NodeDetailComponent,
    LineDetailComponent,
    PolqaGraphsComponent,
    NetworkTrendsComponent,
    LoadingSpinnerComponent,
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
