import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LicenseConsumptionComponent } from './license-consumption/license-consumption.component';
import { ProjectsComponent } from './projects/projects.component';
import { LicensesComponent } from './licenses/licenses.component';
import { RoleGuard } from 'src/app/security/role.guard';

const routes: Routes = [
  {
    path: 'consumption',
    component: LicenseConsumptionComponent,
    canActivate:[RoleGuard]
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    canActivate:[RoleGuard]
  },
  {
    path: 'licenses',
    component: LicensesComponent,
    canActivate:[RoleGuard]
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
