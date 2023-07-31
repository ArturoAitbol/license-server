import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { NgApexchartsModule } from "ng-apexcharts";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";

import { SpotlightChartsService } from "src/app/services/spotlight-charts.service";
import { SpotlightChartsServiceMock } from "src/test/mock/services/spotlight-charts-service.mock";
import { PolqaGraphsComponent } from "./polqa-graphs.component";

let polqaGraphsComponentTestInstance: PolqaGraphsComponent;
let fixture: ComponentFixture<PolqaGraphsComponent>;
const spotlightChartsServiceMock = new SpotlightChartsServiceMock();

const beforeEachFunction = waitForAsync(() => {
  const configBuilder = new TestBedConfigBuilder().useDefaultConfig(
    PolqaGraphsComponent
  );
  configBuilder.addImport(NgApexchartsModule);
  configBuilder.addProvider({
    provide: SpotlightChartsService,
    useValue: spotlightChartsServiceMock,
  });
  TestBed.configureTestingModule(configBuilder.getConfig())
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(PolqaGraphsComponent);
      polqaGraphsComponentTestInstance = fixture.componentInstance;
      polqaGraphsComponentTestInstance.customerNetworkQualityData = spotlightChartsServiceMock.dailyCustomerNetworkQualityData;
      polqaGraphsComponentTestInstance.groupBy = "hour";
      polqaGraphsComponentTestInstance.labels = {
        maxLabel : 'Max. ',
        minLabel : 'Min. ',
        avgLabel : 'Avg. '
      }
      polqaGraphsComponentTestInstance.series = {
        jitter: {
          label: "Jitter",
          value: "Received Jitter"
        },
        packetLoss: {
          label: "Packet Loss",
          value: "Received packet loss"
        },
        sentBitrate: {
          label: "Sent Bitrate",
          value: "Sent bitrate"
        },
        roundTripTime: {
          label: "Round Trip Time",
          value: "Round trip time"
        },
        POLQA:{
          label: "POLQA",
          value: "POLQA"
        }
      };
      polqaGraphsComponentTestInstance.ngOnInit();
    });
});

describe('PolqaGraphsComponent', () => {
  beforeEach(beforeEachFunction);
  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(polqaGraphsComponentTestInstance).toBeTruthy();
  });
  
  it("should have correct labels on polqa-vs-metrics charts", () => {
    
    polqaGraphsComponentTestInstance.ngOnInit();
    expect(polqaGraphsComponentTestInstance.polqaCommonChartOptions.xAxis.title.text).toEqual("Hour");
    expect(polqaGraphsComponentTestInstance.polqaCommonChartOptions.xAxis.categories[0]).toBe("00:00-01:00");


    polqaGraphsComponentTestInstance.groupBy = "date";
    polqaGraphsComponentTestInstance.customerNetworkQualityData = spotlightChartsServiceMock.weeklyCustomerNetworkQualityData;

    polqaGraphsComponentTestInstance.ngOnInit();
    expect(polqaGraphsComponentTestInstance.polqaCommonChartOptions.xAxis.title.text).toEqual("Date");
    expect(polqaGraphsComponentTestInstance.polqaCommonChartOptions.xAxis.categories[0]).toBe("06-15-2023");

  });

  it("should open correct detailed table when point is clicked on polqa-vs-metrics graphs", () => {
    spyOn(polqaGraphsComponentTestInstance.navigateToDetailedTable, "emit");
    fixture.detectChanges();
    const chartContext = {opts: {xaxis: {categories: ["00:00-01:00"]}}};
    const event = {
      srcElement:{
        farthestViewportElement:{
          children:[{},{
            innerHTML:"Jitter"
          }]
        }
      }
    };
    polqaGraphsComponentTestInstance.navigateToDetailedTableFromPolqaChart(event, chartContext, {seriesIndex: "", dataPointIndex: 0, config: ""});
    expect(polqaGraphsComponentTestInstance.navigateToDetailedTable.emit).toHaveBeenCalledWith({chartContext:chartContext, dataPointIndex: 0, polqaCalls: true});
  
    event.srcElement.farthestViewportElement.children[1].innerHTML = "POLQA";
    polqaGraphsComponentTestInstance.calls = 4;
    polqaGraphsComponentTestInstance.navigateToDetailedTableFromPolqaChart(event, chartContext, {seriesIndex: "", dataPointIndex: 0, config: ""})
    expect(polqaGraphsComponentTestInstance.navigateToDetailedTable.emit).toHaveBeenCalledWith({chartContext:chartContext, dataPointIndex: 0, polqaCalls: true});

  });
});
