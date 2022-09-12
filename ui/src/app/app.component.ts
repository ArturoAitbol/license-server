import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { Subject } from 'rxjs/internal/Subject';
import { EventMessage, EventType } from '@azure/msal-browser';
import { filter, takeUntil } from 'rxjs/operators';
import { AutoLogoutService } from "./services/auto-logout.service";
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { AboutModalComponent } from './generics/about-modal/about-modal.component';
import { HeaderService } from './services/header.service';
import { FeatureToggleHelper } from "./helpers/feature-toggle.helper";
import { Features } from './model/features';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly _destroying$ = new Subject<void>();
    title = 'license-server';
    currentUser = false;
    // added as part of ctaas feature
    hideToolbar: boolean = false;
    isTransparentToolbar: boolean = false;
    tabName: string = 'tekVizion 360 Portal';
    readonly APPS_ROUTE_PATH: string = '/apps';
    constructor(
        private router: Router,
        private msalService: MsalService,
        public dialog: MatDialog,
        private broadcastService: MsalBroadcastService,
        private autoLogoutService: AutoLogoutService,
        private headerService: HeaderService
    ) {
        const angularPlugin = new AngularPlugin();
        const appInsights = new ApplicationInsights({
            config: {
                connectionString: environment.INSTRUMENTATION_CONN_STRING,
                enableCorsCorrelation: true,
                enableRequestHeaderTracking: true,
                enableResponseHeaderTracking: true,
                enableAutoRouteTracking: false,
                loggingLevelConsole: 2,
                loggingLevelTelemetry: 2,
                correlationHeaderExcludedDomains: ['*.queue.core.windows.net'],
                extensions: [angularPlugin],
                extensionConfig: {
                    [angularPlugin.identifier]: { router: this.router }
                }
            }
        });
        appInsights.loadAppInsights();
        appInsights.trackPageView();
    }

    ngOnInit() {
        // example for a feature toggle in typescript logic code
        if (FeatureToggleHelper.isFeatureEnabled("testFeature1", this.msalService))
            console.log("Feature toggle 'testFeature1' enabled");
        if (!this.isLoggedIn()) {
            this.router.navigate(['/login']);
        } else {
            this.currentUser = this.isLoggedIn();
            this.autoLogoutService.validateLastActivityTime();
        }
        this.broadcastService.msalSubject$.pipe(
            filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
            takeUntil(this._destroying$)
        ).subscribe((result: EventMessage) => {
            // Do something with event payload here
        });
        this.broadcastService.msalSubject$.pipe(
            filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
            takeUntil(this._destroying$)
        ).subscribe(event => {
            this.currentUser = true;
            this.autoLogoutService.restartTimer();
        });
        // check for CTaaS Feature toggle
        if (FeatureToggleHelper.isFeatureEnabled(Features.CTaaS_Feature, this.msalService)) {
            this.performChangeOnToolbar();
            this.headerService.getOnChangeServiceEvent().subscribe((res: { hideToolbar: boolean, tabName: string, transparentToolbar: boolean }) => {
                if (res) {
                    const { tabName, hideToolbar, transparentToolbar } = res;
                    this.tabName = tabName;
                    this.hideToolbar = hideToolbar;
                    this.isTransparentToolbar = transparentToolbar;
                }
            });
        }
    }
    /**
     * perform changes on Toolbar on refresh
     */
    private performChangeOnToolbar(): void {
        const { location: { href } } = window;
        if (href) {
            const currentRoute = (href.split('/#').length > 0) ? href.split('/#')[1] : '';
            this.hideToolbar = (currentRoute !== this.APPS_ROUTE_PATH);
            this.isTransparentToolbar = (currentRoute === this.APPS_ROUTE_PATH);
        }
    }
    /**
     * check whether user logged in
     * @returns: boolean 
     */
    isLoggedIn(): boolean {
        return this.msalService.instance.getActiveAccount() != null;
    }
    /**
     * navigate to main view
     */
    navigateToMainView(): void {
        this.router.navigate(['/']);
    }
    /**
     * logout 
     */
    logout() {
        try {
            this.msalService.logout();
        } catch (error) {
            console.error('error while logout: ', error);
        }
    }

    getUserName(): string {
        return this.msalService.instance.getActiveAccount().name;
    }
    /**
     * Show About Modal
     */
    about() {
        const dialogRef = this.dialog.open(AboutModalComponent, {
            width: '400px',
            disableClose: false
        });
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}
