import { FeatureToggleGuard } from "./feature-toggle.guard";
import { TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { FeatureToggleServiceMock } from "../../../test/mock/services/feature-toggle-service.mock";
import { TestBedConfigBuilder } from '../../../test/mock/TestBedConfigHelper.mock';
import { FeatureTogglesComponent } from '../feature-toggles/feature-toggles.component';

let guard: FeatureToggleGuard;

const beforeEachFunction = waitForAsync(
    () => {
        const configBuilder = new TestBedConfigBuilder().useDefaultConfig(FeatureTogglesComponent);
        TestBed.configureTestingModule(configBuilder.getConfig()).compileComponents().then(() => {
            guard = TestBed.inject(FeatureToggleGuard);
        });
    }
);

describe('Feature Toggle Guard - When feature toggles are enabled should let navigate to parent routes', () => {
    beforeEach(beforeEachFunction);
    it('should grant access to existing parent routes', () => {
        const parentRoutes = ['customers-dashboard', 'customer'];
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
