// Angular modules
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

// Created and used Modules
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { LoadingComponent } from './generics/loading/loading.component';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { AddCustomerAccountModalComponent } from './modules/dashboard-customer/add-customer-account-modal/add-customer-account-modal.component';
import { AddSubaccountModalComponent } from './modules/dashboard-customer/add-subaccount-modal/add-subaccount-modal.component';
import { ModifyCustomerAccountComponent } from './modules/dashboard-customer/modify-customer-account/modify-customer-account.component';
import { ConfirmComponent } from './dialogs/confirm/confirm.component';
import { AdminEmailsComponent } from './modules/dashboard-customer/admin-emails-modal/admin-emails.component';
import { SubaccountAdminEmailsComponent } from './modules/dashboard-customer/subaccount-admin-emails-modal/subaccount-admin-emails.component';
// third party modules
import { MsalInterceptor, MsalModule } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { SharedModule } from './modules/shared/shared.module';
import { environment } from 'src/environments/environment';
import { NoPermissionsPageComponent } from './views/no-permissions-page/no-permissions-page.component';
import { ApplicationinsightsAngularpluginErrorService } from '@microsoft/applicationinsights-angularplugin-js';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { AboutModalComponent } from './generics/about-modal/about-modal.component';
import { MyAppsComponent } from './my-apps/my-apps.component';
import { RedirectPageComponent } from './redirect-page/redirect-page.component';
import { SubscriptionsOverviewComponent } from './modules/subscriptions-overview/subscriptions-overview.component';
import { ViewProfileComponent } from './generics/view-profile/view-profile.component';
import { ConsumptionMatrixComponent } from './modules/consumption-matrix/consumption-matrix.component';
import { FeatureToggleService } from "./services/feature-toggle.service";
import { FeatureTogglesComponent } from './modules/feature-toggles/feature-toggles.component';
import { FeatureToggleCardComponent } from './modules/feature-toggles/feature-toggle-card/feature-toggle-card.component';
import { AddFeatureToggleModalComponent } from './modules/feature-toggles/add-feature-toggle-modal/add-feature-toggle-modal.component';
import { AddFeatureToggleExceptionModalComponent } from './modules/feature-toggles/add-feature-toggle-exception-modal/add-feature-toggle-exception-modal.component';
import { BannerComponent } from './generics/banner/banner.component';
import { AcceptComponent } from './dialogs/accept/accept.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OptionalComponent } from './dialogs/optional/optional.component';
@NgModule({
    declarations: [
        AppComponent,
        LoginPageComponent,
        LoadingComponent,
        CustomerDashboardComponent,
        AddCustomerAccountModalComponent,
        AddSubaccountModalComponent,
        ModifyCustomerAccountComponent,
        ConfirmComponent,
        AdminEmailsComponent,
        SubaccountAdminEmailsComponent,
        NoPermissionsPageComponent,
        AboutModalComponent,
        MyAppsComponent,
        RedirectPageComponent,
        ViewProfileComponent,
        SubscriptionsOverviewComponent,
        ConsumptionMatrixComponent,
        FeatureTogglesComponent,
        FeatureToggleCardComponent,
        AddFeatureToggleModalComponent,
        AddFeatureToggleExceptionModalComponent,
        BannerComponent,
        AcceptComponent,
        OptionalComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatTooltipModule,
        MsalModule.forRoot(new PublicClientApplication({
            auth: {
                clientId: environment.UI_CLIENT_ID,
                authority: environment.AUTHORITY,
                redirectUri: environment.BASE_URL + '/login' // always redirect to login view just in case there is an issue with login
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
                [environment.apiEndpoint, ['api://' + environment.API_CLIENT_ID + '/' + environment.API_SCOPE]]
            ])
        }),
        SharedModule
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: (featureToggleService: FeatureToggleService) => () => featureToggleService.refreshToggles(), deps: [FeatureToggleService], multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: ErrorHandler, useClass: ApplicationinsightsAngularpluginErrorService },
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true, strict: true } }
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [AddCustomerAccountModalComponent]
})
export class AppModule { }
