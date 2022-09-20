import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Constants } from 'src/app/helpers/constants';
import { CustomerOnboardService } from 'src/app/services/customer-onboard.service';
import { HeaderService } from 'src/app/services/header.service';
import { OnboardWizardComponent } from '../onboard-wizard/onboard-wizard.component';
import { MsalService } from '@azure/msal-angular';
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { ICtaasSetup } from 'src/app/model/ctaas-setup.model';
@Component({
  selector: 'app-ctaas-dashboard',
  templateUrl: './ctaas-dashboard.component.html',
  styleUrls: ['./ctaas-dashboard.component.css']
})
export class CtaasDashboardComponent implements OnInit, OnDestroy {

  onboardSetupStatus: string = '';
  isOnboardingComplete: boolean;
  loggedInUserRoles: string[] = [];
  ctaasSetupDetails: any = {};
  constructor(
    private dialog: MatDialog,
    private msalService: MsalService,
    private ctaasSetupService: CtaasSetupService
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
    const { idTokenClaims: { roles } } = accountDetails;
    this.loggedInUserRoles = roles;
  }
  /**
   * fetch Ctaas Setup details by subaccount id
   */
  fetchCtaasSetupDetails(): void {
    const currentSubaccountDetails = JSON.parse(localStorage.getItem(Constants.CURRENT_SUBACCOUNT));
    const { id } = currentSubaccountDetails;
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(id)
      .subscribe((response: { ctaasSetups: ICtaasSetup[] }) => {
        // const setupDetails: ICtaasSetup = response['ctaasSetups'][0];
        this.ctaasSetupDetails = response['ctaasSetups'][0];
        const { onBoardingComplete, status } = this.ctaasSetupDetails;
        this.isOnboardingComplete = (onBoardingComplete === 'f'); // t- true | f - false
        this.onboardSetupStatus = status;
        this.setupCustomerOnboardDetails();
      });
  }
  /**
   * setup customer onboarding details
   */
  setupCustomerOnboardDetails(): void {
    let dialogRef;
    const index = this.loggedInUserRoles.findIndex(e => e.includes('customer.SubaccountAdmin'));
    // only open onboarding wizard dialog/modal when onboardingcomplete is f and index !==-1
    if ((this.isOnboardingComplete && index !== -1)) {
      setTimeout(() => {
        dialogRef = this.dialog.open(OnboardWizardComponent, { width: '700px', height: '500px', disableClose: true });
      }, 0);
    }
    dialogRef.afterClosed().subscribe((res: any) => {
      this.updateOnboardingStatus();
    });
  }
  /**
   * update ctaas onboarding details
   */
  updateOnboardingStatus(): void {
    const { id } = this.ctaasSetupDetails;
    const requestPayload = { onBoardingComplete: 't', ctaasSetupId: id };
    this.ctaasSetupService.updateSubaccountCtaasDetails(requestPayload).subscribe((response: any) => {
      console.debug('response | ', response);
    });
  }

  ngOnDestroy(): void {
  }
}
