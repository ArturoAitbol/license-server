import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from './security/role.guard';
import { NoPermissionsPageComponent } from './views/no-permissions-page/no-permissions-page.component';
import { FeatureToggleGuard } from "./modules/shared/feature-toggle.guard";
import { MyAppsComponent } from './my-apps/my-apps.component';
import { FeatureToggleHelper } from "./helpers/feature-toggle.helper";
import { RedirectPageComponent } from './redirect-page/redirect-page.component';
// set default route based on the feature toggle
const defaultRoute = FeatureToggleHelper.isFeatureEnabled("ctaasFeature") ? 'redirect' : 'dashboard';

const config: ExtraOptions = {
  onSameUrlNavigation: 'reload',
  relativeLinkResolution: 'legacy',
  useHash: true
};

const routes: Routes = [
  { path: '', redirectTo: defaultRoute, pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'no-permissions', component: NoPermissionsPageComponent, canActivate: [MsalGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard, RoleGuard, FeatureToggleGuard] },
  // example for a path not added in the feature toggle definition
  { path: 'testFeature1', component: NoPermissionsPageComponent, canActivate: [MsalGuard, FeatureToggleGuard] },
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
  { path: '**', redirectTo: defaultRoute }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  providers: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
