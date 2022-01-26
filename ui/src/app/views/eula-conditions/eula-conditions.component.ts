import {Component, OnInit, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {UserService} from 'src/app/services/user.service';
import {NavigationEnd, Router} from '@angular/router';
import {AuthenticationService} from 'src/app/services/authentication.service';

@Component({
    selector: 'eula-conditions',
    templateUrl: './new-eula.component.html',
    styleUrls: ['./eula-conditions.component.css']
})

export class EulaConditionsComponent implements OnInit {

    @ViewChild('userAcceptModal', {static: true}) userAcceptModal: any;
    modalRef: BsModalRef;
    returnUrl: string;
    href: string;

    constructor(private modalService: BsModalService,
                private userService: UserService, private router: Router,
                private authenticationService: AuthenticationService,) {
    }

    ngOnInit() {
        this.router.events.subscribe((ev) => {
            if (ev instanceof NavigationEnd) {                
                if (!window.location.href.includes('login')) {
                    this.userService.checkLicenseStatus().subscribe((response: any) => {
                        if (!response.success) {
                            this.modalRef = this.modalService.show(this.userAcceptModal, {class: 'modal-xl', ignoreBackdropClick: true});
                        }
                    });
                }
            }
        });
    }

    logout() {
        if (this.modalRef) {
            this.modalRef.hide();
        }
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }

    accept() {
        this.userService.acceptLicense().subscribe((response: any) => {
            if (response.success && this.modalRef) {
                this.modalRef.hide();
            }
        });
    }
}
