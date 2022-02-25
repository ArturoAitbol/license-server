import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    enabled: boolean = false;
    enabledSubtitle: boolean = false;
    currentUser: any;
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-lg', ignoreBackdropClick: true };

    phoneLicenseStatus: any = {};
    phoneLicenseDisplay: boolean = false;
    licenseExpired: any;
    licenseExpiryDaysCount: string = 'noissues';
    graceperiod: boolean = false;
    alertLisenseExpired: boolean = true;
    showPopupFlag: boolean = true;
    brandLogoUrl_TS: string;
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
    ) {
        this.brandLogoUrl_TS = 'assets/images/BrandLogo.png?' + new Date();
        this.authenticationService.currentUser.subscribe((response: any) => {
            this.currentUser = response;
        });
        this.authenticationService.closeSession.subscribe((response: any) => {
            this.logout();
        });
    }

    ngOnInit() {
        this.getExpiryDays();
        this.getPhoneLicenseDetails();
        this.getClosedWarning()
    }
    /**
     * setItem to isClosed value through this.licenseExpired in localStorage
     */
    closeWarning() {
        this.licenseExpired = false;
        this.showPopupFlag = false;
        localStorage.setItem('isClosed', 'true');
    }
    /**
     * getting Value From LocalStorage By using 'this.showPopupFlag' flag
     */
    getClosedWarning() {
        if (localStorage.getItem('isClosed') && localStorage.getItem('isClosed') == 'true') {
            this.showPopupFlag = false;
        } else {
            this.showPopupFlag = true;
        }
    }
    changePassword() {
        let object: any;
        // object = ChangePasswordComponent;
        // this.modalRef = this.modalService.show(object, this.modalConfig);
    }

    showAbout(template: TemplateRef<any>) {

    }

    closeModal() {

    }
    /**
     * removing the value of isClosed from localStorage
     */
    logout() {
    }

    isOnSpecificView(viewName: string) {
        if (this.router.url.includes(viewName)) {
            return true;
        } else {
            return false;
        }
    }

    getPhoneLicenseDetails() {

    }

    getExpiryDays() {

    }


    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
