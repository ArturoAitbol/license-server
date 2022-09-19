import { FeatureToggleGuard } from "./feature-toggle.guard";
import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { SnackBarService } from "../../services/snack-bar.service";
import { SnackBarServiceMock } from "../../../test/mock/services/snack-bar-service.mock";
import { MsalService } from "@azure/msal-angular";

const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
};
let guard: FeatureToggleGuard;

const msalServiceMock = jasmine.createSpyObj('MsalService', ['getActiveAccount']);
msalServiceMock.instance = msalServiceMock;

const beforeEachFunction = async () => {
    await TestBed.configureTestingModule({
        providers: [
            FeatureToggleGuard,
            {
                provide: Router,
                useValue: mockRouter
            },
            {
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            },
            {
                provide: MsalService,
                useValue: msalServiceMock
            },
        ],
    }).compileComponents().then(() => {
        guard = TestBed.inject(FeatureToggleGuard);
    });
};

describe('When the feature toggles are loaded for username@test.com', () => {
    beforeEach(beforeEachFunction);
    beforeEach(() => {
        msalServiceMock.getActiveAccount.and.returnValue({username: 'username@test.com'});
    });
    it('should grant access to existing parent routes', () => {
        const parentRoutes = ['dashboard', 'customer'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeTrue();
        });
    });

    it('should grant access to existing parent routes based on the user', () => {
        const parentRoutes = ['unitTestingRoute'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeTrue();
        });
    });

    it('should not grant access to nonexistent parent routes', () => {
        const parentRoutes = ['imaginarycomponent', 'somecomponent'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeFalse();
        });
    });

    it('should grant access to existing child routes', () => {
        const childRoutes = ['consumption', 'projects', 'licenses'];
        childRoutes.forEach(route => {
            expect(guard.canActivateChild({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBeTrue();
        });
    });

    it('should not grant access to nonexistent child routes', () => {
        const childRoutes = ['imaginarycomponent', 'somecomponent'];
        childRoutes.forEach(route => {
            expect(guard.canActivateChild({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBeFalse();
        });
    });
});

describe('When the feature toggles are loaded for a nonexistent user', () => {
    beforeEach(beforeEachFunction);
    beforeEach(() => {
        msalServiceMock.getActiveAccount.and.returnValue({username: 'nonexistent@test.com'});
    });
    it('should grant access to existing parent routes', () => {
        const parentRoutes = ['dashboard', 'customer'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeTrue();
        });
    });

    it('should not grant access to existing parent routes based on the user', () => {
        const parentRoutes = ['unitTestingRoute'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeFalse();
        });
    });

    it('should not grant access to nonexistent parent routes', () => {
        const parentRoutes = ['imaginarycomponent', 'somecomponent'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeFalse();
        });
    });

    it('should grant access to existing child routes', () => {
        const childRoutes = ['consumption', 'projects', 'licenses'];
        childRoutes.forEach(route => {
            expect(guard.canActivateChild({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBeTrue();
        });
    });

    it('should not grant access to nonexistent child routes', () => {
        const childRoutes = ['imaginarycomponent', 'somecomponent'];
        childRoutes.forEach(route => {
            expect(guard.canActivateChild({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBeFalse();
        });
    });
});

describe('When the feature toggles are loaded for a undefined user', () => {
    beforeEach(beforeEachFunction);
    beforeEach(() => {
        msalServiceMock.getActiveAccount.and.returnValue(undefined);
    });
    it('should not grant access to nonexistent parent routes based on the user', () => {
        const parentRoutes = ['unitTestingRoute'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeFalse();
        });
    });
    it('should not grant access to nonexistent child routes based on the user', () => {
        const parentRoutes = ['unitTestingRoute'];
        parentRoutes.forEach(route => {
            expect(guard.canActivateChild({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBeFalse();
        });
    });
});
