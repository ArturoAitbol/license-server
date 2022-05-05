import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LicenseConsumption } from './license-consumption/license-consumption.component';
import { ProjectsComponent } from './projects/projects.component';
import { LicensesComponent } from './licenses/licenses.component';

const routes: Routes = [
  {
    path: 'consumption',
    component: LicenseConsumption
  },
  {
    path: 'projects',
    component: ProjectsComponent
  },
  {
    path: 'licenses',
    component: LicensesComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
