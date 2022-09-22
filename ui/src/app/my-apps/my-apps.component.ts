import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Constants } from '../helpers/constants';
import { IService } from '../model/service.model';
import { AvailableServicesService } from '../services/available-services.service';

@Component({
  selector: 'app-my-apps',
  templateUrl: './my-apps.component.html',
  styleUrls: ['./my-apps.component.css']
})
export class MyAppsComponent implements OnInit {
  availableServices: IService[] = [];
  constructor(
    private router: Router,
    private availabeService: AvailableServicesService,
    private msalService: MsalService
  ) { }
  ngOnInit(): void {
    console.debug('my apps')
    const accountDetails = this.getAccountDetails();
    const { idTokenClaims: { roles } } = accountDetails;
    this.getAvailableServices(roles);
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
    console.debug('roles | ', roles);
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
    const { tabName, enabled, routePath } = value;
    if (enabled) {
      this.router.navigate([routePath]); //, { skipLocationChange: true }
    }
  }
  ngOnDestory(): void {
  }
}
