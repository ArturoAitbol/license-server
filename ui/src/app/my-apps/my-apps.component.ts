import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Constants } from '../helpers/constants';
import { ICtaasSetup } from '../model/ctaas-setup.model';
import { IService } from '../model/service.model';
import { OnboardWizardComponent } from '../modules/ctaas/onboard-wizard/onboard-wizard.component';
import { AvailableServicesService } from '../services/available-services.service';
import { CtaasSetupService } from '../services/ctaas-setup.service';

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
  subaccountId: string = '';
  constructor(
    private router: Router,
    private availabeService: AvailableServicesService,
    private ctaasSetupService: CtaasSetupService,
    private dialog: MatDialog,
    private msalService: MsalService
  ) { }
  ngOnInit(): void {
    const accountDetails = this.getAccountDetails();
    const { idTokenClaims: { roles } } = accountDetails;
    this.loggedInUserRoles = roles;
    this.getAvailableServices(roles);
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
      const currentSubaccountDetails = JSON.parse(localStorage.getItem(Constants.CURRENT_SUBACCOUNT));
      if (currentSubaccountDetails) {
        let { services } = currentSubaccountDetails;
        if ((services === undefined || services === null) && roles) {
          services = roles.includes('customer.SubaccountStakeholder') ? ['ctaas'] : [];
        }
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
    const { enabled, routePath } = value;
    if (enabled) {
      this.router.navigate([routePath]);
    }
  }
  /**
   * fetch Ctaas Setup details by subaccount id
   */
  fetchCtaasSetupDetails(): void {
    const currentSubaccountDetails = JSON.parse(localStorage.getItem(Constants.CURRENT_SUBACCOUNT));
    const { id } = currentSubaccountDetails;
    this.subaccountId = id;
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(id)
      .subscribe((response: { ctaasSetups: ICtaasSetup[] }) => {
        if (response) {
          this.ctaasSetupDetails = response['ctaasSetups'][0];
          const { onBoardingComplete, status } = this.ctaasSetupDetails;
          this.isOnboardingComplete = (onBoardingComplete === 't'); // t- true | f - false
          this.onboardSetupStatus = status;
          this.setupCustomerOnboardDetails();
        }
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
      dialogRef = this.dialog.open(OnboardWizardComponent, { width: '700px', height: '500px', disableClose: true });
    }
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res === 'closed')
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

  ngOnDestory(): void {
  }
}
