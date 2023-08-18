import { Injectable } from "@angular/core";
import { Constants } from "../helpers/constants";
import { MsalService } from "@azure/msal-angular";
import { Router } from "@angular/router";
import moment from "moment";

@Injectable({
    providedIn: 'root'
})
export class AutoLogoutService {
    timeoutId: any = null;
    loginTimeoutId: any = null;
    acquireTokenTimeoutId: any = null;

    private readonly  LAST_ACTIVITY_TIMESTAMP_KEY = 'lastActivityTime';
    constructor(private msalService: MsalService) {
    }

    public validateLastActivityTime(): void {
        const lastActivityTimestamp = localStorage.getItem(this.LAST_ACTIVITY_TIMESTAMP_KEY);
        if (!lastActivityTimestamp) {
            this.restartTimer();
            return;
        }
        if ((+lastActivityTimestamp) + (Constants.LOGOUT_TIME_MS / 1000) <= moment().unix()) {
            this.clearLoginTimeValidator();
            this.logout();
        } else this.resetTimeout();
    }

    public restartTimer(): void {
        localStorage.setItem(this.LAST_ACTIVITY_TIMESTAMP_KEY, moment().unix().toString());
        this.resetTimeout();
    }

    private resetTimeout(): void {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => this.validateLastActivityTime(), Constants.LOGOUT_TIME_MS);
    }

    public clearLoginTimeValidator(): void {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }

    public logout() {
        if (this.msalService.instance.getActiveAccount() != null) {
            try {
                let bannerArray = [];
                Object.keys(localStorage).forEach(key => key.includes("-hiddenBanner") ? bannerArray.push({ key: key, value: localStorage[key] }) : '');
                localStorage.clear();
                bannerArray.forEach(item => localStorage.setItem(item.key, item.value));
                this.msalService.logout();
            } catch (error) {
                console.error('error while logout: ', error);
            }
        }
    }

    public initLoginTimeout(){
        clearTimeout(this.loginTimeoutId);
        this.loginTimeoutId = setTimeout(()=> window.location.reload(), Constants.LOGIN_TIMEOUT);
    }

    public cancelLoginTimeout(){
        clearTimeout(this.loginTimeoutId);
        this.loginTimeoutId = null;
    }

    public initAcquireTokenTimeout(){
        clearTimeout(this.acquireTokenTimeoutId);
        this.acquireTokenTimeoutId = setTimeout(()=> this.logout(), Constants.LOGIN_TIMEOUT);
    }

    public cancelAcquireTokenTimeout(){
        clearTimeout(this.acquireTokenTimeoutId);
        this.acquireTokenTimeoutId = null;
    }
}