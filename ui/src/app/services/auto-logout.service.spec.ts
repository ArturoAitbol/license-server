import { AutoLogoutService } from "./auto-logout.service";
import { MsalService } from "@azure/msal-angular";
import { Constants } from "../helpers/constants";
import moment from "moment";


let msalServiceSpy: jasmine.SpyObj<MsalService>;
let autoLogoutService: AutoLogoutService;
describe('Auto Logout Service - ', () => {
    beforeEach(async () => {
        msalServiceSpy = jasmine.createSpyObj('MsalService', ['logout', 'instance']);
        msalServiceSpy.instance = jasmine.createSpyObj('MsalInstance', ['getActiveAccount']);
        autoLogoutService = new AutoLogoutService(msalServiceSpy);
    });

    it('should validate last activity time correctly', () => {
        spyOn(autoLogoutService, 'restartTimer').and.callThrough();
        spyOn(autoLogoutService, 'clearLoginTimeValidator').and.callThrough();
        spyOn(autoLogoutService, 'logout').and.callThrough();
        autoLogoutService.validateLastActivityTime();
        expect(autoLogoutService.restartTimer).toHaveBeenCalled();
        localStorage.setItem('lastActivityTime', (moment().unix() - (Constants.LOGOUT_TIME_MS/1000)).toString());
        autoLogoutService.validateLastActivityTime();
        expect(autoLogoutService.clearLoginTimeValidator).toHaveBeenCalled();
        expect(autoLogoutService.logout).toHaveBeenCalled();
        localStorage.setItem('lastActivityTime', moment().unix().toString());
        autoLogoutService.validateLastActivityTime();
    });

    it('should logout account correctly', () => {
        (msalServiceSpy.instance.getActiveAccount as jasmine.Spy).and.returnValue({homeAccountId: "", environment: "", tenantId: "", username: "", localAccountId: ""});
        autoLogoutService.logout();
        expect(msalServiceSpy.logout).toHaveBeenCalled();
    });

    it('should init and cancel login timeout correctly', () => {
        spyOn(window, 'clearTimeout').and.callThrough();
        autoLogoutService.initLoginTimeout();
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(autoLogoutService.loginTimeoutId).not.toBeNull();
        autoLogoutService.cancelLoginTimeout();
        expect(clearTimeout).toHaveBeenCalledTimes(2);
        expect(autoLogoutService.loginTimeoutId).toBeNull();
    });

    it('should init and cancel acquire token timeout correctly', () => {
        spyOn(window, 'clearTimeout').and.callThrough();
        autoLogoutService.initAcquireTokenTimeout();
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(autoLogoutService.acquireTokenTimeoutId).not.toBeNull();
        autoLogoutService.cancelAcquireTokenTimeout();
        expect(clearTimeout).toHaveBeenCalledTimes(2);
        expect(autoLogoutService.acquireTokenTimeoutId).toBeNull();
    });

});
