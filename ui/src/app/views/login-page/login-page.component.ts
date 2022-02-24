import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
@Component({
    selector: 'login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
    username: string = '';
    password: string = '';
    loading_status: boolean = false;
    returnUrl: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private msalService: MsalService
    ) {
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        localStorage.clear();
        this.authenticationService.setCurrentUserValue(null);
        setTimeout(() => {
            this.loading_status = true;
        }, 3000);
        // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    }

    /**
     * check whether user is logged in
     * @returns: boolean 
     */
    isLoggedIn(): boolean {
        return this.msalService.instance.getActiveAccount() != null;
    }
    /**
     * login 
     */
    onSubmit() {
        try {
            this.msalService.loginPopup().subscribe((res: AuthenticationResult) => {
                console.debug('login res: ', res);
                this.msalService.instance.setActiveAccount(res.account);

                if (this.isLoggedIn) {
                    this.authenticationService.loggedIn.emit();
                    this.router.navigate(['/dashboard']);
                }
            });
        } catch (error) {
            console.error('error while logging with Azure AD: ', error);
        }
    }
}
