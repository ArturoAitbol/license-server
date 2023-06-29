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



//Test that Daily Weekly toggle button correctly updates and reloads
//Test customer name is correct
//Test report title is correct
//Test filters and apply button
//Test Weekly graphs are in place with tooltip and correct logic
//Test Daily graphs are in place with tooltip and correct logic
describe('DashboardPocComponent', () => {
  beforeEach(beforeEachFunction);

  it('should create', () => {
    expect(dashboardPocComponentTestInstance).toBeTruthy();
  });
});
