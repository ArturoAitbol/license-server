import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from './security/role.guard';
import { NoPermissionsPageComponent } from './views/no-permissions-page/no-permissions-page.component';
import { FeatureToggleGuard } from "./modules/shared/feature-toggle.guard";
import { MyAppsComponent } from './my-apps/my-apps.component';
import { RedirectPageComponent } from './redirect-page/redirect-page.component';
import { DevicesComponent } from './modules/devices/devices.component';
import { SubscriptionsOverviewComponent } from "./modules/subscriptions-overview/subscriptions-overview.component";
import { ConsumptionMatrixComponent } from "./modules/consumption-matrix/consumption-matrix.component";
import { FeatureTogglesComponent } from "./modules/feature-toggles/feature-toggles.component";

const config: ExtraOptions = {
  onSameUrlNavigation: 'reload',
  relativeLinkResolution: 'legacy',
  useHash: true
};

const routes: Routes = [
  { path: '', redirectTo: 'redirect', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'no-permissions', component: NoPermissionsPageComponent, canActivate: [MsalGuard] },
  { path: 'customers-dashboard', component: CustomerDashboardComponent, canActivate: [MsalGuard, RoleGuard, FeatureToggleGuard] },
  { path: 'subscriptions-overview', component: SubscriptionsOverviewComponent, canActivate: [MsalGuard, RoleGuard, FeatureToggleGuard] },
  { path: 'consumption-matrix', component: ConsumptionMatrixComponent, canActivate: [MsalGuard, RoleGuard, FeatureToggleGuard] },
  { path: 'apps', component: MyAppsComponent, canActivate: [MsalGuard, RoleGuard, FeatureToggleGuard] },
  { path: 'redirect', component: RedirectPageComponent, canActivate: [MsalGuard, RoleGuard, FeatureToggleGuard] },
  {
    path: 'customer', canActivate: [MsalGuard, RoleGuard, FeatureToggleGuard], canActivateChild: [FeatureToggleGuard],
    loadChildren: () => import('./modules/customer/customer.module').then(m => m.CustomerModule)
  },
  {
    path: 'spotlight', canActivate: [MsalGuard, RoleGuard, FeatureToggleGuard], canActivateChild: [FeatureToggleGuard],
    loadChildren: () => import('./modules/ctaas/ctaas.module').then(m => m.CtaasModule)
  },
  { path: 'devices', component: DevicesComponent, canActivate: [MsalGuard, RoleGuard] },
  { path: 'feature-toggles', component: FeatureTogglesComponent, canActivate: [ MsalGuard, RoleGuard, FeatureToggleGuard ] },
  { path: '**', redirectTo: 'redirect' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  providers: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
