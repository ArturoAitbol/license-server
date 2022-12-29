import { CommonModule, TitleCasePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MsalService } from '@azure/msal-angular';
import { throwError } from 'rxjs';
import { ReportType } from 'src/app/helpers/report-type';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { CtaasDashboardServiceMock } from 'src/test/mock/services/ctaas-dashboard-service.mock';
import { MsalServiceMock } from 'src/test/mock/services/msal-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { SubaccountServiceMock } from 'src/test/mock/services/subaccount-service.mock';
import { SharedModule } from '../../shared/shared.module';

import { CtaasHistoricalDashboardComponent } from './ctaas-historical-dashboard.component';

let ctaasHistoricalDashboardComponentTestInstance: CtaasHistoricalDashboardComponent;
let fixture: ComponentFixture<CtaasHistoricalDashboardComponent>;

const note = {
  closeDate: null,
  closedBy: null,
  content: "First Sample Note",
  current: false,
  id: "434b4fef-fbcb-4c76-b071-199a5f52d9cd",
  openDate:"2022-12-07 21:48:33.654639",
  openedBy: "arasguido@tekvizionlabs.com",
  reports: [{reportType: "Daily-FeatureFunctionality",timestampId: "221207090048"},
            {reportType: "Daily-CallingReliability",timestampId:"221207194605"},
            {reportType:"Daily-PESQ",timestampId:"221207090122"},
            {reportType: "Weekly-FeatureFunctionality",timestampId:"221207090111"},
            {reportType:"Weekly-PESQ",timestampId:"221207090130"}] ,
  status:"Open",
  subaccountId:"b5b91753-4c2b-43f5-afa0-feb00cefa981"
}

const MatDialogRefMock = {
    close: () => {
        return null
    }
};


const beforeEachFunction = async () => {
  await TestBed.configureTestingModule({
    declarations: [ CtaasHistoricalDashboardComponent],
    imports:[CommonModule,SharedModule],
    providers:[
      {
        provide:MsalService,
        useValue:MsalServiceMock
      },
      {
        provide:CtaasDashboardService,
        useValue:CtaasDashboardServiceMock
      },
      {
        provide:SnackBarService,
        useValue:SnackBarServiceMock
      },{
        provide:SubAccountService,
        useValue:SubaccountServiceMock 
      },{
          provide: MatDialogRef,
          useValue: MatDialogRefMock
      },
      {
        provide: MAT_DIALOG_DATA,
        useValue:note
      }
    ]
  }).compileComponents();
  fixture = TestBed.createComponent(CtaasHistoricalDashboardComponent);
  ctaasHistoricalDashboardComponentTestInstance = fixture.componentInstance;
}

describe('Historical-Dashboard UI verification tests', () => {

  beforeEach(beforeEachFunction);

  it('should show basic html elements', () => {
    fixture.detectChanges();
    expect(ctaasHistoricalDashboardComponentTestInstance).toBeTruthy();
    const toggleButton: HTMLElement = fixture.nativeElement.querySelector('#toggle-button');
    expect(toggleButton.childNodes.length).toBe(2);
    
    // const rigthText: HTMLElement = fixture.nativeElement.querySelector('.right');
    // expect(rigthText.textContent).toContain("Last Updated:");

    const titleCasePipe = new TitleCasePipe();
    expect(toggleButton.firstChild.textContent).toBe(titleCasePipe.transform(ctaasHistoricalDashboardComponentTestInstance.DAILY));
    expect(toggleButton.lastChild.textContent).toBe(titleCasePipe.transform(ctaasHistoricalDashboardComponentTestInstance.WEEKLY));

  });
});

describe("Historical-Dashboard data collection and parsing tests",()=>{

  beforeEach(beforeEachFunction);

  it('should make a call to get the dashboard details (reports)', () => {
    spyOn(ctaasHistoricalDashboardComponentTestInstance,'fetchCtaasDashboardDetailsBySubaccount').and.callThrough();
    spyOn(ctaasHistoricalDashboardComponentTestInstance,'onChangeButtonToggle').and.callThrough();
    spyOn(CtaasDashboardServiceMock,'getCtaasDashboardDetails').and.callThrough();

    fixture.detectChanges();
   
    expect(ctaasHistoricalDashboardComponentTestInstance.fetchCtaasDashboardDetailsBySubaccount).toHaveBeenCalled();
    expect(CtaasDashboardServiceMock.getCtaasDashboardDetails).toHaveBeenCalledTimes(ctaasHistoricalDashboardComponentTestInstance.note.reports.length);
    expect(ctaasHistoricalDashboardComponentTestInstance.onChangeButtonToggle).toHaveBeenCalled();
  });

  it('should show an error if note is null', () => {
    spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
    spyOn(ctaasHistoricalDashboardComponentTestInstance,'fetchCtaasDashboardDetailsBySubaccount');
    ctaasHistoricalDashboardComponentTestInstance.note = null;

    fixture.detectChanges();
   
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error loading dashboard, please connect tekVizion admin', 'Ok');
    expect(ctaasHistoricalDashboardComponentTestInstance.fetchCtaasDashboardDetailsBySubaccount).not.toHaveBeenCalled();
  });

  it('should show an error if an error is thrown when calling fetchCtaasDashboardDetailsBySubaccount()', () => {
    spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
    spyOn(CtaasDashboardServiceMock,'getCtaasDashboardDetails').and.returnValue(throwError("Some error"));
    
    fixture.detectChanges();

    expect(CtaasDashboardServiceMock.getCtaasDashboardDetails).toHaveBeenCalled();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error loading dashboard, please connect tekVizion admin', 'Ok');
  });

  it('should get the name of a given report when calling getReportNameByType()',()=>{

    let reportName = ctaasHistoricalDashboardComponentTestInstance.getReportNameByType(ReportType.DAILY_FEATURE_FUNCTIONALITY);
    expect(reportName).toBe("Feature Functionality");

    reportName = ctaasHistoricalDashboardComponentTestInstance.getReportNameByType(ReportType.DAILY_CALLING_RELIABILITY);
    expect(reportName).toBe("Calling Reliability");

    // as media injection is not ready yet, hence disabling PESQ for now.
    // reportName = ctaasHistoricalDashboardComponentTestInstance.getReportNameByType(ReportType.DAILY_PESQ);
    // expect(reportName).toBe("PESQ");

    // reportName = ctaasHistoricalDashboardComponentTestInstance.getReportNameByType(ReportType.WEEKLY_PESQ);
    // expect(reportName).toBe("PESQ");
  })

  it('should heck whether dashboard has any data to display or not when calling checkForDashboardDetails()',()=>{
    ctaasHistoricalDashboardComponentTestInstance.resultantImagesList.length = 0;
    expect(ctaasHistoricalDashboardComponentTestInstance.checkForDashboardDetails()).toBeFalse();

    ctaasHistoricalDashboardComponentTestInstance.resultantImagesList.length = 2;
    expect(ctaasHistoricalDashboardComponentTestInstance.checkForDashboardDetails()).toBeTrue();
  })

})