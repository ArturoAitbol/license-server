import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CtaasDashboardComponent } from './ctaas-dashboard/ctaas-dashboard.component';
import { CtaasProjectsComponent } from './ctaas-projects/ctaas-projects.component';


const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: CtaasDashboardComponent },
  { path: 'projects', component: CtaasProjectsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CtaasRoutingModule { }
