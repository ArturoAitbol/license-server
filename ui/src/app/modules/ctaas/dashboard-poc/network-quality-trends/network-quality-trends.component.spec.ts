import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkQualityTrendsComponent } from './network-quality-trends.component';

describe('NetworkQualityTrendsComponent', () => {
  let component: NetworkQualityTrendsComponent;
  let fixture: ComponentFixture<NetworkQualityTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetworkQualityTrendsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkQualityTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
