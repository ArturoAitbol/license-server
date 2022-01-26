import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const config: ExtraOptions = {
  onSameUrlNavigation: 'reload',
};

const routes: Routes = [
  { path: '', redirectTo: "dashboard", pathMatch: "full" },
  { path: 'login', component: LoginPageComponent },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(mod => mod.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'testCases',
    loadChildren: () => import('./modules/tests-cases/test-cases.module').then(mod => mod.TestCasesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'phoneConfiguration',
    loadChildren: () => import('./modules/phone-configuration/phone-configuration.module').then(mod => mod.PhoneConfigurationModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'testCase/:id',
    loadChildren: () => import('./modules/editor/editor.module').then(mod => mod.EditorModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'projects',
    loadChildren: () => import('./modules/project/project.module').then(mod => mod.ProjectModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'adminPanel',
    loadChildren: () => import('./modules/admin-panel/admin-panel.module').then(mod => mod.AdminPanelModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  providers: [AuthGuard],
  exports: [RouterModule]
})
export class AppRoutingModule { }
