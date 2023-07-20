import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';
import { SnackBarService } from '../../services/snack-bar.service';
import { FeatureToggleService } from "../../services/feature-toggle.service";
import { SubAccountService } from "../../services/sub-account.service";

@Injectable({
    providedIn: 'root'
})
export class FeatureToggleGuard implements CanActivate, CanActivateChild {
    constructor(private snackBarService: SnackBarService,
                private featureToggleService: FeatureToggleService,
                private subAccountService: SubAccountService) {
    }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        //This could probably be improved once the subaccountId is in the url as a query parameter.
        const subaccountId = this.subAccountService.getSelectedSubAccount().id || null;
        if (this.featureToggleService.isFeatureEnabled(route.url[0].path, subaccountId)) {
            return true;
        } else {
            this.snackBarService.openSnackBar('Feature not available', 'Error');
            return false;
        }
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        //This could probably be improved once the subaccountId is in the url as a query parameter.
        const subaccountId = this.subAccountService.getSelectedSubAccount().id || null;
        if (this.featureToggleService.isFeatureEnabled(childRoute.url[0].path, subaccountId)) {
            return true;
        } else {
            this.snackBarService.openSnackBar('Feature not available', 'Error');
            return false;
        }
    }
}
