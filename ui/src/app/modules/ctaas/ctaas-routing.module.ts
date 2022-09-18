import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/security/role.guard';
import { CtaasDashboardComponent } from './ctaas-dashboard/ctaas-dashboard.component';
import { CtaasProjectComponent } from './ctaas-project/ctaas-project.component';
import { CtaasStakeholderComponent } from './ctaas-stakeholder/ctaas-stakeholder.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboards', pathMatch: 'full' },
  {
    path: 'dashboards',
    component: CtaasDashboardComponent,
    canActivate:[RoleGuard]
  },
  {
    path: 'project',
    component: CtaasProjectComponent,
    canActivate:[RoleGuard]
  },
  {
    path: 'stakeholders',
    component: CtaasStakeholderComponent,
    canActivate:[RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CtaasRoutingModule { }
