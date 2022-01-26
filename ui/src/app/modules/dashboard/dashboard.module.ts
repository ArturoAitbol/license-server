import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { DashboardRoutingModule } from '../dashboard/dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DetailComponent } from './detail/detail.component';
import { TableWidgetComponent } from './widgets/table-widget/table-widget.component';
import { CounterWidgetComponent } from './widgets/counter-widget/counter-widget.component';

@NgModule({
  declarations: [
    DashboardComponent,
    TableWidgetComponent,
    CounterWidgetComponent,
    DetailComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule
  ], entryComponents: []
})
export class DashboardModule { }
