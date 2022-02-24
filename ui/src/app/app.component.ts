import { Component, OnInit, AfterContentInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { MsalService } from '@azure/msal-angular';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'license-server';
    currentUser: boolean = false;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private msalService: MsalService
    ) { }

    ngOnInit() {
        console.log('AppComponent.ngOnInit: ', window.location.origin + '/license-server/index.hmtl');
        if (!this.isLoggedIn()) {
            this.router.navigate(['/login']);
        } else {
            this.currentUser = this.isLoggedIn();
            this.navigateToDashboard();
        }
        this.authenticationService.loggedIn.subscribe(() => {
            this.currentUser = this.isLoggedIn();
        });
    }
    /**
     * check whether user logged in
     * @returns: boolean 
     */
    isLoggedIn(): boolean {
        return this.msalService.instance.getActiveAccount() != null;
    }
    /**
     * navigate to dashboard page
     */
    navigateToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }
    /**
     * logout 
     */
    logout() {
        try {
            const baseUrl: string = window.location.origin + '/license-server/index.hmtl';
            this.msalService.logoutPopup({
                mainWindowRedirectUri: baseUrl
            });
        } catch (error) {
            console.error('error while logout: ', error);
        }
    }

    ngOnDestroy(): void {
    }
}
