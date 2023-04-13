import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MsalService} from '@azure/msal-angular';
import { Constants } from '../helpers/constants';
import {tekVizionServices} from '../helpers/tekvizion-services';
import {ICtaasSetup} from '../model/ctaas-setup.model';
import {IService} from '../model/service.model';
import {OnboardWizardComponent} from '../modules/ctaas/ctaas-onboard-wizard/ctaas-onboard-wizard.component';
import {AvailableServicesService} from '../services/available-services.service';
import {CtaasSetupService} from '../services/ctaas-setup.service';
import {SubAccountService} from '../services/sub-account.service';
import { SnackBarService } from '../services/snack-bar.service';

@Component({
    selector: 'app-my-apps',
    templateUrl: './my-apps.component.html',
    styleUrls: ['./my-apps.component.css']
})
export class MyAppsComponent implements OnInit {
    availableServices: IService[] = [];
    onboardSetupStatus: string = '';
    isOnboardingComplete: boolean;
    loggedInUserRoles: string[] = [];
    ctaasSetupDetails: any = {};
    currentSubaccountDetails: any = {};
    isDataLoading = false;
    subaccountId: any;

    constructor(
        private router: Router,
        private availabeService: AvailableServicesService,
        private ctaasSetupService: CtaasSetupService,
        private subaccountService: SubAccountService,
        private dialog: MatDialog,
        private msalService: MsalService,
        private route: ActivatedRoute,
        private snackBarService: SnackBarService,
    ) {
        this.route.queryParams.subscribe((query:Params) => {
            this.subaccountId = query.subaccountId;
        });
    }

    ngOnInit(): void {
        this.currentSubaccountDetails = this.subaccountService.getSelectedSubAccount();
        const accountDetails = this.getAccountDetails();
        this.loggedInUserRoles = accountDetails.idTokenClaims.roles;
        this.getAvailableServices(accountDetails.idTokenClaims.roles);
        this.fetchCtaasSetupDetails();
    }

    /**
     * get logged in account details
     * @returns: any | null
     */
    private getAccountDetails(): any | null {
        return this.msalService.instance.getActiveAccount() || null;
    }

    /**
     * get available services
     */
    private getAvailableServices(roles?: string) {
        const response = this.availabeService.fetchAllAvailabeServices();
        if (response.length > 0) {
            this.availableServices = response.filter((x: IService) => x.enabled === true);
            // get the current logged in subaccount details
            if (this.currentSubaccountDetails) {
                let {services} = this.currentSubaccountDetails;
                if ((services === undefined || services === null) && roles)
                    services = roles.includes(Constants.SUBACCOUNT_STAKEHOLDER) ? [tekVizionServices.SpotLight] : [];
                // enable respective access to activated service here
                this.availableServices = this.availableServices.map(e => {
                    if (services.includes(e.value))
                        e.access = true;
                    return e;
                });
            }
        }
    }

    /**
     * navigate to service which is enabled to user
     * @param value: { label: string, value: string, enabled: boolean, access: boolean, routePath: string, tabName: string, transparentToolbar: boolean }
     */
    onClickService(value: { label: string, value: string, enabled: boolean, access: boolean, routePath: string, tabName: string, transparentToolbar: boolean }): void {
        const {enabled, routePath} = value;
        if (enabled) {
            this.router.navigate([routePath], {queryParams:{subaccountId:this.subaccountId}});
        }
    }

    /**
     * fetch Ctaas Setup details by subaccount id
     */
    fetchCtaasSetupDetails(): void {
        this.isDataLoading = true;
        const {id, subaccountId} = this.currentSubaccountDetails;
        const SUB_ACCOUNT_ID = (id) ? id : subaccountId;
        this.subaccountId = SUB_ACCOUNT_ID;
        this.ctaasSetupService.getSubaccountCtaasSetupDetails(SUB_ACCOUNT_ID)
            .subscribe((response: { ctaasSetups: ICtaasSetup[] }) => {
                if (response) {
                    this.ctaasSetupDetails = response['ctaasSetups'][0];
                    const {onBoardingComplete, status} = this.ctaasSetupDetails;
                    this.isOnboardingComplete = onBoardingComplete;
                    this.onboardSetupStatus = status;
                    this.setupCustomerOnboardDetails();
                    this.isDataLoading = false;
                } else {
                    this.snackBarService.openSnackBar('Error fetching setup details!', '');
                    this.isDataLoading = false;
                }
            }, (err) => {
                this.snackBarService.openSnackBar(err.error, 'Error fetching setup details!');
                this.isDataLoading = false;
            });
    }

    /**
     * setup customer onboarding details
     */
    setupCustomerOnboardDetails(): void {
        // only open onboarding wizard dialog/modal when onboardingcomplete is f and index !==-1
        if ((!this.isOnboardingComplete && this.loggedInUserRoles.includes(Constants.SUBACCOUNT_ADMIN))) {
            this.dialog.open(OnboardWizardComponent, {
                width: '700px',
                maxHeight: '80vh',
                disableClose: true,
                data: {ctaasSetupId:this.ctaasSetupDetails.id, ctaasSetupSubaccountId:this.subaccountId}
            });
        }
    }


    ngOnDestory(): void {
    }
}
