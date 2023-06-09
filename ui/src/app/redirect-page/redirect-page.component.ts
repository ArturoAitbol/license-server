import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { map } from 'rxjs/operators';
import { Constants } from '../helpers/constants';
import { IService } from '../model/service.model';
import { SubAccount } from '../model/subaccount.model';
import { SubAccountService } from '../services/sub-account.service';
import { AvailableServicesService } from '../services/available-services.service';
import { UserProfileService } from '../services/user-profile.service';
import { tekVizionServices } from '../helpers/tekvizion-services';
import { FeatureToggleService } from "../services/feature-toggle.service";
@Component({
  selector: 'app-redirect-page',
  templateUrl: './redirect-page.component.html',
  styleUrls: ['./redirect-page.component.css']
})
export class RedirectPageComponent implements OnInit {

  private readonly DASHBOARD_ROUTE_PATH: string = '/dashboard';
  private readonly APPS_ROUTE_PATH: string = '/apps';
  private readonly  CONSUMPTION_MATRIX_PATH = '/consumption-matrix';
  loggedInUserRoles: string[] = [];
  currentSubaccountDetails: SubAccount;
  availableServices: IService[] = [];
  constructor(
    private router: Router,
    private msalService: MsalService,
    private subaccountService: SubAccountService,
    private userProfileService: UserProfileService,
    private availabeService: AvailableServicesService,
    private featureTogglesService: FeatureToggleService,
  ) { }

  ngOnInit(): void {
    try {
      this.getAvailableServices();
      const accountDetails = this.getAccountDetails();
      const { idTokenClaims: { roles } } = accountDetails;
      this.loggedInUserRoles = roles;
      if (this.loggedInUserRoles.length == 1 && this.loggedInUserRoles[0] === Constants.DEVICES_ADMIN) {
        // Devices admin does not have permission to access dashboard, so it's a special case
        this.router.navigate([ this.CONSUMPTION_MATRIX_PATH ]);
      } else {
        //get the user's details only if the user logged is subbaccount admin or stakeholder otherwise redirect to the dashboard
        if (this.loggedInUserRoles.includes(Constants.SUBACCOUNT_STAKEHOLDER) || this.loggedInUserRoles.includes(Constants.SUBACCOUNT_ADMIN)) {
          this.fetchUserProfileDetails();
          this.getSubAccountDetails();
        } else {
          this.navigateToDashboard();
        }
      }
    } catch (e) {
      console.error('error at redirect page');
    }
  }
  /**
   * get all available tekVizion services
   * @returns: IService[] 
   */
  private getAvailableServices() {
    const response = this.availabeService.fetchAllAvailabeServices();
    if (response.length > 0) {
      this.availableServices = response.filter((x: IService) => x.enabled === true);
    }
  }
  /**
   * get logged in user's subaccount details
   */
  private getSubAccountDetails(): void {
    this.subaccountService.getSubAccountList().pipe(map((e: SubAccount) => {
        const { services } = e['subaccounts'][0];
        if (services) {
          e['subaccounts'][0]['services'] = services.split(',').map((e: string) => e.trim());
        } else {
          e['subaccounts'][0]['services'] = [];
        }
        return e;
      })).subscribe((res: any) => {
      if (res) {
        const { subaccounts } = res;
        this.currentSubaccountDetails = subaccounts[0];
        this.subaccountService.setSelectedSubAccount(this.currentSubaccountDetails);
        // enable/disable the available services
        this.availableServices.forEach((e: { label: string, value: string, access: boolean }) => {
          if (this.currentSubaccountDetails.services.includes(e.value))
            e.access = true;
        });
        this.navigationCheckPoint();
      }
    });
  }
  /**
   * get logged in account details 
   * @returns: any | null 
   */
  private getAccountDetails(): any | null {
    return this.msalService.instance.getActiveAccount() || null;
  }
  /**
   * navigate to Dashboard page if roles has tekVizion FullAdmin/ConfigTester/Distributor
   */
  private navigateToDashboard(): void { this.router.navigate([this.DASHBOARD_ROUTE_PATH]); }
  /**
   * check point where based on roles, it will redirect to apps/tekToken Consumption portal
   */
  private navigationCheckPoint(): void {
    // checking that user has subaccount role to send it to apps page 
    if (this.loggedInUserRoles.includes(Constants.SUBACCOUNT_ADMIN) || this.loggedInUserRoles.includes(Constants.SUBACCOUNT_STAKEHOLDER)) {
      this.navigateToMyApps();
    } else {
      this.navigateToDashboard();
    }
  }
  /**
   * navigate to my apps page
   */
  private navigateToMyApps(): void {
    const { services } = this.currentSubaccountDetails;
    if (!this.loggedInUserRoles.includes(Constants.SUBACCOUNT_ADMIN) && services.length > 0) {
      const serviceObj: IService = this.availableServices.find((e: any) => e.value === tekVizionServices.SpotLight);
      const { routePath } = serviceObj;
      this.router.navigate([routePath]);
    } else {
      if (services.length > 1) {
        this.router.navigate([this.APPS_ROUTE_PATH]);
      } else if (services.length === 1) {
        const serviceObj: IService = this.availableServices.find((e: any) => e.value === services[0]);
        const { routePath } = serviceObj;
        this.router.navigate([routePath]);
      }
    }
  }
  /**
   * fetch user profile details
   */
  async fetchUserProfileDetails() {
    try {
      const res: any = await this.userProfileService.getUserProfileDetails().toPromise()
      if (res) {
        const { userProfile } = res;
        // localStorage.setItem(Constants.SUBACCOUNT_USER_PROFILE, JSON.stringify(userProfile));
        this.userProfileService.setSubaccountUserProfileDetails(userProfile);
      }
    } catch (error) {
      console.error(error);
      this.navigateToDashboard();
    }
  }
}
