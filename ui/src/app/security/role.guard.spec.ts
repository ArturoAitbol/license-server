import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SnackBarService } from "../services/snack-bar.service";
import { RoleGuard } from "./role.guard";

const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
};
let guard: RoleGuard

const msalServiceMock = jasmine.createSpyObj('MsalService', ['getActiveAccount']);
msalServiceMock.instance = msalServiceMock;

const beforeEachFunction = async () => {
    await TestBed.configureTestingModule({
        providers: [
            RoleGuard,
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
        ]
    }).compileComponents().then(() => {
        guard = TestBed.inject(RoleGuard);
    });
};

describe('When roles are loaded for username@test.com', () => {
    beforeEach(beforeEachFunction);
    beforeEach(() => {
        msalServiceMock.getActiveAccount.and.returnValue(MsalServiceMock.mockIdTokenClaims)
    });

    it('should grant access to existing parent routes', () => {
        const parentRoutes = ['customers-dashboard', 'customer'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeTrue();
        });
    });

    it('should grant access to spotlight parent routes', () => {
        const parentRoutes = ['spotlight', 'customer'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeTrue();
        });
    });

    it('should now grant access to nonexistent parent routes', () => {
        const parentRoutes = ['imaginarycomponent', 'somecomponent'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeFalse();
        });
    });

    it('should not grant access to existing parent routes based on the user', () => {
        const parentRoutes = ['unitTestingRoute'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeFalse();
        });
    });
    
});

describe('When roles are not loaded for username@test.com', () => {
    beforeEach(beforeEachFunction);
    beforeEach(() => {
        msalServiceMock.getActiveAccount.and.returnValue(MsalServiceMock.mockIdTokenClaimsWithoutRoles)
    });

    it('should call canActive with no roles', () => {
        const parentRoutes = ['customers-dashboard', 'customer'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeFalse();
        });
    });   

    it('should call canActive with no roles', () => {
        const parentRoutes = ['imaginarycomponent', 'somecomponent'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeFalse();
        });
    });   
});
