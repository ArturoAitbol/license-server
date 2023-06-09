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
import { MatSidenav } from '@angular/material/sidenav';
import { Constants } from './helpers/constants';
import { Utility } from './helpers/utils';
import { MediaMatcher } from '@angular/cdk/layout';
import { ViewProfileComponent } from './generics/view-profile/view-profile.component';
import { UserProfileService } from './services/user-profile.service';
import { SubAccountService } from './services/sub-account.service';
import { CustomerService } from './services/customer.service';
import { BehaviorSubject, Subscription } from "rxjs";
import { ISidebar } from './model/sidebar.model';
import { FeatureToggleService } from './services/feature-toggle.service';


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
    tabName: string = Constants.TEK_TOKEN_TOOL_BAR;
    previousDisplayedItemsSubscription: Subscription = null;
    @ViewChild('sidenav') sidenav: MatSidenav;
    fullSideBarItems: any = {
        spotlight: [
            {
                name: 'Dashboard',
                iconName: "assets\\images\\analytics.png",
                path: 'visualization',
                active: false,
                materialIcon: 'analytics',
                baseUrl: '/spotlight/',
                isPreview: false
            },
            {
                name: 'Notes',
                iconName: "assets\\images\\note.png",
                path: 'notes',
                active: false,
                materialIcon: 'description',
                baseUrl: '/spotlight/',
                isPreview: false
            },
            {
                name: 'Test Suites',
                iconName: "assets\\images\\project_3.png",
                path: 'test-suites',
                active: false,
                materialIcon: 'folder_open',
                baseUrl: '/spotlight/',
                isPreview: false
            },
            {
                name: 'Stakeholders',
                iconName: "assets\\images\\multiple-users.png",
                path: 'stakeholders',
                active: false,
                materialIcon: 'groups',
                baseUrl: '/spotlight/',
                isPreview: false
            },
            {
                name: 'Test Reports',
                iconName: "assets\\images\\project_3.png",
                path: 'reports',
                active: false,
                materialIcon: 'folder_copy',
                baseUrl: '/spotlight/',
                isPreview: false
            },
            {
                name: 'Configuration',
                iconName: "assets\\images\\tune.png",
                path: 'setup',
                active: false,
                materialIcon: 'tune',
                baseUrl: '/spotlight/',
                isPreview: false
            },

        ],
        main: [
            {
                name: 'Home',
                iconName: "assets\\images\\dashboard_3.png",
                path: 'dashboard',
                active: true,
                materialIcon: 'home',
                baseUrl: '/',
                isPreview: false
            },
            {
                name: 'Subscriptions',
                iconName: "assets\\images\\dashboard_3.png",
                path: 'subscriptions-overview',
                active: false,
                materialIcon: 'event_repeat',
                baseUrl: '/',
                isPreview: false
            },
            {

                name: 'Devices',
                iconName: "assets\\images\\dashboard_3.png",
                path: 'devices',
                active: false,
                materialIcon: 'devices',
                baseUrl: '/',
                isPreview: false
            },
            {
                name: 'Consumption Matrix',
                path: 'consumption-matrix',
                active: false,
                materialIcon: 'grid_on',
                baseUrl: '/',
                isPreview: false
            },
            {
                name: 'Feature Toggles',
                path: 'feature-toggles',
                active: false,
                materialIcon: 'toggle_on',
                baseUrl: '/',
                isPreview: false
            },
        ]
    };
    allowedSideBarItems = {
        spotlight: new BehaviorSubject([]),
        main: new BehaviorSubject([])
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
    readonly CTAAS_POWERBI_REPORT_ROUTE_PATH: string = '/spotlight/visualization';
    readonly CTAAS_TEST_SUITES_ROUTE_PATH: string = '/spotlight/test-suites';
    readonly CTAAS_STAKEHOLDERS_ROUTE_PATH: string = '/spotlight/stakeholders';
    readonly CTAAS_SETUP_PATH: string = '/spotlight/setup';
    readonly SPOTLIGHT_NOTES_PATH: string = '/spotlight/notes';
    readonly SPOTLIGHT_TEST_REPORTS: string = '/spotlight/reports'
    readonly MAIN_DASHBOARD = '/dashboard';
    readonly SUBSCRIPTIONS_OVERVIEW = '/subscriptions-overview';
    private subaccountId: any;
    readonly DEVICES = '/devices';
    readonly CONSUMPTION_MATRIX = '/consumption-matrix';
    readonly FEATURE_TOGGLES = '/feature-toggles';

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
        private customerService: CustomerService,
        private featureToggleService: FeatureToggleService
    ) {
        this.route.queryParams.subscribe((query: Params) => {
            this.subaccountId = query.subaccountId;
            if (this.subaccountId) {
                //if subaccountId from url has a value we need to retrieve the details
                const oldSubaccountDetails = this.subaccountService.getSelectedSubAccount();
                if (!oldSubaccountDetails.id) {
                    //if old subaccount details are empty set only the id before requesting the rest of the data 
                    this.subaccountService.setSelectedSubAccount({ id: this.subaccountId });
                    this.retrieveSubaccountDetails();
                } else if (oldSubaccountDetails.id !== this.subaccountId || !oldSubaccountDetails.name) {
                    //if old selected subaccount id is different to the new selected subaccount id retrieve the rest of the details
                    this.retrieveSubaccountDetails();
                }
            }
            this.onRouteChanges();
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
    }

    private retrieveSubaccountDetails() {
        this.subaccountService.getSubAccountDetails(this.subaccountId).subscribe((subaccountsResp: any) => {
            let selectedSubAccount = subaccountsResp.subaccounts[0];
            this.customerService.getCustomerById(selectedSubAccount.customerId).subscribe((customersResp: any) => {
                const subaccountCustomer = customersResp.customers[0];
                selectedSubAccount.id = this.subaccountId;
                selectedSubAccount.customerName = subaccountCustomer.name;
                selectedSubAccount.testCustomer = subaccountCustomer.testCustomer;
                selectedSubAccount.customerType = subaccountCustomer.customerType;
                selectedSubAccount.distributorId = subaccountCustomer.distributorId;
                selectedSubAccount.adminEmails = subaccountCustomer.adminEmails;
                selectedSubAccount.customerId = selectedSubAccount.customerId;
                selectedSubAccount.subaccountId = this.subaccountId;
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
                        this.enableSidebar();
                        break;
                    case this.APPS_ROUTE_PATH:
                        this.tabName = '';
                        this.hideToolbar = true;
                        this.enableSidebar();
                        break;
                    case this.CTAAS_DASHBOARD_ROUTE_PATH:
                    case this.CTAAS_POWERBI_REPORT_ROUTE_PATH:
                    case this.CTAAS_TEST_SUITES_ROUTE_PATH:
                    case this.CTAAS_STAKEHOLDERS_ROUTE_PATH:
                    case this.CTAAS_SETUP_PATH:
                    case this.SPOTLIGHT_NOTES_PATH:
                    case this.SPOTLIGHT_TEST_REPORTS:
                        this.tabName = Constants.CTAAS_TOOL_BAR;
                        this.hideToolbar = false;
                        if (this.previousDisplayedItemsSubscription) {
                            this.previousDisplayedItemsSubscription.unsubscribe();
                        }
                        this.previousDisplayedItemsSubscription = this.allowedSideBarItems.spotlight.subscribe(res => {
                            this.displayedSideBarItems = res;
                            this.validateSideBarItem();
                        });
                        this.enableSidebar();
                        break;
                    case this.MAIN_DASHBOARD:
                    case this.SUBSCRIPTIONS_OVERVIEW:
                    case this.DEVICES:
                    case this.CONSUMPTION_MATRIX:
                    case this.FEATURE_TOGGLES:
                        this.tabName = Constants.TEK_TOKEN_TOOL_BAR;
                        this.hideToolbar = false;
                        if (this.previousDisplayedItemsSubscription) {
                            this.previousDisplayedItemsSubscription.unsubscribe();
                        }
                        this.previousDisplayedItemsSubscription = this.allowedSideBarItems.main.subscribe(res => {
                            this.displayedSideBarItems = res;
                            this.validateSideBarItem();
                        });
                        this.enableSidebar();
                        break;
                    default:
                        // if route contains spotlight details
                        if (this.currentRoutePath.includes('/spotlight/details')) {
                            this.tabName = Constants.CTAAS_TOOL_BAR;
                            if (this.previousDisplayedItemsSubscription) {
                                this.previousDisplayedItemsSubscription.unsubscribe();
                            }
                            this.previousDisplayedItemsSubscription = this.allowedSideBarItems.spotlight.subscribe(res => {
                                this.displayedSideBarItems = res;
                            });
                        } else {
                            this.tabName = Constants.TEK_TOKEN_TOOL_BAR;
                            if (this.previousDisplayedItemsSubscription) {
                                this.previousDisplayedItemsSubscription.unsubscribe();
                            }
                            this.previousDisplayedItemsSubscription = this.allowedSideBarItems.main.subscribe(res => {
                                this.displayedSideBarItems = res;
                            });
                        }
                        this.hideToolbar = false;
                        this.enableSidebar();
                        break;
                }
                this.validateSideBarItem();
            }
        });
    }

    private validateSideBarItem() {
        this.displayedSideBarItems.forEach((e: any) => {
            if (e.baseUrl + e.path === this.currentRoutePath)
                e.active = true;
            else
                e.active = false;
        });
    }

    ngOnInit() {
        if (!this.isLoggedIn()) {
            this.router.navigate(['/login']);
        }
        this.currentUser = this.isLoggedIn();
        this.autoLogoutService.validateLastActivityTime();
        this.broadcastService.msalSubject$.pipe(
            filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
            takeUntil(this._destroying$)
        ).subscribe((result: EventMessage) => {
            // Do something with event payload here 
            this.initializeSideBarItems();
        });
        this.broadcastService.msalSubject$.pipe(
            filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
            takeUntil(this._destroying$)
        ).subscribe(event => {
            this.currentUser = true;
            this.autoLogoutService.restartTimer();
        });
    }

    /**
     * initalize the items required for side nav bar
     */
    initializeSideBarItems(): void {
        try {
            const accountDetails = this.getAccountDetails();
            const { roles } = accountDetails.idTokenClaims;
            // check for Power Bi feature toggle, if enabled then only we can see the Power Bi Visuals tab on the side bar
            const SPOTLIGHT_SIDEBAR_ITEMS_LIST: any[] = this.featureToggleService.isFeatureEnabled("powerbiFeature", this.subaccountId) ?
                this.fullSideBarItems.spotlight :
                this.fullSideBarItems.spotlight.filter((e: ISidebar) => e.path !== 'visualization');
            this.allowedSideBarItems.spotlight.next(Utility.getNavbarOptions(roles, SPOTLIGHT_SIDEBAR_ITEMS_LIST));
            this.allowedSideBarItems.main.next(Utility.getNavbarOptions(roles, this.fullSideBarItems.main));
        } catch (e) {
            console.error('Error while initalizing sidebar items: ', e);
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
        if (roles.includes(Constants.SUBACCOUNT_ADMIN) || roles.includes(Constants.SUBACCOUNT_STAKEHOLDER))
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
            sessionStorage.clear();
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
        const { baseUrl, path } = item;
        const componentRoute = baseUrl + path;
        this.router.navigate([componentRoute], { queryParams: { subaccountId: this.subaccountId } });
        if (this.mobileQuery.matches) this.snav.toggle();
    }

    /**
     * enable sidebar based on the service
     * @returns: boolean 
     */
    enableSidebar(): boolean {
        this.displayedSideBarItems.forEach((e: any) => {
            if (e.baseUrl + e.path === this.currentRoutePath)
                e.active = true;
            else
                e.active = false;
        });
        return true;
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
        if (this.previousDisplayedItemsSubscription) {
            this.previousDisplayedItemsSubscription.unsubscribe();
        }
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}
