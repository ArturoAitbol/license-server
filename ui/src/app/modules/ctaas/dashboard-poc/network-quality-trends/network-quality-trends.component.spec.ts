import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkQualityTrendsComponent } from './network-quality-trends.component';
import { TestBedConfigBuilder } from 'src/test/mock/TestBedConfigHelper.mock';

let networkQualityTrendsComponentTestInstance: NetworkQualityTrendsComponent;
let fixture: ComponentFixture<NetworkQualityTrendsComponent>;

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(NetworkQualityTrendsComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(NetworkQualityTrendsComponent);
    networkQualityTrendsComponentTestInstance = fixture.componentInstance;
};

describe('NetworkQualityTrendsComponent', () => {
  beforeEach(beforeEachFunction);

  it('should create', () => {
    expect(networkQualityTrendsComponentTestInstance).toBeTruthy();
  });
});
