import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ProjectRoutingModule } from './project-routing.module'
import { ProjectComponent } from './project.component';
import { NewProjectComponent } from './new-project/new-project.component';
import { ProjectRunComponent } from './project-run/project-run.component';
import { RunDetailsComponent } from './table/run-details/run-details.component';
import { TestDetailsComponent } from './table/test-details/test-details.component';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { LastRunComponent } from './last-run/last-run.component';
import { AssociatedPhonesComponent } from './associated-phones/associated-phones.component';
import { SchedulerComponent } from './scheduler/scheduler.component';

@NgModule({
  declarations: [
    ProjectComponent,
    NewProjectComponent,
    ProjectRunComponent,
    RunDetailsComponent,
    TestDetailsComponent,
    EditProjectComponent,
    SchedulerComponent,
    LastRunComponent,
    AssociatedPhonesComponent,
    SchedulerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProjectRoutingModule
  ],
  entryComponents: [
    NewProjectComponent,
    SchedulerComponent,
    EditProjectComponent,
    AssociatedPhonesComponent,
  ]
})
export class ProjectModule { }
