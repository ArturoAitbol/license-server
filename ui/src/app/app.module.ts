// Angular modules
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Created and used Modules
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { LoadingComponent } from './generics/loading/loading.component';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MaterialModule } from './modules/material/material.module';
import { AddCustomerAccountModalComponent } from './dashboard/add-customer-account-modal/add-customer-account-modal.component';
import { AddSubaccountModalComponent } from './dashboard/add-subaccount-modal/add-subaccount-modal.component';
import { ModifyCustomerAccountComponent } from './dashboard/modify-customer-account/modify-customer-account.component';
import { ConfirmComponent } from './dialogs/confirm/confirm.component';
// third party modules
import { MsalInterceptor, MsalModule } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { Constants } from './helpers/constants';
import { SharedModule } from './modules/shared/shared.module';
import { environment } from 'src/environments/environment';
import { AdminEmailsComponent } from "./dashboard/admin-emails-modal/admin-emails.component";
@NgModule({
    declarations: [
        AppComponent,
        LoginPageComponent,
        LoadingComponent,
        DashboardComponent,
        AddCustomerAccountModalComponent,
        AddSubaccountModalComponent,
        ModifyCustomerAccountComponent,
        ConfirmComponent,
        AdminEmailsComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        MsalModule.forRoot(new PublicClientApplication({
            auth: {
                clientId: Constants.CLIENT_ID,
                redirectUri: Constants.REDIRECT_URL_AFTER_LOGIN
            },
            cache: {
                cacheLocation: 'localStorage'
            }
        }), {
            interactionType: InteractionType.Popup,
            authRequest: {
                scopes: ['user.read']
            }
        }, {
            interactionType: InteractionType.Popup,
            protectedResourceMap: new Map([
                [environment.apiEndpoint, ['user.read']]
            ])
        }),
        SharedModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [AddCustomerAccountModalComponent]
})
export class AppModule { }
