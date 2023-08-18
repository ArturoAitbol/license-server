import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as L from 'leaflet';
import moment from 'moment';
import { MapService } from 'src/app/services/map.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { NodeDetailComponent } from './node-detail/node-detail.component';
import { LineDetailComponent } from './line-detail/line-detail.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Constants } from 'src/app/helpers/constants';
import { Observable, Subject, Subscription, interval } from 'rxjs';
import { SpotlightChartsService } from 'src/app/services/spotlight-charts.service';
import { map, startWith } from 'rxjs/operators';
import { Utility } from 'src/app/helpers/utils';
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { BannerService } from 'src/app/services/banner.service';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  displayedColumns: any[] = [];
  isLoadingResults = false;
  isRequestCompleted = false;
  tableMaxHeight: number;
  mapData: any = [];
  maxDate: any;
  map:any;
  nodesMap:any = {};
  linesMap:any = {};
  nodeIcon:any;
  nodesArray: any = [];
  linesArray: any = [];
  filteredDate: any;
  endDate: any;
  autoRefresh = false;
  mapStartView: any[] = [];
  subaccountId: string;
  regions: { country: string, state: string, city: string, displayName: string }[] = [];
  refreshIntervalSubscription: any;
  disableFiltersWhileLoading = true;
  selectedRegions = [];
  filteredRegions: Observable<{ country: string, state: string, city: string, displayName: string }[]>;
  notSelectedFilteredRegions: {country: string, state: string, city: string, displayName: string}[];
  preselectedRegions = [];
  filterForm = this.fb.group({
    region: [''],
    // toRegionFilterControl: [''],
    startDateFilterControl: [moment.utc(),[Validators.required]],
    endDateFilterControl: [''],
  });
  private onDestroy: Subject<void> = new Subject<void>();

  constructor(private mapService: MapService,
    private spotlightChartsService: SpotlightChartsService, 
    private fb: FormBuilder,
    private subaccountService: SubAccountService,
    private ctaasSetupService: CtaasSetupService,
    private bannerService: BannerService,
    public dialog: MatDialog, 
    private snackBarService: SnackBarService,
    private dialogService: DialogService ) { }

  readonly GOOD_COLOR: string = "#273176";
  readonly MID_COLOR: string = "#EC7C56";
  readonly BAD_COLOR: string = "#bb2426";
  LINE_WEIGHT: number;
  readonly LINE_SMOOTH_FACTOR: number = 1;
 
  private calculateTableHeight() {
    this.tableMaxHeight = window.innerHeight // doc height
      - (window.outerHeight * 0.01 * 2) // - main-container margin
      - 60 // - route-content margin
      - 20 // - dashboard-content padding
      - 30 // - table padding
      - 32 // - title height
      - (window.outerHeight * 0.05 * 2); // - table-section margin
  }

  initColumns(): void {
    this.displayedColumns = [
      { name: 'From', dataKey: 'fromLocation', position: 'left', isSortable: true },
      { name: 'To', dataKey: 'toLocation', position: 'left', isSortable: true },
      { name: 'No. of Calls', dataKey: 'totalCalls', position: 'left', isSortable: true },
      { name: 'Packet Lost', dataKey: 'receivedPacketLoss', position: 'left', isSortable: true },
      { name: 'Jitter', dataKey: 'receivedJitter', position:'left', isSortable:true},
      { name: 'Round Trip Time (ms)', dataKey: 'roundTripTime', position:'left', isSortable:true}
    ];
  }

  mapSubscription: Subscription;
  filtersSubscription: Subscription;

  ngOnInit(): void {
    this.dialogService.showHelpButton = true;
    this.subaccountId = this.subaccountService.getSelectedSubAccount().id;
    this.checkMaintenanceMode();
    this.filteredDate = moment.utc();
    this.disableFiltersWhileLoading = true;
    this.initColumns();
    this.calculateTableHeight();
    this.setDate();
    this.map = L.map('map'); 
    this.getMapSummary();
    this.refreshIntervalSubscription = interval(Constants.DASHBOARD_REFRESH_INTERVAL).subscribe(() => {
      this.disableFiltersWhileLoading = false;
      this.autoRefresh = true;
      if(this.nodesArray.length > 0) {
        this.nodesArray.forEach((node:any) => {
          this.map.removeLayer(node);
        });
      }
      if(this.linesArray.length > 0) {
        this.linesArray.forEach((line:any) => {
          this.map.removeLayer(line);
        });
      }
      this.getMapSummary();
    });
    this.initAutocompletes();
    this.maxDate = moment.utc().format("YYYY-MM-DD[T]HH:mm:ss");
    this.sendHelpDialogValues();
  }

  regionsHasChanged():boolean{
    return JSON.stringify(this.preselectedRegions) !== JSON.stringify(this.selectedRegions);
  }

  processMapData(){
    for(let i=0 ; i < this.mapData.length; i++){
      try {
        let fromRegion: string; 
        let toRegion: string;
        if(this.mapData[i].from.location) {
          fromRegion = this.mapData[i].from.location.y + ", " + this.mapData[i].from.location.x;
          this.mapStartView.push([this.mapData[i].from.location.y,this.mapData[i].from.location.x]);
        }
        if(this.mapData[i].to.location) {
          toRegion = this.mapData[i].to.location.y + ", " + this.mapData[i].to.location.x;
          this.mapStartView.push([this.mapData[i].to.location.y,this.mapData[i].to.location.x]);
        }
        this.getNodeData(i, fromRegion, toRegion);
        if(fromRegion && toRegion)
          this.getLineData(i, fromRegion, toRegion);
      } catch(error) {
        console.log(error);
      }
    }
    this.map.fitBounds(this.mapStartView);
    this.baseMap();
  }

  private getNodeData(index: number, fromRegion: string, toRegion: string) {
    if(fromRegion) {
      if (!this.nodesMap[fromRegion]) {
        let newRegionObj = {
          region: this.mapData[index].from,
          totalCalls: this.mapData[index].totalCalls,
          totalCallTimes: this.mapData[index].totalCallTimes,
          callsOriginated: {
            passed: this.mapData[index].passed,
            failed: this.mapData[index].failed,
            total: this.mapData[index].totalCalls, 
            polqa: { count: 0, min: "", avg: "" },
            receivedJitter: JSON.parse(JSON.stringify(this.mapData[index].receivedJitter)),
            roundTripTime: JSON.parse(JSON.stringify(this.mapData[index].roundTripTime)),
            receivedPacketLoss: JSON.parse(JSON.stringify(this.mapData[index].receivedPacketLoss)),
            sentBitrate: JSON.parse(JSON.stringify(this.mapData[index].sentBitrate)),
            callsPassedToSameRegion: 0,
            callsFailedToSameRegion: 0
          },
          callsTerminated: {
            passed: 0,failed: 0, total: 0, 
            polqa: { count: 0, min: "", avg: "" }, 
            receivedJitter: { count: 0, max: "", avg: "" }, 
            roundTripTime: { count: 0, max: "", avg: "" }, 
            receivedPacketLoss: { count: 0, max: "", avg: "" }, 
            sentBitrate: { count: 0, avg: "" },
            callsPassedToSameRegion: 0,
            callsFailedToSameRegion: 0
          }
        }
        if (this.validMapDataMetric(index, "polqa"))
          newRegionObj.callsOriginated.polqa = JSON.parse(JSON.stringify(this.mapData[index].polqa));
        if(fromRegion === toRegion) {
          newRegionObj.callsOriginated.callsPassedToSameRegion += this.mapData[index].passed;
          newRegionObj.callsOriginated.callsFailedToSameRegion += this.mapData[index].failed;
        }
        this.nodesMap[fromRegion] = newRegionObj;
      } else {
        this.updateRegionInformation(index, fromRegion, "callsOriginated");
        this.nodesMap[fromRegion].totalCalls += this.mapData[index].totalCalls;
        this.nodesMap[fromRegion].totalCallTimes += this.mapData[index].totalCallTimes;
        if(fromRegion === toRegion) {
          this.nodesMap[fromRegion].callsOriginated.callsPassedToSameRegion += this.mapData[index].passed;
          this.nodesMap[fromRegion].callsOriginated.callsFailedToSameRegion += this.mapData[index].failed;
        }
      }
    }
    if(toRegion) {
      if (!this.nodesMap[toRegion]) {
        let newRegionObj = {
          region: this.mapData[index].to,
          totalCalls: this.mapData[index].totalCalls,
          totalCallTimes: this.mapData[index].totalCallTimes,
          callsOriginated: {
            passed: 0,failed: 0, total: 0, 
            polqa: { count: 0, min: "", avg: "" }, 
            receivedJitter: { count: 0, max: "", avg: "" },
            roundTripTime: { count: 0, max: "", avg: "" }, 
            receivedPacketLoss: { count: 0, max: "", avg: "" }, 
            sentBitrate: { count: 0, avg: "" },
            callsPassedToSameRegion: 0,
            callsFailedToSameRegion: 0
          },
          callsTerminated: {
            passed: this.mapData[index].passed,
            failed: this.mapData[index].failed,
            total: this.mapData[index].totalCalls, 
            polqa: { count: 0, min: "", avg: "" },
            receivedJitter: JSON.parse(JSON.stringify(this.mapData[index].receivedJitter)),
            roundTripTime: JSON.parse(JSON.stringify(this.mapData[index].roundTripTime)),
            receivedPacketLoss: JSON.parse(JSON.stringify(this.mapData[index].receivedPacketLoss)),
            sentBitrate: JSON.parse(JSON.stringify(this.mapData[index].sentBitrate)),
            callsPassedToSameRegion: 0,
            callsFailedToSameRegion: 0
          }
        }
        if (this.validMapDataMetric(index, "polqa"))
          newRegionObj.callsTerminated.polqa = JSON.parse(JSON.stringify(this.mapData[index].polqa));
        if(fromRegion === toRegion) {
          newRegionObj.callsTerminated.callsPassedToSameRegion += this.mapData[index].passed;
          newRegionObj.callsTerminated.callsFailedToSameRegion += this.mapData[index].failed;
        }
        this.nodesMap[toRegion] = newRegionObj;
      } else {
        this.updateRegionInformation(index, toRegion, "callsTerminated");
        if (fromRegion !== toRegion){
          this.nodesMap[toRegion].totalCalls += this.mapData[index].totalCalls;
          this.nodesMap[toRegion].totalCallTimes += this.mapData[index].totalCallTimes;
        }
        else {
          this.nodesMap[toRegion].callsTerminated.callsPassedToSameRegion += this.mapData[index].passed;
          this.nodesMap[toRegion].callsTerminated.callsFailedToSameRegion += this.mapData[index].failed;
        }
      }
    }
  }

  private updateRegionInformation(index: number, region: string, callsOrientation: string) {
    this.nodesMap[region][callsOrientation].passed += this.mapData[index].passed;
    this.nodesMap[region][callsOrientation].failed += this.mapData[index].failed;
    this.nodesMap[region][callsOrientation].total += this.mapData[index].totalCalls;
    if (this.validMapDataMetric(index, "polqa")) {
      this.updateMetricDataInNodesMap(index, region, callsOrientation, "polqa");
    }
    if (this.validMapDataMetric(index, "receivedJitter")) {
      this.updateMetricDataInNodesMap(index, region, callsOrientation, "receivedJitter");
    }
    if (this.validMapDataMetric(index, "roundTripTime")) {
      this.updateMetricDataInNodesMap(index, region, callsOrientation, "roundTripTime");
    }
    if (this.validMapDataMetric(index, "receivedPacketLoss")) {
      this.updateMetricDataInNodesMap(index, region, callsOrientation, "receivedPacketLoss");
    }
    if (this.validMapDataMetric(index, "sentBitrate")) {
      this.updateMetricDataInNodesMap(index, region, callsOrientation, "sentBitrate");
    }
  }

  private updateMetricDataInNodesMap(index: number, region: string, callsOrientation: string, metric: string): void {
    const selector = Utility.worstCaseSelectorBasedOnMetric(metric);
    if (this.nodesMap[region][callsOrientation][metric]?.count > 0) {
      if (selector === "min") {
        if (this.nodesMap[region][callsOrientation][metric].min > this.mapData[index][metric].min) {
          this.nodesMap[region][callsOrientation][metric].min = this.mapData[index].polqa.min;
        }
      } else if (selector === "max") {
        if (this.nodesMap[region][callsOrientation][metric].max < this.mapData[index][metric].max) {
          this.nodesMap[region][callsOrientation][metric].max = this.mapData[index][metric].max;
        }
      }
      this.nodesMap[region][callsOrientation][metric].avg = 
          (this.nodesMap[region][callsOrientation][metric].avg * this.nodesMap[region][callsOrientation][metric].count + 
          this.mapData[index][metric].avg * this.mapData[index][metric].count) /
          (this.nodesMap[region][callsOrientation][metric].count + this.mapData[index][metric].count);
    } else {
      if (selector !== "") {
        this.nodesMap[region][callsOrientation][metric][selector] = this.mapData[index][metric][selector];
      }
      this.nodesMap[region][callsOrientation][metric].avg = this.mapData[index][metric].avg;
    }
    this.nodesMap[region][callsOrientation][metric].count += this.mapData[index][metric].count;
  }

  private validMapDataMetric(index: number, metric: string): boolean {
    return this.mapData[index][metric]?.count && this.mapData[index][metric]?.count > 0;
  }

  private getLineData(index: number, fromRegion: string, toRegion: string): void {
    if (fromRegion === toRegion) return;

    const fromTo = fromRegion + " - " + toRegion;
    const toFrom = toRegion + " - " + fromRegion;
    const uniqueKey = this.linesMap[fromTo]? fromTo : toFrom;

    if (!this.linesMap[uniqueKey]) {
      this.linesMap[uniqueKey] = JSON.parse(JSON.stringify(this.mapData[index]));
      if (this.validMapDataMetric(index, "polqa")) {
        this.linesMap[uniqueKey].polqa = JSON.parse(JSON.stringify(this.mapData[index].polqa));
      } else {
        this.linesMap[uniqueKey].polqa = { count: 0, min: "", avg: "" };
      }
    } else {
      this.linesMap[uniqueKey].passed += this.mapData[index].passed;
      this.linesMap[uniqueKey].failed += this.mapData[index].failed;
      this.linesMap[uniqueKey].totalCalls += this.mapData[index].totalCalls;
      this.linesMap[uniqueKey].totalCallTimes += this.mapData[index].totalCallTimes;
      if (this.validMapDataMetric(index, "polqa")) {
        this.updateMetricDataInLinesMap(index, uniqueKey, "polqa");
      }
      if (this.validMapDataMetric(index, "receivedJitter")) {
        this.updateMetricDataInLinesMap(index, uniqueKey, "receivedJitter");
      }
      if (this.validMapDataMetric(index, "roundTripTime")) {
        this.updateMetricDataInLinesMap(index, uniqueKey, "roundTripTime");
      }
      if (this.validMapDataMetric(index, "receivedPacketLoss")) {
        this.updateMetricDataInLinesMap(index, uniqueKey, "receivedPacketLoss");
      }
      if (this.validMapDataMetric(index, "sentBitrate")) {
        this.updateMetricDataInLinesMap(index, uniqueKey, "sentBitrate");
      }
    }
  }

  private updateMetricDataInLinesMap(index: number, key: string, metric: string): void {
    const selector = Utility.worstCaseSelectorBasedOnMetric(metric);
    if (this.linesMap[key][metric]?.count > 0) {
      if (selector === "min") {
        if (this.linesMap[key][metric].min > this.mapData[index][metric].min) {
          this.linesMap[key][metric].min = this.mapData[index].polqa.min;
        }
      } else if (selector === "max") {
        if (this.linesMap[key][metric].max < this.mapData[index][metric].max) {
          this.linesMap[key][metric].max = this.mapData[index][metric].max;
        }
      }
      this.linesMap[key][metric].avg = 
          (this.linesMap[key][metric].avg * this.linesMap[key][metric].count + 
          this.mapData[index][metric].avg * this.mapData[index][metric].count) /
          (this.linesMap[key][metric].count + this.mapData[index][metric].count);
    } else {
      if (selector !== "") {
        this.linesMap[key][metric][selector] = this.mapData[index][metric][selector];
      }
      this.linesMap[key][metric].avg = this.mapData[index][metric].avg;
    }
    this.linesMap[key][metric].count += this.mapData[index][metric].count;
  }

  baseMap(): void {
    var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      minZoom: 4,
      maxZoom: 12
    }).addTo(this.map);
    //Scale of grey mode option DO NOT DELETE THIS
    // var CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    //   subdomains: 'abcd',
    //   minZoom: 4,
    //   maxZoom: 12
    // }).addTo(this.map);
    // var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png', {
    //   attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/4.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //   subdomains: 'abcd',
    //   minZoom: 4,
    //   maxZoom: 12
    // }).addTo(this.map);
    //Dark mode option DO NOT DELETE THIS
    // var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    //   minZoom: 4,
    //   maxZoom: 12,
    //   attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    // }).addTo(this.map);
    // Light mode with richer city labels DO NOT DELETE THIS 
    // var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
    //   minZoom: 4,
    //   maxZoom: 12,
    //   attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    // });
  }

  drawNodes():void {
    for (const key in this.nodesMap) {
      let customIconUrl = "assets/images/goodMarker.svg";
      let failed = this.nodesMap[key].callsOriginated.failed + this.nodesMap[key].callsTerminated.failed;
      let polqa = this.nodesMap[key].callsOriginated.polqa.count > 0 ? this.nodesMap[key].callsOriginated.polqa.avg : 5;
      if (this.nodesMap[key].callsTerminated.polqa.count > 0 && polqa > this.nodesMap[key].callsTerminated.polqa.avg) 
        polqa = this.nodesMap[key].callsTerminated.polqa.avg;
      if (failed >= 1 && failed < 5 || polqa >= 2 && polqa <= 3)
        customIconUrl = "assets/images/midMarker.svg";
      if (failed >= 5 || polqa < 2)
        customIconUrl = "assets/images/badMarker.svg";
      let customIcon = L.icon({
        iconUrl: customIconUrl,
        iconAnchor: [25, 29]
      })
      let latlong = new L.LatLng(this.nodesMap[key].region.location.y, this.nodesMap[key].region.location.x)
      let node = L.marker(latlong, {icon:customIcon, title:this.nodesMap[key].region.city}).on('click', (e) =>{
        this.nodeDetails(key);
      }).addTo(this.map);
      this.nodesArray.push(node)
      node.bindTooltip(this.nodesMap[key].region.city + ", " + this.nodesMap[key].region.state);
    }
  }

  drawLines() {
    for (const key in this.linesMap) {
      let lineState = this.GOOD_COLOR;
      this.LINE_WEIGHT = 5;
      let coordinatesArray = [];
      let failed = this.linesMap[key].failed;
      let polqa = this.linesMap[key].polqa.count > 0 ? this.linesMap[key].polqa.avg : 5;
      if ((failed >= 1 && failed < 5) || (polqa >= 2  && polqa <= 3)) {
        lineState = this.MID_COLOR;
        this.LINE_WEIGHT = 7;
      }
      if (failed >= 5 || polqa < 2) {
        lineState = this.BAD_COLOR;
        this.LINE_WEIGHT = 7;
      }
      coordinatesArray[0] = new L.LatLng(this.linesMap[key].from.location.y, this.linesMap[key].from.location.x);
      coordinatesArray[1] = new L.LatLng(this.linesMap[key].to.location.y, this.linesMap[key].to.location.x);
      let line = new L.Polyline(coordinatesArray, {
        color: lineState,
        weight: this.LINE_WEIGHT,
        smoothFactor: this.LINE_SMOOTH_FACTOR,
        className: `${this.linesMap[key].from.city} ${this.linesMap[key].to.city}`
      }).on('click', (e) =>{
        this.lineDetails(key);
      }).addTo(this.map);
      this.linesArray.push(line);
      line.bindTooltip(`<p>${this.linesMap[key].from.city}, ${this.linesMap[key].from.state}  &#8646 ${this.linesMap[key].to.city}, ${this.linesMap[key].to.state}</p>`);
    }
  }

  getMapSummary(){
    this.mapData = [];
    this.mapStartView = [];
    this.linesMap = {};
    this.nodesMap = {};
    this.isLoadingResults = true;
    this.isRequestCompleted = false;
    this.mapSubscription = this.mapService.getMapSummary(this.filteredDate,this.subaccountId, this.preselectedRegions).subscribe((res:any)=>{
      if(res){
        let parsedSummaryData = []
        if( res.length > 0) {
        res.map((summaryData, index) => {
          summaryData = {
          ...summaryData, 
          fromLocation: summaryData.from.city + ", " + summaryData.from.state + ", " + summaryData.from.country,
          toLocation: summaryData.to.city + ", " + summaryData.to.state + ", " + summaryData.to.country
        }
          parsedSummaryData[index] = summaryData;
          });
          this.mapData = parsedSummaryData
          this.processMapData();
          this.drawNodes();
          this.drawLines();
          this.isRequestCompleted = true;
          this.isLoadingResults = false;
        } else {
          this.isLoadingResults = false;
          this.isRequestCompleted = true;
          this.map.setView([39.09973,-94.57857], 5);
          this.snackBarService.openSnackBar('There is not data to display', '');
          this.baseMap();
        }
        this.autoRefresh = false;
      }
    }, err => {
      console.debug('error', err);
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
    });
    this.reloadFilterOptions();
  }

  dateFilter(){
    if(this.nodesArray.length > 0) {
      this.nodesArray.forEach((node:any) => {
        this.map.removeLayer(node);
      });
    }
    if(this.linesArray.length > 0) {
      this.linesArray.forEach((line:any) => {
        this.map.removeLayer(line);
      });
    }
    if(this.filterForm.get('startDateFilterControl').value !== '') {
      let selectedStartDate = this.filterForm.get('startDateFilterControl').value.clone();
      this.filteredDate = Utility.setHoursOfDate(selectedStartDate);
      this.getMapSummary();
      this.selectedRegions = [...this.preselectedRegions];
    }
  }

  dateHasChanged():boolean{
    return this.filterForm.get('startDateFilterControl').value.format("MM-DD-YYYY") !== this.filteredDate.format("MM-DD-YYYY");
  }

  setDate(){
    const date = this.filterForm.get('startDateFilterControl').value.clone();
    this.filteredDate = Utility.setHoursOfDate(date);
  }
  
  addRegion() {
    const region = this.filterForm.get('region').value;
    this.preselectedRegions.push(region);
    this.filterForm.get('region').setValue("");
    this.initAutocompletes();
  }

  removeRegion(region: string): void {
    const regions = this.preselectedRegions;
    const index = regions.indexOf(region);
    if (index >= 0) {
      regions.splice(index, 1);
    }
    this.initAutocompletes();
  }

  clearRegionsFilter() {
    this.preselectedRegions = [];
    this.initAutocompletes();
  }

  regionDisplayFn(region: any) {
    return region.displayName;
  }

  private initAutocompletes() {
    this.filteredRegions = this.filterForm.get('region').valueChanges.pipe(
        startWith(''),
        map(value => this._filterRegion(value || '')),
    );
    this.filteredRegions.subscribe((regions) => {
      this.notSelectedFilteredRegions = regions;
      this.preselectedRegions.forEach(region => {
        this.removeRegionFromArray(region.displayName, this.notSelectedFilteredRegions);
      });
    });
  }

  removeRegionFromArray(displayName: string, array: {country: string, state: string, city: string, displayName: string}[]){
    const index = array.map(e => e.displayName).indexOf(displayName);
    if (index >= 0) {
      array.splice(index, 1);
    }
  }

  private _filterRegion(value: string): { country: string; state: string; city: string; displayName: string }[] {
    const filterValue = value;
    return this.regions.filter(option => option.displayName.toLowerCase().includes(filterValue));
  }

  private reloadFilterOptions() {
    if(this.disableFiltersWhileLoading)
      this.filterForm.disable();

    this.filtersSubscription = this.spotlightChartsService.getFilterOptions(this.subaccountId,this.filteredDate,this.filteredDate).subscribe((res: any) => {
      const regions = [];
      res.regions.map(region => {
        if (region.country !== null){
          regions.push({country: region.country, state: null, city: null, displayName: region.country});
          if (region.state && region.country) regions.push({country: region.country, state: region.state, city: null, displayName: `${region.state}, ${region.country}`});
          if (region.state && region.country && region.city) regions.push({country: region.country, state: region.state, city: region.city, displayName: `${region.city}, ${region.state}, ${region.country}`});
        }
      });
      const flags = new Set();
      this.regions = regions.filter(entry => {
        if (flags.has(entry.displayName) || !entry.displayName.trim().length) {
          return false;
        }
        flags.add(entry.displayName);
        return true;
      }).sort();
      this.filterForm.enable();
      this.initAutocompletes();
    })
  }

  nodeDetails(key:any){
    let nodeData = {...this.nodesMap[key], date: this.filteredDate};
    this.dialog.open(NodeDetailComponent, {
      width: '900px',
      height: '89vh',
      maxHeight: '100vh',
      autoFocus: false,
      disableClose: true,
      data: nodeData
    });
  }
  
  lineDetails(key:any){
    let lineData = {...this.linesMap[key], date: this.filteredDate};
    let dialogRef = this.dialog.open(LineDetailComponent, {
      width: '505px',
      height: '89vh',
      maxHeight: '100vh',
      disableClose: true,
      autoFocus: false,
      data: lineData
    });
  }

  private checkMaintenanceMode() {
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountId).subscribe(res => {
        const ctaasSetupDetails = res['ctaasSetups'][0];
        if (ctaasSetupDetails.maintenance) {
            this.bannerService.open("ALERT", Constants.MAINTENANCE_MODE_ALERT, this.onDestroy, "alert");
        }
    });
  }

  ngOnDestroy(): void {
    if(this.refreshIntervalSubscription) 
      this.refreshIntervalSubscription.unsubscribe();
    if (this.mapSubscription)
      this.mapSubscription.unsubscribe();
    if (this.filtersSubscription)
      this.filtersSubscription.unsubscribe();
    this.onDestroy.next();
    this.onDestroy.complete();
    this.dialogService.showHelpButton = false;
  }
  sendHelpDialogValues(): void {
    const data = {
      title: 'Map',
      summary: "Map/Route path offers an overview of all regions and cross-calling between them. It also serves as a reference point to identify if any regions is experiencing issues with calls.",
      sections: [
        {
          //name: empty as section doesn't have title
          elements: [
            {
              subtitle: 'Note',
              descriptions: 
                [
                  'To view the map of call routes for a specific date, choose the date from the radio button and click "Apply".',
                  'To view the map of call routes for a particular region, select the relevant City, State, or Country from the dropdown and click "Apply".'
                ]
            },
            {
              description: 'Route region: To view information for a particular route region, click the region on the map. For detailed report, click "Go to Dashboard" at the bottom',
            },
            {
              description: 'Route line: To view call information between two connecting regions click the call route line. Click "Close" to close the dialog box.',
            }
          ]
        }
      ]
    };
    this.dialogService.clearDialogData();
    this.dialogService.updateDialogData(this.dialogService.transformToDialogData(data));
  }
}
