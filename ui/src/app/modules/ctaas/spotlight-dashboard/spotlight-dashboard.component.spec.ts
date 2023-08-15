import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { SpotlightDashboardComponent } from "./spotlight-dashboard.component";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";
import { ActivatedRoute } from "@angular/router";
import { of, throwError } from "rxjs";
import { NgApexchartsModule } from "ng-apexcharts";

import { SpotlightChartsServiceMock } from "src/test/mock/services/spotlight-charts-service.mock";
import { SpotlightChartsService } from "src/app/services/spotlight-charts.service";
import { By } from "@angular/platform-browser";
import { NetworkQualityComponent } from "./network-quality/network-quality.component";
import { BannerComponent } from "../banner/banner.component";
import moment from "moment";
import { dateInputsHaveChanged } from "@angular/material/datepicker/datepicker-input-base";
import { ReportName, ReportType } from "src/app/helpers/report-type";
import { environment } from "src/environments/environment";
import { SubAccountService } from "src/app/services/sub-account.service";
import { Utility } from "src/app/helpers/utils";
import { Constants } from "src/app/helpers/constants";

let dashboardPocComponentTestInstance: SpotlightDashboardComponent;
let fixture: ComponentFixture<SpotlightDashboardComponent>;
const spotlightChartsServiceMock = new SpotlightChartsServiceMock();
let subaccountService: SubAccountService;

const beforeEachFunction = waitForAsync(() => {
  const configBuilder = new TestBedConfigBuilder().useDefaultConfig(
    SpotlightDashboardComponent
  );
  configBuilder.addProvider({
    provide: ActivatedRoute,
    useValue: {
      queryParams: of({
        id: "f2b57afb-c389-48ec-a54b-7d8a05a51f32",
        //noteId: "f2b57afb-c389-48ec-a54b-7d8a05a51f32",
        date: "07-06-2023",
        location: "Chicago, Illinois, United States",
        toLocation: "Chicago, Illinois, United States",
      }),
    },
  });
  configBuilder.addImport(NgApexchartsModule);
  configBuilder.addDeclaration(NetworkQualityComponent);
  configBuilder.addDeclaration(BannerComponent);
  configBuilder.addProvider({
    provide: SpotlightChartsService,
    useValue: spotlightChartsServiceMock,
  });
  TestBed.configureTestingModule(configBuilder.getConfig()).compileComponents();
  fixture = TestBed.createComponent(SpotlightDashboardComponent);
  dashboardPocComponentTestInstance = fixture.componentInstance;
});

//Test that Daily Weekly toggle button correctly updates and reloads
//Test customer name is correct
//Test report title is correct
//Test filters and apply button
//Test Weekly graphs are in place with tooltip and correct logic
//Test Daily graphs are in place with tooltip and correct logic
describe("DashboardPocComponent", () => {
  beforeEach(beforeEachFunction);
  beforeEach(() => {
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(dashboardPocComponentTestInstance).toBeTruthy();
  });

  it("should change graphs when toggle is changed", () => {
    spyOn(
      dashboardPocComponentTestInstance,
      "selectedPeriodChange"
    ).and.callThrough();
    spyOn(dashboardPocComponentTestInstance, "loadCharts");
    expect(dashboardPocComponentTestInstance.selectedPeriod).toBe("daily");
    const matButtonToggles = fixture.debugElement
      .query(By.css("mat-button-toggle-group"))
      .queryAll(By.css("mat-button-toggle"));
    matButtonToggles[1].nativeElement.querySelector("button").click();
    expect(
      dashboardPocComponentTestInstance.selectedPeriodChange
    ).toHaveBeenCalled();
    expect(dashboardPocComponentTestInstance.selectedPeriod).toBe("weekly");
    expect(dashboardPocComponentTestInstance.loadCharts).toHaveBeenCalled();
    matButtonToggles[0].nativeElement.querySelector("button").click();
    expect(
      dashboardPocComponentTestInstance.selectedPeriodChange
    ).toHaveBeenCalledTimes(2);
    expect(dashboardPocComponentTestInstance.selectedPeriod).toBe("daily");
    expect(dashboardPocComponentTestInstance.loadCharts).toHaveBeenCalledTimes(
      2
    );
  });

  it("correctly checks if date has changed", () => {
    dashboardPocComponentTestInstance.selectedPeriod = "daily";
    dashboardPocComponentTestInstance.filters
      .get("date")
      .setValue(moment("07-24-2023"));
    dashboardPocComponentTestInstance.date = moment("07-24-2023");
    expect(dashboardPocComponentTestInstance.dateHasChanged()).toBe(false);
    dashboardPocComponentTestInstance.date = moment("07-23-2023");
    expect(dashboardPocComponentTestInstance.dateHasChanged()).toBe(true);
    dashboardPocComponentTestInstance.selectedPeriod = "weekly";
    dashboardPocComponentTestInstance.weeklyFilters
      .get("date")
      .setValue(moment("07-24-2023"));
    dashboardPocComponentTestInstance.selectedRange.end = moment("07-24-2023");
    expect(dashboardPocComponentTestInstance.dateHasChanged()).toBe(false);
    dashboardPocComponentTestInstance.selectedRange.end = moment("07-23-2023");
    expect(dashboardPocComponentTestInstance.dateHasChanged()).toBe(true);
  });

  it("correctly checks if region has changed", () => {
    dashboardPocComponentTestInstance.selectedPeriod = "daily";
    dashboardPocComponentTestInstance.preselectedRegions = [{
      country: "United States",
      city: "Chicago",
      state: "IL",
    }];
    dashboardPocComponentTestInstance.selectedRegions = [{
      country: "United States",
      city: "Chicago",
      state: "IL",
    }];
    expect(dashboardPocComponentTestInstance.regionsHaveChanged()).toBe(false);
    dashboardPocComponentTestInstance.selectedRegions = [];
    expect(dashboardPocComponentTestInstance.regionsHaveChanged()).toBe(true);
    dashboardPocComponentTestInstance.selectedPeriod = "weekly";
    dashboardPocComponentTestInstance.weeklyPreselectedRegions = [{
      country: "United States",
      city: "Chicago",
      state: "IL",
    }];
    dashboardPocComponentTestInstance.weeklySelectedRegions = [{
      country: "United States",
      city: "Chicago",
      state: "IL",
    }];
    expect(dashboardPocComponentTestInstance.regionsHaveChanged()).toBe(false);
    dashboardPocComponentTestInstance.weeklySelectedRegions = [];
    expect(dashboardPocComponentTestInstance.regionsHaveChanged()).toBe(true);
  });

  it("correctly sets start day of week", () => {
    dashboardPocComponentTestInstance.weeklyFilters.get('date').setValue(moment("07-24-2023"));
    expect(dashboardPocComponentTestInstance.getStartWeekDate().format("MM-DD-YYYY")).toBe("07-18-2023");
  });

  it("correctly sets end day of week and date", () => {
    dashboardPocComponentTestInstance.weeklyFilters.get('date').setValue(moment("07-24-2023"));
    dashboardPocComponentTestInstance.filters.get('date').setValue(moment("07-24-2023"));
    expect(dashboardPocComponentTestInstance.getEndWeekDate().format("MM-DD-YYYY")).toEqual("07-24-2023");
    dashboardPocComponentTestInstance.setDate();
    expect(dashboardPocComponentTestInstance.date.format("MM-DD-YYYY")).toBe("07-24-2023");
    dashboardPocComponentTestInstance.isHistoricalView = true;
    expect(dashboardPocComponentTestInstance.getEndWeekDate().format("MM-DD-YYYY")).toEqual("07-24-2023");
    dashboardPocComponentTestInstance.setDate();
    expect(dashboardPocComponentTestInstance.date.format("MM-DD-YYYY")).toBe("07-24-2023");
  });

  it("should remove regions correctly", () => {
    dashboardPocComponentTestInstance.selectedPeriod = 'daily';
    dashboardPocComponentTestInstance.preselectedRegions = ["United States"];
    dashboardPocComponentTestInstance.removeRegion("United States");
    expect(dashboardPocComponentTestInstance.preselectedRegions).toEqual([]);
    dashboardPocComponentTestInstance.selectedPeriod = 'weekly';
    dashboardPocComponentTestInstance.weeklyPreselectedRegions = ["United States"];
    dashboardPocComponentTestInstance.removeRegion("United States");
    expect(dashboardPocComponentTestInstance.weeklyPreselectedRegions).toEqual([]);
  });

  it("should remove regions from array correctly", () => {
    const displayName = "Chicago";
    let array = [{
      country: "United States",
      city: "Chicago",
      state: "IL",
      displayName: "Chicago"
    }];
    dashboardPocComponentTestInstance.removeRegionFromArray(displayName, array);
    expect(array).toEqual([]);
  });

  it("should add regions correctly", () => {
    dashboardPocComponentTestInstance.selectedPeriod = 'daily';
    dashboardPocComponentTestInstance.preselectedRegions = [];
    dashboardPocComponentTestInstance.filters.get('region').setValue("United States");
    console.log(dashboardPocComponentTestInstance.regionInput);
    dashboardPocComponentTestInstance.addRegion();
    expect(dashboardPocComponentTestInstance.preselectedRegions).toEqual(["United States"]);
    dashboardPocComponentTestInstance.selectedPeriod = "weekly";
    dashboardPocComponentTestInstance.weeklyPreselectedRegions = [];
    dashboardPocComponentTestInstance.weeklyFilters.get('region').setValue("United States");
    dashboardPocComponentTestInstance.addRegion();
    expect(dashboardPocComponentTestInstance.weeklyPreselectedRegions).toEqual(["United States"]);
  });

  it("should clear regions filter correctly", () => {
    dashboardPocComponentTestInstance.selectedPeriod = "daily";
    dashboardPocComponentTestInstance.preselectedRegions = [""];
    dashboardPocComponentTestInstance.clearRegionsFilter();
    expect(dashboardPocComponentTestInstance.preselectedRegions).toEqual([]);
    dashboardPocComponentTestInstance.selectedPeriod = "weekly";
    dashboardPocComponentTestInstance.weeklyPreselectedRegions = [""];
    dashboardPocComponentTestInstance.clearRegionsFilter();
    expect(dashboardPocComponentTestInstance.weeklyPreselectedRegions).toEqual([]);
  });

  it("should stop timer and stop showing progress bar when chartsloaded is 2", () => {
    dashboardPocComponentTestInstance.chartsLoaded = 0;
    dashboardPocComponentTestInstance.autoRefresh = true;
    dashboardPocComponentTestInstance.startTimer();
    dashboardPocComponentTestInstance.chartsStatus(true);
    expect(dashboardPocComponentTestInstance.chartsLoaded).toBe(1);
    dashboardPocComponentTestInstance.chartsStatus(true);
    expect(dashboardPocComponentTestInstance.chartsLoaded).toBe(0);
    expect(dashboardPocComponentTestInstance.autoRefresh).toBe(false);
    expect(dashboardPocComponentTestInstance.timerIsRunning).toBe(false);
  });

  it("should apply filters when user updates the filter values", () => {
    spyOn(dashboardPocComponentTestInstance, 'setDate');
    spyOn(dashboardPocComponentTestInstance, 'setWeeklyRange');
    spyOn(dashboardPocComponentTestInstance, 'reloadCharts');
    dashboardPocComponentTestInstance.selectedPeriod = "daily";
    dashboardPocComponentTestInstance.filters.get('date').markAsDirty();
    dashboardPocComponentTestInstance.weeklyFilters.get('date').markAsDirty();
    dashboardPocComponentTestInstance.isHistoricalView = true;
    dashboardPocComponentTestInstance.applyFilters();
    expect(dashboardPocComponentTestInstance.isHistoricalView).toBe(false);
    expect(dashboardPocComponentTestInstance.selectedRegions).toEqual(dashboardPocComponentTestInstance.preselectedRegions);
    expect(dashboardPocComponentTestInstance.setDate).toHaveBeenCalled();
    dashboardPocComponentTestInstance.selectedPeriod = "weekly";
    dashboardPocComponentTestInstance.applyFilters();
    expect(dashboardPocComponentTestInstance.weeklySelectedRegions).toEqual(dashboardPocComponentTestInstance.weeklyPreselectedRegions);
    expect(dashboardPocComponentTestInstance.setWeeklyRange).toHaveBeenCalled();
    expect(dashboardPocComponentTestInstance.reloadCharts).toHaveBeenCalled();
  });

  it("loadCharts should retrieve the correct data from spotlight charts service", () => {
    spyOn(spotlightChartsServiceMock, 'getDailyCallsStatusSummary');
    spyOn(spotlightChartsServiceMock, 'getVoiceQualityChart');
    spyOn(spotlightChartsServiceMock, 'getWeeklyComboBarChart');
    spyOn(spotlightChartsServiceMock, 'getWeeklyCallsStatusHeatMap');
    spyOn(spotlightChartsServiceMock, 'getWeeklyCallsStatusSummary');
    dashboardPocComponentTestInstance.selectedPeriod = "daily";
    dashboardPocComponentTestInstance.loadCharts();
    dashboardPocComponentTestInstance.selectedPeriod = "weekly";
    dashboardPocComponentTestInstance.loadCharts();
    expect(spotlightChartsServiceMock.getDailyCallsStatusSummary).toHaveBeenCalledTimes(2);
    expect(spotlightChartsServiceMock.getVoiceQualityChart).toHaveBeenCalledTimes(2);
    expect(spotlightChartsServiceMock.getWeeklyComboBarChart).toHaveBeenCalledTimes(2);
    expect(spotlightChartsServiceMock.getWeeklyCallsStatusHeatMap).toHaveBeenCalledTimes(1);
    expect(spotlightChartsServiceMock.getWeeklyCallsStatusSummary).toHaveBeenCalledTimes(2);
  });

  it("should throw error with bad service data", () => {
    spyOn(console, "error");
    spyOn(dashboardPocComponentTestInstance, 'chartsStatus');
    const simError = new Error('Simulated error');
    spyOn(spotlightChartsServiceMock, 'getVoiceQualityChart').and.returnValue(throwError(simError));
    dashboardPocComponentTestInstance.loadCharts();
    expect(console.error).toHaveBeenCalledWith("SPDS ERROR: ", simError);
    expect(dashboardPocComponentTestInstance.isloading).toBe(false);
    expect(dashboardPocComponentTestInstance.chartsStatus).toHaveBeenCalled();
  });

  it("should process weekly data in load charts", () => {
    spyOn(dashboardPocComponentTestInstance, 'chartsStatus');
    dashboardPocComponentTestInstance.selectedPeriod = "weekly";
    dashboardPocComponentTestInstance.loadCharts();
    expect(dashboardPocComponentTestInstance.loadingTime).toBeGreaterThan(0);
    expect(dashboardPocComponentTestInstance.isloading).toBe(false);
    expect(dashboardPocComponentTestInstance.chartsStatus).toHaveBeenCalled();
  });

  it("should open detailed table when calling reliability graph is clicked", () => {
    spyOn(window, "open");
    dashboardPocComponentTestInstance.selectedRegions = [{country: "United States", state: "Illinois", city: "Chicago", displayName: "Chicago"}];
    fixture.detectChanges();
    const callingReliabilityTestPlans = ReportName.TAP_CALLING_RELIABILITY + "," + ReportName.TAP_VQ;
    const reportFilter = "type=" + callingReliabilityTestPlans;
    const startTime = dashboardPocComponentTestInstance.selectedDate.clone().utc().startOf('day').format(Constants.DATE_TIME_FORMAT);
    const endTime = dashboardPocComponentTestInstance.selectedDate.clone().utc().format(Constants.DATE_TIME_FORMAT);
    //const subaccountDetails = subaccountService.getSelectedSubAccount();
    const regions = JSON.stringify(dashboardPocComponentTestInstance.selectedRegions);
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${dashboardPocComponentTestInstance.subaccountDetails.id}&${reportFilter}&start=${startTime}&end=${endTime}&regions=${regions}`;
    dashboardPocComponentTestInstance.navigateToDetailedTable(callingReliabilityTestPlans);
    expect(window.open).toHaveBeenCalledWith(url);
  });

  it("should open detailed table when feature functionality graph is clicked", () => {
    spyOn(window, "open");
    dashboardPocComponentTestInstance.selectedRegions = [{country: "United States", state: "Illinois", city: "Chicago", displayName: "Chicago"}];
    fixture.detectChanges();
    const reportFilter = "type=" + ReportType.DAILY_FEATURE_FUNCTIONALITY;
    const startTime = dashboardPocComponentTestInstance.selectedDate.clone().utc().startOf('day').format(Constants.DATE_TIME_FORMAT);
    const endTime = dashboardPocComponentTestInstance.selectedDate.clone().utc().format(Constants.DATE_TIME_FORMAT);
    //const subaccountDetails = subaccountService.getSelectedSubAccount();
    const regions = JSON.stringify(dashboardPocComponentTestInstance.selectedRegions);
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${dashboardPocComponentTestInstance.subaccountDetails.id}&${reportFilter}&start=${startTime}&end=${endTime}&regions=${regions}`;
    dashboardPocComponentTestInstance.navigateToDetailedTable(ReportType.DAILY_FEATURE_FUNCTIONALITY);
    expect(window.open).toHaveBeenCalledWith(url);
  });

  it("should open detailed table with status", () => {
    spyOn(window, "open");
    dashboardPocComponentTestInstance.selectedRegions = [{country: "United States", state: "Illinois", city: "Chicago", displayName: "Chicago"}];
    fixture.detectChanges();
    const reportFilter = "status=" + 'FAILED';
    const startTime = dashboardPocComponentTestInstance.selectedDate.clone().utc().startOf('day').format(Constants.DATE_TIME_FORMAT);
    const endTime = dashboardPocComponentTestInstance.selectedDate.clone().utc().format(Constants.DATE_TIME_FORMAT);
    //const subaccountDetails = subaccountService.getSelectedSubAccount();
    const regions = JSON.stringify(dashboardPocComponentTestInstance.selectedRegions);
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${dashboardPocComponentTestInstance.subaccountDetails.id}&${reportFilter}&start=${startTime}&end=${endTime}&regions=${regions}`;
    dashboardPocComponentTestInstance.navigateToDetailedTable(null, 'FAILED');
    expect(window.open).toHaveBeenCalledWith(url);
  });

  it("should open detailed table with POLQA Call", () => {
    spyOn(window, "open");
    dashboardPocComponentTestInstance.selectedRegions = [{country: "United States", state: "Illinois", city: "Chicago", displayName: "Chicago"}];
    fixture.detectChanges();
    const reportFilter = "polqaCalls=true";
    const startTime = dashboardPocComponentTestInstance.selectedDate.clone().utc().startOf('day').format(Constants.DATE_TIME_FORMAT);
    const endTime = dashboardPocComponentTestInstance.selectedDate.clone().utc().format(Constants.DATE_TIME_FORMAT);
    //const subaccountDetails = subaccountService.getSelectedSubAccount();
    const regions = JSON.stringify(dashboardPocComponentTestInstance.selectedRegions);
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${dashboardPocComponentTestInstance.subaccountDetails.id}&${reportFilter}&start=${startTime}&end=${endTime}&regions=${regions}`;
    dashboardPocComponentTestInstance.navigateToPOLQACallsDetailedTable();
    expect(window.open).toHaveBeenCalledWith(url);
  });

  it("should call reloadUserOptions when selected regions is greater than 0", () => {
    spyOn(spotlightChartsServiceMock, 'getFilterOptions').and.callThrough();
    dashboardPocComponentTestInstance.selectedRegions = [{country: "United States", state: "Illinois", city: "Chicago", displayName: "Chicago"}];
    dashboardPocComponentTestInstance.loadCharts();
    expect(spotlightChartsServiceMock.getFilterOptions).toHaveBeenCalledTimes(2);
    dashboardPocComponentTestInstance.weeklySelectedRegions = [{country: "United States", state: "Illinois", city: "Chicago", displayName: "Chicago"}];
    dashboardPocComponentTestInstance.selectedPeriod = "weekly";
    dashboardPocComponentTestInstance.loadCharts();
    expect(spotlightChartsServiceMock.getFilterOptions).toHaveBeenCalledTimes(4);
  });



  


  

});
