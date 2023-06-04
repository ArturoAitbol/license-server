import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotlightDashboardComponent } from './spotlight-dashboard.component';
import { TestBedConfigBuilder } from 'src/test/mock/TestBedConfigHelper.mock';
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

let dashboardPocComponentTestInstance: SpotlightDashboardComponent;
let fixture: ComponentFixture<SpotlightDashboardComponent>;

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(SpotlightDashboardComponent);
    configBuilder.addProvider({provide: ActivatedRoute, useValue: {
            queryParams: of({
                id: "f2b57afb-c389-48ec-a54b-7d8a05a51f32",
            })
        }});
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
