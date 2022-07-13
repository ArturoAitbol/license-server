import { Injectable } from "@angular/core";
import { Constants } from "../helpers/constants";
import { MsalService } from "@azure/msal-angular";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AutoLogoutService {
    timeoutId: any = null;

    private readonly  LAST_ACTIVITY_TIMESTAMP_KEY = 'lastActivityTime';
    constructor(private msalService: MsalService) {
    }

    public validateLastActivityTime(): void {
        const lastActivityTimestamp = new Date(localStorage.getItem(this.LAST_ACTIVITY_TIMESTAMP_KEY));
        if (lastActivityTimestamp.getTime() + Constants.LOGOUT_TIME_MS < new Date().getTime()) {
            this.logout();
            this.clearLoginTimeValidator();
        }
    }

    public restartTimer(): void {
        clearTimeout(this.timeoutId);
        localStorage.setItem(this.LAST_ACTIVITY_TIMESTAMP_KEY, new Date().toISOString());
        this.timeoutId = setTimeout(() => this.validateLastActivityTime(), Constants.LOGOUT_TIME_MS);
    }

    public clearLoginTimeValidator(): void {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }

    private logout() {
        if (this.msalService.instance.getActiveAccount() != null) {
            try {
                const baseUrl: string = environment.REDIRECT_URL_AFTER_LOGIN;
                this.msalService.logoutPopup({
                    mainWindowRedirectUri: baseUrl
                });
            } catch (error) {
                console.error('error while logout: ', error);
            }
        }
    }
}