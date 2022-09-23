import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
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
import { FeatureToggleHelper } from "./helpers/feature-toggle.helper";
import { Features } from './helpers/features';
import { MatSidenav } from '@angular/material/sidenav';
import { Constants } from './helpers/constants';
import { Utility } from './helpers/utils';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly _destroying$ = new Subject<void>();
    title = 'license-server';
    currentUser = false;
    // added as part of spotlight feature
    hideToolbar: boolean = false;
    isTransparentToolbar: boolean = false;
    baseCtaasURL = "/spotlight/";
    // tabName: string = 'tekVizion 360 Portal';
    tabName: string = Constants.TEK_TOKEN_TOOL_BAR;
    @ViewChild('sidenav') sidenav: MatSidenav;
    fullSideBarItems: any = [
        {
            name: 'Dashboard',
            iconName: "assets\\images\\dashboard_3.png",
            path: 'report-dashboards',
            active: true,
            materialIcon: 'dashboard'
        },
        {
            name: 'Test Suites',
            iconName: "assets\\images\\project_3.png",
            path: 'test-suites',
            active: false,
            materialIcon: 'folder_open'
        },
        {
            name: 'Stakeholders',
            iconName: "assets\\images\\multiple-users.png",
            path: 'stakeholders',
            active: false,
            materialIcon: 'groups'
        },
        {
            name: 'Configuration',
            iconName: "assets\\images\\tune.png",
            path: 'setup',
            active: false,
            materialIcon: 'tune'
        }
    ];
    displayedSideBarItems: any[] = [
        {
            name: 'Dashboard',
            iconName: "assets\\images\\dashboard_3.png",
            path: 'report-dashboards',
            active: true,
            materialIcon: 'dashboard'
        }
    ];
    currentRoutePath: string = '';
    // routes
    readonly REDIRECT_ROUTE_PATH: string = '/redirect';
    readonly APPS_ROUTE_PATH: string = '/apps';
    readonly CTAAS_DASHBOARD_ROUTE_PATH: string = '/spotlight/report-dashboards';
    readonly CTAAS_TEST_SUITES_ROUTE_PATH: string = '/spotlight/test-suites';
    readonly CTAAS_STAKEHOLDERS_ROUTE_PATH: string = '/spotlight/stakeholders';
    readonly CTAAS_SETUP_PATH: string = '/spotlight/setup';

    constructor(
        private router: Router,
        private msalService: MsalService,
        public dialog: MatDialog,
        private broadcastService: MsalBroadcastService,
        private autoLogoutService: AutoLogoutService
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
        this.onRouteChanges();
    }
    /**
     * listen for route changes, to manage toolbar based on the route
     */
    onRouteChanges(): void {
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.currentRoutePath = val.urlAfterRedirects;
                switch (this.currentRoutePath) {
                    case this.REDIRECT_ROUTE_PATH:
                        this.tabName = '';
                        this.hideToolbar = true;
                        this.isTransparentToolbar = false;
                        this.enableSidebar();
                        break;
                    case this.APPS_ROUTE_PATH:
                        this.tabName = '';
                        this.hideToolbar = false;
                        this.isTransparentToolbar = true;
                        this.enableSidebar();
                        break;

                    case this.CTAAS_DASHBOARD_ROUTE_PATH:
                    case this.CTAAS_TEST_SUITES_ROUTE_PATH:
                    case this.CTAAS_STAKEHOLDERS_ROUTE_PATH:
                    case this.CTAAS_SETUP_PATH:
                        this.tabName = Constants.CTAAS_TOOL_BAR;
                        this.hideToolbar = false;
                        this.isTransparentToolbar = false;
                        this.enableSidebar();
                        break;
                    default:
                        this.tabName = Constants.TEK_TOKEN_TOOL_BAR;
                        this.hideToolbar = false;
                        this.isTransparentToolbar = false;
                        this.enableSidebar();
                        break;
                }
            }
        });
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
            this.initalizeSidebarItems();
        });
        this.broadcastService.msalSubject$.pipe(
            filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
            takeUntil(this._destroying$)
        ).subscribe(event => {
            this.currentUser = true;
            this.autoLogoutService.restartTimer();
            this.initalizeSidebarItems();
            this.onRouteChanges();
        });
    }
    /**
     * initalize the items required for side nav bar
     */
    initalizeSidebarItems(): void {
        const accountDetails = this.getAccountDetails();
        const { roles }  = accountDetails.idTokenClaims;
        this.displayedSideBarItems = Utility.getNavbarOptions(roles, this.fullSideBarItems);
    }
    /**
     * perform changes on Toolbar on refresh
     */
    private performChangeOnToolbar(): void {
        const { location: { href } } = window;
        if (href) {
            this.currentRoutePath = (href.split('/#').length > 0) ? href.split('/#')[1] : '';
            console.debug('currentRoute | ', this.currentRoutePath);
            // this.hideToolbar = (currentRoute !== this.APPS_ROUTE_PATH);
            // this.isTransparentToolbar = (currentRoute === this.APPS_ROUTE_PATH);
        }
        const value = JSON.parse(localStorage.getItem('toolbarDetails'));
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
     * mark the selected nav item here as active to apply styles
     * @param item: any 
     */
    onSelectedNavItem(item: any): void {
        this.displayedSideBarItems.forEach((e: any) => {
            if (e.name === item.name)
                e.active = true;
            else
                e.active = false;
        });
        const { path } = item;
        const componentRoute = this.baseCtaasURL + path;
        this.router.navigate([componentRoute]);
    }
    /**
     * enable side bar based on the service and this feature is enabled only when CTaaS_Feature is enabled
     * @returns: boolean 
     */
    enableSidebar(): boolean {
        if (this.isCtaasFeatureEnabled() && this.currentRoutePath.includes(this.baseCtaasURL)) {
            this.fullSideBarItems.forEach((e: any) => {
                if (this.baseCtaasURL + e.path === this.currentRoutePath)
                    e.active = true;
                else
                    e.active = false;
            });
            return true;
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
    /**
     * get logged in account details 
     * @returns: any | null 
     */
    private getAccountDetails(): any | null {
        return this.msalService.instance.getActiveAccount() || null;
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}
