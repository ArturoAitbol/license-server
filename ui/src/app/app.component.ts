import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
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
import { MediaMatcher } from '@angular/cdk/layout';
import { ViewProfileComponent } from './generics/view-profile/view-profile.component';
import { UserProfileService } from './services/user-profile.service';
import { SubAccountService } from './services/sub-account.service';
import { CustomerService } from './services/customer.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly _destroying$ = new Subject<void>();
    @ViewChild('snav') snav;
    mobileQuery: MediaQueryList;
    title = 'license-server';
    currentUser = false;
    // added as part of spotlight feature
    hideToolbar = false;
    isTransparentToolbar = false;
    baseCtaasURL = "/spotlight/";
    // tabName: string = 'tekVizion 360 Portal';
    tabName: string = Constants.TEK_TOKEN_TOOL_BAR;
    @ViewChild('sidenav') sidenav: MatSidenav;
    fullSideBarItems: any = {
        spotlight: [
            {
                name: 'Dashboard',
                iconName: "assets\\images\\dashboard_3.png",
                path: 'report-dashboards',
                active: true,
                materialIcon: 'dashboard',
                baseUrl: '/spotlight/'
            },
            {
                name: 'Notes',
                iconName: "assets\\images\\note.png",
                path: 'notes',
                active: false,
                materialIcon: 'description',
                baseUrl: '/spotlight/'
            },
            {
                name: 'Test Suites',
                iconName: "assets\\images\\project_3.png",
                path: 'test-suites',
                active: false,
                materialIcon: 'folder_open',
                baseUrl: '/spotlight/'
            },
            {
                name: 'Stakeholders',
                iconName: "assets\\images\\multiple-users.png",
                path: 'stakeholders',
                active: false,
                materialIcon: 'groups',
                baseUrl: '/spotlight/'
            },
            {
                name: 'Test Reports',
                iconName: "assets\\images\\project_3.png",
                path: 'reports',
                active: false,
                materialIcon: 'folder_copy',
                baseUrl: '/spotlight/'
            },
            {
                name: 'Configuration',
                iconName: "assets\\images\\tune.png",
                path: 'setup',
                active: false,
                materialIcon: 'tune',
                baseUrl: '/spotlight/'
            }
        ],
        main: [
            {
                name: 'Home',
                iconName: "assets\\images\\dashboard_3.png",
                path: 'dashboard',
                active: true,
                materialIcon: 'home',
                baseUrl: '/'
            },
            {
                name: 'Subscriptions',
                iconName: "assets\\images\\dashboard_3.png",
                path: 'subscriptions-overview',
                active: false,
                materialIcon: 'event_repeat',
                baseUrl: '/'
            },
        ]
    };
    allowedSideBarItems: any = {
        spotlight: [],
        main: []
    };
    displayedSideBarItems: any[] = [
        {
            name: 'Dashboard',
            iconName: "assets\\images\\dashboard_3.png",
            path: 'report-dashboards',
            active: true,
            materialIcon: 'dashboard'
        }
    ];

    currentRoutePath = '';
    // routes
    readonly REDIRECT_ROUTE_PATH: string = '/redirect';
    readonly APPS_ROUTE_PATH: string = '/apps';
    readonly CTAAS_DASHBOARD_ROUTE_PATH: string = '/spotlight/report-dashboards';
    readonly CTAAS_TEST_SUITES_ROUTE_PATH: string = '/spotlight/test-suites';
    readonly CTAAS_STAKEHOLDERS_ROUTE_PATH: string = '/spotlight/stakeholders';
    readonly CTAAS_SETUP_PATH: string = '/spotlight/setup';
    readonly SPOTLIGHT_NOTES_PATH: string = '/spotlight/notes';
    readonly SPOTLIGHT_TEST_REPORTS: string = '/spotlight/reports'
    readonly MAIN_DASHBOARD = '/dashboard';
    readonly SUBSCRIPTIONS_OVERVIEW = '/subscriptions-overview';
    private subaccountId: any;
    private _mobileQueryListener: () => void;

    constructor(
        private router: Router,
        private msalService: MsalService,
        public dialog: MatDialog,
        private broadcastService: MsalBroadcastService,
        private autoLogoutService: AutoLogoutService,
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        private userProfileService: UserProfileService,
        private route: ActivatedRoute,
        private subaccountService: SubAccountService,
        private customerService: CustomerService
    ) {
        this.route.queryParams.subscribe((query:Params) => {
            this.subaccountId = query.subaccountId;
            if(this.subaccountId) {
                //if subaccountId from url has a value we need to retrieve the details
                const oldSubaccountDetails = this.subaccountService.getSelectedSubAccount();
                if(!oldSubaccountDetails.id) {
                    //if old subaccount details are empty set only the id before requesting the rest of the data 
                    this.subaccountService.setSelectedSubAccount({id:this.subaccountId});
                    this.retrieveSubaccountDetails();
                } else if(oldSubaccountDetails.id !== this.subaccountId || !oldSubaccountDetails.name ) {
                     //if old selected subaccount id is different to the new selected subaccount id retrieve the rest of the details
                    this.retrieveSubaccountDetails();
                }
            }
        });

        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addEventListener("change", this._mobileQueryListener);

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

    private retrieveSubaccountDetails() {
        this.subaccountService.getSubAccountDetails(this.subaccountId).subscribe((subaccountsResp: any) => {
            let selectedSubAccount = subaccountsResp.subaccounts[0];
            this.customerService.getCustomerById(selectedSubAccount.customerId).subscribe((customersResp: any) => {
                const subaccountCustomer = customersResp.customers[0];
                selectedSubAccount.id = this.subaccountId;
                selectedSubAccount.customerName = subaccountCustomer.name;
                selectedSubAccount.testCustomer = subaccountCustomer.testCustomer;
                this.subaccountService.setSelectedSubAccount(selectedSubAccount);
            });
        });
    }
    /**
     * listen for route changes, to manage toolbar based on the route
     */
    onRouteChanges(): void {
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.currentRoutePath = val.urlAfterRedirects.split('?')[0];
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
                    case this.SPOTLIGHT_NOTES_PATH:
                    case this.SPOTLIGHT_TEST_REPORTS:
                        this.tabName = Constants.CTAAS_TOOL_BAR;
                        this.hideToolbar = false;
                        this.isTransparentToolbar = false;
                        this.displayedSideBarItems = this.allowedSideBarItems.spotlight;
                        this.enableSidebar();
                        break;
                    case this.MAIN_DASHBOARD:
                    case this.SUBSCRIPTIONS_OVERVIEW:
                        this.tabName = Constants.TEK_TOKEN_TOOL_BAR;
                        this.hideToolbar = false;
                        this.isTransparentToolbar = false;
                        this.displayedSideBarItems = this.allowedSideBarItems.main;
                        this.enableSidebar();
                        break;
                    default:
                        // if route contains spotlight details
                        if (this.currentRoutePath.includes('/spotlight/details')) {
                            this.tabName = Constants.CTAAS_TOOL_BAR;
                            this.displayedSideBarItems = this.allowedSideBarItems.spotlight;
                        } else {
                            this.tabName = Constants.TEK_TOKEN_TOOL_BAR;
                            this.displayedSideBarItems = this.allowedSideBarItems.main;
                        }
                        this.hideToolbar = false;
                        this.isTransparentToolbar = false;
                        this.enableSidebar();
                        break;
                }
            }
        });
    }

    ngOnInit() {
        if (!this.isLoggedIn()) {
            this.router.navigate(['/login']);
        } else {
            this.currentUser = this.isLoggedIn();
            this.autoLogoutService.validateLastActivityTime();
            this.initalizeSidebarItems();
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
        const { roles } = accountDetails.idTokenClaims;
        this.allowedSideBarItems.spotlight = Utility.getNavbarOptions(roles, this.fullSideBarItems.spotlight);
        this.allowedSideBarItems.main = Utility.getNavbarOptions(roles, this.fullSideBarItems.main);
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
        const accountDetails = this.getAccountDetails();
        const { roles } = accountDetails.idTokenClaims;
        if(roles.includes(Constants.SUBACCOUNT_ADMIN) || roles.includes(Constants.SUBACCOUNT_STAKEHOLDER))
            this.router.navigate(['/']);
        else
            this.router.navigate(['/dashboard']);
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
     * Show User profile Modal
     */
    viewProfile(): void {
        const dialogRef = this.dialog.open(ViewProfileComponent, {
            width: '450px',
            disableClose: false
        });

        dialogRef.afterClosed().subscribe((closedType: string) => {
            if (closedType === 'closed')
                this.fetchUserProfileDetails();
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
        const { baseUrl, path } = item;
        const componentRoute = baseUrl + path;
        this.router.navigate([componentRoute], {queryParams:{subaccountId: this.subaccountId}});
        if (this.mobileQuery.matches) this.snav.toggle();
    }

    /**
     * enable sidebar based on the service and this feature is enabled only when CTaaS_Feature is enabled
     * @returns: boolean 
     */
    enableSidebar(): boolean {
        if ((this.isCtaasFeatureEnabled() && this.currentRoutePath.includes(this.baseCtaasURL)) ||
            this.currentRoutePath === this.MAIN_DASHBOARD || this.currentRoutePath == this.SUBSCRIPTIONS_OVERVIEW) {
            this.displayedSideBarItems.forEach((e: any) => {
                if (e.baseUrl + e.path === this.currentRoutePath)
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
    /**
     * fetch user profile details and save it in local storage
     */
    async fetchUserProfileDetails(): Promise<void> {
        try {
            const res: any = await this.userProfileService.getUserProfileDetails().toPromise()
            if (res) {
                const { userProfile } = res;
                this.userProfileService.setSubaccountUserProfileDetails(userProfile);
            }
        } catch (error) {
            console.error('Error while fetching user profile details | ', error);
        }
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}
