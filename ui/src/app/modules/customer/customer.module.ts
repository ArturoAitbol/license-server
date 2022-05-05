import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// components
import { LicenseConsumption } from './license-consumption/license-consumption.component';
import { AddLicenseConsumptionComponent } from './license-consumption/add-license-consumption/add-license-consumption.component';
import { AddLicenseComponent } from './licenses/add-license/add-license.component';
// modules
import { CustomerRoutingModule } from './customer-routing.module';
import { MaterialModule } from '../material/material.module';
import { ModifyLicenseConsumptionDetailsComponent } from './license-consumption/modify-license-consumption-details/modify-license-consumption-details.component';
import { LicensesComponent } from './licenses/licenses.component';
import { ProjectsComponent } from './projects/projects.component';
import { AddProjectComponent } from './projects/add-project/add-project.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    LicenseConsumption,
    AddLicenseConsumptionComponent,
    AddLicenseComponent,
    ModifyLicenseConsumptionDetailsComponent,
    LicensesComponent,
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
