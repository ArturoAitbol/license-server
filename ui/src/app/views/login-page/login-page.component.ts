import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
    username = '';
    password = '';
    loading_status = false;
    returnUrl: string;

    constructor(private router: Router, private msalService: MsalService) {
        if (this.msalService.instance.getActiveAccount() != null)
            this.router.navigate(['/']);
    }

    ngOnInit() {
        localStorage.clear();
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
                if (this.isLoggedIn)
                    this.router.navigate(['/dashboard']);
            });
        } catch (error) {
            console.error('error while logging with Azure AD: ', error);
        }
    }
}
