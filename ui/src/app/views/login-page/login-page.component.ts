import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { first } from 'rxjs/operators';
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
        private authenticationService: AuthenticationService
    ) {
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        setTimeout(() => {
            this.loading_status = true;
        }, 3000);
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    }

    onSubmit() {
        const loggedUserDetails = {
            username: this.username,
            password: this.password
        };
        localStorage.setItem('currentUser', JSON.stringify(loggedUserDetails));
        this.router.navigate(['/dashboard']);
        this.authenticationService.setCurrentUserValue(loggedUserDetails);
        // this.authenticationService.login(this.username, this.password)
        // .pipe(first()).subscribe((response: any) => {
        //     if (!response.success) {
        //         // this.toastr.error('Login Failed: ' + response.message, 'Error');
        //     } else {
        //         this.router.navigate([this.returnUrl]);
        //     }
        // });
    }
}
