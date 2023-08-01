import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { NgApexchartsModule } from "ng-apexcharts";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";

import { SpotlightChartsService } from "src/app/services/spotlight-charts.service";
import { SpotlightChartsServiceMock } from "src/test/mock/services/spotlight-charts-service.mock";
import { NetworkTrendsComponent } from "./network-trends.component";

let networkTrendsComponentTestInstance: NetworkTrendsComponent;
let fixture: ComponentFixture<NetworkTrendsComponent>;
const spotlightChartsServiceMock = new SpotlightChartsServiceMock();

const beforeEachFunction = waitForAsync(() => {
  const configBuilder = new TestBedConfigBuilder().useDefaultConfig(
    NetworkTrendsComponent
  );
  configBuilder.addImport(NgApexchartsModule);
  configBuilder.addProvider({
    provide: SpotlightChartsService,
    useValue: spotlightChartsServiceMock,
  });
  TestBed.configureTestingModule(configBuilder.getConfig())
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(NetworkTrendsComponent);
      networkTrendsComponentTestInstance = fixture.componentInstance;
      networkTrendsComponentTestInstance.networkTrendsData = spotlightChartsServiceMock.dailyNetworkTrendsData;
      networkTrendsComponentTestInstance.groupBy = "hour";
      networkTrendsComponentTestInstance.labels = {
        maxLabel : 'Max. ',
        minLabel : 'Min. ',
        avgLabel : 'Avg. '
      }
      networkTrendsComponentTestInstance.series = {
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
      networkTrendsComponentTestInstance.ngOnInit();
    });
});

describe('NetworkTrendsComponent', () => {
  beforeEach(beforeEachFunction);
  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(networkTrendsComponentTestInstance).toBeTruthy();
  });

  it("should have correct labels on quality charts", () => {
    networkTrendsComponentTestInstance.ngOnInit();
    expect(networkTrendsComponentTestInstance.commonChartOptions.xAxis.title.text).toEqual("Hour");
    expect(networkTrendsComponentTestInstance.commonChartOptions.xAxis.categories[0]).toBe("00:00-01:00");

    networkTrendsComponentTestInstance.groupBy = "date";
    networkTrendsComponentTestInstance.networkTrendsData = spotlightChartsServiceMock.weeklyNetworkTrendsData

    networkTrendsComponentTestInstance.ngOnInit();
    expect(networkTrendsComponentTestInstance.commonChartOptions.xAxis.title.text).toEqual("Date");
    expect(networkTrendsComponentTestInstance.commonChartOptions.xAxis.categories[0]).toBe("06-15-2023");

  });

  it("should open correct detailed table when point is clicked on network graph", () => {
    spyOn(networkTrendsComponentTestInstance.navigateToDetailedTable, "emit");
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
    networkTrendsComponentTestInstance.navigateToDetailedTableFromNetworkChart(event, chartContext, {seriesIndex: "", dataPointIndex: 0, config: ""});
    expect(networkTrendsComponentTestInstance.navigateToDetailedTable.emit).toHaveBeenCalledWith({chartContext:chartContext, dataPointIndex: 0, polqaCalls: false});
  
    event.srcElement.farthestViewportElement.children[1].innerHTML = "Packet Loss";
    networkTrendsComponentTestInstance.calls = 4;
    networkTrendsComponentTestInstance.navigateToDetailedTableFromNetworkChart(event, chartContext, {seriesIndex: "", dataPointIndex: 0, config: ""})
    expect(networkTrendsComponentTestInstance.navigateToDetailedTable.emit).toHaveBeenCalledWith({chartContext:chartContext, dataPointIndex: 0, polqaCalls: false});

  });


});
