import { Component, OnInit, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { User } from './model/user';
import { Role } from './helpers/role';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterContentInit {
    title = 'onPOINT';
    opened: boolean;
    mode: string;
    position: string;
    dock: boolean;
    dockedSize: string;
    closeOnClickOutside: boolean;
    closeOnClickBackdrop: boolean;
    animation: boolean;
    currentUser: User = null;
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

    constructor(private router: Router,
        private authenticationService: AuthenticationService,
        private cdr: ChangeDetectorRef
    ) {
        // this.opened = true;
        this.mode = 'push';
        this.position = 'left';
        this.dock = true;
        this.dockedSize = '50px';
        this.closeOnClickOutside = false;
        this.closeOnClickBackdrop = false;
        this.animation = true;
    }

    userEnabled(role: string) {
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        if (currentPermissions.includes(role) || currentPermissions.includes(Role[1])) {
            return false;
        }
        return true;
    }

    ngOnInit() {
        this.authenticationService.currentUser.subscribe((response: any) => {
            this.currentUser = response;
        });
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    ngAfterContentInit(): void {
        const value = localStorage.getItem('user-toggle-preference');
        this.checkForTogglePreference();
        // tslint:disable-next-line: max-line-length
        this.opened = value ? JSON.parse(localStorage.getItem('user-toggle-preference')) : true;
        this.cdr.detectChanges();
    }

    /**
     * check if local-storage has user toggle preference else set true by default
     */
    checkForTogglePreference(): void {
        const value = localStorage.getItem('user-toggle-preference');
        if (value == null || value == undefined) {
            localStorage.setItem('user-toggle-preference', JSON.stringify(true));
        }
    }

    toggleClosed(): void {
        // this.utilService.changedBarState.emit(this.opened);
    }

    toggleOpened(): void {
        // setTimeout(() => {
        //     this.checkForTogglePreference();
        //     this.opened = !this.opened;
        //     this.utilService.changedBarState.emit(this.opened);
        //     // store the user preference of toggle in local-storage
        //     localStorage.setItem('user-toggle-preference', JSON.stringify(this.opened));
        // }, 0);
    }

    redirectTo(redirectPath: any) {
        this.toggleOpened();
        this.router.navigate([redirectPath]);
    }

    redirectFromIcon(redirectPath: any) {
        this.router.navigate([redirectPath]);
    }

    currentPageColor(option: any) {
        const currentLocation = this.router.url;
        if (currentLocation.includes(option.redirectsTo)) {
            return true;
        } else {
            return false;
        }
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }
}
