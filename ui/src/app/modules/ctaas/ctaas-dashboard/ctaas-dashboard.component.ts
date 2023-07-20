import { Component, Input, OnDestroy, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OnboardWizardComponent } from '../ctaas-onboard-wizard/ctaas-onboard-wizard.component';
import { MsalService } from '@azure/msal-angular';
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { ICtaasSetup } from 'src/app/model/ctaas-setup.model';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { ReportType, ReportName } from 'src/app/helpers/report-type';
import { forkJoin, interval, Observable, Subscription } from 'rxjs';
import { Constants } from 'src/app/helpers/constants';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { IReportEmbedConfiguration, models, service } from 'powerbi-client';
import { Router } from '@angular/router';
import { IPowerBiReponse } from 'src/app/model/powerbi-response.model';
import { IDashboardImageResponse, IImage } from 'src/app/model/dashboard-image-response.model';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import { BannerService } from "../../../services/banner.service";
import { FeatureToggleService } from 'src/app/services/feature-toggle.service';
import { Subject } from "rxjs/internal/Subject";
import { Utility } from 'src/app/helpers/utils';

@Component({
    selector: 'app-ctaas-dashboard',
    templateUrl: './ctaas-dashboard.component.html',
    styleUrls: ['./ctaas-dashboard.component.css']
})
export class CtaasDashboardComponent implements OnInit, OnDestroy {
    @Input() openedAsModal = false;

    onboardSetupStatus = '';
    isOnboardingComplete: boolean;
    loggedInUserRoles: string[] = [];
    ctaasSetupDetails: any = {};
    private subaccountDetails: any;
    hasDashboardDetails = false;
    latestNoteLoaded = false;
    isLoadingResults = false;
    dailyImagesList: string[] = [];
    weeklyImagesList: string[] = [];
    refreshIntervalSubscription: Subscription;
    subscriptionToFetchDashboard: Subscription;
    lastModifiedDate: string;
    fontStyleControl = new FormControl('');
    powerBiFontStyleControl = new FormControl('');
    resultantImagesList: IDashboardImageResponse[] = [];
    resultantImagesListBk: IDashboardImageResponse[] = [];
    resultant: any;
    readonly DAILY: string = 'daily';
    readonly WEEKLY: string = 'weekly';
    readonly TEST1: string = 'test1';
    readonly TEST2: string = 'test2';
    featureToggleKey: string = 'daily';
    // embedded power bi changes
    // CSS Class to be passed to the wrapper
    // Hide the report container initially
    reportClass = 'report-container-hidden';
    reportRendered: boolean = false;
    // Flag which specify the type of embedding
    phasedEmbeddingFlag = false;
    powerBiEmbeddingFlag: boolean = false;
    reportConfig: IReportEmbedConfiguration | any = {
        id: undefined,
        type: "report",
        embedUrl: undefined,
        accessToken: undefined, // Keep as empty string, null or undefined
        tokenType: models.TokenType.Embed,
        hostname: "https://app.powerbi.com",
        settings: {
            filterPaneEnabled: false,
            navContentPaneEnabled: false,
            background: models.BackgroundType.Transparent,
            layoutType: models.LayoutType.Custom,
            customLayout: {
                displayOption: models.DisplayOption.FitToWidth
            },
            panes: {
                filters: {
                    visible: false
                },
                pageNavigation: {
                    visible: false
                }
            },
            panels: {
                scrollable: true
            }
        },
        viewMode: models.ViewMode.View
    }
    @ViewChild(PowerBIReportEmbedComponent) reportObj!: PowerBIReportEmbedComponent;
    report: any;
    pbiErrorCounter: boolean = false;
    private onDestroy: Subject<void> = new Subject<void>();

    /**
     * Map of event handlers to be applied to the embedded report
     */
    // Update event handlers for the report by redefining the map using this.eventHandlersMap
    // Set event handler to null if event needs to be removed
    // More events can be provided from here
    // https://docs.microsoft.com/en-us/javascript/api/overview/powerbi/handle-events#report-events
    eventHandlersMap = new Map<string, (event?: service.ICustomEvent<any>) => void>([
        ['loaded', () => console.debug('Report has loaded')],
        [
            'error',
            (event?: service.ICustomEvent<any>) => {
                if (event) {
                    console.debug('Error Event: ', event)
                    const { detail: { message, errorCode } } = event;
                    if (message && errorCode && message === 'TokenExpired' && (errorCode === '403' || errorCode === '401') && !this.pbiErrorCounter) {
                        this.pbiErrorCounter = true;
                        this.setPbiReportDetailsInSubaccountDetails(null);
                        this.getRefreshAccessToken();
                    }
                }
            },
        ],
        ['visualClicked', () => console.debug('visual clicked')]
    ]);

    readonly LEGACY_MODE: string = 'legacy_view';
    readonly POWERBI_MODE: string = 'powerbi_view';
    readonly REPORT_TYPE: string = 'report';
    readonly ReportName = ReportName;
    viewMode = new FormControl(this.LEGACY_MODE);
    powerbiReportResponse: IPowerBiReponse;
    enableEmbedTokenCache: boolean = true;
    canRefreshDashboard: boolean = false;
    refresh: boolean = false;
    startTime: number = 0;
    milliseconds: number = 0;
    seconds: number = 0;
    timer: any;
    stopTimer$: Subject<void> = new Subject();
    timerIsRunning = false;
    tabChanged = false;
    @ViewChild('reportEmbed') reportContainerDivElement: any;

    constructor(
        private dialog: MatDialog,
        private msalService: MsalService,
        private ctaasSetupService: CtaasSetupService,
        private ctaasDashboardService: CtaasDashboardService,
        private subaccountService: SubAccountService,
        private snackBarService: SnackBarService,
        private router: Router,
        private bannerService: BannerService
    ) { }

    /**
     * get logged in account details
     * @returns: any | null
     */
    private getAccountDetails(): any | null {
        return this.msalService.instance.getActiveAccount() || null;
    }

    ngAfterViewInit(): void {
        if (this.reportObj) {
            this.report = this.reportObj.getReport();
            this.reportObj.powerbi.bootstrap(this.reportContainerDivElement, this.reportConfig);
        }
    }

    ngOnInit(): void {
        this.tabChanged = true;
        this.fontStyleControl.setValue(this.DAILY);
        this.powerBiFontStyleControl.setValue(this.DAILY);
        this.isOnboardingComplete = false;
        this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
        this.fetchCtaasSetupDetails();
        this.startTimer();
        const accountDetails = this.getAccountDetails();
        const { idTokenClaims: { roles } } = accountDetails;
        this.loggedInUserRoles = roles;
        // load the view based on the route
        this.viewMode.setValue(this.POWERBI_MODE);
        this.viewDashboardByMode();
        // fetch dashboard report for every 15 minutes interval
        this.refreshIntervalSubscription = interval(Constants.LEGACY_DASHBOARD_REFRESH_INTERVAL)
            .subscribe(() => {
                // Make an http request only in Legacy mode
                if (!this.powerBiEmbeddingFlag)
                    this.fetchCtaasDashboardDetailsBySubaccount();
            });
        // fetch dashboard report for every 30 seconds interval
        this.subscriptionToFetchDashboard = interval(30000)
            .subscribe(() => {
                // Make an http request only in PowerBi mode
                if (this.powerBiEmbeddingFlag && this.subaccountDetails) {
                    const { pbiReport: { expiresAt } } = this.subaccountDetails;
                    if (expiresAt) {
                        // Convert the expiration date string to a Date object
                        const tokenExpireDate = new Date(expiresAt);
                        console.debug('token expires at: ', tokenExpireDate);
                        // Calculate the difference between the expiration date and the current time in milliseconds
                        const timeDiff = tokenExpireDate.getTime() - Date.now();
                        console.debug('timeDiff: ', timeDiff);
                        // Check if the difference is less than or equal to 5 minutes (300,000 milliseconds)
                        const within5Mins = timeDiff <= 300000;
                        if (within5Mins) {
                            this.setPbiReportDetailsInSubaccountDetails(null);
                            this.getRefreshAccessToken();
                        }
                    }
                }
            });
    }

    /**
    * on change button toggle
    */
    onChangeButtonToggle(): void {
        const { value } = this.fontStyleControl;
        this.resultantImagesList = this.resultantImagesListBk.filter(e => e.reportType.toLowerCase().includes(value));
    }

    /**
     * on change power bi button toggle
     */
    onChangePowerBiButtonToggle() {
        this.startTimer();
        this.tabChanged = true;
        this.reportRendered = false;
        const { value } = this.powerBiFontStyleControl;
        this.featureToggleKey = value;
        if (this.reportObj) {
            this.report = this.reportObj.getReport();
            this.reportObj.powerbi.reset(this.reportContainerDivElement.containerRef.nativeElement);
        }
        this.viewDashboardByMode();
    }

    /**
     * fetch SpotLight Setup details by subaccount id
     */
    fetchCtaasSetupDetails(): void {
        this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountDetails.id)
            .subscribe((response: { ctaasSetups: ICtaasSetup[] }) => {
                this.ctaasSetupDetails = response['ctaasSetups'][0];
                const { onBoardingComplete, status, maintenance } = this.ctaasSetupDetails;
                this.isOnboardingComplete = onBoardingComplete;
                this.onboardSetupStatus = status;
                this.setupCustomerOnboardDetails();
                if (maintenance) {
                    this.fontStyleControl.setValue(this.WEEKLY);
                    this.fontStyleControl.disable();
                    this.powerBiFontStyleControl.setValue(this.WEEKLY);
                    this.powerBiFontStyleControl.disable();
                    this.onChangePowerBiButtonToggle();
                    this.bannerService.open("ALERT", Constants.MAINTENANCE_MODE_ALERT, this.onDestroy, "alert");
                    this.viewDashboardByMode();
                }
            });
    }

    /**
     * setup customer onboarding details
     */
    setupCustomerOnboardDetails(): void {
        // only open onboarding wizard dialog/modal when onboardingcomplete is f and user is SUBACCOUNT_ADMIN
        if ((!this.isOnboardingComplete && this.loggedInUserRoles.length === 1 && this.loggedInUserRoles.includes(Constants.SUBACCOUNT_ADMIN))) {
            const { id } = this.ctaasSetupDetails;
            this.dialog.open(OnboardWizardComponent, {
                width: '700px',
                maxHeight: '80vh',
                disableClose: true,
                data: { ctaasSetupId: id, ctaasSetupSubaccountId: this.subaccountDetails.id }
            });
        }
    }

    /**
     * fetch PBRS images SpotLight dashboard required details
     */
    fetchCtaasDashboardDetailsBySubaccount(): void {
        this.isLoadingResults = true;
        this.hasDashboardDetails = false;
        this.resultantImagesList = this.resultantImagesListBk = [];
        this.ctaasDashboardService.setReports(null);
        const requests: Observable<any>[] = [];
        // iterate through dashboard reports
        for (const key in ReportType) {
            const reportType: string = ReportType[key];
            // if(key==='WEEKLY_FEATURE_FUNCTIONALITY')
            // push all the request to an array
            requests.push(this.ctaasDashboardService.getCtaasDashboardDetails(this.subaccountDetails.id, reportType));
        }
        // get all the request response in an array
        forkJoin([...requests]).subscribe((res: [{ response?: IImage, error?: string }]) => {
            this.isLoadingResults = false;
            if (res) {
                // get all response without any error messages
                const result: IImage[] = [...res]
                    .filter((e: any) => !e.error)
                    .map((e: { response: IImage }) => e.response);
                if ((result.length > 0)) {
                    this.hasDashboardDetails = true;
                    const resultant = { daily: [], weekly: [] };
                    result.forEach((e) => {
                        if (e.reportType.toLowerCase().includes(this.DAILY)) {
                            resultant.daily.push({ imageBase64: e.imageBase64, reportType: Utility.getReportNameByReportTypeOrTestPlan(e.reportType), startDate: e.startDateStr, endDate: e.endDateStr });
                        } else if (e.reportType.toLowerCase().includes(this.WEEKLY)) {
                            resultant.weekly.push({ imageBase64: e.imageBase64, reportType: Utility.getReportNameByReportTypeOrTestPlan(e.reportType) });
                        }
                    });
                    this.ctaasDashboardService.setReports(result);
                    const { daily, weekly } = resultant;
                    if (daily.length > 0)
                        this.resultantImagesList.push({ reportType: this.DAILY, imagesList: daily });
                    if (weekly.length > 0)
                        this.resultantImagesList.push({ reportType: this.WEEKLY, imagesList: weekly });
                    this.resultantImagesListBk = [...this.resultantImagesList];
                    if (this.resultantImagesListBk.length > 0) {
                        this.onChangeButtonToggle();
                    }
                }
                this.hasDashboardDetails = this.checkForDashboardDetails();
            }
        }, (e) => {
            this.resultantImagesList = this.resultantImagesListBk = [];
            this.hasDashboardDetails = this.checkForDashboardDetails();
            this.isLoadingResults = false;
            console.error('Error loading dashboard reports | ', e.error);
            this.snackBarService.openSnackBar('Error loading dashboard, please contact your TekVizion 360 admin', 'Ok');
        });
    }

    /**
     * check whether dashboard has any data to display or not
     * @returns: boolean 
     */
    checkForDashboardDetails(): boolean {
        return this.resultantImagesList.length > 0;
    }

    /**
     * on click more details
     * @param index: string 
     */
    onClickMoreDetails(index: string): void {
        const obj = this.resultantImagesList[0];
        const { imagesList } = obj;
        const { reportType, startDate, endDate } = imagesList[index];
        const type = Utility.getTAPTestPlaNameByReportTypeOrName(reportType);
        const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${type}&start=${startDate}&end=${endDate}`;
        window.open(url);
    }

    /**
     * fetch SpotLight Power BI dashboard required details
     */
    fetchSpotlightPowerBiDashboardDetailsBySubaccount(): Promise<any> {
        if (this.enableEmbedTokenCache) { // check whether cache embed token is enabled/disabled
            const { pbiReport } = this.subaccountDetails;
            // check if pbiReport is there in the subaccount object from session storage
            if (pbiReport) {
                return new Promise((resolve, reject) => {
                    try {
                        const { daily, weekly, test1, test2, expiresAt } = pbiReport;
                        this.powerbiReportResponse = { daily, weekly, test1, test2, expiresAt };
                        resolve("API request is successful!");
                    } catch (error) {
                        this.powerbiReportResponse = undefined;
                        reject("API request is failed!");
                    }
                });
            }
        }
        // make an API call to fetch Embedded Powerbi details 
        return new Promise((resolve, reject) => {
            this.powerbiReportResponse = undefined;
            this.isLoadingResults = true;
            this.hasDashboardDetails = false;
            this.ctaasDashboardService.getCtaasPowerBiDashboardDetails(this.subaccountDetails.id)
                .subscribe((response: { powerBiInfo: IPowerBiReponse }) => {
                    this.pbiErrorCounter = true;
                    this.isLoadingResults = false;
                    const { daily, weekly, expiresAt, test1, test2 } = response.powerBiInfo;
                    this.powerbiReportResponse = { daily, weekly, test1, test2, expiresAt };
                    this.subaccountDetails = { ... this.subaccountDetails, pbiReport: { daily, weekly, test1, test2, expiresAt } };
                    this.setPbiReportDetailsInSubaccountDetails({ daily, weekly, test1, test2, expiresAt });
                    this.hasDashboardDetails = true;
                    resolve("API request is successful!");
                }, (err) => {
                    this.hasDashboardDetails = false;
                    this.isLoadingResults = false;
                    console.error('Error while loading embedded powerbi report: ', err);
                    this.setPbiReportDetailsInSubaccountDetails(null);
                    this.snackBarService.openSnackBar('Error loading dashboard, please contact your TekVizion 360 admin', 'Ok');
                    reject("API request is failed!");
                });
        });
    }

    /**
     * configure the embedded powerbi report
     * @param embedUrl: string 
     * @param accessToken: string 
     */
    configurePowerbiEmbeddedReport(id: string, embedUrl: string, accessToken: string) {
        if (embedUrl && accessToken) {
            this.reportConfig = {
                ... this.reportConfig,
                id,
                embedUrl,
                accessToken
            };
            this.hasDashboardDetails = true;
        }
    }

    /**
     * view dashboard based on the mode
     * PBRS dashboard - LEGACY mode
     * Embedded PowerBi - PowerBi mode
     */
    async viewDashboardByMode(): Promise<any> {
        switch (this.viewMode.value) {
            case this.POWERBI_MODE:
                // check for powerbi response, if not make an API request to fetch powerbi dashboard details
                if (!this.powerbiReportResponse) {
                    await this.fetchSpotlightPowerBiDashboardDetailsBySubaccount();
                    this.hasDashboardDetails = false;
                }
                if (this.powerbiReportResponse) {
                    this.hasDashboardDetails = true;
                    const { daily, weekly, test1, test2 } = this.powerbiReportResponse;

                    // configure for daily report
                    if (this.featureToggleKey === this.DAILY) {
                        const { id, embedUrl, embedToken } = daily;
                        this.configurePowerbiEmbeddedReport(id, embedUrl, embedToken);
                    } else if (this.featureToggleKey === this.WEEKLY) { // configure for weekly report
                        const { id, embedUrl, embedToken } = weekly;
                        this.configurePowerbiEmbeddedReport(id, embedUrl, embedToken);
                    } else if (this.featureToggleKey === this.TEST1) { // configure for test1 report
                        const { id, embedUrl, embedToken } = test1;
                        this.configurePowerbiEmbeddedReport(id, embedUrl, embedToken);
                    } else if (this.featureToggleKey === this.TEST2) { // configure for test2 report
                        const { id, embedUrl, embedToken } = test2;
                        this.configurePowerbiEmbeddedReport(id, embedUrl, embedToken);
                    }
                }
                this.powerBiEmbeddingFlag = true;
                break;
            case this.LEGACY_MODE:
                this.powerBiEmbeddingFlag = false;
                this.fetchCtaasDashboardDetailsBySubaccount();
                break;
        }
    }

    /**
     * set powerbi report details in subaccount object in session storage
     * @param data: { daily: any, weekly: any } | null
     */
    setPbiReportDetailsInSubaccountDetails(data: IPowerBiReponse | null): void {
        this.subaccountDetails = { ... this.subaccountDetails, pbiReport: data };
        this.subaccountService.setSelectedSubAccount(this.subaccountDetails);
    }

    /**
     * get subaccount id
     * @returns: string
     */
    getSubaccountId(): string {
        return this.subaccountDetails ? this.subaccountDetails.id : "";
    }

    ngOnDestroy(): void {
        if (this.refreshIntervalSubscription)
            this.refreshIntervalSubscription.unsubscribe();
        if (this.subscriptionToFetchDashboard)
            this.subscriptionToFetchDashboard.unsubscribe();
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async refreshDashboard() {
        this.startTimer();
        this.refresh = true;
        this.reportRendered = false;
        const { value } = this.powerBiFontStyleControl;
        this.powerBiEmbeddingFlag = false;
        await this.delay(1);
        this.featureToggleKey = value;
        await this.viewDashboardByMode();
        this.refresh = false;
    }

    getRefreshAccessToken() {
        this.fetchSpotlightPowerBiDashboardDetailsBySubaccount().then(async (res) => {
            if (res === 'API request is successful!') {
                await this.viewDashboardByMode();
            }
        });
    }

    reportFinishedRendering(){
        this.tabChanged = false;
        this.stopTimer();
        this.reportRendered = true;
    }
    startTimer() {
        if(!this.timerIsRunning){
            this.startTime = 0;
            this.seconds=0;
            this.milliseconds = 0;
            this.startTime = performance.now();
            this.timer = interval(1).subscribe(() => {
                const elapsedTime = performance.now() - this.startTime;
                this.seconds = Math.floor(elapsedTime / 1000);
                this.milliseconds = Math.floor(elapsedTime % 1000);
            });
            this.timerIsRunning = true;
        }
    }
    stopTimer() {
        this.timer.unsubscribe();
        this.timerIsRunning = false;
    }

    powerBiPageChanged(){
        this.reportRendered = false;
        this.startTimer();
    }
}
