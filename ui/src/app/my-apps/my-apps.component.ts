import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from '../helpers/constants';
import { IService } from '../model/service.model';
import { AvailableServicesService } from '../services/available-services.service';
import { HeaderService } from '../services/header.service';

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
    private headerService: HeaderService
  ) { }
  ngOnInit(): void {
    this.getAvailableServices();
  }
  /**
   * get available services
   */
  private getAvailableServices() {
    const response = this.availabeService.fetchAllAvailabeServices();
    if (response.length > 0) {
      this.availableServices = response.filter((x: IService) => x.enabled === true);
      // get the current logged in subaccount details
      const currentSubaccountDetails = JSON.parse(localStorage.getItem(Constants.CURRENT_SUBACCOUNT));
      if (currentSubaccountDetails) {
        const { services } = currentSubaccountDetails;
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
      this.emitOnPageChangeEvent({ hideToolbar: false, tabName: tabName, transparentToolbar: false });
      this.router.navigate([routePath]);
    }
  }
  /**
   * emit an event on page change
   * @param value: { hideToolbar: boolean, tabName: string, transparentToolbar: boolean }
   */
  emitOnPageChangeEvent(value: { hideToolbar: boolean, tabName: string, transparentToolbar: boolean }): void {
    this.headerService.onChangeService(value);
  }

}