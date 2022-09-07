import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';
import { SnackBarService } from '../../services/snack-bar.service';
import { environment } from "src/environments/environment";
import FeatureToggles from 'src/assets/feature-toggles/feature-toggles.json';
import UserFeatureToggles from 'src/assets/feature-toggles/user-feature-toggles.json';
import { MsalService } from '@azure/msal-angular';

@Injectable({
    providedIn: 'root'
})
export class FeatureToggleGuard implements CanActivate, CanActivateChild {
    private environmentFeatureToggles;
    private environmentUserFeatureToggles;

    constructor(private snackBarService: SnackBarService,
                private msalService: MsalService) {
        this.environmentFeatureToggles = FeatureToggles[environment.ENVIRONMENT_NAME];
        this.environmentUserFeatureToggles = UserFeatureToggles[environment.ENVIRONMENT_NAME];
    }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (this.environmentFeatureToggles.routes[route.url[0].path] || (this.environmentUserFeatureToggles)[this.msalService.instance.getActiveAccount()?.username]?.routes?.[route.url[0].path]) {
            return true;
        } else {
            this.snackBarService.openSnackBar('Feature not available', 'Error');
            return false;
        }
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.environmentFeatureToggles.routes[childRoute.url[0].path] || (this.environmentUserFeatureToggles)[this.msalService.instance.getActiveAccount()?.username]?.routes?.[childRoute.url[0].path]) {
            return true;
        } else {
            this.snackBarService.openSnackBar('Feature not available', 'Error');
            return false;
        }
    }
}
