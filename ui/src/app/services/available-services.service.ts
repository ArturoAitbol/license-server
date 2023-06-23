import { Injectable } from '@angular/core';
import { tekVizionServices } from '../helpers/tekvizion-services';
import { IService } from '../model/service.model';
import { Constants } from '../helpers/constants';
@Injectable({
  providedIn: 'root'
})
export class AvailableServicesService {

  private availableServices: IService[] = [
    {
      "label": "tekToken Usage",
      "value": tekVizionServices.tekTokenConstumption,
      "enabled": true,
      "access": false,
      "routePath": Constants.CUSTOMERS_DASHBOARD_VIEW_PATH,
      "imagePath": "assets/images/tokens.png",
      "tabName": "TekVizion 360 Portal"
    },
    {
      "label": "UCaaS Continuous Testing",
      "value": tekVizionServices.SpotLight,
      "enabled": true,
      "access": false,
      "routePath": Constants.SPOTLIGHT_DASHBOARD_PATH,
      "imagePath": "assets/images/dashboard.png",
      "tabName": "SpotLight"
    }
  ];

  constructor() { }
  /**
   * fetch all availabe services with enabled flag as true, if that respective feature toggle is enabled
   * @returns: IService[]
   */
  public fetchAllAvailabeServices(): IService[] {
    return this.availableServices;
  }
}
