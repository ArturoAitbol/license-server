import { Injectable } from "@angular/core";
import { Constants } from "../helpers/constants";
import { MsalService } from "@azure/msal-angular";

@Injectable({
    providedIn: 'root'
})
export class AutoLogoutService {
    constructor(private msalService: MsalService) {
    }

    timeoutId: number;

    private logout() {
        if (this.msalService.instance.getActiveAccount() != null) {
            try {
                const baseUrl: string = Constants.REDIRECT_URL_AFTER_LOGIN;
                this.msalService.logoutPopup({
                    mainWindowRedirectUri: baseUrl
                });
            } catch (error) {
                console.error('error while logout: ', error);
            }
        }
    }

    public restartTimer(): void {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            this.logout();
        }, Constants.LOGOUT_TIME_MS);
    }
}