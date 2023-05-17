import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerNetworkQualityComponent } from './customer-network-quality.component';
import { TestBedConfigBuilder } from 'src/test/mock/TestBedConfigHelper.mock';

let customerNetworkQualityComponentTestInstance: CustomerNetworkQualityComponent;
let fixture: ComponentFixture<CustomerNetworkQualityComponent>;

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CustomerNetworkQualityComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(CustomerNetworkQualityComponent);
    customerNetworkQualityComponentTestInstance = fixture.componentInstance;
};

describe('CustomerNetworkQualityComponent', () => {
  beforeEach(beforeEachFunction);

  it('should create', () => {
    expect(customerNetworkQualityComponentTestInstance).toBeTruthy();
  });
});
