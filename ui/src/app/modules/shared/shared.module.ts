import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaPipe } from 'src/app/pipes/na.pipe';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { MaterialModule } from '../material/material.module';
import { DataPropertyGetterPipe } from 'src/app/pipes/data-property-getter.pipe';
import { CheckAccessForDirective } from 'src/app/directives/check-access-for.directive';
import { DeleteCustomerModal } from '../../dialogs/delete-customer/delete-customer-modal.component';
import { FeatureToggleDirective } from '../../directives/feature-toggle.directive';



@NgModule({
  declarations: [
    NaPipe,
    DataTableComponent,
    DataPropertyGetterPipe,
    CheckAccessForDirective,
    DeleteCustomerModal,
    FeatureToggleDirective,
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    NaPipe,
    DataTableComponent,
    DataPropertyGetterPipe,
    MaterialModule,
    CheckAccessForDirective,
    FeatureToggleDirective
  ]
})
export class SharedModule { }
