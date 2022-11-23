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
    imagesList: string[] = [];
    refreshIntervalSubscription: Subscription;
    lastModifiedDate: string;
    fontStyleControl = new FormControl('');
    fontStyle?: string;
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
        this.fontStyleControl.setValue('daily');
        this.isOnboardingComplete = false;
        this.fetchCtaasSetupDetails();
        const accountDetails = this.getAccountDetails();
        const { idTokenClaims: { roles } } = accountDetails;
        this.loggedInUserRoles = roles;
        this.fetchCtaasDashboardDetailsBySubaccount(this.fontStyleControl.value);
        // fetch dashboard report for every 15 minutes interval
        this.refreshIntervalSubscription = interval(Constants.DASHBOARD_REFRESH_INTERVAL)
            .subscribe(() => {
                this.fetchCtaasDashboardDetailsBySubaccount(this.fontStyleControl.value);
            });
    }
    /**
     * on change button group
     */
    onChangeButtonGroup(): void {
        this.isLoadingResults = true;
        this.fetchCtaasDashboardDetailsBySubaccount(this.fontStyleControl.value);
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
                data: id
            });
        }
    }

    /**
     * fetch SpotLight Power BI dashboard required details
     */
    fetchCtaasDashboardDetailsBySubaccount(reportType: string): void {
        this.isLoadingResults = true;
        const requests: Observable<any>[] = [];
        for (const key in ReportType) {
            const reportType: string = ReportType[key];
            if (reportType.toLowerCase().includes(reportType))
                // push all the request to an array
                requests.push(this.ctaasDashboardService.getCtaasDashboardDetails(this.subaccountId, reportType));
        }
        forkJoin([...requests]).subscribe((res: [{ response?: { lastUpdatedTS: string, imageBase64: string }, error?: string }]) => {
            if (res) {
                const result = [...res]
                    .filter((e: any) => !e.error)
                    .map((e: { response: { lastUpdatedTS: string, imageBase64: string } }) => e.response);
                this.imagesList = result.map(e => e.imageBase64);
                const length = this.imagesList.length - 1;
                this.lastModifiedDate = result[length].lastUpdatedTS;
                this.isLoadingResults = false;
                if (this.imagesList.length > 0)
                    this.hasDashboardDetails = true;
                else
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
