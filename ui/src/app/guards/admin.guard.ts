import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Role } from '../helpers/role';


@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {

    constructor(private router: Router) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        if (currentPermissions.includes(Role[0]) || currentPermissions.includes(Role[1]) ||
            // tslint:disable-next-line: max-line-length
            (currentPermissions.includes(Role[2]) && currentPermissions.includes(Role[3]) || currentPermissions.includes(Role[4]) || currentPermissions.includes(Role[5]))
        ) {
            return true;
        }
        return false;
    }
}
