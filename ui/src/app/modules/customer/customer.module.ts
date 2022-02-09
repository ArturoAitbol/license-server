import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewCustomerLicenseComponent } from './view-customer-license/view-customer-license.component';
import { CustomerRoutingModule } from './customer-routing.module';
import { MaterialModule } from '../material/material.module';
import { AddLicenseConsumptionComponent } from './view-customer-license/add-license-consumption/add-license-consumption.component';
import { AddLicenseComponent } from './view-customer-license/add-license/add-license.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ViewCustomerLicenseComponent,
    AddLicenseConsumptionComponent,
    AddLicenseComponent
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
