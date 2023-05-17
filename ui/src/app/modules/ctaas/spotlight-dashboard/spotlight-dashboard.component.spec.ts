import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotlightDashboardComponent } from './spotlight-dashboard.component';
import { TestBedConfigBuilder } from 'src/test/mock/TestBedConfigHelper.mock';

let dashboardPocComponentTestInstance: SpotlightDashboardComponent;
let fixture: ComponentFixture<SpotlightDashboardComponent>;

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(SpotlightDashboardComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(SpotlightDashboardComponent);
    dashboardPocComponentTestInstance = fixture.componentInstance;
};

describe('DashboardPocComponent', () => {
  beforeEach(beforeEachFunction);

  it('should create', () => {
    expect(dashboardPocComponentTestInstance).toBeTruthy();
  });
});
