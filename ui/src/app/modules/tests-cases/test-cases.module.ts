import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { TestCasesRoutingModule } from './test-cases-routing.module';
import { TestCasesComponent } from './test-cases.component';
import { NewTestComponent } from './new-test/new-test.component';
import { NewPlanComponent } from './new-plan/new-plan.component';
import { TestPlanComponent } from './test-plan/test-plan.component';
import { EditTestComponent } from './edit-test/edit-test.component';
import { EditPlanComponent } from './edit-plan/edit-plan.component';
import { ShowTestComponent } from './show-test/show-test.component';
@NgModule({
  declarations: [
    TestCasesComponent,
    NewTestComponent,
    NewPlanComponent,
    TestPlanComponent,
    EditTestComponent,
    EditPlanComponent,
    ShowTestComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TestCasesRoutingModule
  ], entryComponents: [
    NewTestComponent,
    EditTestComponent,
    ShowTestComponent,
    EditPlanComponent,
    NewPlanComponent,
  ]
})
export class TestCasesModule { }
