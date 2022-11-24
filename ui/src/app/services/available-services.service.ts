import { Injectable } from '@angular/core';
import { FeatureToggleHelper } from '../helpers/feature-toggle.helper';
import { Features } from '../helpers/features';
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
      "label": "SpotLight",
      "value": tekVizionServices.SpotLight,
      "enabled": false,
      "access": false,
      "routePath": "/spotlight/report-dashboards",
      "imagePath": "assets/images/dashboard.png",
      "tabName": "SpotLight",
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
      if (e.featureName && FeatureToggleHelper.isFeatureEnabled(Features[e.featureName]))
        e.enabled = true;
      return e;
    });
  }
}
