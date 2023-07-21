import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinerComponent } from './loading-spiner.component';
import { TestBedConfigBuilder } from 'src/test/mock/TestBedConfigHelper.mock';

describe('LoadingSpinerComponent', () => {
  let fixture: ComponentFixture<LoadingSpinerComponent>;
  let loadingSpiner: LoadingSpinerComponent;

  const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(LoadingSpinerComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(LoadingSpinerComponent);
    loadingSpiner = fixture.componentInstance;
    loadingSpiner.message = 'Please wait...';
    loadingSpiner.visible = true;
    loadingSpiner.ngOnInit();
  }

  describe('Verification test for loading spiner', () => {
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

      expect(loadingSpiner.message).toBe('Please wait...');
      expect(loadingSpiner.visible).toBe(true);
  });
  });
});
