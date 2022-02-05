import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { AuthGuard } from './guards/auth.guard';

const config: ExtraOptions = {
  onSameUrlNavigation: 'reload',
};

const routes: Routes = [
  { path: '', redirectTo: "login", pathMatch: "full" },
  { path: 'login', component: LoginPageComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  providers: [AuthGuard],
  exports: [RouterModule]
})
export class AppRoutingModule { }
