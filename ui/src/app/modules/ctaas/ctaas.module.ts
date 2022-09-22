import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CtaasRoutingModule } from './ctaas-routing.module';
import { CtaasDashboardComponent } from './ctaas-dashboard/ctaas-dashboard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { OnboardWizardComponent } from './onboard-wizard/onboard-wizard.component';
import { CtaasTestSuitesComponent } from './ctaas-test-suites/ctaas-test-suites.component';
import { CtaasStakeholderComponent } from './ctaas-stakeholder/ctaas-stakeholder.component';
import { AddStakeHolderComponent } from './ctaas-stakeholder/add-stake-holder/add-stake-holder.component';
import { UpdateStakeHolderComponent } from './ctaas-stakeholder/update-stake-holder/update-stake-holder.component';
import { AddTestSuiteComponent } from './ctaas-test-suites/add-test-suite/add-test-suite.component';
import { CtaasSetupComponent } from "./ctaas-setup/ctaas-setup.component";
import { LicenseConfirmationModalComponent } from './ctaas-setup/license-confirmation-modal/license-confirmation-modal.component';


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
    LicenseConfirmationModalComponent

  ],
  imports: [
    CommonModule,
    CtaasRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ],
  entryComponents: [
    OnboardWizardComponent,
    AddStakeHolderComponent,
    UpdateStakeHolderComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CtaasModule { }
