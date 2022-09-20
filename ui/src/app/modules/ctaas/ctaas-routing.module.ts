import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CtaasDashboardComponent } from './ctaas-dashboard/ctaas-dashboard.component';
import { CtaasTestSuitesComponent } from './ctaas-test-suites/ctaas-test-suites.component';


const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: CtaasDashboardComponent },
  { path: 'test-suites', component: CtaasTestSuitesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CtaasRoutingModule { }
