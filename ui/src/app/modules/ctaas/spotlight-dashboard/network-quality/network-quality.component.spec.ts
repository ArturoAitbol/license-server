import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from "@angular/core/testing";
import {
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
  FormControlDirective,
} from "@angular/forms";
import { of, throwError } from "rxjs";
import { By } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { NgApexchartsModule } from "ng-apexcharts";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";

import { NetworkQualityComponent } from "./network-quality.component";
import { SpotlightChartsService } from "src/app/services/spotlight-charts.service";
import { SpotlightChartsServiceMock } from "src/test/mock/services/spotlight-charts-service.mock";
import moment, { Moment } from "moment";
import { SimpleChange } from "@angular/core";
import { environment } from "src/environments/environment";
import { SubaccountServiceMock } from "src/test/mock/services/subaccount-service.mock";
import { trendsChartCommonOptions } from "./initial-chart-config";
import { Utility } from "src/app/helpers/utils";

let networkQualityComponentTestInstance: NetworkQualityComponent;
let fixture: ComponentFixture<NetworkQualityComponent>;
const spotlightChartsServiceMock = new SpotlightChartsServiceMock();

const beforeEachFunction = waitForAsync(() => {
  const configBuilder = new TestBedConfigBuilder().useDefaultConfig(
    NetworkQualityComponent
  );
  configBuilder.addImport(NgApexchartsModule);
  configBuilder.addProvider({
    provide: SpotlightChartsService,
    useValue: spotlightChartsServiceMock,
  });
  TestBed.configureTestingModule(configBuilder.getConfig())
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(NetworkQualityComponent);
      networkQualityComponentTestInstance = fixture.componentInstance;
      networkQualityComponentTestInstance.startDate = moment("06-21-2023");
      networkQualityComponentTestInstance.endDate = moment("06-21-2023");
      networkQualityComponentTestInstance.users = [
        "John Doe",
        "Jane Doe",
        "Joe Smith",
      ];
      networkQualityComponentTestInstance.regions = [];
      networkQualityComponentTestInstance.selectedUsers = [];
      networkQualityComponentTestInstance.ngOnInit();
    });
});

/* 1. should initialize `commonChartOptions`, `polqaChartOptions`, and all the customer network trends variables like `receivedPacketLossChartOptions`, `jitterChartOptions`, `sentBitrateChartOptions`, and `roundTripChartOptions` in the `ngOnInit` method.
 * 2. should call the `loadCharts` method when any of the `startDate`, `endDate`, or `regions` inputs are changed in the `ngOnChanges` method.
 * 3. should set `isChartLoading` to `true` and the `hideChart` variable to the value of the `hideChart` input in the `loadCharts` method when it is called.
 * 4. should set `selectedFilter` to the result of calling `evaluateFilter` in the `applyFilters` method.
 * 5. should call the `evaluateFilter` method and set the `maxLabel`, `minLabel`, and `avgLabel` variables accordingly in the `initChartOptions` method.
 * 6. should call the `navigateToDetailedTableFromPoint` method with the correct parameters when a marker is clicked on the received packet loss chart in the `receivedPacketLossChartOptions` object.
 * 7. should set the `polqaChartOptions` variable according to the selected graph and redraw the chart in the `changeGraph` method.
 * 8. should append a new user to the `preselectedUsers` array when the `selected` method is called.
 * 9. should remove a user from the `preselectedUsers` array when the `remove` method is called.
 * 10. should clear the `preselectedUsers` array when the `clearUsersFilter` method is called.
 * 11. should return `true` or `false` when `userHasChanged` and `metricValueHasChanged` methods are called based on whether the `selectedUsers` and `selectedFilter` variables have changed or not.
 * 12. should emit `true` through the `chartStatus` output when the chart loading is completed.
 * 13. should test the behavior of all the inputs, outputs, and variables in the component.
 * 14. should test the output of the `loadCharts` method.
 * 15. should test the `initAutocompletes` method and check whether the `filteredUsers` variable is correctly filtered based on the input.
 * 16. should test the `_filterUser` method to check whether it correctly filters the array of users based on the input.
 * 17. should test the `navigateToDetailedTableFromPoint` method by checking whether it correctly constructs the URL and opens the new window.
 * 18. should test the `initChartOptions` method by checking whether it sets the `receivedPacketLossChartOptions`, `jitterChartOptions`, `sentBitrateChartOptions`, `roundTripChartOptions`, and `polqaChartOptions` variables correctly.
 * 19. should test the `changeGraph` method by checking whether it sets the `polqaChartOptions` variable and properly redraws the chart. 20. should test the `applyFilters` method by checking whether the `selectedUsers` and `selectedFilter` variables are correctly updated and whether the charts are redrawn with the new filter.
 */

describe("NetworkQualityComponent", () => {
  beforeEach(beforeEachFunction);
  beforeEach(() => {
    fixture.detectChanges();
  });
  /*const spotlightChartsServiceSpy = jasmine.createSpyObj('SpotlightChartsService', [
    'getCustomerNetworkTrendsData',
    'getNetworkQualitySummary',
    'getCustomerNetworkQualityData'
  ]);*/

  //const fb: FormBuilder = new FormBuilder();

  /*beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientModule, FormsModule, NgApexchartsModule, MatAutocompleteModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatButtonToggleModule],
      declarations: [NetworkQualityComponent, FormControlDirective],
      providers: [
        { provide: SpotlightChartsService, useValue: spotlightChartsServiceSpy },
        { provide: FormBuilder, useValue: fb }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkQualityComponent);
    component = fixture.componentInstance;
    component.startDate = moment('2023-01-01');
    component.endDate = moment('2023-01-01');
    component.users = ['John Doe', 'Jane Doe', 'Joe Smith'];
    component.regions = [];
    component.selectedUsers = [];
    fixture.detectChanges();
  });*/

  it("should create", () => {
    expect(networkQualityComponentTestInstance).toBeTruthy();
  });

  it("should initialize the filteredUsers variable with empty options", () => {
    networkQualityComponentTestInstance.initAutocompletes();
    networkQualityComponentTestInstance.filters.enable();
    fixture.detectChanges();

    networkQualityComponentTestInstance.filteredUsers.subscribe((users) => {
      expect(users.length).toBe(3);
    });
  });

  it('should filter users by input string value', async () => {
    networkQualityComponentTestInstance.initAutocompletes();
    networkQualityComponentTestInstance.filters.enable();
    fixture.detectChanges();

    let inputSelected = fixture.nativeElement.querySelector('#userInput');
    inputSelected.dispatchEvent(new Event('focusin'));
    networkQualityComponentTestInstance.filters.get('user').setValue("joh");

    fixture.detectChanges();
    await fixture.whenStable();
    
    const options = fixture.debugElement.queryAll(By.css('mat-option'));
    expect(options.length).toBe(1);
    expect(options[0].nativeElement.textContent).toBe(' John Doe ');

  });

  it("should update the selectedUsers array when a user is added", () => {
    networkQualityComponentTestInstance.initAutocompletes();
    networkQualityComponentTestInstance.filters.enable();

    networkQualityComponentTestInstance.selectedUsers = ["John Doe"];
    networkQualityComponentTestInstance.preselectedUsers = ["John Doe"];

    networkQualityComponentTestInstance.filters
      .get("user")
      .setValue("Jane Doe");
    networkQualityComponentTestInstance.selected();
    networkQualityComponentTestInstance.applyFilters();
    fixture.detectChanges();
    //console.log(networkQualityComponentTestInstance.selectedUsers);
    expect(networkQualityComponentTestInstance.selectedUsers.length).toBe(2);
    expect(networkQualityComponentTestInstance.selectedUsers[1]).toBe(
      "Jane Doe"
    );
  });

  it("should remove a user from the selectedUsers array when deleted", () => {
    networkQualityComponentTestInstance.initAutocompletes();
    networkQualityComponentTestInstance.filters.enable();

    networkQualityComponentTestInstance.selectedUsers = [
      "John Doe",
      "Jane Doe",
    ];
    networkQualityComponentTestInstance.preselectedUsers = [
      "John Doe",
      "Jane Doe",
    ];
    //networkQualityComponentTestInstance.selected();
    //networkQualityComponentTestInstance.applyFilters();
    fixture.detectChanges();

    networkQualityComponentTestInstance.remove("John Doe");
    networkQualityComponentTestInstance.applyFilters();
    fixture.detectChanges();

    expect(networkQualityComponentTestInstance.preselectedUsers.length).toBe(1);
    expect(networkQualityComponentTestInstance.selectedUsers.length).toBe(1);
    expect(networkQualityComponentTestInstance.selectedUsers[0]).toBe(
      "Jane Doe"
    );
  });

  it("should call the loadCharts method when any of the `startDate`, `endDate`, or `regions` inputs are changed", () => {
    spyOn(networkQualityComponentTestInstance, "loadCharts").and.callThrough();

    networkQualityComponentTestInstance.startDate = moment("06-22-2023");

    networkQualityComponentTestInstance.ngOnChanges({
      startDate: new SimpleChange(
        moment("06-21-2023"),
        networkQualityComponentTestInstance.startDate,
        false
      ),
      endDate: new SimpleChange(
        networkQualityComponentTestInstance.endDate,
        networkQualityComponentTestInstance.endDate,
        true
      ),
      users: new SimpleChange(
        networkQualityComponentTestInstance.users,
        networkQualityComponentTestInstance.users,
        true
      ),
      regions: new SimpleChange(
        networkQualityComponentTestInstance.regions,
        networkQualityComponentTestInstance.regions,
        true
      ),
      groupBy: new SimpleChange(
        networkQualityComponentTestInstance.groupBy,
        networkQualityComponentTestInstance.groupBy,
        true
      ),
      isLoading: new SimpleChange(
        networkQualityComponentTestInstance.isLoading,
        networkQualityComponentTestInstance.isLoading,
        true
      ),
    });

    networkQualityComponentTestInstance.endDate = moment("06-22-2023");

    networkQualityComponentTestInstance.ngOnChanges({
      startDate: new SimpleChange(
        networkQualityComponentTestInstance.startDate,
        networkQualityComponentTestInstance.startDate,
        true
      ),
      endDate: new SimpleChange(
        moment("06-21-2023"),
        networkQualityComponentTestInstance.endDate,
        false
      ),
      users: new SimpleChange(
        networkQualityComponentTestInstance.users,
        networkQualityComponentTestInstance.users,
        true
      ),
      regions: new SimpleChange(
        networkQualityComponentTestInstance.regions,
        networkQualityComponentTestInstance.regions,
        true
      ),
      groupBy: new SimpleChange(
        networkQualityComponentTestInstance.groupBy,
        networkQualityComponentTestInstance.groupBy,
        true
      ),
      isLoading: new SimpleChange(
        networkQualityComponentTestInstance.isLoading,
        networkQualityComponentTestInstance.isLoading,
        true
      ),
    });

    networkQualityComponentTestInstance.regions = [
      { country: "USA", state: "Texas", city: "Dallas" },
    ];

    networkQualityComponentTestInstance.ngOnChanges({
      startDate: new SimpleChange(
        networkQualityComponentTestInstance.startDate,
        networkQualityComponentTestInstance.startDate,
        true
      ),
      endDate: new SimpleChange(
        networkQualityComponentTestInstance.endDate,
        networkQualityComponentTestInstance.endDate,
        true
      ),
      users: new SimpleChange(
        networkQualityComponentTestInstance.users,
        networkQualityComponentTestInstance.users,
        true
      ),
      regions: new SimpleChange(
        [],
        networkQualityComponentTestInstance.regions,
        false
      ),
      groupBy: new SimpleChange(
        networkQualityComponentTestInstance.groupBy,
        networkQualityComponentTestInstance.groupBy,
        true
      ),
      isLoading: new SimpleChange(
        networkQualityComponentTestInstance.isLoading,
        networkQualityComponentTestInstance.isLoading,
        true
      ),
    });

    networkQualityComponentTestInstance.users = [];

    networkQualityComponentTestInstance.ngOnChanges({
      startDate: new SimpleChange(
        networkQualityComponentTestInstance.startDate,
        networkQualityComponentTestInstance.startDate,
        true
      ),
      endDate: new SimpleChange(
        networkQualityComponentTestInstance.endDate,
        networkQualityComponentTestInstance.endDate,
        true
      ),
      users: new SimpleChange(
        ["John Doe", "Jane Doe", "Joe Smith"],
        networkQualityComponentTestInstance.users,
        false
      ),
      regions: new SimpleChange(
        networkQualityComponentTestInstance.regions,
        networkQualityComponentTestInstance.regions,
        true
      ),
      groupBy: new SimpleChange(
        networkQualityComponentTestInstance.groupBy,
        networkQualityComponentTestInstance.groupBy,
        true
      ),
      isLoading: new SimpleChange(
        networkQualityComponentTestInstance.isLoading,
        networkQualityComponentTestInstance.isLoading,
        true
      ),
    });

    expect(
      networkQualityComponentTestInstance.loadCharts
    ).toHaveBeenCalledTimes(3);
  });

  it("should have correct labels for the selected filter", () => {
    networkQualityComponentTestInstance.selectedFilter = false;
    networkQualityComponentTestInstance.ngOnInit();
    expect(networkQualityComponentTestInstance.maxLabel).toEqual("Max.");
    expect(networkQualityComponentTestInstance.minLabel).toEqual("Min.");
    expect(networkQualityComponentTestInstance.avgLabel).toEqual("Avg.");

    networkQualityComponentTestInstance.selectedFilter = true;
    networkQualityComponentTestInstance.ngOnInit();
    expect(networkQualityComponentTestInstance.maxLabel).toEqual("");
    expect(networkQualityComponentTestInstance.minLabel).toEqual("");
    expect(networkQualityComponentTestInstance.avgLabel).toEqual("");
  });

  it("should have correct labels on quality charts", () => {
    networkQualityComponentTestInstance.groupBy = "hour";
    networkQualityComponentTestInstance.ngOnInit();
    expect(
      networkQualityComponentTestInstance.commonChartOptions.xAxis.title.text
    ).toEqual("Hour");
    expect(
      networkQualityComponentTestInstance.commonChartOptions.xAxis.categories[0]
    ).toBe("00:00-01:00");
    networkQualityComponentTestInstance.groupBy = "date";
    networkQualityComponentTestInstance.ngOnInit();
    expect(
      networkQualityComponentTestInstance.commonChartOptions.xAxis.title.text
    ).toEqual("Date");
    expect(
      networkQualityComponentTestInstance.commonChartOptions.xAxis.categories[0]
    ).toBe("06-15-2023");
  });

  it("should clear preselectedUsers when clearUsersFilter is called", () => {
    networkQualityComponentTestInstance.preselectedUsers = [
      "John Doe",
      "Jane Doe",
      "Joe Smith",
    ];
    networkQualityComponentTestInstance.clearUsersFilter();
    networkQualityComponentTestInstance.applyFilters();
    fixture.detectChanges();
    expect(networkQualityComponentTestInstance.preselectedUsers.length).toBe(0);
    expect(networkQualityComponentTestInstance.selectedUsers.length).toBe(0);
  });

  it("should correctly set selected filter from drop down", () => {
    const matSelect = fixture.debugElement.query(
      By.css("mat-select")
    ).nativeElement;
    matSelect.click();
    fixture.detectChanges();
    const matOption = fixture.debugElement.queryAll(By.css("mat-option"));
    matOption[1].nativeElement.click();
    fixture.detectChanges();
    const apply = fixture.debugElement.query(
      By.css("#add-customer-button")
    ).nativeElement;
    apply.click();
    fixture.detectChanges();
    expect(networkQualityComponentTestInstance.preselectedFilter).toBe(
      "Average"
    );
    expect(networkQualityComponentTestInstance.selectedFilter).toBe(true);
  });

  it('should change network quality graph when button toggle is changed', () => {
    spyOn(networkQualityComponentTestInstance, 'changeGraph').and.callThrough();
    expect(networkQualityComponentTestInstance.selectedGraph).toBe('jitter');
    const matButtonToggles = fixture.debugElement.query(By.css("mat-button-toggle-group")).queryAll(By.css("mat-button-toggle"));
    matButtonToggles[1].nativeElement.querySelector('button').click();
    console.log(matButtonToggles[0].nativeElement.text);
    fixture.detectChanges();
    expect(networkQualityComponentTestInstance.selectedGraph).toBe('packetLoss');
    expect(networkQualityComponentTestInstance.changeGraph).toHaveBeenCalled();
    matButtonToggles[2].nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(networkQualityComponentTestInstance.selectedGraph).toBe('roundTripTime');
    expect(networkQualityComponentTestInstance.changeGraph).toHaveBeenCalled();
  });

  it("should open detailed table when point is clicked on hourly graph", () => {
    spyOn(window, "open");
    networkQualityComponentTestInstance.regions = [{country: "United States", state: null, city: null, displayName: "United States"}];
    networkQualityComponentTestInstance.selectedUsers = ['John Doe'];
    fixture.detectChanges();
    let startDate: Moment, endDate: Moment;
    const chartContext = {opts: {xaxis: {categories: ["00:00-01:00"]}}};
    const [startTime, endTime] = "00:00-1:00".split('-');
    startDate = networkQualityComponentTestInstance.startDate.clone().utc().startOf('day').hour(+startTime.split(':')[0]);
    endDate = Utility.setMinutesOfDate(networkQualityComponentTestInstance.endDate.clone().utc().startOf('day').hour(+startTime.split(':')[0]));
    let url = `${ environment.BASE_URL }/#/spotlight/details?subaccountId=${SubaccountServiceMock.getSelectedSubAccount().id}&start=${ startDate.format('YYMMDDHHmmss') }&end=${ endDate.format('YYMMDDHHmmss') }&regions=${JSON.stringify(networkQualityComponentTestInstance.regions)}&users=${networkQualityComponentTestInstance.selectedUsers.join(',')}`;
    networkQualityComponentTestInstance.navigateToDetailedTableFromPoint("", chartContext, {seriesIndex: "", dataPointIndex: 0, config: ""})
    expect(window.open).toHaveBeenCalledWith(url);
  });
  it("should open correct detailed table when point is clicked on hourly graph", () => {
    spyOn(window, "open");
    networkQualityComponentTestInstance.regions = [{country: "United States", state: null, city: null, displayName: "United States"}];
    networkQualityComponentTestInstance.selectedUsers = ['John Doe'];
    fixture.detectChanges();
    let startDate: Moment, endDate: Moment;
    const chartContext = {opts: {xaxis: {categories: ["00:00-01:00"]}}};
    const [startTime, endTime] = "00:00-1:00".split('-');
    startDate = networkQualityComponentTestInstance.startDate.clone().utc().startOf('day').hour(+startTime.split(':')[0]);
    endDate = Utility.setMinutesOfDate(networkQualityComponentTestInstance.endDate.clone().utc().startOf('day').hour(+startTime.split(':')[0]));
    let url = `${ environment.BASE_URL }/#/spotlight/details?subaccountId=${SubaccountServiceMock.getSelectedSubAccount().id}&start=${ startDate.format('YYMMDDHHmmss') }&end=${ endDate.format('YYMMDDHHmmss') }&regions=${JSON.stringify(networkQualityComponentTestInstance.regions)}&users=${networkQualityComponentTestInstance.selectedUsers.join(',')}`;
    networkQualityComponentTestInstance.navigateToDetailedTableFromPoint("", chartContext, {seriesIndex: "", dataPointIndex: 0, config: ""})
    expect(window.open).toHaveBeenCalledWith(url);
  });
  it("should open correct detailed table when point is clicked on daily graph", () => {
    spyOn(window, "open");
    networkQualityComponentTestInstance.groupBy = 'date';
    networkQualityComponentTestInstance.regions = [{country: "United States", state: null, city: null, displayName: "United States"}];
    networkQualityComponentTestInstance.selectedUsers = ['John Doe'];
    fixture.detectChanges();
    let startDate: Moment, endDate: Moment;
    const chartContext = {opts: {xaxis: {categories: ["06-23-2023"]}}};
    startDate = moment.utc("06-23-2023").hour(0);
    endDate = Utility.setHoursOfDate(moment.utc("06-23-2023"));
    let url = `${ environment.BASE_URL }/#/spotlight/details?subaccountId=${SubaccountServiceMock.getSelectedSubAccount().id}&start=${ startDate.format('YYMMDDHHmmss') }&end=${ endDate.format('YYMMDDHHmmss') }&regions=${JSON.stringify(networkQualityComponentTestInstance.regions)}&users=${networkQualityComponentTestInstance.selectedUsers.join(',')}`;
    networkQualityComponentTestInstance.navigateToDetailedTableFromPoint("", chartContext, {seriesIndex: "", dataPointIndex: 0, config: ""})
    expect(window.open).toHaveBeenCalledWith(url);
  });

  it("should throw error with bad service data", () => {
    spyOn(console, "error");
    const error = new Error('Simulated error');
    spyOn(spotlightChartsServiceMock, "getCustomerNetworkTrendsData").and.returnValue(throwError(error));
    networkQualityComponentTestInstance.loadCharts();
    expect(console.error).toHaveBeenCalledWith(error);
  });
});
