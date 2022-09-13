import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardWizardComponent } from './onboard-wizard.component';

describe('OnboardWizardComponent', () => {
  let component: OnboardWizardComponent;
  let fixture: ComponentFixture<OnboardWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardWizardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
