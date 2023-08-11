import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsChartComponent } from './permissions-chart.component';

describe('PermissionsChartComponent', () => {
  let component: PermissionsChartComponent;
  let fixture: ComponentFixture<PermissionsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
