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

@NgModule({
  declarations: [
    ViewCustomerLicenseComponent,
    AddLicenseConsumptionComponent,
    AddLicenseComponent,
    ModifyLicenseConsumptionDetailsComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerModule { }
