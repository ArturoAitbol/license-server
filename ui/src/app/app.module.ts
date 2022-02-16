// Angular modules
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Created and used Modules
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './navigation/header/header.component';
import { FooterComponent } from './navigation/footer/footer.component';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { LoadingComponent } from './generics/loading/loading.component';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MaterialModule } from './modules/material/material.module';
import { DialogComponent } from './generics/loading/dialog/dialog.component';
import { AddCustomerAccountModalComponent } from './dashboard/add-customer-account-modal/add-customer-account-modal.component';
import { DataTableComponent } from './generics/loading/data-table/data-table.component';
import { OAuthModule } from 'angular-oauth2-oidc';
import { RedirectComponent } from './views/redirect/redirect.component';
import { ModifyCustomerAccountComponent } from './dashboard/modify-customer-account/modify-customer-account.component';
import { ConfirmComponent } from './dialogs/confirm/confirm.component';
@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        LoginPageComponent,
        LoadingComponent,
        DashboardComponent,
        DialogComponent,
        AddCustomerAccountModalComponent,
        DataTableComponent,
        RedirectComponent,
        ModifyCustomerAccountComponent,
        ConfirmComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        OAuthModule.forRoot()
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [AddCustomerAccountModalComponent]
})
export class AppModule { }
