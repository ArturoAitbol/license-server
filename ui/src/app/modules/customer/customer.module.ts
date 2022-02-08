import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewCustomerLicenseComponent } from './view-customer-license/view-customer-license.component';
import { CustomerRoutingModule } from './customer-routing.module';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [
    ViewCustomerLicenseComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    MaterialModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerModule { }
