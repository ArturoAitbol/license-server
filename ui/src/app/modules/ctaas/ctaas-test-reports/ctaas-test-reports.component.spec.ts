import { HttpClient } from '@angular/common/http';
import { ComponentFixture,TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CtaasTestReportsComponent } from './ctaas-test-reports.component';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { SharedModule } from '../../shared/shared.module';
import { MatDialogMock } from 'src/test/mock/components/mat-dialog.mock';
import { TestReportsService } from 'src/app/services/test-reports.service';
import { TestReportsServiceMock } from 'src/test/mock/services/ctaas-test-reports.service.mock';
import { DialogService } from 'src/app/services/dialog.service';
import { MsalServiceMock } from 'src/test/mock/services/msal-service.mock';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { SubaccountServiceMock } from 'src/test/mock/services/subaccount-service.mock';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { of, throwError } from 'rxjs';
import { ITestReports } from 'src/app/model/test-reports.model';


let ctaasTestReportComponentTestInstance: CtaasTestReportsComponent;
let fixture: ComponentFixture<CtaasTestReportsComponent>;
const dialogService = new DialogServiceMock();


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
                provide: MatDialog,
                useValue: MatDialogMock
            },
            {
                provide: MatSnackBarRef,
                useValue: {}
            },
            {
                provide: TestReportsService,
                useValue: TestReportsServiceMock
            },
            {
                provide: DialogService,
                useValue: dialogService
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
                provide: HttpClient,
                useValue: HttpClient
            },
            {
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            },
        ]
    });
    fixture = TestBed.createComponent(CtaasTestReportsComponent);
    ctaasTestReportComponentTestInstance = fixture.componentInstance;
};

describe('UI verification test', () => {
  beforeEach(beforeEachFunction);
  it('should display essential UI and components', () => {
    fixture.detectChanges();
    const h2 = fixture.nativeElement.querySelector('#main-title');
    const typeFilterLabel = fixture.nativeElement.querySelector('#type-filter-label');
    const dateFilterLabel = fixture.nativeElement.querySelector('#date-filter-label');

    expect(h2.textContent).toBe('Test Reports');
    expect(typeFilterLabel.textContent).toBe('Filter by report type');
    expect(dateFilterLabel.textContent).toBe('Filter by date');
  });

  it('should load correct data form the columns for the table', () => {
    fixture.detectChanges();
    const reportTypeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[0];
    const startTimeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[1];
    const endTimeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[2];

    expect(reportTypeColumn.innerText).toBe('Report Type');
    expect(startTimeColumn.innerText).toBe('Start Time');
    expect(endTimeColumn.innerText).toBe('End Time');
  });

  it('should call sortData and sort the data', () => {
    ctaasTestReportComponentTestInstance.testReportsData = TestReportsServiceMock.testReportsValue.reports;
    ctaasTestReportComponentTestInstance.sortData({active: "reportType", direction: "asc"});
    expect(ctaasTestReportComponentTestInstance.testReportsData).toEqual(TestReportsServiceMock.testReportsSortedAsc.reports);
    
    ctaasTestReportComponentTestInstance.sortData({active: "reportType", direction: "desc"});
    expect(ctaasTestReportComponentTestInstance.testReportsData).toEqual(TestReportsServiceMock.testReportsSortedDesc.reports);

    ctaasTestReportComponentTestInstance.sortData({active: "reportType", direction: ''});
    expect(ctaasTestReportComponentTestInstance.testReportsData).toEqual(TestReportsServiceMock.testReportsValue.reports);
  })

});

describe('Data collection and parsing test', () => {
  beforeEach(beforeEachFunction);
  it('should make a call to get the selected subaccount, test reports and actionMenuOptions ', () => {
    spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
    spyOn(TestReportsServiceMock, 'getTestReportsList').and.callThrough();
    spyOn(MsalServiceMock.instance, 'getActiveAccount').and.callThrough();

    fixture.detectChanges();

    expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
    expect(TestReportsServiceMock.getTestReportsList).toHaveBeenCalled();
    expect(MsalServiceMock.instance.getActiveAccount).toHaveBeenCalled();
    expect(ctaasTestReportComponentTestInstance.actionMenuOptions).toEqual(['View Report'])
  });

  it('should change the loading-related variables if getLicenses() got an error', () => {
    spyOn(TestReportsServiceMock, 'getTestReportsList').and.returnValue(throwError("error"));

    fixture.detectChanges();

    expect(ctaasTestReportComponentTestInstance.isLoadingResults).toBeFalse();
    expect(ctaasTestReportComponentTestInstance.isRequestCompleted).toBeTrue();
  });

  // it('should return an error if something went wrong while fetching the data', () => {
  //   spyOn(console, 'error').and.callThrough();
  //   spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
  //   spyOn(TestReportsServiceMock, 'getTestReportsList').and.returnValue(of([{error:'some error'}]));

  //   fixture.detectChanges();

  //   expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
  //   expect(console.error).toHaveBeenCalledWith('some error |', jasmine.any(TypeError));
  // })
});

describe('Interactions of the table', () => {
  beforeEach(beforeEachFunction);

  // it('should execute rowAction() with expected data given set arguments', async () => {
  //   spyOn(ctaasTestReportComponentTestInstance, 'onClickMoreDetails').and.callThrough();
  //   ctaasTestReportComponentTestInstance.testReportsData = TestReportsServiceMock.testReportsValue.reports;
    
  //   const testReport: ITestReports = TestReportsServiceMock.mockTestReportA;
    
  //   const selectedTestData = {selectedRow: testReport, selectedOption: undefined, selectedIndex: '0'};
  //   selectedTestData.selectedOption = ctaasTestReportComponentTestInstance.VIEW_REPORT;
    
  //   fixture.detectChanges();
  //   await fixture.whenStable();
    
  //   ctaasTestReportComponentTestInstance.rowAction(selectedTestData);
  //   expect(ctaasTestReportComponentTestInstance.onClickMoreDetails).toHaveBeenCalledWith(selectedTestData.selectedIndex)
  // });

  it('should filter the rows in the table based on the name, type and status filters',() => {
    ctaasTestReportComponentTestInstance.filterForm.patchValue({typeFilterControl: 'Daily-FeatureFunctionality'});
    ctaasTestReportComponentTestInstance.toggleOptionValue('Daily-FeatureFunctionality');

    expect(ctaasTestReportComponentTestInstance.selectedTypeFilter).toBe('feature');

    ctaasTestReportComponentTestInstance.filterForm.patchValue({typeFilterControl: 'Daily-CallingReliability'});
    ctaasTestReportComponentTestInstance.toggleOptionValue('Daily-CallingReliability');

    expect(ctaasTestReportComponentTestInstance.selectedTypeFilter).toBe('calling');

    ctaasTestReportComponentTestInstance.filterForm.patchValue({typeFilterControl: 'None'});
    ctaasTestReportComponentTestInstance.toggleOptionValue('None');

    expect(ctaasTestReportComponentTestInstance.selectedTypeFilter).toBe('');

    ctaasTestReportComponentTestInstance.filterForm.patchValue({typeFilterControl: 'any'});
    ctaasTestReportComponentTestInstance.toggleOptionValue('any');

    expect(ctaasTestReportComponentTestInstance.selectedTypeFilter).toBe('');

    // ctaasTestReportComponentTestInstance.clearDate();
    // expect(ctaasTestReportComponentTestInstance.selectedDateFilter).toBe('')
  });
});