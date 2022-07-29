import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { Subject } from 'rxjs/internal/Subject';
import { EventMessage, EventType } from '@azure/msal-browser';
import { filter, takeUntil } from 'rxjs/operators';
import { AutoLogoutService } from "./services/auto-logout.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly _destroying$ = new Subject<void>();
    title = 'license-server';
    currentUser = false;

    constructor(
        private router: Router,
        private msalService: MsalService,
        private broadcastService: MsalBroadcastService,
        private autoLogoutService: AutoLogoutService
    ) { }

    ngOnInit() {
        if (!this.isLoggedIn()) {
            this.router.navigate(['/login']);
        } else {
            this.currentUser = this.isLoggedIn();
            this.navigateToDashboard();
            this.autoLogoutService.validateLastActivityTime();
        }
        this.broadcastService.msalSubject$.pipe(
            filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
            takeUntil(this._destroying$)
        ).subscribe((result: EventMessage) => {
            // Do something with event payload here
        });
        this.broadcastService.msalSubject$.pipe(
            filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
            takeUntil(this._destroying$)
        ).subscribe(event => {
            this.currentUser = true;
            this.autoLogoutService.restartTimer();
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
            this.msalService.logoutRedirect();
        } catch (error) {
            console.error('error while logout: ', error);
        }
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}
