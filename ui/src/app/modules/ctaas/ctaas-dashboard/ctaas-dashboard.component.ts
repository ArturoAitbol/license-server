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

export interface IImagesList {
    imageBase64: string;
    reportType: string
}
export interface IResultant {
    lastUpdatedTS: string;
    reportType: string;
    imagesList: IImagesList[]
}
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
    subaccountId = '';
    hasDashboardDetails = false;
    latestNoteLoaded = false;
    isLoadingResults = false;
    dailyImagesList: string[] = [];
    weeklyImagesList: string[] = [];
    refreshIntervalSubscription: Subscription;
    refreshNotesIntervalSubscription: Subscription;
    lastModifiedDate: string;
    fontStyleControl = new FormControl('');
    resultantImagesList: IResultant[] = [];
    resultantImagesListBk: IResultant[] = [];
    resultant: any;
    readonly DAILY: string = 'daily';
    readonly WEEKLY: string = 'weekly';
    constructor(
        private dialog: MatDialog,
        private msalService: MsalService,
        private ctaasSetupService: CtaasSetupService,
        private ctaasDashboardService: CtaasDashboardService,
        private subaccountService: SubAccountService,
        private snackBarService: SnackBarService,
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
        this.isOnboardingComplete = false;
        this.fetchCtaasSetupDetails();
        const accountDetails = this.getAccountDetails();
        const { idTokenClaims: { roles } } = accountDetails;
        this.loggedInUserRoles = roles;
        this.fetchCtaasDashboardDetailsBySubaccount();
        // fetch dashboard report for every 15 minutes interval
        this.refreshIntervalSubscription = interval(Constants.DASHBOARD_REFRESH_INTERVAL)
            .subscribe(() => {
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
    /**
     * fetch SpotLight Setup details by subaccount id
     */
    fetchCtaasSetupDetails(): void {
        const currentSubaccountDetails = this.subaccountService.getSelectedSubAccount();
        const { id, subaccountId } = currentSubaccountDetails;
        this.subaccountId = subaccountId ? subaccountId : id;
        this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountId)
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
        const index = this.loggedInUserRoles.findIndex(e => e.includes('customer.SubaccountAdmin'));
        // only open onboarding wizard dialog/modal when onboardingcomplete is f and index !==-1
        if ((!this.isOnboardingComplete && index !== -1)) {
            const { id } = this.ctaasSetupDetails;
            this.dialog.open(OnboardWizardComponent, {
                width: '700px',
                maxHeight: '80vh',
                disableClose: true,
                data: { ctaasSetupId: id, ctaasSetupSubaccountId: this.subaccountId }
            });
        }
    }

    /**
     * fetch PBRS images SpotLight dashboard required details
     */
    fetchCtaasDashboardDetailsBySubaccount(): void {
        this.isLoadingResults = true;
        this.resultantImagesList = this.resultantImagesListBk = [];
        this.ctaasDashboardService.setReports(null);
        const requests: Observable<any>[] = [];
        // iterate through dashboard reports
        for (const key in ReportType) {
            const reportType: string = ReportType[key];
            // push all the request to an array
            requests.push(this.ctaasDashboardService.getCtaasDashboardDetails(this.subaccountId, reportType));
        }
        // get all the request response in an array
        forkJoin([...requests]).subscribe((res: [{ response?: { lastUpdatedTS: string, imageBase64: string }, error?: string }]) => {
            if (res) {
                // get all response without any error messages
                const result: { lastUpdatedTS: string, imageBase64: string, reportType: string, timestampId: string }[] = [...res]
                    .filter((e: any) => !e.error)
                    .map((e: { response: { lastUpdatedTS: string, imageBase64: string, reportType: string, timestampId: string } }) => e.response);
                this.isLoadingResults = false;
                if (result.length > 0) {
                    this.hasDashboardDetails = true;
                    const resultant = { daily: [], weekly: [], lastUpdatedDateList: [] };
                    const reportsIdentifiers: any[] = [];
                    result.forEach((e) => {
                        let reportIdentifier = (({ timestampId, reportType }) => ({ timestampId, reportType }))(e);
                        reportsIdentifiers.push(reportIdentifier);

                        if (e.reportType.toLowerCase().includes(this.DAILY)) {
                            resultant.daily.push({ imageBase64: e.imageBase64, reportType: this.getReportNameByType(e.reportType) });
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
            case ReportType.DAILY_PESQ: case ReportType.WEEKLY_PESQ: return 'PESQ';
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

    ngOnDestroy(): void {
        if (this.refreshIntervalSubscription)
            this.refreshIntervalSubscription.unsubscribe();
        if (this.refreshNotesIntervalSubscription)
            this.refreshNotesIntervalSubscription.unsubscribe();
    }
}
