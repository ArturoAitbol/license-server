import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {OnboardWizardComponent} from '../onboard-wizard/onboard-wizard.component';
import {MsalService} from '@azure/msal-angular';
import {CtaasSetupService} from 'src/app/services/ctaas-setup.service';
import {ICtaasSetup} from 'src/app/model/ctaas-setup.model';
import {IReportEmbedConfiguration, models, service} from 'powerbi-client';
import {CtaasDashboardService} from 'src/app/services/ctaas-dashboard.service';
import {SnackBarService} from 'src/app/services/snack-bar.service';
import {SubAccountService} from 'src/app/services/sub-account.service';

// Handles the embed config response for embedding
export interface ConfigResponse {
    Id: string;
    EmbedUrl: string;
    EmbedToken: {
        Token: string;
    };
}

export interface IPowerBiReponse {
    embedUrl: string;
    embedToken: string;
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
    isLoadingResults = false;
    // CSS Class to be passed to the wrapper
    // Hide the report container initially
    reportClass = 'report-container-hidden';

    // Flag which specify the type of embedding
    phasedEmbeddingFlag = false;
    reportConfig: IReportEmbedConfiguration;
    /**
     * Map of event handlers to be applied to the embedded report
     */
        // Update event handlers for the report by redefining the map using this.eventHandlersMap
        // Set event handler to null if event needs to be removed
        // More events can be provided from here
        // https://docs.microsoft.com/en-us/javascript/api/overview/powerbi/handle-events#report-events
    eventHandlersMap = new Map<string, (event?: service.ICustomEvent<any>) => void>([
        ['loaded', () => console.log('Report has loaded')],
        [
            'rendered',
            () => {
                console.log('Report has rendered');
            },
        ],
        [
            'error',
            (event?: service.ICustomEvent<any>) => {
                if (event) {
                    console.error(event.detail);
                    const {detail: {message, errorCode}} = event;
                    if (message && errorCode && message === 'TokenExpired' && errorCode === '403') {
                        this.fetchCtaasDashboardDetailsBySubaccount();
                    }
                }
            },
        ],
        ['visualClicked', () => console.log('visual clicked')],
        ['pageChanged', (event) => console.log(event)],
    ]);

    constructor(
        private dialog: MatDialog,
        private msalService: MsalService,
        private ctaasSetupService: CtaasSetupService,
        private ctaasDashboardService: CtaasDashboardService,
        private subaccountService: SubAccountService,
        private snackBarService: SnackBarService
    ) {
    }

    /**
     * get logged in account details
     * @returns: any | null
     */
    private getAccountDetails(): any | null {
        return this.msalService.instance.getActiveAccount() || null;
    }

    ngOnInit(): void {
        this.isOnboardingComplete = false;
        this.fetchCtaasSetupDetails();
        const accountDetails = this.getAccountDetails();
        const {idTokenClaims: {roles}} = accountDetails;
        this.loggedInUserRoles = roles;
        this.fetchCtaasDashboardDetailsBySubaccount();
    }

    /**
     * fetch SpotLight Setup details by subaccount id
     */
    fetchCtaasSetupDetails(): void {
        const currentSubaccountDetails = this.subaccountService.getSelectedSubAccount();
        const {id, subaccountId} = currentSubaccountDetails;
        this.subaccountId = subaccountId ? subaccountId : id;
        this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountId)
            .subscribe((response: { ctaasSetups: ICtaasSetup[] }) => {
                this.ctaasSetupDetails = response['ctaasSetups'][0];
                const {onBoardingComplete, status} = this.ctaasSetupDetails;
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
            const {id} = this.ctaasSetupDetails;
            this.dialog.open(OnboardWizardComponent, {
                width: '700px',
                maxHeight: '80vh',
                disableClose: true,
                data: id
            });
        }
    }

    /**
     * fetch SpotLight Power BI dashboard required details
     */
    fetchCtaasDashboardDetailsBySubaccount(): void {
        this.isLoadingResults = true;
        this.ctaasDashboardService.getCtaasDashboardDetails(this.subaccountId).subscribe((response: { powerBiInfo: IPowerBiReponse }) => {
            this.isLoadingResults = false;
            const {powerBiInfo} = response;
            if (powerBiInfo) {
                const {embedUrl, embedToken} = powerBiInfo;
                this.reportConfig = {
                    type: 'report',
                    embedUrl,
                    tokenType: models.TokenType.Embed,
                    accessToken: embedToken,
                    settings: {
                        filterPaneEnabled: false,
                        navContentPaneEnabled: true,
                        layoutType: models.LayoutType.Custom,
                        customLayout: {
                            displayOption: models.DisplayOption.FitToPage
                        }
                    }
                };
                this.hasDashboardDetails = true;
            } else {
                this.hasDashboardDetails = false;
            }
        }, (err) => {
            this.hasDashboardDetails = false;
            this.isLoadingResults = false;
            console.error('Error | ', err);
            this.snackBarService.openSnackBar('Error loading dashboard, please connect tekVizion admin', 'Ok');
        });
    }

}
