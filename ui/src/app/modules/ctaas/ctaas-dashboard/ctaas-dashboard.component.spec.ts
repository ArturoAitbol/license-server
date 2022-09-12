import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtaasDashboardComponent } from './ctaas-dashboard.component';

describe('CtaasDashboardComponent', () => {
  let component: CtaasDashboardComponent;
  let fixture: ComponentFixture<CtaasDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CtaasDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CtaasDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
