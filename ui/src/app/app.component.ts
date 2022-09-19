import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { MatSidenav } from '@angular/material/sidenav';
import { Constants } from './helpers/constants';


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
    hideToolbar = false;
    isTransparentToolbar = false;
    tabName = 'tekVizion 360 Portal';
    readonly APPS_ROUTE_PATH: string = '/apps';
    @ViewChild('sidenav') sidenav: MatSidenav;
    sideBarItems = [];
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
        if (this.isCtaasFeatureEnabled()) {
            this.initalizeSidebarItems();
            this.performChangeOnToolbar();
            this.headerService.getOnChangeServiceEvent().subscribe((res: { hideToolbar: boolean, tabName: string, transparentToolbar: boolean }) => {
                if (res) {
                    localStorage.setItem(Constants.TOOLBAR_DETAILS, JSON.stringify(res));
                    const { tabName, hideToolbar, transparentToolbar } = res;
                    this.tabName = tabName;
                    this.hideToolbar = hideToolbar;
                    this.isTransparentToolbar = transparentToolbar;
                }
            });
        }
    }
    /**
     * initalize the items required for side nav bar
     */
    initalizeSidebarItems(): void {
        this.sideBarItems = [
            {
                name: 'Dashboard',
                iconName: 'dashboard',
                selected: true,
                path: 'dashboard'
            },
            {
                name: 'Project',
                iconName: 'auto_awesome_motion',
                selected: false,
                path: 'projects'
            },
            {
                name: 'Stakeholders',
                iconName: 'settings',
                selected: false,
                path: 'stakeholders'
            }
        ];
    }
    /**
     * perform changes on Toolbar on refresh
     */
    private performChangeOnToolbar(): void {
        // const { location: { href } } = window;
        // if (href) {
        //     const currentRoute = (href.split('/#').length > 0) ? href.split('/#')[1] : '';
        //     this.hideToolbar = (currentRoute !== this.APPS_ROUTE_PATH);
        //     this.isTransparentToolbar = (currentRoute === this.APPS_ROUTE_PATH);
        // }
        const value = JSON.parse(localStorage.getItem('check'));
        if (value) {
            const { tabName, hideToolbar, transparentToolbar } = value;
            this.tabName = tabName;
            this.hideToolbar = hideToolbar;
            this.isTransparentToolbar = transparentToolbar;
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
    /**
     * get logged in user name
     * @returns: string 
     */
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
    /**
     * mark the selected nav item here
     * @param item: any 
     */
    onSelectedNavItem(item: any): void {
        this.sideBarItems.forEach((e: any) => {
            if (e.name === item.name)
                e.selected = true;
            else
                e.selected = false;
        });
    }
    /**
     * enable side bar based on the service and this feature is enabled only when CTaaS_Feature is enabled
     * @returns: boolean 
     */
    enableSidebar(): boolean {
        if (this.isCtaasFeatureEnabled()) {
            switch (this.tabName) {
                case 'CTaaS':
                    return true;
                default:
                    return false;
            }
        } else {
            return false;
        }
    }
    /**
     * check whether 
     * @returns: boolean CTaaS_Feature is enabled or not
     */
    isCtaasFeatureEnabled(): boolean {
        return FeatureToggleHelper.isFeatureEnabled(Features.CTaaS_Feature, this.msalService);
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}
