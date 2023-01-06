import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtaasTestReportsComponent } from './ctaas-test-reports.component';

describe('CtaasTestReportsComponent', () => {
  let component: CtaasTestReportsComponent;
  let fixture: ComponentFixture<CtaasTestReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CtaasTestReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CtaasTestReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
