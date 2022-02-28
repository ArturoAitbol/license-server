import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaPipe } from 'src/app/pipes/na.pipe';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { MaterialModule } from '../material/material.module';
import { DataPropertyGetterPipe } from 'src/app/pipes/data-property-getter.pipe';



@NgModule({
  declarations: [
    NaPipe,
    DataTableComponent,
    DataPropertyGetterPipe
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    NaPipe,
    DataTableComponent,
    DataPropertyGetterPipe,
    MaterialModule
  ]
})
export class SharedModule { }
