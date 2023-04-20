import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FeatureToggleMgmtServiceMock } from "../../../test/mock/services/feature-toggle-mgmt-service.mock";
import { MatDialogMock } from "../../../test/mock/components/mat-dialog.mock";
import { FeatureTogglesComponent } from "./feature-toggles.component";
import { AddFeatureToggleModalComponent } from "./add-feature-toggle-modal/add-feature-toggle-modal.component";
import { TestBedConfigBuilder } from '../../../test/mock/TestBedConfigHelper.mock';

let testInstance: FeatureTogglesComponent;
let fixture: ComponentFixture<FeatureTogglesComponent>;

const beforeEachFunction = waitForAsync(
    () => {
      const configBuilder = new TestBedConfigBuilder().useDefaultConfig(FeatureTogglesComponent);
      TestBed.configureTestingModule(configBuilder.getConfig()).compileComponents().then(() => {
        fixture = TestBed.createComponent(FeatureTogglesComponent);
        testInstance = fixture.componentInstance;
      });
    }
);

describe('Feature Toggles Component - UI verification tests', () => {
  beforeEach(beforeEachFunction);
  it('should display form labels text correctly', () =>{
    fixture.detectChanges();
    const pageTitle = fixture.nativeElement.querySelector('#page-title');
    const addFtBtn = fixture.nativeElement.querySelector('#add-ft-btn');
    expect(pageTitle.textContent).toBe('Feature Toggles');
    expect(addFtBtn.textContent).toBe('Add Feature Toggle ');
  });

  it('should load the feature toggles data', () =>{
    spyOn(FeatureToggleMgmtServiceMock, "getFeatureToggles").and.callThrough();
    fixture.detectChanges();
    expect(FeatureToggleMgmtServiceMock.getFeatureToggles).toHaveBeenCalledTimes(1);

  });
});

describe('Feature Toggles Component - Add feature toggle functionality', () => {
  beforeEach(beforeEachFunction);
  it('should open the add feature toggle modal when button is clicked', () =>{
    spyOn(MatDialogMock, "open").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "getFeatureToggles").and.callThrough();
    fixture.detectChanges();
    const addFtBtn = fixture.nativeElement.querySelector('#add-ft-btn');
    addFtBtn.click();
    expect(MatDialogMock.open).toHaveBeenCalledWith(AddFeatureToggleModalComponent, { width: '400px', disableClose: true });
    expect(FeatureToggleMgmtServiceMock.getFeatureToggles).toHaveBeenCalledTimes(2);
  });
});
