import { Injectable } from '@angular/core';
import { tekVizionServices } from '../helpers/tekvizion-services';
import { IService } from '../model/service.model';
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
      "routePath": "/dashboard",
      "imagePath": "assets/images/tokens.png",
      "tabName": "tekVizion 360 Portal"
    },
    {
      "label": "Spotlight",
      "value": tekVizionServices.SpotLight,
      "enabled": true,
      "access": false,
      "routePath": "/spotlight/visualization",
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
