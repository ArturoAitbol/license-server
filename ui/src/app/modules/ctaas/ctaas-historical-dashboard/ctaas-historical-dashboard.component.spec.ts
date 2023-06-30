import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { CtaasDashboardServiceMock } from 'src/test/mock/services/ctaas-dashboard-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { CtaasHistoricalDashboardComponent } from './ctaas-historical-dashboard.component';
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';

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
            {reportType: "Daily-VQ",timestampId:"221207090122"},
            {reportType: "Weekly-FeatureFunctionality",timestampId:"221207090111"},
            {reportType: "Weekly-CallingReliability",timestampId:"221207090111"},
            {reportType: "Weekly-VQ",timestampId:"221207090130"}] ,
  status:"Open",
  subaccountId:"b5b91753-4c2b-43f5-afa0-feb00cefa981"
}

const MatDialogRefMock = {
    close: () => {
        return null
    }
};

const beforeEachFunction = waitForAsync(
    () => {
      const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CtaasHistoricalDashboardComponent);
      configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: note });
      configBuilder.addProvider({ provide: MatDialogRef, useValue: MatDialogRefMock });
      TestBed.configureTestingModule(configBuilder.getConfig()).compileComponents();
      fixture = TestBed.createComponent(CtaasHistoricalDashboardComponent);
      ctaasHistoricalDashboardComponentTestInstance = fixture.componentInstance;
    }
);

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
    const cancelButton = fixture.nativeElement.querySelector('#cancel-button');
    spyOn(ctaasHistoricalDashboardComponentTestInstance,'fetchCtaasDashboardDetailsBySubaccount').and.callThrough();
    spyOn(ctaasHistoricalDashboardComponentTestInstance,'onChangeButtonToggle').and.callThrough();
    spyOn(CtaasDashboardServiceMock,'getCtaasHistoricalDashboardDetails').and.callThrough();
    spyOn(ctaasHistoricalDashboardComponentTestInstance, 'onClose').and.callThrough();

    fixture.detectChanges();
    cancelButton.click();

    expect(ctaasHistoricalDashboardComponentTestInstance.fetchCtaasDashboardDetailsBySubaccount).toHaveBeenCalled();
    expect(CtaasDashboardServiceMock.getCtaasHistoricalDashboardDetails).toHaveBeenCalled();
    expect(ctaasHistoricalDashboardComponentTestInstance.onChangeButtonToggle).toHaveBeenCalled();
    expect(ctaasHistoricalDashboardComponentTestInstance.onClose).toHaveBeenCalled();
  });

  it('should show an error if note is null', () => {
    spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
    spyOn(ctaasHistoricalDashboardComponentTestInstance,'fetchCtaasDashboardDetailsBySubaccount');
    ctaasHistoricalDashboardComponentTestInstance.note = null;

    fixture.detectChanges();
   
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error loading dashboard, please contact your TekVizion 360 admin', 'Ok');
    expect(ctaasHistoricalDashboardComponentTestInstance.fetchCtaasDashboardDetailsBySubaccount).not.toHaveBeenCalled();
  });

  it('should show an error if an error is thrown when calling fetchCtaasDashboardDetailsBySubaccount()', () => {
    spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
    spyOn(CtaasDashboardServiceMock,'getCtaasHistoricalDashboardDetails').and.returnValue(throwError("Some error"));
    
    fixture.detectChanges();

    expect(CtaasDashboardServiceMock.getCtaasHistoricalDashboardDetails).toHaveBeenCalled();
    expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error loading dashboard, please contact your TekVizion 360 admin', 'Ok');
  });

  it('should heck whether dashboard has any data to display or not when calling checkForDashboardDetails()',()=>{
    ctaasHistoricalDashboardComponentTestInstance.resultantImagesList.length = 0;
    expect(ctaasHistoricalDashboardComponentTestInstance.checkForDashboardDetails()).toBeFalse();

    ctaasHistoricalDashboardComponentTestInstance.resultantImagesList.length = 2;
    expect(ctaasHistoricalDashboardComponentTestInstance.checkForDashboardDetails()).toBeTrue();
  });

  it('should call onClickMoreDetails with Feature Functionality', () => {
    spyOn(ctaasHistoricalDashboardComponentTestInstance, 'onClickMoreDetails').and.callThrough();
    spyOn(window, 'open').and.returnValue(null);
    spyOn(window, 'close').and.returnValue(null);

    fixture.detectChanges();
    ctaasHistoricalDashboardComponentTestInstance.onClickMoreDetails('0');
    expect(ctaasHistoricalDashboardComponentTestInstance.onClickMoreDetails).toHaveBeenCalledWith('0');

  });

  it('should call onClickMoreDetails with Calling Reliability', () => {
    spyOn(ctaasHistoricalDashboardComponentTestInstance, 'onClickMoreDetails').and.callThrough();
    spyOn(window, 'open').and.returnValue(null);
    spyOn(window, 'close').and.returnValue(null);

    fixture.detectChanges();
    ctaasHistoricalDashboardComponentTestInstance.onClickMoreDetails('1');
    expect(ctaasHistoricalDashboardComponentTestInstance.onClickMoreDetails).toHaveBeenCalledWith('1');

  });

  it('should call onClickMoreDetails with Calling Reliability', () => {
    spyOn(ctaasHistoricalDashboardComponentTestInstance, 'onClickMoreDetails').and.callThrough();
    spyOn(window, 'open').and.returnValue(null);
    spyOn(window, 'close').and.returnValue(null);

    fixture.detectChanges();
    ctaasHistoricalDashboardComponentTestInstance.resultantImagesList[0].imagesList['1'].reportType = ''
    ctaasHistoricalDashboardComponentTestInstance.onClickMoreDetails('1');
    expect(ctaasHistoricalDashboardComponentTestInstance.onClickMoreDetails).toHaveBeenCalledWith('1');

  });
});
