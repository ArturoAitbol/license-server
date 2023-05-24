import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkQualityComponent } from './network-quality.component';
import { TestBedConfigBuilder } from 'src/test/mock/TestBedConfigHelper.mock';

let networkQualityTrendsComponentTestInstance: NetworkQualityComponent;
let fixture: ComponentFixture<NetworkQualityComponent>;

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(NetworkQualityComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(NetworkQualityComponent);
    networkQualityTrendsComponentTestInstance = fixture.componentInstance;
};

describe('NetworkQualityTrendsComponent', () => {
  beforeEach(beforeEachFunction);

  it('should create', () => {
    expect(networkQualityTrendsComponentTestInstance).toBeTruthy();
  });
});
