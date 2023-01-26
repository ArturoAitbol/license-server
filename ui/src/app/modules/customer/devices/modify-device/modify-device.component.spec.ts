import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyDeviceComponent } from './modify-device.component';

describe('ModifyDeviceComponent', () => {
  let component: ModifyDeviceComponent;
  let fixture: ComponentFixture<ModifyDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyDeviceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
