// import { HttpClient } from '@angular/common/http';
// import { ComponentFixture,fakeAsync,TestBed, tick } from '@angular/core/testing';
// import { MatDialog } from '@angular/material/dialog';
// import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
// import { Router } from '@angular/router';
// import { MsalService } from '@azure/msal-angular';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { FormsModule, ReactiveFormsModule } from "@angular/forms";
// import { CtaasTestReportsComponent } from './old-ctaas-test-reports.component';
// import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
// import { SharedModule } from '../../shared/shared.module';
// import { MatDialogMock } from 'src/test/mock/components/mat-dialog.mock';
// import { TestReportsService } from 'src/app/services/test-reports.service';
// import { TestReportsServiceMock } from 'src/test/mock/services/ctaas-test-reports.service.mock';
// import { DialogService } from 'src/app/services/dialog.service';
// import { MsalServiceMock } from 'src/test/mock/services/msal-service.mock';
// import { SubAccountService } from 'src/app/services/sub-account.service';
// import { SubaccountServiceMock } from 'src/test/mock/services/subaccount-service.mock';
// import { SnackBarService } from 'src/app/services/snack-bar.service';
// import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
// import { of, throwError } from 'rxjs';
// import { ITestReports } from 'src/app/model/test-reports.model';
// import moment from 'moment';
// import { HarnessLoader } from '@angular/cdk/testing';
// import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';


// let ctaasTestReportComponentTestInstance: CtaasTestReportsComponent;
// let fixture: ComponentFixture<CtaasTestReportsComponent>;
// const dialogService = new DialogServiceMock();
// let loader: HarnessLoader;

// const RouterMock = {
//     navigate: (commands: string[]) => { }
// };

// const beforeEachFunction = () => {
//     TestBed.configureTestingModule({
//         declarations: [CtaasTestReportsComponent],
//         imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule],
//         providers: [
//             {
//                 provide: Router,
//                 useValue: RouterMock
//             },
//             {
//                 provide: MatDialog,
//                 useValue: MatDialogMock
//             },
//             {
//                 provide: MatSnackBarRef,
//                 useValue: {}
//             },
//             {
//                 provide: TestReportsService,
//                 useValue: TestReportsServiceMock
//             },
//             {
//                 provide: DialogService,
//                 useValue: dialogService
//             },
//             {
//                 provide: MsalService,
//                 useValue: MsalServiceMock
//             },
//             {
//               provide: SubAccountService,
//               useValue: SubaccountServiceMock
//             },
//             {
//                 provide: HttpClient,
//                 useValue: HttpClient
//             },
//             {
//                 provide: SnackBarService,
//                 useValue: SnackBarServiceMock
//             },
//         ]
//     });
//     fixture = TestBed.createComponent(CtaasTestReportsComponent);
//     ctaasTestReportComponentTestInstance = fixture.componentInstance;
//     loader = TestbedHarnessEnvironment.loader(fixture);
//     spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
// };

// describe('UI verification test', () => {
//   beforeEach(beforeEachFunction);
//   it('should display essential UI and components', () => {
//     fixture.detectChanges();
//     const h2 = fixture.nativeElement.querySelector('#main-title');
//     const typeFilterLabel = fixture.nativeElement.querySelector('#type-filter-label');
//     const dateFilterLabel = fixture.nativeElement.querySelector('#date-filter-label');

//     expect(h2.textContent).toBe('Test Reports');
//     expect(typeFilterLabel.textContent).toBe('Filter by report type');
//     expect(dateFilterLabel.textContent).toBe('Filter by date');
//   });

//   it('should load correct data form the columns for the table', () => {
//     fixture.detectChanges();
//     const reportTypeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[0];
//     const startTimeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[1];
//     const endTimeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[2];

//     expect(reportTypeColumn.innerText).toBe('Report Type');
//     expect(startTimeColumn.innerText).toBe('Start Time');
//     expect(endTimeColumn.innerText).toBe('End Time');
//   });

//   it('should call sortData and sort the data', () => {
//     ctaasTestReportComponentTestInstance.testReportsData = TestReportsServiceMock.testReportsValue.reports;
//     ctaasTestReportComponentTestInstance.sortData({active: "reportType", direction: "asc"});
//     expect(ctaasTestReportComponentTestInstance.testReportsData).toEqual(TestReportsServiceMock.testReportsSortedAsc.reports);
    
//     ctaasTestReportComponentTestInstance.sortData({active: "reportType", direction: "desc"});
//     expect(ctaasTestReportComponentTestInstance.testReportsData).toEqual(TestReportsServiceMock.testReportsSortedDesc.reports);

//     ctaasTestReportComponentTestInstance.sortData({active: "reportType", direction: ''});
//     expect(ctaasTestReportComponentTestInstance.testReportsData).toEqual(TestReportsServiceMock.testReportsValue.reports);
//   })

// });

// describe('Data collection and parsing test', () => {
//   beforeEach(beforeEachFunction);
//   it('should make a call to get the selected subaccount, test reports and actionMenuOptions ', () => {
//     spyOn(TestReportsServiceMock, 'getTestReportsList').and.callThrough();
//     spyOn(MsalServiceMock.instance, 'getActiveAccount').and.callThrough();

//     fixture.detectChanges();

//     expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
//     expect(TestReportsServiceMock.getTestReportsList).toHaveBeenCalled();
//     expect(MsalServiceMock.instance.getActiveAccount).toHaveBeenCalled();
//     expect(ctaasTestReportComponentTestInstance.actionMenuOptions).toEqual(['View Report'])
//   });

//   it('should change the loading-related variables if getLicenses() got an error', () => {
//     spyOn(TestReportsServiceMock, 'getTestReportsList').and.returnValue(throwError("error"));

//     fixture.detectChanges();

//     expect(ctaasTestReportComponentTestInstance.isLoadingResults).toBeFalse();
//     expect(ctaasTestReportComponentTestInstance.isRequestCompleted).toBeTrue();
//   });

//   it('should return an error if something went wrong while fetching the data', () => {
//     spyOn(console, 'error').and.callThrough();
//     spyOn(TestReportsServiceMock, 'getTestReportsList').and.returnValue(of([{"error":'some error'}]));
    
//     fixture.detectChanges();

//     expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
//     expect(TestReportsServiceMock.getTestReportsList).toHaveBeenCalled();
//     expect(console.error).toHaveBeenCalledWith('error while fetching data', jasmine.any(TypeError));
//   })
// });

// describe('Interactions of the table', () => {
//   beforeEach(beforeEachFunction);
//   it('should filter the rows in the table based on the name, type and status filters',() => {
//     let pickedEvent = {data:null};
//     let pickedDate = {value: moment().toDate()};
//     fixture.detectChanges();

//     ctaasTestReportComponentTestInstance.filterForm.patchValue({typeFilterControl: 'Daily-FeatureFunctionality'});
//     ctaasTestReportComponentTestInstance.toggleOptionValue('Daily-FeatureFunctionality');

//     expect(ctaasTestReportComponentTestInstance.selectedTypeFilter).toBe('feature');

//     ctaasTestReportComponentTestInstance.filterForm.patchValue({typeFilterControl: 'Daily-CallingReliability'});
//     ctaasTestReportComponentTestInstance.toggleOptionValue('Daily-CallingReliability');

//     expect(ctaasTestReportComponentTestInstance.selectedTypeFilter).toBe('calling');

//     ctaasTestReportComponentTestInstance.filterForm.patchValue({typeFilterControl: 'None'});
//     ctaasTestReportComponentTestInstance.toggleOptionValue('None');

//     expect(ctaasTestReportComponentTestInstance.selectedTypeFilter).toBe('');
//     expect(ctaasTestReportComponentTestInstance.testReportsData.length).toBe(6);

//     ctaasTestReportComponentTestInstance.filterForm.patchValue({typeFilterControl: 'any'});
//     ctaasTestReportComponentTestInstance.toggleOptionValue('any');

//     expect(ctaasTestReportComponentTestInstance.selectedTypeFilter).toBe('');
//     expect(ctaasTestReportComponentTestInstance.testReportsData.length).toBe(6);

//     ctaasTestReportComponentTestInstance.clearDateFilter();

//     expect(ctaasTestReportComponentTestInstance.selectedDateFilter).toBe('');
//     expect(ctaasTestReportComponentTestInstance.testReportsData.length).toBe(6);

//     ctaasTestReportComponentTestInstance.restoreTable(pickedEvent);

//     expect(ctaasTestReportComponentTestInstance.selectedDateFilter).toBe('');
//     expect(ctaasTestReportComponentTestInstance.testReportsData.length).toBe(6);

//     ctaasTestReportComponentTestInstance.toggleDateValue(pickedDate);
//     expect(ctaasTestReportComponentTestInstance.selectedDateFilter).toBe(pickedDate.value.toJSON());
//   });
// });

// describe('interaction with the elements of the table', () => {
//   beforeEach(beforeEachFunction);
//   it('should execute rowAction with expected data given set arguments',() => {
//     const selectedTestData = {
//       selectedRow:{
//         reportType: "Daily-FeatureFunctionality",
//         endTime: "230110034409",
//         startTime: "230109113617"
//       }, 
//       selectedOption: 'selectedOption', 
//       selectedIndex: '0' 
//     }
//     fixture.detectChanges();
//     spyOn(ctaasTestReportComponentTestInstance, 'onClickMoreDetails').and.callThrough();
//     spyOn(window, 'open').and.returnValue(null);
//     spyOn(window, 'close').and.returnValue(null);
//     selectedTestData.selectedOption = ctaasTestReportComponentTestInstance.VIEW_REPORT;

//     ctaasTestReportComponentTestInstance.rowAction(selectedTestData);
//     expect(ctaasTestReportComponentTestInstance.onClickMoreDetails).toHaveBeenCalledWith(selectedTestData.selectedIndex);
//   });

//   it('should execute rowAction with expected data given set arguments',() => {
//     const selectedTestData = {
//       selectedRow:{
//         reportType: "Daily-CallingReliability",
//         endTime: "230110034409",
//         startTime: "230109113617"
//       }, 
//       selectedOption: 'selectedOption', 
//       selectedIndex: '4' 
//     }
//     fixture.detectChanges();
//     spyOn(ctaasTestReportComponentTestInstance, 'onClickMoreDetails').and.callThrough();
//     spyOn(window, 'open').and.returnValue(null);
//     spyOn(window, 'close').and.returnValue(null);
//     selectedTestData.selectedOption = ctaasTestReportComponentTestInstance.VIEW_REPORT;

//     ctaasTestReportComponentTestInstance.rowAction(selectedTestData);
//     expect(ctaasTestReportComponentTestInstance.onClickMoreDetails).toHaveBeenCalledWith(selectedTestData.selectedIndex);
//   });

//   it('should execute rowAction with inexistent name in the report type',() => {
//     fixture.detectChanges();
//     const selectedTestData = {
//       selectedRow:{
//         reportType: "testName",
//         endTime: "230110034409",
//         startTime: "230109113617"
//       }, 
//       selectedOption: 'selectedOption', 
//       selectedIndex: '3' 
//     }
//     spyOn(ctaasTestReportComponentTestInstance, 'onClickMoreDetails').and.callThrough();
//     spyOn(window, 'open').and.returnValue(null);
//     spyOn(window, 'close').and.returnValue(null);
//     selectedTestData.selectedOption = ctaasTestReportComponentTestInstance.VIEW_REPORT;

//     ctaasTestReportComponentTestInstance.rowAction(selectedTestData);
//     expect(ctaasTestReportComponentTestInstance.onClickMoreDetails).toHaveBeenCalledWith(selectedTestData.selectedIndex);
//   });
// })