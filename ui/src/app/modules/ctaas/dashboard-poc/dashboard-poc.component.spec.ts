import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPocComponent } from './dashboard-poc.component';
import { TestBedConfigBuilder } from 'src/test/mock/TestBedConfigHelper.mock';

let dashboardPocComponentTestInstance: DashboardPocComponent;
let fixture: ComponentFixture<DashboardPocComponent>;

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(DashboardPocComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(DashboardPocComponent);
    dashboardPocComponentTestInstance = fixture.componentInstance;
};

describe('DashboardPocComponent', () => {
  beforeEach(beforeEachFunction);

  it('should create', () => {
    expect(dashboardPocComponentTestInstance).toBeTruthy();
  });
});
