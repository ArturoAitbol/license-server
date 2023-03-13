
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick, } from '@angular/core/testing';
import { MatSnackBarModule} from '@angular/material/snack-bar';
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
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { CtaasSetupServiceMock } from 'src/test/mock/services/ctaas-setup.service.mock';
import { of } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { TestReportsServiceMock } from 'src/test/mock/services/ctaas-test-reports.service.mock';
import { Utility } from 'src/app/helpers/utils';
import { BannerService } from 'src/app/services/alert-banner.service';
import { BannerServiceMock } from 'src/test/mock/services/alert-banner-service.mock';


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
      },
      {
        provide: CtaasSetupService,
        useValue: CtaasSetupServiceMock
      },
      {
        provide: BannerService,
        useValue: BannerServiceMock
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
    spyOn(ctaasTestReportComponentTestInstance, 'sizeChange').and.callThrough();
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

  it('should execute action with expected data given set arguments', () => {
    fixture.detectChanges();
    const filterForm = ctaasTestReportComponentTestInstance.filterForm;
    filterForm.setValue({
      reportType: "Daily-FeatureFunctionality",
      endDate: "2023-01-10T03:44:09",
      startDate: "2023-01-09T:11:36:17",
      todayReportType: ''
    });

    spyOn(ctaasTestReportComponentTestInstance, 'filterReport').and.callThrough();
    spyOn(window, 'open').and.returnValue(null);
    spyOn(window, 'close').and.returnValue(null);

  });

  it('should call to rowAction with Daily-featureFunctionality', () => {
    fixture.detectChanges();
    const selectedTestData = {selectedRow: {
      startDate: '2023-01-10T00:00:00',
      endDate: '2023-01-10T:11:36:17'
    },
    selectedOption: 'Daily-FeatureFunctionality', 
    selectedIndex: '0' }
    spyOn(ctaasTestReportComponentTestInstance, 'rowAction').and.callThrough();
    spyOn(window, 'open').and.returnValue(null);
    spyOn(window, 'close').and.returnValue(null);

    ctaasTestReportComponentTestInstance.rowAction(selectedTestData);
    expect(window.open).toHaveBeenCalled();
  });

  it('should call to rowAction with Daily-CallingReliability', () => {
    fixture.detectChanges();
    const selectedTestData = {selectedRow: {
      startDate: '2023-01-10T00:00:00',
      endDate: '2023-01-10T:11:36:17'
    },
    selectedOption: 'Daily-CallingReliability', 
    selectedIndex: '0' }
    spyOn(ctaasTestReportComponentTestInstance, 'rowAction').and.callThrough();
    spyOn(window, 'open').and.returnValue(null);
    spyOn(window, 'close').and.returnValue(null);

    ctaasTestReportComponentTestInstance.rowAction(selectedTestData);
    expect(window.open).toHaveBeenCalled();
  });

  it('should setup the flags with withoutTapURL', () => {
    fixture.detectChanges();
    const res = {ctaasSetups:[{tapUrl:''}]}
    spyOn(ctaasTestReportComponentTestInstance, 'userSetupData').and.callThrough();
    spyOn(CtaasSetupServiceMock, 'getSubaccountCtaasSetupDetails').and.returnValue(of(res));

    ctaasTestReportComponentTestInstance.userSetupData();
    expect(ctaasTestReportComponentTestInstance.tapURLFlag).toBe('withoutTapURL');
  });

  it('should setup and call bannerService ', () => {
    fixture.detectChanges();
    const res = {ctaasSetups:[{maintenance:true}]}
    spyOn(ctaasTestReportComponentTestInstance, 'userSetupData').and.callThrough();
    spyOn(BannerServiceMock, 'open').and.callThrough();
    spyOn(CtaasSetupServiceMock, 'getSubaccountCtaasSetupDetails').and.returnValue(of(res));

    fixture.detectChanges();

    ctaasTestReportComponentTestInstance.userSetupData();
    expect(ctaasTestReportComponentTestInstance.submitDisabled).toBeTrue();
  });

  it('should setup the flags with withoutData', () => {
    fixture.detectChanges();
    const res = {ctaasSetups:[]}
    spyOn(ctaasTestReportComponentTestInstance, 'userSetupData').and.callThrough();
    spyOn(CtaasSetupServiceMock, 'getSubaccountCtaasSetupDetails').and.returnValue(of(res));

    ctaasTestReportComponentTestInstance.userSetupData();
    expect(ctaasTestReportComponentTestInstance.tapURLFlag).toBe('withoutData');
  });

  it('test reports - should sort data table', () => {
    const sort: Sort = { active: 'startDate', direction: 'desc' }
    spyOn(ctaasTestReportComponentTestInstance,'sortData').and.callThrough();
    ctaasTestReportComponentTestInstance.dateList = TestReportsServiceMock.unsortedDateList;

    ctaasTestReportComponentTestInstance.sortData(sort);
    expect(ctaasTestReportComponentTestInstance.dateList).toEqual(TestReportsServiceMock.descSortedDateList);

    sort.direction = 'asc';
    ctaasTestReportComponentTestInstance.sortData(sort);
    expect(ctaasTestReportComponentTestInstance.dateList).toEqual(TestReportsServiceMock.ascSortedDateList);

    sort.direction = '';
    fixture.detectChanges();
    ctaasTestReportComponentTestInstance.sortData(sort);
    expect(ctaasTestReportComponentTestInstance.dateList).toEqual(TestReportsServiceMock.unsortedDateList);
  });

  it('test reports - should call to todayReport', () => {
    fixture.detectChanges();
    spyOn(window, 'open').and.returnValue(null);
    spyOn(window, 'close').and.returnValue(null);
    spyOn(Utility, 'parseReportDate').and.callThrough();
    spyOn(ctaasTestReportComponentTestInstance, 'todayReport').and.callThrough();
    ctaasTestReportComponentTestInstance.filterForm.get('todayReportType').setValue('Daily-FeatureFunctionality');
    fixture.detectChanges();
    ctaasTestReportComponentTestInstance.todayReport();
    expect(Utility.parseReportDate).toHaveBeenCalled();
  });

  it('test reports - should make a call with filterReport', () => {
    fixture.detectChanges();
    spyOn(window, 'open').and.returnValue(null);
    spyOn(window, 'close').and.returnValue(null);
    spyOn(Utility, 'parseReportDate').and.callThrough();
    spyOn(ctaasTestReportComponentTestInstance, 'filterReport').and.callThrough();

    ctaasTestReportComponentTestInstance.filterForm.get('reportType').setValue('Daily-FeatureFunctionality');
    ctaasTestReportComponentTestInstance.filterForm.get('startDate').setValue('2023-03-01T11:16');
    ctaasTestReportComponentTestInstance.filterForm.get('endDate').setValue('2023-03-04T11:16');

    fixture.detectChanges();
    ctaasTestReportComponentTestInstance.filterReport();

    expect(Utility.parseReportDate).toHaveBeenCalledWith(new Date('2023-03-01T11:16'));
    expect(Utility.parseReportDate).toHaveBeenCalledWith(new Date('2023-03-04T11:16'));
  });

  it('test report - should clear the start date data', () => {
    fixture.detectChanges();
    ctaasTestReportComponentTestInstance.filterForm.get('startDate').setValue('2023-03-01T11:16');
    ctaasTestReportComponentTestInstance.filterForm.get('endDate').setValue('2023-03-04T11:16');

    fixture.detectChanges();
    ctaasTestReportComponentTestInstance.clearDateFilter('start');

    expect(ctaasTestReportComponentTestInstance.filterForm.get('startDate').value).toBe('');
    expect(ctaasTestReportComponentTestInstance.filterForm.get('endDate').value).toBe('');
  });

  it('test reports - should clear the end date data', () => {
    fixture.detectChanges();
    ctaasTestReportComponentTestInstance.filterForm.get('endDate').setValue('2023-03-04T11:16');

    fixture.detectChanges();
    ctaasTestReportComponentTestInstance.clearDateFilter('endDate');

    expect(ctaasTestReportComponentTestInstance.filterForm.get('endDate').value).toBe('');
    expect(ctaasTestReportComponentTestInstance.minEndDate).toEqual(null);
  });

  it(' test reports - should filter the list of reports', fakeAsync(() => {
    ctaasTestReportComponentTestInstance.filterForm.patchValue({
        reportType:'Daily-FeatureFunctionality', 
        startDate:'2023-03-01T11:16', 
        endDate:'2023-03-04T11:16', 
        todayReportType: 'Daily-FeatureFunctionality'
      })
    tick(1000)
    fixture.detectChanges();

    ctaasTestReportComponentTestInstance.filterForm.updateValueAndValidity();
    tick(1000)
    fixture.detectChanges();
   

    expect(ctaasTestReportComponentTestInstance.searchFlag).toBeFalse();
  }));

  it('should call toggleDateValue', () => {
    fixture.detectChanges();
    spyOn(ctaasTestReportComponentTestInstance, 'toggleDateValue').and.callThrough();

    ctaasTestReportComponentTestInstance.toggleDateValue('2023-03-01T11:16');

    expect(ctaasTestReportComponentTestInstance.minEndDate).toEqual('2023-03-01T11:16')

  });
});