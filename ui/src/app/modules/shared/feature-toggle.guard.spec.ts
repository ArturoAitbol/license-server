import { FeatureToggleGuard } from "./feature-toggle.guard";
import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { SnackBarService } from "../../services/snack-bar.service";
import { SnackBarServiceMock } from "../../../test/mock/services/snack-bar-service.mock";
import { HttpBackend, HttpClient } from "@angular/common/http";
import { FeatureToggleService } from "../../services/feature-toggle.service";
import { FeatureToggleServiceMock } from "../../../test/mock/services/feature-toggle-service.mock";

const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
};
let guard: FeatureToggleGuard;

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
                provide: HttpClient,
                useValue: HttpClient
            },
            {
                provide: HttpBackend,
                useValue: HttpBackend
            },
            {
                provide: FeatureToggleService,
                useValue: FeatureToggleServiceMock
            },
        ],
    }).compileComponents().then(() => {
        guard = TestBed.inject(FeatureToggleGuard);
    });
};

describe('Feature Toggle Guard - When feature toggles are enabled should let navigate to parent routes', () => {
    beforeEach(beforeEachFunction);
    it('should grant access to existing parent routes', () => {
        const parentRoutes = ['dashboard', 'customer'];
        parentRoutes.forEach(route => {
            expect(guard.canActivate({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot)).toBeTrue();
        });
    });

    it('should not grant access when feature toggle is disabled', () => {
        spyOn(FeatureToggleServiceMock, "isFeatureEnabled").and.returnValue(false);
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
        spyOn(FeatureToggleServiceMock, "isFeatureEnabled").and.returnValue(false);
        const childRoutes = ['imaginarycomponent', 'somecomponent'];
        childRoutes.forEach(route => {
            expect(guard.canActivateChild({url: [{path: route, parameters: {}}]} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBeFalse();
        });
    });
});
