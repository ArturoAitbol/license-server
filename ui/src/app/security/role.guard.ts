import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { permissions } from '../helpers/role-permissions';
import { SnackBarService } from '../services/snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private msalService: MsalService,
    private route:Router,
    private snackBarService:SnackBarService){
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const idTokenClaims: any = this.msalService.instance.getActiveAccount().idTokenClaims;
    if(!idTokenClaims.roles || !permissions[idTokenClaims.roles[0]]){
      this.snackBarService.openSnackBar('Role is missing', 'NOT AUTHORIZED');
      this.route.navigate(['/no-permissions']);
      return false;
    }
    if (!this.isAuthorized(route,idTokenClaims.roles)) {
      this.snackBarService.openSnackBar('You do not have access as expected role is missing', 'NOT AUTHORIZED');
      return false;
    }
    return true;
  }
  
  private isAuthorized(route: ActivatedRouteSnapshot, accountRoles: string[]): boolean{
    const path = route.url[0].path;
    const pathsMatch = accountRoles.findIndex(accountRole => permissions[accountRole].paths.indexOf(path)!==-1);
    return (pathsMatch >= 0);
  }
}
