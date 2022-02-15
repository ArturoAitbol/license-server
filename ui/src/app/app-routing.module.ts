import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RedirectComponent } from './views/redirect/redirect.component';

const config: ExtraOptions = {
  onSameUrlNavigation: 'reload',
  relativeLinkResolution: 'legacy',
  // useHash: true,
  // initialNavigation: 'enabledBlocking'
};

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // { path: 'login', component: LoginPageComponent },
  { path: 'redirect', component: RedirectComponent },
  { path: 'dashboard', component: DashboardComponent },
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
