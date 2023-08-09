import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/security/role.guard';
import { CtaasTestSuitesComponent } from './ctaas-test-suites/ctaas-test-suites.component';
import { CtaasStakeholderComponent } from './ctaas-stakeholder/ctaas-stakeholder.component';
import { CtaasSetupComponent } from "./ctaas-setup/ctaas-setup.component";
import { CtaasNotesComponent } from './ctaas-notes/ctaas-notes.component';
import { DetailedReportsComponent } from './ctaas-detailed-reports/ctaas-detailed-reports.component';
import { CtaasTestReportsComponent } from './ctaas-test-reports/ctaas-test-reports.component';
import { MapComponent } from './map/map.component';
import { SpotlightDashboardComponent } from "./spotlight-dashboard/spotlight-dashboard.component";

const routes: Routes = [
  { path: '', redirectTo: 'spotlight-dashboard', pathMatch: 'full' },
  {
    path: 'spotlight-dashboard',
    component: SpotlightDashboardComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'map',
    component: MapComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'test-suites',
    component: CtaasTestSuitesComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'stakeholders',
    component: CtaasStakeholderComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'setup',
    component: CtaasSetupComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'notes',
    component: CtaasNotesComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'details',
    component: DetailedReportsComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'reports',
    component: CtaasTestReportsComponent,
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CtaasRoutingModule { }
