import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OnboardWizardComponent } from '../onboard-wizard/onboard-wizard.component';
import { MsalService } from '@azure/msal-angular';
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { ICtaasSetup } from 'src/app/model/ctaas-setup.model';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { ReportType } from 'src/app/helpers/report-type';
import { forkJoin, interval, Observable, Subscription } from 'rxjs';
import { Constants } from 'src/app/helpers/constants';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { IReportEmbedConfiguration, models, service } from 'powerbi-client';
import { Router } from '@angular/router';
import { IPowerBiReponse } from 'src/app/model/powerbi-response.model';
import { IDashboardImageResponse } from 'src/app/model/dashboard-image-response.model';

@Component({
    selector: 'app-ctaas-dashboard',
    templateUrl: './ctaas-dashboard.component.html',
    styleUrls: ['./ctaas-dashboard.component.css']
})
export class CtaasDashboardComponent implements OnInit {

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
    refreshNotesIntervalSubscription: Subscription;
    lastModifiedDate: string;
    fontStyleControl = new FormControl('');
    powerBiFontStyleControl = new FormControl('');
    resultantImagesList: IDashboardImageResponse[] = [];
    resultantImagesListBk: IDashboardImageResponse[] = [];
    resultant: any;
    readonly DAILY: string = 'daily';
    readonly WEEKLY: string = 'weekly';
    featureToggleKey: string = 'daily';
    // embedded power bi changes
    // CSS Class to be passed to the wrapper
    // Hide the report container initially
    reportClass = 'report-container-hidden';

    // Flag which specify the type of embedding
    phasedEmbeddingFlag = false;
    powerBiEmbeddingFlag: boolean = false;
    reportConfig: IReportEmbedConfiguration;
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
            'rendered',
            () => {
                console.debug('Report has rendered');
            },
        ],
        [
            'error',
            (event?: service.ICustomEvent<any>) => {
                if (event) {
                    console.error(event.detail);
                    const { detail: { message, errorCode } } = event;
                    if (message && errorCode && message === 'TokenExpired' && errorCode === '403') {
                        this.fetchCtaasPowerBiDashboardDetailsBySubaccount();
                    }
                }
            },
        ],
        ['visualClicked', () => console.debug('visual clicked')],
        ['pageChanged', (event) => console.debug(event)],
    ]);

    readonly LEGACY_MODE: string = 'legacy_view';
    readonly POWERBI_MODE: string = 'powerbi_view';

    viewMode = new FormControl(this.LEGACY_MODE);

    constructor(
        private dialog: MatDialog,
        private msalService: MsalService,
        private ctaasSetupService: CtaasSetupService,
        private ctaasDashboardService: CtaasDashboardService,
        private subaccountService: SubAccountService,
        private snackBarService: SnackBarService,
        private router: Router
    ) { }

    /**
     * get logged in account details
     * @returns: any | null
     */
    private getAccountDetails(): any | null {
        return this.msalService.instance.getActiveAccount() || null;
    }
    ngOnInit(): void {
        this.fontStyleControl.setValue(this.DAILY);
        this.powerBiFontStyleControl.setValue(this.DAILY);
        this.isOnboardingComplete = false;
        this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
        this.fetchCtaasSetupDetails();
        const accountDetails = this.getAccountDetails();
        const { idTokenClaims: { roles } } = accountDetails;
        this.loggedInUserRoles = roles;
        // load the view based on the route
        if (this.router.url.includes('/report-dashboards'))
            this.viewMode.setValue(this.LEGACY_MODE);
        else
            this.viewMode.setValue(this.POWERBI_MODE);
        this.viewDashboardByMode();
        // fetch dashboard report for every 15 minutes interval
        this.refreshIntervalSubscription = interval(Constants.DASHBOARD_REFRESH_INTERVAL)
            .subscribe(() => {
                // Make an http request only in Legacy mode
                if (!this.powerBiEmbeddingFlag)
                    this.fetchCtaasDashboardDetailsBySubaccount();
            });
    }
    /**
    * on change button toggle
    */
    onChangeButtonToggle(): void {
        const { value } = this.fontStyleControl;
        this.resultantImagesList = this.resultantImagesListBk.filter(e => e.reportType.toLowerCase().includes(value));
    }
    onChangePowerBiButtonToggle() {
        const { value } = this.powerBiFontStyleControl;
        this.featureToggleKey = value;
        this.viewDashboardByMode();
    }
    /**
     * fetch SpotLight Setup details by subaccount id
     */
    fetchCtaasSetupDetails(): void {
        // const currentSubaccountDetails = this.subaccountService.getSelectedSubAccount();
        // const { id } = currentSubaccountDetails;
        this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountDetails.id)
            .subscribe((response: { ctaasSetups: ICtaasSetup[] }) => {
                this.ctaasSetupDetails = response['ctaasSetups'][0];
                const { onBoardingComplete, status } = this.ctaasSetupDetails;
                this.isOnboardingComplete = onBoardingComplete;
                this.onboardSetupStatus = status;
                this.setupCustomerOnboardDetails();
            });
    }

    /**
     * setup customer onboarding details
     */
    setupCustomerOnboardDetails(): void {
        // only open onboarding wizard dialog/modal when onboardingcomplete is f and user is SUBACCOUNT_ADMIN
        if ((!this.isOnboardingComplete && this.loggedInUserRoles.includes(Constants.SUBACCOUNT_ADMIN))) {
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
        forkJoin([...requests]).subscribe((res: [{ response?: { lastUpdatedTS: string, imageBase64: string }, error?: string }]) => {
            this.isLoadingResults = false;
            if (res) {
                // get all response without any error messages
                const result: { lastUpdatedTS: string, imageBase64: string, reportType: string, timestampId: string, startDateStr: string, endDateStr: string }[] = [...res]
                    .filter((e: any) => !e.error)
                    .map((e: { response: { lastUpdatedTS: string, imageBase64: string, reportType: string, timestampId: string, startDateStr: string, endDateStr: string } }) => e.response);
                if ((result.length > 0)) {
                    this.hasDashboardDetails = true;
                    const resultant = { daily: [], weekly: [], lastUpdatedDateList: [] };
                    const reportsIdentifiers: any[] = [];
                    result.forEach((e) => {
                        let reportIdentifier = (({ timestampId, reportType }) => ({ timestampId, reportType }))(e);
                        reportsIdentifiers.push(reportIdentifier);

                        if (e.reportType.toLowerCase().includes(this.DAILY)) {
                            resultant.daily.push({ imageBase64: e.imageBase64, reportType: this.getReportNameByType(e.reportType), startDate: e.startDateStr, endDate: e.endDateStr });
                            resultant.lastUpdatedDateList.push(e.lastUpdatedTS);
                        } else if (e.reportType.toLowerCase().includes(this.WEEKLY)) {
                            resultant.weekly.push({ imageBase64: e.imageBase64, reportType: this.getReportNameByType(e.reportType) });
                            resultant.lastUpdatedDateList.push(e.lastUpdatedTS);
                        }
                    });
                    this.ctaasDashboardService.setReports(reportsIdentifiers.length > 0 ? reportsIdentifiers : null);
                    const { daily, weekly, lastUpdatedDateList } = resultant;
                    this.lastModifiedDate = lastUpdatedDateList[0];
                    if (daily.length > 0)
                        this.resultantImagesList.push({ lastUpdatedTS: lastUpdatedDateList[0], reportType: this.DAILY, imagesList: daily });
                    if (weekly.length > 0)
                        this.resultantImagesList.push({ lastUpdatedTS: lastUpdatedDateList[0], reportType: this.WEEKLY, imagesList: weekly });
                    this.resultantImagesListBk = [...this.resultantImagesList];
                    if (this.resultantImagesListBk.length > 0) {
                        this.onChangeButtonToggle();
                    }
                }
                this.hasDashboardDetails = this.checkForDashboardDetails();
            } else {
                this.resultantImagesList = this.resultantImagesListBk = [];
                this.hasDashboardDetails = this.checkForDashboardDetails();
            }
        }, (e) => {
            this.resultantImagesList = this.resultantImagesListBk = [];
            this.hasDashboardDetails = this.checkForDashboardDetails();
            this.isLoadingResults = false;
            console.error('Error loading dashboard reports | ', e.error);
            this.snackBarService.openSnackBar('Error loading dashboard, please connect tekVizion admin', 'Ok');
        });
    }
    /**
     * show/hide last updated element by condition
     * @param index: string 
     * @returns: boolean 
     */
    showLastUpdatedTSByCondition(index: string): boolean {
        return this.lastModifiedDate && (+index) === 0;
    }
    /**
     * get report name by report type
     * @param reportType: string 
     * @returns: string 
     */
    getReportNameByType(reportType: string): string {
        switch (reportType) {
            case ReportType.DAILY_FEATURE_FUNCTIONALITY: return 'Feature Functionality';
            case ReportType.DAILY_CALLING_RELIABILITY: return 'Calling Reliability';
            // case ReportType.DAILY_PESQ: case ReportType.WEEKLY_PESQ: return 'PESQ';  // as media injection is not ready yet, hence disabling PESQ for now.
            case ReportType.WEEKLY_FEATURE_FUNCTIONALITY: return 'Feature Functionality & Calling Reliability'
        }
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
        const type = (reportType === 'Feature Functionality') ? ReportType.DAILY_FEATURE_FUNCTIONALITY : (reportType === 'Calling Reliability') ? ReportType.DAILY_CALLING_RELIABILITY : '';
        const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&type=${type}&start=${startDate}&end=${endDate}`;
        window.open(url);
        window.close();
    }
    /**
     * fetch SpotLight Power BI dashboard required details
     */
    fetchCtaasPowerBiDashboardDetailsBySubaccount(): void {
        this.isLoadingResults = true;
        this.hasDashboardDetails = false;
        this.ctaasDashboardService.getCtaasPowerBiDashboardDetails(this.subaccountDetails.id)
            .subscribe((response: { powerBiInfo: IPowerBiReponse }) => {
                this.isLoadingResults = false;
                const { daily, weekly } = response.powerBiInfo;
                if (response.powerBiInfo) {
                    if (this.featureToggleKey === this.DAILY) {
                        const { embedUrl, embedToken } = daily;
                        this.fetchData(embedUrl, embedToken)
                    }
                    else {
                        const { embedUrl, embedToken } = weekly;
                        this.fetchData(embedUrl, embedToken)
                    }

                } else {
                    this.hasDashboardDetails = false;
                }
            }, (err) => {
                this.hasDashboardDetails = false;
                this.isLoadingResults = false;
                console.error('Error while loading embedded powerbi report: ', err);
                this.snackBarService.openSnackBar('Error loading dashboard, please connect tekVizion admin', 'Ok');
            });
    }

    /**
     * Fetching Data based on toggle feature
     * @param url 
     * @param token 
     */
    fetchData(embedUrl, token) {
        if (embedUrl && token) {
            this.reportConfig = {
                type: 'report',
                embedUrl,
                tokenType: models.TokenType.Embed,
                accessToken: token,
                settings: {
                    filterPaneEnabled: false,
                    navContentPaneEnabled: false,
                    layoutType: models.LayoutType.Custom,
                    customLayout: {
                        displayOption: models.DisplayOption.FitToWidth
                    }
                }
            };
            this.hasDashboardDetails = true;
        }
    }
    /**
     * view dashboard based on the mode
     * PBRS dashboard - LEGACY mode
     * Embedded PowerBi - PowerBi mode
     */
    viewDashboardByMode(): void {
        switch (this.viewMode.value) {
            case this.POWERBI_MODE:
                this.fetchCtaasPowerBiDashboardDetailsBySubaccount();
                this.powerBiEmbeddingFlag = true;
                break;
            default:
                this.powerBiEmbeddingFlag = false;
                this.fetchCtaasDashboardDetailsBySubaccount();
                break;
        }
    }

    ngOnDestroy(): void {
        if (this.refreshIntervalSubscription)
            this.refreshIntervalSubscription.unsubscribe();
        if (this.refreshNotesIntervalSubscription)
            this.refreshNotesIntervalSubscription.unsubscribe();
    }
}
