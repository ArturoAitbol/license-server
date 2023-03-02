
import { ComponentFixture, TestBed, } from '@angular/core/testing';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CtaasTestReportsComponent } from './ctaas-test-reports.component';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { SharedModule } from '../../shared/shared.module';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { SubaccountServiceMock } from 'src/test/mock/services/subaccount-service.mock';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MsalService } from '@azure/msal-angular';
import { MsalServiceMock } from 'src/test/mock/services/msal-service.mock';


let ctaasTestReportComponentTestInstance: CtaasTestReportsComponent;
let fixture: ComponentFixture<CtaasTestReportsComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const RouterMock = {
  navigate: (commands: string[]) => { }
};

const beforeEachFunction = () => {
  TestBed.configureTestingModule({
    declarations: [CtaasTestReportsComponent],
    imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule],
    providers: [
      {
        provide: Router,
        useValue: RouterMock
      },
      {
        provide: MsalService,
        useValue: MsalServiceMock
      },
      {
        provide: SubAccountService,
        useValue: SubaccountServiceMock
      }
    ]
  });
  fixture = TestBed.createComponent(CtaasTestReportsComponent);
  ctaasTestReportComponentTestInstance = fixture.componentInstance;
  loader = TestbedHarnessEnvironment.loader(fixture);
  spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
};

describe('UI verification test', () => {
  beforeEach(beforeEachFunction);
  it('should display essential UI and components', () => {
    fixture.detectChanges();
    const h2 = fixture.nativeElement.querySelector('#main-title');
    const typeFilterLabel = fixture.nativeElement.querySelector('#type-filter-label');
    const startDateFilterLabel = fixture.nativeElement.querySelector('#start-date-filter-label');
    const endDateFilterLabel = fixture.nativeElement.querySelector('#end-date-filter-label');
    const utcNoticeLabel = fixture.nativeElement.querySelector('#utc-notice');

    expect(h2.textContent).toBe('Test Reports');
    expect(typeFilterLabel.textContent).toBe('Choose report type');
    expect(startDateFilterLabel.textContent).toBe('Choose Start Date');
    expect(endDateFilterLabel.textContent).toBe('Choose End Date');
    expect(utcNoticeLabel.textContent).toBe('Please notice that selected dates will be used in UTC');
  });
});

describe('Data collection and parsing test', () => {
  beforeEach(beforeEachFunction);
  it('should make a call to get the selected subaccount', () => {
    fixture.detectChanges();
    expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();

  });
});

describe('interaction with selected filters', () => {
  beforeEach(beforeEachFunction);
  it('should create a formGroup with necessary controls', () => {
    fixture.detectChanges();
    expect(ctaasTestReportComponentTestInstance.filterForm.get('reportType')).toBeTruthy();
    expect(ctaasTestReportComponentTestInstance.filterForm.get('startDate')).toBeTruthy();
    expect(ctaasTestReportComponentTestInstance.filterForm.get('endDate')).toBeTruthy();
  });
  it('should make all the controls required', () => {
    const filterForm = ctaasTestReportComponentTestInstance.filterForm;
    filterForm.setValue({
      reportType: '',
      startDate: '',
      endDate: '',
    });
    expect(filterForm.get('reportType').valid).toBeFalse();
    expect(filterForm.get('startDate').valid).toBeFalse();
    expect(filterForm.get('endDate').valid).toBeFalse();
  });

  it('should execute action with expected data given set arguments', () => {
    fixture.detectChanges();
    const filterForm = ctaasTestReportComponentTestInstance.filterForm;
    filterForm.setValue({
      reportType: "Daily-FeatureFunctionality",
      endDate: "2023-01-10T03:44:09",
      startDate: "2023-01-09T:11:36:17"
    });

    spyOn(ctaasTestReportComponentTestInstance, 'filterReport').and.callThrough();
    spyOn(window, 'open').and.returnValue(null);
    spyOn(window, 'close').and.returnValue(null);

  });
})