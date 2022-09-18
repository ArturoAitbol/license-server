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
  // charts
  runSample: any[];
  testCaseSample: any[];
  view: any[] = [600, 400];

  // options for bar chart

  showXAxis = true;
  showYAxis = true;
  gradient1 = false;
  showLegend1 = true;
  showXAxisLabel = true;
  xAxisLabel = 'Date';
  xAxisLabelForTestCases = 'Test Cases';
  showYAxisLabel = true;
  yAxisLabel = 'Failure Rate';

  // options for pie chart
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition: string = 'below';

  barColorScheme = {
    domain: ['#061F4F']
  };
  constructor(
    private headerService: HeaderService,
    private customerOnboardService: CustomerOnboardService,
    private router: Router,
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
    // this.isOnboardingComplete = localStorage.getItem('onboardingFlag');
    // if ((this.isOnboardingComplete == undefined || this.isOnboardingComplete == null) && !roles.includes('customer.SubaccountStakeholder')) {
    //   localStorage.setItem('onboardingFlag', JSON.stringify(true));
    // }
    this.headerService.onChangeService({ hideToolbar: false, tabName: Constants.CTAAS_TOOL_BAR, transparentToolbar: false });
  }
  /**
   * fetch Ctaas Setup details by subaccount id
   */
  fetchCtaasSetupDetails(): void {
    const currentSubaccountDetails = JSON.parse(localStorage.getItem(Constants.CURRENT_SUBACCOUNT));
    const { id } = currentSubaccountDetails;
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(id)
      .subscribe((response: { ctaasSetups: ICtaasSetup[] }) => {
        const setupDetails: ICtaasSetup = response['ctaasSetups'][0];
        const { onBoardingComplete, status } = setupDetails;
        this.isOnboardingComplete = (onBoardingComplete === 'f'); // t- true | f - false
        this.onboardSetupStatus = status;
        this.getCustomerOnboardDetails();
      });
  }
  /**
   * get customer onboarding details,
   * status is hard-coded as 'pending'
   */
  getCustomerOnboardDetails(): void {
    // this.onboardSetupStatus = this.customerOnboardService.fetchCustomerOnboardingDetails('');
    // this.isOnboardingComplete = JSON.parse(localStorage.getItem('onboardingFlag'));
    // if (this.isOnboardingComplete === 'true' || this.isOnboardingComplete === true)
    console.debug('isOnboardingComplete | ', this.isOnboardingComplete);
    const index = this.loggedInUserRoles.findIndex(e => e.includes('customer.SubaccountAdmin'));
    // only open onboarding wizard dialog/modal when onboardingcomplete is f and index !==-1
    if (this.isOnboardingComplete && index !== -1)
      setTimeout(() => {
        this.dialog.open(OnboardWizardComponent, { width: '700px', height: '500px', disableClose: true });
      }, 0);
  }
  ngOnDestroy(): void {
    this.dialog.closeAll();
  }
}
