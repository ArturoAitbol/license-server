import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaPipe } from 'src/app/pipes/na.pipe';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { MaterialModule } from '../material/material.module';
import { DataPropertyGetterPipe } from 'src/app/pipes/data-property-getter.pipe';
import { CheckAccessForDirective } from 'src/app/directives/check-access-for.directive';



@NgModule({
  declarations: [
    NaPipe,
    DataTableComponent,
    DataPropertyGetterPipe,
    CheckAccessForDirective
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
    CheckAccessForDirective
  ]
})
export class SharedModule { }
