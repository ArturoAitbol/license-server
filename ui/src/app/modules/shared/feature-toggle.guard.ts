import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';
import { SnackBarService } from "../../services/snack-bar.service";
import FeatureToggles from '../../../assets/feature-toggles.json';
import UserFeatureToggles from "../../../assets/user-feature-toggles.json";
import { MsalService } from "@azure/msal-angular";

@Injectable({
    providedIn: 'root'
})
export class FeatureToggleGuard implements CanActivate, CanActivateChild {

    constructor(private snackBarService: SnackBarService,
                private msalService: MsalService) {
    }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (FeatureToggles.routes[route.url[0].path] || UserFeatureToggles[this.msalService.instance.getActiveAccount()?.username]?.routes?.[route.url[0].path]) {
            return true;
        } else {
            this.snackBarService.openSnackBar("Feature not available", "OK")
            return false
        }
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (FeatureToggles.routes[childRoute.url[0].path] || UserFeatureToggles[this.msalService.instance.getActiveAccount()?.username]?.routes?.[childRoute.url[0].path]) {
            return true
        } else {
            this.snackBarService.openSnackBar("Feature not available", "OK")
            return false;
        }
    }
}