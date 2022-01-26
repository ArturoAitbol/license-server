// Angular modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Created and used Modules
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './navigation/header/header.component';
import { SharedModule } from './modules/shared/shared.module';
import { FooterComponent } from './navigation/footer/footer.component';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
//
import { ChangePasswordComponent } from './modules/admin-panel/tabs/users/change-password/change-password.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { EulaConditionsComponent } from './views/eula-conditions/eula-conditions.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginPageComponent,
    ChangePasswordComponent,
    EulaConditionsComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule,
    AccordionModule.forRoot(),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ChangePasswordComponent,
  ]
})
export class AppModule { }
