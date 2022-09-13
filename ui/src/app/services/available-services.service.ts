import { Injectable } from '@angular/core';
import { FeatureToggleHelper } from '../helpers/feature-toggle.helper';
import { Features } from '../model/features';
import { IService } from '../model/service.model';
@Injectable({
  providedIn: 'root'
})
export class AvailableServicesService {

  private availableServices: IService[] = [
    {
      "label": "tekToken Usage",
      "value": "tokenConsumption",
      "enabled": false,
      "access": false,
      "routePath": "/dashboard",
      "imagePath": "assets/images/tokens.png",
      "tabName": "tekVizion 360 Portal",
      "featureName": "Test_Feature_1"
    },
    {
      "label": "CTaaS",
      "value": "ctaas",
      "enabled": false,
      "access": false,
      "routePath": "/ctaas",
      "imagePath": "assets/images/dashboard.png",
      "tabName": "CTaaS",
      "featureName": "CTaaS_Feature"
    }
  ];

  constructor() { }
  /**
   * fetch all availabe services with enabled flag as true, if that respective feature toggle is enabled
   * @returns: IService[]
   */
  public fetchAllAvailabeServices(): IService[] {
    return this.availableServices.map((e: IService) => {
      if (FeatureToggleHelper.isFeatureEnabled(Features[e.featureName])) {
        e.enabled = true;
        return e;
      }
    });
  }
}
