import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Constants } from 'src/app/helpers/constants';
import { OnboardWizardComponent } from '../onboard-wizard/onboard-wizard.component';
import { MsalService } from '@azure/msal-angular';
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { ICtaasSetup } from 'src/app/model/ctaas-setup.model';
import { IReportEmbedConfiguration, models, service } from 'powerbi-client';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

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
export class CtaasDashboardComponent implements OnInit, OnDestroy {

  onboardSetupStatus: string = '';
  isOnboardingComplete: boolean;
  loggedInUserRoles: string[] = [];
  ctaasSetupDetails: any = {};
  subaccountId: string = '';
  hasDashboardDetails: boolean = false;
  isLoadingResults: boolean = false;
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
          const { detail: { message, errorCode } } = event;
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
    private snackBarService: SnackBarService
  ) { }

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
    this.fetchCtaasDashboardDetailsBySubaccount();
  }
  /**
   * fetch SpotLight Setup details by subaccount id
   */
  fetchCtaasSetupDetails(): void {
    const currentSubaccountDetails = JSON.parse(localStorage.getItem(Constants.CURRENT_SUBACCOUNT));
    const { id } = currentSubaccountDetails;
    this.subaccountId = id;
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
      dialogRef = this.dialog.open(OnboardWizardComponent, { width: '700px', height: '500px', disableClose: true });
    }
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res === 'closed') {
        this.updateOnboardingStatus();
      }
    });
  }
  /**
   * update spotlight onboarding details
   */
  updateOnboardingStatus(): void {
    const { id } = this.ctaasSetupDetails;
    const requestPayload = { onBoardingComplete: 't', ctaasSetupId: id };
    this.ctaasSetupService.updateSubaccountCtaasDetails(requestPayload).subscribe((response: any) => {
      console.debug('response | ', response);
    });
  }
  /**
   * fetch SpotLight Power BI dashboard required details
   */
  fetchCtaasDashboardDetailsBySubaccount(): void {
    this.isLoadingResults = true;
    this.ctaasDashboardService.getCtaasDashboardDetails(this.subaccountId).subscribe((response: { powerBiInfo: IPowerBiReponse }) => {
      this.isLoadingResults = false;
      const { powerBiInfo } = response;
      if (powerBiInfo) {
        const { embedUrl, embedToken } = powerBiInfo;
        this.reportConfig = {
          type: 'report',
          embedUrl,
          tokenType: models.TokenType.Embed,
          accessToken: embedToken,
          settings: undefined
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
  ngOnDestroy(): void {
  }
}
