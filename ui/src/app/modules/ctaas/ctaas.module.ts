import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CtaasRoutingModule } from './ctaas-routing.module';
import { CtaasDashboardComponent } from './ctaas-dashboard/ctaas-dashboard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { OnboardWizardComponent } from './onboard-wizard/onboard-wizard.component';
import { CtaasTestSuitesComponent } from './ctaas-test-suites/ctaas-test-suites.component';


@NgModule({
  declarations: [
    CtaasDashboardComponent,
    OnboardWizardComponent,
    CtaasTestSuitesComponent,
  ],
  imports: [
    CommonModule,
    CtaasRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ],
  entryComponents: [
    OnboardWizardComponent
  ]
})
export class CtaasModule { }
