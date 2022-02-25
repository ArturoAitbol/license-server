import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaPipe } from 'src/app/pipes/na.pipe';



@NgModule({
  declarations: [
    NaPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [NaPipe]
})
export class SharedModule { }
