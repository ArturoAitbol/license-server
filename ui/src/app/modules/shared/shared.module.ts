import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaPipe } from 'src/app/pipes/na.pipe';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { MaterialModule } from '../material/material.module';
import { DataPropertyGetterPipe } from 'src/app/pipes/data-property-getter.pipe';
import { TitleGetterPipe } from 'src/app/pipes/title-getter.pipe';
import { CheckAccessForDirective } from 'src/app/directives/check-access-for.directive';
import { DeleteCustomerModalComponent } from "../../dialogs/delete-customer/delete-customer-modal.component";
import { FeatureToggleDirective } from "../../directives/feature-toggle.directive";
import { DateRangeDirective } from 'src/app/directives/date-range-directive';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';


@NgModule({
  declarations: [
    NaPipe,
    DataTableComponent,
    DataPropertyGetterPipe,
    CheckAccessForDirective,
    DeleteCustomerModalComponent,
    FeatureToggleDirective,
    DateRangeDirective,
    TitleGetterPipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    PowerBIEmbedModule,
    NgxMatTimepickerModule
  ],
  exports: [
    NaPipe,
    DataTableComponent,
    DataPropertyGetterPipe,
    MaterialModule,
    CheckAccessForDirective,
    FeatureToggleDirective,
    DateRangeDirective,
    PowerBIEmbedModule
  ]
})
export class SharedModule { }
