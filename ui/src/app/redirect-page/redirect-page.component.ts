import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Constants } from '../helpers/constants';
import { IService } from '../model/service.model';
import { SubAccountService } from '../services/sub-account.service';
import { AvailableServicesService } from '../services/available-services.service';
import { UserProfileService } from '../services/user-profile.service';
import { tekVizionServices } from '../helpers/tekvizion-services';
import { CustomerService } from '../services/customer.service';
@Component({
  selector: 'app-redirect-page',
  templateUrl: './redirect-page.component.html',
  styleUrls: ['./redirect-page.component.css']
})
export class RedirectPageComponent implements OnInit {

  private readonly DASHBOARD_ROUTE_PATH: string = Constants.CUSTOMERS_DASHBOARD_VIEW_PATH;
  private readonly APPS_ROUTE_PATH: string = '/apps';
  private readonly  CONSUMPTION_MATRIX_PATH = '/consumption-matrix';
  loggedInUserRoles: string[] = [];
  currentSubaccountDetails: any;
  availableServices: IService[] = [];
  constructor(
    private router: Router,
    private msalService: MsalService,
    private subaccountService: SubAccountService,
    private customerService: CustomerService,
    private userProfileService: UserProfileService,
    private availabeService: AvailableServicesService,
  ) { }

  ngOnInit(): void {
    try {
      this.getAvailableServices();
      const accountDetails = this.getAccountDetails();
      const { idTokenClaims: { roles } } = accountDetails;
      this.loggedInUserRoles = roles;
      if (this.loggedInUserRoles.length === 1 && this.loggedInUserRoles[0] === Constants.DEVICES_ADMIN) {
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
   * get all available TekVizion 360 services
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
    this.subaccountService.getSubAccountListForCustomerUser().subscribe((subaccountsResp: any) => {
      if (subaccountsResp) {
        let indexOfLastCustomerWithServices: number = 0;
        for (let i = 0; i < subaccountsResp.subaccounts.length; i++) {
          const services: string = subaccountsResp.subaccounts[i].services;
          if (services.includes(tekVizionServices.SpotLight)) {
            this.currentSubaccountDetails = subaccountsResp.subaccounts[i];
            break;
          }
          if (services !== "")
            indexOfLastCustomerWithServices = i;
        }
        if (!this.currentSubaccountDetails) {
          this.currentSubaccountDetails = subaccountsResp.subaccounts[indexOfLastCustomerWithServices];
          this.navigateToDashboard();
          return;
        }
        if (this.currentSubaccountDetails.services)
          this.currentSubaccountDetails.services = this.currentSubaccountDetails.services.split(',').map((e: string) => e.trim());
        else
          this.currentSubaccountDetails.services = [];
        this.currentSubaccountDetails.customerName = this.currentSubaccountDetails.name;
        this.subaccountService.setSelectedSubAccount(this.currentSubaccountDetails);
        this.customerService.getCustomerById(this.currentSubaccountDetails.customerId).subscribe((customersResp: any) => {
          const subaccountCustomer = customersResp.customers[0];
          this.currentSubaccountDetails.customerName = subaccountCustomer.name;
          this.currentSubaccountDetails.testCustomer = subaccountCustomer.testCustomer;
          this.currentSubaccountDetails.customerType = subaccountCustomer.customerType;
          this.currentSubaccountDetails.distributorId = subaccountCustomer.distributorId;
          this.currentSubaccountDetails.adminEmails = subaccountCustomer.adminEmails;
          this.currentSubaccountDetails.customerId = this.currentSubaccountDetails.customerId;
          this.currentSubaccountDetails.subaccountId = this.currentSubaccountDetails.id;
          this.subaccountService.setSelectedSubAccount(this.currentSubaccountDetails);
        });
        // enable/disable the available services
        this.availableServices.forEach((e: { label: string, value: string, access: boolean }) => {
          if (this.currentSubaccountDetails.services.includes(e.value))
            e.access = true;
        });
        this.navigateToMyApps();
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
   * navigate to Dashboard page if roles has tekVizion.FullAdmin/ConfigTester/Distributor
   */
  private navigateToDashboard(): void { this.router.navigate([this.DASHBOARD_ROUTE_PATH]); }
  /**
   * navigate to my apps page
   */
  private navigateToMyApps(): void {
    const { services } = this.currentSubaccountDetails;
    if (this.loggedInUserRoles.length > 1) {
      this.router.navigate([this.APPS_ROUTE_PATH]);
      return;
    }
    if (this.loggedInUserRoles.includes(Constants.SUBACCOUNT_STAKEHOLDER) && services.length > 0) {
      const serviceObj: IService = this.availableServices.find((e: any) => e.value === tekVizionServices.SpotLight);
      const { routePath } = serviceObj;
      this.router.navigate([routePath], { queryParams: { subaccountId: this.currentSubaccountDetails.id } });
    } else {
      if (services.length > 1) {
        this.router.navigate([this.APPS_ROUTE_PATH]);
      } else if (services.length === 1) {
        const serviceObj: IService = this.availableServices.find((e: any) => e.value === services[0]);
        const { routePath } = serviceObj;
        this.router.navigate([routePath], { queryParams: { subaccountId: this.currentSubaccountDetails.id } });
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
