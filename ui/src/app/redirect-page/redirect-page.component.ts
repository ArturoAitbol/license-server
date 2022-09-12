import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { map } from 'rxjs/operators';
import { Constants } from '../helpers/constants';
import { IService } from '../model/service.model';
import { SubAccount } from '../model/subaccount.model';
import { HeaderService } from '../services/header.service';
import { SubAccountService } from '../services/sub-account.service';
import { AvailableServicesService } from '../services/available-services.service';
@Component({
  selector: 'app-redirect-page',
  templateUrl: './redirect-page.component.html',
  styleUrls: ['./redirect-page.component.css']
})
export class RedirectPageComponent implements OnInit {

  private readonly DASHBOARD_ROUTE_PATH: string = '/dashboard';
  private readonly APPS_ROUTE_PATH: string = '/apps';
  loggedInUserRoles: string[] = [];
  currentSubaccountDetails: SubAccount;
  availableServices: IService[] = [];
  readonly redirectingMsg: string = 'Please wait while redirecting ...';

  constructor(
    private router: Router,
    private msalService: MsalService,
    private subaccountService: SubAccountService,
    private headerService: HeaderService,
    private availabeService: AvailableServicesService
  ) { }

  ngOnInit(): void {
    this.getAvailableServices();
    // hide toolbar on load this redirect page
    this.emitOnPageChangeEvent({ hideToolbar: true, tabName: '', transparentToolbar: true });
    const accountDetails = this.getAccountDetails();
    // console.debug('active account details | ', accountDetails);
    const { idTokenClaims: { roles } } = accountDetails;
    this.loggedInUserRoles = roles;
    this.getSubAccountDetails();
  }
  /**
   * get all available tekVizion services
   * @returns: IService[] 
   */
  private getAvailableServices() {
    this.availabeService.fetchAllAvailabeServices().subscribe((response: { availabeServices: [] }) => {
      if (response && response['availabeServices']) {
        this.availableServices = response['availabeServices'].filter((x: IService) => x.enabled === true);
      }
    });
  }
  /**
   * get logged in sub account details
   */
  private getSubAccountDetails(): void {
    this.subaccountService.getSubAccountList()
      .pipe( // Hard coding services in subaccounts for now
        map(val => {
          val['subaccounts'][0]['services'] = ['ctaas', 'tekToken'];
          // val['subaccounts'][0]['services'] = ['ctaas'];
          return val;
        })
      )
      .subscribe((res: any) => {
        if (res) {
          const { subaccounts } = res;
          this.currentSubaccountDetails = subaccounts[0];
          localStorage.setItem(Constants.CURRENT_SUBACCOUNT, JSON.stringify(this.currentSubaccountDetails));
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
    if (this.loggedInUserRoles.includes('customer.SubaccountAdmin' || 'customer.SubaccountStakeholder')) {
      this.navigateToMyApps();
    } else {
      this.emitOnPageChangeEvent({ hideToolbar: false, tabName: 'tekVizion 360 Portal', transparentToolbar: false });
      this.navigateToDashboard();
    }
  }
  /**
   * navigate to my apps page
   */
  private navigateToMyApps(): void {
    const { services } = this.currentSubaccountDetails; 
    if (services.length > 1) {
      this.emitOnPageChangeEvent({ hideToolbar: false, tabName: '', transparentToolbar: true });
      this.router.navigate([this.APPS_ROUTE_PATH]);
    } else if (services.length === 1) {
      const serviceObj: IService = this.availableServices.find((e: any) => e.value === services[0]);
      const { routePath, tabName } = serviceObj;
      this.emitOnPageChangeEvent({ hideToolbar: false, tabName: tabName, transparentToolbar: false });
      this.router.navigate([routePath]);
    }
  }

  /**
   * emit an event on page navigate to perform some action on toolbar
   * @param value: { hideToolbar: boolean, tabName: string, transparentToolbar: boolean } 
   */
  emitOnPageChangeEvent(value: { hideToolbar: boolean, tabName: string, transparentToolbar: boolean }): void {
    this.headerService.onChangeService(value);
  }

}
