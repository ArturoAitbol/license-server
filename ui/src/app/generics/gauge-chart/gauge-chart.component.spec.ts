import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GaugeChartComponent } from "./gauge-chart.component";

describe("GaugeChartComponent", () => {
  let component: GaugeChartComponent;
  let fixture: ComponentFixture<GaugeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GaugeChartComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GaugeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("set seriesName", () => {
    it("should set the labels when the seriesName input is set", () => {
      const seriesName = "Series Name";
      component.seriesName = seriesName;
      expect(component.chartOptions.labels).toEqual([seriesName]);
    });
  });

  describe("set seriesName", () => {
    it("should set the chartOptions.series when the value input is set", () => {
      const value = 50;
      component.value = value;
      expect(component.chartOptions.series).toEqual([value]);
    });
  });

  describe("viewDetailedTableClicked", () => {
    it("should emit the viewDetailedTableEvent when viewDetailedTableClicked is called", () => {
      spyOn(component.viewDetailedTableEvent, "emit");
      component.viewDetailedTableClicked();
      expect(component.viewDetailedTableEvent.emit).toHaveBeenCalled();
    });
  });
});
