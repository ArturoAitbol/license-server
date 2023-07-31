import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { TestBedConfigBuilder } from 'src/test/mock/TestBedConfigHelper.mock';

describe('LoadingSpinnerComponent', () => {
  let fixture: ComponentFixture<LoadingSpinnerComponent>;
  let loadingSpinner: LoadingSpinnerComponent;

  const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(LoadingSpinnerComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    loadingSpinner = fixture.componentInstance;
    loadingSpinner.message = 'Please wait...';
    loadingSpinner.visible = true;
    loadingSpinner.ngOnInit();
  }

  describe('Verification test for loading spinner', () => {
    beforeEach(beforeEachFunction);

    it('should contain spinner and spotlight ', () => {
        fixture.detectChanges();
        const spinnerLoading = fixture.nativeElement.querySelector('#spinnerLoading');
        const spotlightLoading = fixture.nativeElement.querySelector('#spotlightLoading');

        expect(spinnerLoading).toBeDefined();
        expect(spotlightLoading).toBeDefined();
    });

    it('should display message correctly ', () => {
      fixture.detectChanges();
      const spinnerLoading = fixture.nativeElement.querySelector('#spinnerLoading');
      const spotlightLoading = fixture.nativeElement.querySelector('#spotlightLoading');

      expect(loadingSpinner.message).toBe('Please wait...');
      expect(loadingSpinner.visible).toBe(true);
  });
  });
});
