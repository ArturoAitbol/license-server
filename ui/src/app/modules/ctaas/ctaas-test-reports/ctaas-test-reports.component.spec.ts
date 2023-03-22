
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick, } from '@angular/core/testing';
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
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { CtaasSetupServiceMock } from 'src/test/mock/services/ctaas-setup.service.mock';
import { Sort } from '@angular/material/sort';
import { TestReportsServiceMock } from 'src/test/mock/services/ctaas-test-reports.service.mock';
import { Utility } from 'src/app/helpers/utils';
import { SearchConsolidateDateComponent } from './search-consolidate-date/search-consolidate-date.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogMock } from 'src/test/mock/components/mat-dialog.mock';
import { of } from "rxjs";
import { BannerServiceMock } from "../../../../test/mock/services/alert-banner-service.mock";
import { BannerService } from "../../../services/alert-banner.service";
import { BannerComponent } from "../banner/banner.component";


let ctaasTestReportComponentTestInstance: CtaasTestReportsComponent;
let fixture: ComponentFixture<CtaasTestReportsComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const RouterMock = {
  navigate: (commands: string[]) => { }
};

const beforeEachFunction = () => {
  TestBed.configureTestingModule({
    declarations: [CtaasTestReportsComponent, BannerComponent],
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
      },
      {
        provide: MatDialog,
        useValue: MatDialogMock
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
    const subTitleLabel = fixture.nativeElement.querySelector('#sub-title');

    expect(h2.textContent).toBe('Report for today');
    
    expect(subTitleLabel.textContent).toBe('Pick from the reports autogenerated for you');
  });
});

describe('Data collection and parsing test', () => {
  beforeEach(beforeEachFunction);
  it('should make a call to get the selected subaccount', () => {
    fixture.detectChanges();
    expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();

  });

  it('should make a call to searchConsolidatedReport', () => {
    fixture.detectChanges();
    spyOn(ctaasTestReportComponentTestInstance, 'searchConsolidatedReport').and.callThrough();
    spyOn(MatDialogMock, 'open').and.callThrough();
    ctaasTestReportComponentTestInstance.searchConsolidatedReport();
    expect(ctaasTestReportComponentTestInstance.dialog.open).toHaveBeenCalledWith(SearchConsolidateDateComponent, {
      width:'450px',
      disableClose: true
    });
  });

  it('should call to onChangeButtonToggle with calling option', () => {
    fixture.detectChanges();
    spyOn(ctaasTestReportComponentTestInstance, 'onChangeButtonToggle').and.callThrough();
    const toggleButton = fixture.nativeElement.querySelector('#calling-button');
    toggleButton.click();
    ctaasTestReportComponentTestInstance.fontStyleControl.setValue('calling');
    ctaasTestReportComponentTestInstance.onChangeButtonToggle();

    expect(ctaasTestReportComponentTestInstance.dateListBK.length).toBe(15)
  });

  it('should call to onChangeButtonToggle with fetaure option', () => {
    fixture.detectChanges();
    spyOn(ctaasTestReportComponentTestInstance, 'onChangeButtonToggle').and.callThrough();
    const toggleButton = fixture.nativeElement.querySelector('#feature-button');
    toggleButton.click();
    ctaasTestReportComponentTestInstance.fontStyleControl.setValue('feature');
    ctaasTestReportComponentTestInstance.onChangeButtonToggle();

    expect(ctaasTestReportComponentTestInstance.dateListBK.length).toBe(15)
  });

});

describe('interaction with selected filters', () => {
  beforeEach(beforeEachFunction);

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

  it('test reports - should sort data table', fakeAsync (() => {
    const sort: Sort = { active: 'startDate', direction: 'desc' }
    spyOn(ctaasTestReportComponentTestInstance,'sortData').and.callThrough();
    spyOn(ctaasTestReportComponentTestInstance, 'onChangeButtonToggle').and.callThrough();
    ctaasTestReportComponentTestInstance.dateList = TestReportsServiceMock.unsortedDateList;
    fixture.detectChanges();
    ctaasTestReportComponentTestInstance.sortData(sort);
    expect(ctaasTestReportComponentTestInstance.dateListBK).toEqual(TestReportsServiceMock.descSortedDateList);

    sort.direction = 'asc';
    ctaasTestReportComponentTestInstance.sortData(sort);
    expect(ctaasTestReportComponentTestInstance.dateListBK).toEqual(TestReportsServiceMock.ascSortedDateList);

    sort.direction = '';
    fixture.detectChanges();
    ctaasTestReportComponentTestInstance.dateListBK = TestReportsServiceMock.unsortedDateList;
    ctaasTestReportComponentTestInstance.sortData(sort);
    expect(ctaasTestReportComponentTestInstance.dateListBK).toEqual(TestReportsServiceMock.unsortedDateList);
  }));

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

describe('Ctaas Test Reports - maintenance mode', () => {
  beforeEach(beforeEachFunction);
  it('should open an alert banner when maintenance mode is enabled',fakeAsync(() => {
    spyOn(CtaasSetupServiceMock, "getSubaccountCtaasSetupDetails").and.returnValue(of({ ctaasSetups: [CtaasSetupServiceMock.testSetupMaintenance] }));
    spyOn(BannerServiceMock, "open").and.callThrough();
    fixture.detectChanges();
    tick();
    expect(BannerServiceMock.open).toHaveBeenCalledWith('WARNING', 'Spotlight service is under maintenance, this function is disabled until the service resumes. ', jasmine.any(Object));
    discardPeriodicTasks();
  }));
});
