import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// components
import { ViewCustomerLicenseComponent } from './view-customer-license/view-customer-license.component';
import { AddLicenseConsumptionComponent } from './view-customer-license/add-license-consumption/add-license-consumption.component';
import { AddLicenseComponent } from './view-customer-license/add-license/add-license.component';
// modules
import { CustomerRoutingModule } from './customer-routing.module';
import { MaterialModule } from '../material/material.module';
import { ModifyLicenseConsumptionDetailsComponent } from './view-customer-license/modify-license-consumption-details/modify-license-consumption-details.component';
import { ProjectsComponent } from './projects/projects.component';
import { AddProjectComponent } from './projects/add-project/add-project.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ViewCustomerLicenseComponent,
    AddLicenseConsumptionComponent,
    AddLicenseComponent,
    ModifyLicenseConsumptionDetailsComponent,
    ProjectsComponent,
    AddProjectComponent,
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerModule { }
