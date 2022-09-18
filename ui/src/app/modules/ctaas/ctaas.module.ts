import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CtaasRoutingModule } from './ctaas-routing.module';
import { CtaasDashboardComponent } from './ctaas-dashboard/ctaas-dashboard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { OnboardWizardComponent } from './onboard-wizard/onboard-wizard.component';
import { CtaasProjectComponent } from './ctaas-project/ctaas-project.component';
import { CtaasStakeholderComponent } from './ctaas-stakeholder/ctaas-stakeholder.component'; 


@NgModule({
  declarations: [
    CtaasDashboardComponent,
    OnboardWizardComponent,
    CtaasProjectComponent,
    CtaasStakeholderComponent,
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CtaasModule { }
