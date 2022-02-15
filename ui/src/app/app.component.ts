import { Component, OnInit, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { User } from './model/user';
import { Role } from './helpers/role';
import { Constants } from './helpers/constants';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './security/auth.config';
import { SessionStorageUtil } from './helpers/session-storage';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'license-server';
    opened: boolean;
    mode: string;
    position: string;
    dock: boolean;
    dockedSize: string;
    closeOnClickOutside: boolean;
    closeOnClickBackdrop: boolean;
    animation: boolean;
    currentUser: boolean = false;
    optionsMenu: any[] = [
        {
            name: 'Dashboard',
            imgLocation: 'dashboard_icon.svg',
            imgActive: 'dashboard_current_icon.svg',
            redirectsTo: '/dashboard',
            stylePadding: 'padding:3px 0 0 10px;',
            requiresAdmin: true
        },
        {
            name: 'Phone Manager',
            imgLocation: 'phone_icon.svg',
            imgActive: 'phone_current_icon.svg',
            redirectsTo: '/phoneConfiguration',
            stylePadding: 'padding:2px 0 0 10px;'
        },
        {
            name: 'Test Manager',
            imgLocation: 'tests_icon.svg',
            imgActive: 'tests_current_icon.svg',
            redirectsTo: '/testCases',
            stylePadding: 'padding:1px 0 0 10px;'
        },
        {
            name: 'Project Manager',
            imgLocation: 'projects_icon.svg',
            imgActive: 'projects_current_icon.svg',
            redirectsTo: '/projects',
            stylePadding: 'padding:0px 0 0 10px;'
        },
        {
            name: 'Admin Panel',
            imgLocation: 'settings_icon.svg',
            imgActive: 'settings_current_icon.svg',
            redirectsTo: '/adminPanel',
            stylePadding: 'padding:0px 0 0 10px;'
        },
    ];

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private cdr: ChangeDetectorRef,
        private oauthService: OAuthService
    ) {
        this.oauthService.configure(authConfig);
        this.oauthService.loadDiscoveryDocumentAndLogin().then((res) => {
            this.currentUser = (res);
            this.router.navigate(['/dashboard']);
        });
        this.oauthService.setupAutomaticSilentRefresh();
    }

    ngOnInit() {
        this.authenticationService.currentUser.subscribe((response: any) => {
            setTimeout(() => {
                // if (!this.currentUser) {
                //     this.router.navigate(['/login']);
                // }
            }, 0);
        });
        console.log('AppComponent.ngOnInit: ', window.location.origin + '/license-server/index.hmtl');

        // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    navigateToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    logout() {
        // this.oauthService.revokeTokenAndLogout();
        this.oauthService.logOut();
        // this.authenticationService.logout();
        this.router.navigate(['/redirect']);
    }
}
