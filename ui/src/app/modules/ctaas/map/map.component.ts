import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as L from 'leaflet';
import moment from 'moment';
import { MapServicesService } from 'src/app/services/map.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { NodeDetailComponent } from './node-detail/node-detail.component';
import { LineDetailComponent } from './line-detail/line-detail.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Constants } from 'src/app/helpers/constants';
import { interval } from 'rxjs';
import { SpotlightChartsService } from 'src/app/services/spotlight-charts.service';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
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
  startDate: any;
  endDate: any;
  autoRefresh = false;
  mapStartView: any[] = [];
  subaccountId: string;
  regions: { country: string, state: string, city: string, displayName: string }[] = [];
  refreshIntervalSubscription: any;
  disableFiltersWhileLoading = true;
  selectedRegions = [];
  filterForm = this.fb.group({
    region: [''],
    // toRegionFilterControl: [''],
    startDateFilterControl: [moment.utc(),[Validators.required]],
    endDateFilterControl: [''],
});
  constructor(private mapService: MapServicesService,
    private spotlightChartsService: SpotlightChartsService, 
    private fb: FormBuilder,
    private subaccountService: SubAccountService,
    public dialog: MatDialog, 
    private snackBarService: SnackBarService ) { }

  readonly GOOD_COLOR: string = "#203c66";
  readonly MID_COLOR: string = "orange";
  readonly BAD_COLOR: string = "red";
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

  ngOnInit(): void {
    this.subaccountId = this.subaccountService.getSelectedSubAccount().id;
    this.startDate = moment.utc().format("YYYY-MM-DDT00:00:00")+'Z';
    this.disableFiltersWhileLoading = true;
    this.initColumns();
    this.calculateTableHeight();
    this.map = L.map('map'); 
    this.getMapSummary();
    this.refreshIntervalSubscription = interval(Constants.DASHBOARD_REFRESH_INTERVAL).subscribe(() => {
      this.disableFiltersWhileLoading = false;
      this.autoRefresh = true;
      this.getMapSummary();
    });
    this.maxDate = moment.utc().format("YYYY-MM-DD[T]HH:mm:ss");
  }
  
  processMapData(){
    for(let i=0 ; i < this.mapData.length; i++){
      try {
        let fromRegion; 
        let toRegion;
        if(this.mapData[i].from.location) {
          fromRegion = this.mapData[i].from.location?.y + ", " + this.mapData[i].from.location?.x;
          this.mapStartView.push([this.mapData[i].from.location.y,this.mapData[i].from.location.x]);
        }
        if(this.mapData[i].to.location) {
          toRegion = this.mapData[i].to.location?.y + ", " + this.mapData[i].to.location?.x;
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

  private getNodeData(index, fromRegion, toRegion) {
    const thereIsPolqaForIndex = this.mapData[index].polqa !== null && this.mapData[index].polqa !== undefined && this.mapData[index].polqa !== "";
    if(fromRegion) {
      if (!this.nodesMap[fromRegion]) {
        let newRegionObj = {
          region: this.mapData[index].from,
          totalCalls: this.mapData[index].totalCalls,
          callsOriginated: {
            passed: this.mapData[index].passed,
            failed: this.mapData[index].failed,
            total: this.mapData[index].totalCalls, 
            polqa: "--",
            receivedJitter: 0,
            roundTripTime: 0,
            receivedPacketLoss: 0
          },
          callsTerminated: {passed: 0,failed: 0, total: 0, polqa: "--", receivedJitter: 0, roundTripTime: 0, receivedPacketLoss: 0}
        }
        if (thereIsPolqaForIndex)
          newRegionObj.callsOriginated.polqa = this.mapData[index].polqa;
        this.nodesMap[fromRegion] = newRegionObj;
      } else {
        this.nodesMap[fromRegion].callsOriginated.passed += this.mapData[index].passed;
        this.nodesMap[fromRegion].callsOriginated.failed += this.mapData[index].failed;
        this.nodesMap[fromRegion].callsOriginated.total += this.mapData[index].totalCalls;
        if (thereIsPolqaForIndex && this.nodesMap[fromRegion].callsOriginated.polqa > this.mapData[index].polqa)
          this.nodesMap[fromRegion].callsOriginated.polqa = this.mapData[index].polqa;
        if(this.nodesMap[fromRegion].callsOriginated.receivedJitter < this.mapData[index].receivedJitter)
          this.nodesMap[fromRegion].callsOriginated.receivedJitter = this.mapData[index].receivedJitter;
        if(this.nodesMap[fromRegion].callsOriginated.roundTripTime < this.mapData[index].roundTripTime)
          this.nodesMap[fromRegion].callsOriginated.roundTripTime = this.mapData[index].roundTripTime;
        if(this.nodesMap[fromRegion].callsOriginated.receivedPacketLoss < this.mapData[index].receivedPacketLoss)
          this.nodesMap[fromRegion].callsOriginated.receivedPacketLoss = this.mapData[index].receivedPacketLoss;
        if(this.nodesMap[fromRegion].callsOriginated.polqa === 0)
          this.nodesMap[fromRegion].callsOriginated.polqa = "--";
        this.nodesMap[fromRegion].totalCalls += this.mapData[index].totalCalls;
      }
    }
    if(toRegion) {
      if (!this.nodesMap[toRegion]) {
        let newRegionObj = {
          region: this.mapData[index].to,
          totalCalls: this.mapData[index].totalCalls,
          callsOriginated: {passed: 0,failed: 0, total: 0, polqa: "--", receivedJitter: 0,roundTripTime: 0, receivedPacketLoss: 0},
          callsTerminated: {
            passed: this.mapData[index].passed,
            failed: this.mapData[index].failed,
            total: this.mapData[index].totalCalls, 
            polqa: "--",
            receivedJitter: 0,
            roundTripTime: 0,
            receivedPacketLoss: 0
          }
        }
        if (thereIsPolqaForIndex)
          newRegionObj.callsTerminated.polqa = this.mapData[index].polqa;
        this.nodesMap[toRegion] = newRegionObj;
      } else {
        this.nodesMap[toRegion].callsTerminated.passed += this.mapData[index].passed;
        this.nodesMap[toRegion].callsTerminated.failed += this.mapData[index].failed;
        this.nodesMap[toRegion].callsTerminated.total += this.mapData[index].totalCalls;
        if (thereIsPolqaForIndex && this.nodesMap[toRegion].callsTerminated.polqa > this.mapData[index].polqa)
          this.nodesMap[toRegion].callsTerminated.polqa = this.mapData[index].polqa;
        if (this.nodesMap[toRegion].callsTerminated.receivedJitter < this.mapData[index].receivedJitter)
          this.nodesMap[toRegion].callsTerminated.receivedJitter = this.mapData[index].receivedJitter;
        if (this.nodesMap[toRegion].callsTerminated.roundTripTime < this.mapData[index].roundTripTime)
          this.nodesMap[toRegion].callsTerminated.roundTripTime = this.mapData[index].roundTripTime;
        if (this.nodesMap[toRegion].callsTerminated.receivedPacketLoss < this.mapData[index].receivedPacketLoss)
          this.nodesMap[toRegion].callsTerminated.receivedPacketLoss = this.mapData[index].receivedPacketLoss;
        if (this.nodesMap[toRegion].callsTerminated.polqa === 0)
          this.nodesMap[toRegion].callsTerminated.polqa = "--";
        if (fromRegion !== toRegion)
          this.nodesMap[toRegion].totalCalls += this.mapData[index].totalCalls;
      }
    }
  }

  private getLineData(index, fromRegion, toRegion) {
    const fromTo = fromRegion + " - " + toRegion;
    const toFrom = toRegion + " - " + fromRegion;
    const uniqueKey = this.linesMap[fromTo]? fromTo : toFrom;

    if (!this.linesMap[uniqueKey]) {
      this.linesMap[uniqueKey] = this.mapData[index];
      if (this.mapData[index].polqa !== null && this.mapData[index].polqa !== undefined && this.mapData[index].polqa !== "")
        this.linesMap[uniqueKey].polqa = this.mapData[index].polqa;
      else
        this.linesMap[uniqueKey].polqa = "--";
    } else {
      this.linesMap[uniqueKey].passed += this.mapData[index].passed;
      this.linesMap[uniqueKey].failed += this.mapData[index].failed;
      this.linesMap[uniqueKey].totalCalls += this.mapData[index].totalCalls;
      if (this.linesMap[uniqueKey].polqa && this.linesMap[uniqueKey].polqa > this.mapData[index].polqa)
        this.linesMap[uniqueKey].polqa = this.mapData[index].polqa;
      if (this.linesMap[uniqueKey].receivedJitter < this.mapData[index].receivedJitter)
        this.linesMap[uniqueKey].receivedJitter = this.mapData[index].receivedJitter;
      if (this.linesMap[uniqueKey].roundTripTime < this.mapData[index].roundTripTime)
        this.linesMap[uniqueKey].roundTripTime = this.mapData[index].roundTripTime;
      if (this.linesMap[uniqueKey].receivedPacketLoss < this.mapData[index].receivedPacketLoss)
        this.linesMap[uniqueKey].receivedPacketLoss = this.mapData[index].receivedPacketLoss;
    }
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
      let failed, polqa;
      failed = this.nodesMap[key].callsOriginated.failed + this.nodesMap[key].callsTerminated.failed;
      polqa = this.nodesMap[key].callsOriginated.polqa;
      if(this.nodesMap[key].callsOriginated.polqa > this.nodesMap[key].callsTerminated.polqa) 
        polqa = this.nodesMap[key].callsTerminated.polqa;
      if(failed >= 1 && failed < 5 || polqa >= 2 && polqa <= 3)
        customIconUrl = "assets/images/midMarker.svg";
      if(failed >= 5 || polqa < 2)
        customIconUrl = "assets/images/badMarker.svg";
      let customIcon = L.icon({
        iconUrl: customIconUrl,
        iconAnchor: [25, 29]
      })
      let latlong = new L.LatLng(this.nodesMap[key].region.location.y, this.nodesMap[key].region.location.x)
      let node = L.marker(latlong, {icon:customIcon}).on('click', (e) =>{
        this.nodeDetails(key);
      }).addTo(this.map);
      this.nodesArray.push(node)
      node.bindTooltip(this.nodesMap[key].region.city + ", " + this.nodesMap[key].region.state);
    }
  }

  drawLines() {
    for (const key in this.linesMap) {
      let lineState = this.GOOD_COLOR;
      this.LINE_WEIGHT = 3;
      let coordinatesArray = [];
      if(this.linesMap[key].failed >= 1 && this.linesMap[key].failed < 5 || this.linesMap[key].polqa >= 2  && this.linesMap[key].polqa <= 3) {
        lineState = this.MID_COLOR;
        this.LINE_WEIGHT = 5;
      }
      if(this.linesMap[key].failed >= 5 || this.linesMap[key].polqa < 2) {
        lineState = this.BAD_COLOR;
        this.LINE_WEIGHT = 5;
      }
      coordinatesArray[0] = new L.LatLng(this.linesMap[key].from.location.y, this.linesMap[key].from.location.x);
      coordinatesArray[1] = new L.LatLng(this.linesMap[key].to.location.y, this.linesMap[key].to.location.x);
      let line = new L.Polyline(coordinatesArray, {
        color: lineState,
        weight: this.LINE_WEIGHT,
        smoothFactor: this.LINE_SMOOTH_FACTOR
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
    this.mapService.getMapSummary(this.startDate,this.subaccountId, this.selectedRegions).subscribe((res:any)=>{
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
          this.isLoadingResults = false;
          this.isRequestCompleted = true;
        } else {
          this.isLoadingResults = false;
          this.isRequestCompleted = true;
          this.map.setView([39.09973,-94.57857], 5);
          this.snackBarService.openSnackBar('There is not data to display', '');
          this.baseMap();
        }
        this.autoRefresh = false;
      }
    });
  if(this.selectedRegions.length > 0)
    this.reloadUserOptions(this.selectedRegions);
  else
    this.reloadFilterOptions();
  }

  dateFilter(){
    this.isLoadingResults = true;
    this.isRequestCompleted = false;
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
    if(this.filterForm.get('startDateFilterControl').value !== ''){
      let selectedStartDate = moment.utc(this.filterForm.get('startDateFilterControl').value).format('YYYY-MM-DDT00:00:00')+'Z';
      this.startDate = selectedStartDate;
      this.getMapSummary();
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
    }
  }

  selected() {
    this.selectedRegions.push(this.filterForm.get('region').value);
    this.filterForm.get('region').setValue("");
  }

  remove(region: string) {
    const regions = this.selectedRegions;
    const index = regions.indexOf(region);
    if ( index >= 0)
      regions.splice(index, 1); 
  }

  clearRegionsFilter() {
    this.selectedRegions=[];
  }

  regionDisplayFn(region: any) {
    return region.displayName;
  }

  private reloadFilterOptions() {
    if(this.disableFiltersWhileLoading)
      this.filterForm.disable();

    let startDate, endDate;
    startDate = endDate = moment.utc(this.filterForm.get('startDateFilterControl').value);

    this.spotlightChartsService.getFilterOptions(this.subaccountId,startDate,endDate).subscribe((res: any) => {
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
    })
  }

  private reloadUserOptions(regions?: any) {
    if(this.disableFiltersWhileLoading)
      this.filterForm.disable();
    
    let startDate, endDate;
      startDate = endDate = moment.utc(this.filterForm.get('startDateFilterControl').value);

    this.spotlightChartsService.getFilterOptions(this.subaccountId,startDate,endDate,"users",regions ? regions : null).subscribe((res: any) => {
      this.filterForm.enable();
    })
  }

  ngOnDestroy(): void {
    if(this.refreshIntervalSubscription) 
      this.refreshIntervalSubscription.unsubscribe();
  }

  nodeDetails(key:any){
    let nodeData = {...this.nodesMap[key], date: this.startDate};
    this.dialog.open(NodeDetailComponent, {
      width: '800px',
      disableClose: true,
      data: nodeData
    });
  }

  lineDetails(key:any){
    let lineData = {...this.linesMap[key], date: this.startDate};
    this.dialog.open(LineDetailComponent, {
      width: '500px',
      disableClose: true,
      data: lineData
    });
  }
}
