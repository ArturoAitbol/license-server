import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RedirectComponent } from './views/redirect/redirect.component';
import { MsalGuard } from '@azure/msal-angular';

const config: ExtraOptions = {
  onSameUrlNavigation: 'reload',
  relativeLinkResolution: 'legacy',
  useHash: false
};

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  // { path: 'redirect', component: RedirectComponent },
  {
    path: 'dashboard', component: DashboardComponent,
    canActivate: [
      MsalGuard
    ]
  },
  {
    path: 'customer',
    loadChildren: () => import('./modules/customer/customer.module').then(m => m.CustomerModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  providers: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
