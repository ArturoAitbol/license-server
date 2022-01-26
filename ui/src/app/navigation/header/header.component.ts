import { Component, EventEmitter, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { ChangePasswordComponent } from 'src/app/modules/admin-panel/tabs/users/change-password/change-password.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { PhoneService } from 'src/app/services/phone.service';
import { DashboardService } from 'src/app/services/dashboard.service';
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
    modalRef: BsModalRef;

    phoneLicenseStatus: any = {};
    phoneLicenseDisplay: boolean = false;
    licenseExpired: any;
    licenseExpiryDaysCount: string = 'noissues';
    graceperiod: boolean = false;
    alertLisenseExpired: boolean = true;
    showPopupFlag: boolean = true;
    brandLogoUrl_TS: string;
    constructor(private aeService: AutomationEditorService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private modalService: BsModalService,
        private userService: UserService,
        private toastr: ToastrService,
        private phoneService: PhoneService,
        private dashboardService: DashboardService) {
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
        this.userService.closeModal.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
        });
        this.dashboardService.getExpiryRefresh$.subscribe(() => {
            this.getExpiryDays();
            this.getClosedWarning();
        })
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
        object = ChangePasswordComponent;
        this.modalRef = this.modalService.show(object, this.modalConfig);
    }

    showAbout(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, {
            backdrop: true,
            class: 'modal-dialog-centered modal-sm',
            ignoreBackdropClick: true
        });
    }

    closeModal() {
        if (this.modalRef) {
            this.modalRef.hide();
        }
    }
    /**
     * removing the value of isClosed from localStorage
     */
    logout() {
        localStorage.removeItem('isClosed');
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }

    isOnSpecificView(viewName: string) {
        if (this.router.url.includes(viewName)) {
            return true;
        } else {
            return false;
        }
    }

    getPhoneLicenseDetails() {
        this.phoneService.getPhoneLicenseStatus().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to acquire phone license status', 'Error');
            } else {
                this.phoneLicenseStatus = response.response;
                if (this.phoneLicenseStatus.remainingAvailablePhones <= 10) {
                    this.phoneLicenseDisplay = true;
                }
            }

        });
    }

    getExpiryDays() {
        this.dashboardService.getExpiryDaysDetails().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to get expiry days details: ' + response.response.message, 'Error');
            } else {
                this.licenseExpired = response.licenseExpired;
                this.licenseExpiryDaysCount = response.licenseExpiryDaysCount;
                this.graceperiod = response.graceperiod;
                localStorage.setItem('alertLisenseExpired', this.licenseExpired);
            }
        });
    }


    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
