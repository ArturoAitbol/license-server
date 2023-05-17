import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as L from 'leaflet';
import moment from 'moment';
import { EsriServicesService } from 'src/app/services/map-poc.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { NodeDetailComponent } from './node-detail/node-detail.component';
import { LineDetailComponent } from './line-detail/line-detail.component';
@Component({
  selector: 'app-map-poc',
  templateUrl: './map-poc.component.html',
  styleUrls: ['./map-poc.component.css']
})
export class MapPocComponent implements OnInit {
  displayedColumns: any[] = [];
  isLoadingResults = false;
  isRequestCompleted = false;
  tableMaxHeight: number;
  mapData: any = [];
  fromRegions: any[] = [];
  toRegions: any[]= [];
  maxDate: any;
  map:any;
  nodesMap:any = {};
  linesMap:any = {};
  nodeIcon:any;
  filterForm = this.fb.group({
    fromRegionFilterControl: [''],
    toRegionFilterControl: [''],
    startDateFilterControl: [''],
    endDateFilterControl: [''],
});
  constructor(private esriService: EsriServicesService, 
    private fb: FormBuilder,
    private subaccountService: SubAccountService,
    public dialog: MatDialog) { }

  readonly GOOD_COLOR: string = "#203c66";
  readonly MID_COLOR: string = "orange";
  readonly BAD_COLOR: string = "red";
  readonly LINE_WEIGHT: number = 3;
  readonly LINKED: string = 'Linked';
  readonly HEAT: string = 'Heat';
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
    this.map = L.map('map').setView([39.09973,-94.57857], 5); 
    this.baseMap(this.map);
    this.initColumns();
    this.calculateTableHeight();
    this.getMapSummary();
    this.maxDate = moment.utc().format("YYYY-MM-DD[T]HH:mm:ss");
  }
  
  processMapData(){
    for(let i=0 ; i < this.mapData.length; i++){
      try {
        const fromRegion = this.mapData[i].from.location.y + ", " + this.mapData[i].from.location.x;
        const toRegion = this.mapData[i].to.location.y + ", " + this.mapData[i].to.location.x;
        this.getNodeData(i, fromRegion, toRegion);
        this.getLineData(i, fromRegion, toRegion);
      } catch(error) {
        console.log(error);
      }
    }
  }

  private getNodeData(index, fromRegion, toRegion) {
    if (!this.nodesMap[fromRegion]) {
      let newRegionObj = {
        region: this.mapData[index].from,
        totalCalls: this.mapData[index].totalCalls,
        callsOriginated: {passed: this.mapData[index].passed,failed: this.mapData[index].failed, total: this.mapData[index].totalCalls, polqa: 0, callsTitle: 'Calls Originated'},
        callsTerminated: {passed: 0,failed: 0, total: 0, polqa: 0}
      }
      if (this.mapData[index].polqa)
        newRegionObj.callsOriginated.polqa = this.mapData[index].polqa;
      this.nodesMap[fromRegion] = newRegionObj;
    } else {
      this.nodesMap[fromRegion].callsOriginated.passed += this.mapData[index].passed;
      this.nodesMap[fromRegion].callsOriginated.failed += this.mapData[index].failed;
      this.nodesMap[fromRegion].callsOriginated.total += this.mapData[index].totalCalls;
      if (this.mapData[index].polqa && this.nodesMap[fromRegion].callsOriginated.polqa > this.mapData[index].polqa)
        this.nodesMap[fromRegion].callsOriginated.polqa = this.mapData[index].polqa;
      this.nodesMap[fromRegion].totalCalls += this.mapData[index].totalCalls;
    }
    if (!this.nodesMap[toRegion]) {
      let newRegionObj = {
        region: this.mapData[index].to,
        totalCalls: this.mapData[index].totalCalls,
        callsOriginated: {passed: 0,failed: 0, total: 0, polqa: 0},
        callsTerminated: {passed: this.mapData[index].passed,failed: this.mapData[index].failed, total: this.mapData[index].totalCalls, polqa: 0,callsTitle: 'Calls Terminated'}
      }
      if (this.mapData[index].polqa)
        newRegionObj.callsTerminated.polqa = this.mapData[index].polqa;
      this.nodesMap[toRegion] = newRegionObj;
    } else {
      this.nodesMap[toRegion].callsTerminated.passed += this.mapData[index].passed;
      this.nodesMap[toRegion].callsTerminated.failed += this.mapData[index].failed;
      this.nodesMap[toRegion].callsTerminated.total += this.mapData[index].totalCalls;
      if (this.mapData[index].polqa && this.nodesMap[toRegion].callsTerminated.polqa > this.mapData[index].polqa)
        this.nodesMap[toRegion].callsTerminated.polqa = this.mapData[index].polqa;
      if (fromRegion !== toRegion)
        this.nodesMap[toRegion].totalCalls += this.mapData[index].totalCalls;
    }
  }

  private getLineData(index, fromRegion, toRegion) {
    const fromTo = fromRegion + " - " + toRegion;
    const toFrom = toRegion + " - " + fromRegion;
    const uniqueKey = this.linesMap[fromTo]? fromTo : toFrom;
    if (!this.linesMap[uniqueKey])
      this.linesMap[uniqueKey] = this.mapData[index];
    else {
      this.linesMap[uniqueKey].passed += this.mapData[index].passed;
      this.linesMap[uniqueKey].failed += this.mapData[index].failed;
      this.linesMap[uniqueKey].totalCalls += this.mapData[index].totalCalls;
      if (this.linesMap[uniqueKey].callsOriginated.polqa > this.mapData[index].polqa)
        this.linesMap[uniqueKey].callsTerminated.polqa = this.mapData[index].polqa;
    }
  }

  baseMap(map: any): void {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  }

  drawNodes():void {
    let customIconUrl = '../../../../assets/images/goodMarker.svg';
    for (const key in this.nodesMap) {
      let failed, polqa;
      failed = this.nodesMap[key].callsOriginated.failed + this.nodesMap[key].callsTerminated.failed;
      polqa = this.nodesMap[key].callsOriginated.polqa;
      if(this.nodesMap[key].callsOriginated.polqa > this.nodesMap[key].callsTerminated.polqa)
        polqa = this.nodesMap[key].callsTerminated.polqa;
      if(failed > 1 && failed < 5 || polqa >=2 && polqa < 3)
        customIconUrl = '../../../../assets/images/midMarker.svg';
      if(failed > 5 || polqa < 2)
        customIconUrl = '../../../../assets/images/badMarker.svg';
      let customIcon = L.icon({
        iconUrl: customIconUrl,
        iconAnchor: [25, 29]
      })
      let latlong = new L.LatLng(this.nodesMap[key].region.location.y, this.nodesMap[key].region.location.x)
      let node = L.marker(latlong, {icon:customIcon}).on('click', (e) =>{
        this.nodeDetails(key);
      });
      node.addTo(this.map);
    }
  }

  drawLines() {
    for (const key in this.linesMap) {
      let lineState = this.GOOD_COLOR;
      let coordinatesArray = [];
      if(this.linesMap[key].failed > 1 && this.linesMap[key].failed < 5 || this.linesMap[key].polqa < 3 && this.linesMap[key].polqa >= 2 )
        lineState = this.MID_COLOR;
      if(this.linesMap[key].failed > 5 || this.linesMap[key].polqa < 2)
        lineState = this.BAD_COLOR
      coordinatesArray[0] = new L.LatLng(this.linesMap[key].from.location.y, this.linesMap[key].from.location.x);
      coordinatesArray[1] = new L.LatLng(this.linesMap[key].to.location.y, this.linesMap[key].to.location.x);
      let line = new L.Polyline(coordinatesArray, {
        color: lineState,
        weight: this.LINE_WEIGHT,
        smoothFactor: this.LINE_SMOOTH_FACTOR
      }).on('click', (e) =>{
        this.lineDetails(key);
      });
      line.addTo(this.map);
    }
  }

  getMapSummary(){
    this.isLoadingResults = true;
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    this.esriService.getMapSummary(moment("05-04-2023"),moment("05-08-2023"),subaccountId).subscribe((res:any)=>{
      if(res){
        let parsedSummaryData = []
        res.map((summaryData, index) => {
          summaryData = {...summaryData, 
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
      }
    });
  }
  
  sortData(option: any){

  }

  onChangeButtonToggle(){
   
  }

  nodeDetails(key:any){
    this.dialog.open(NodeDetailComponent, {
      width: '500px',
      disableClose: true,
      data: this.nodesMap[key]
    });
  }

  lineDetails(key:any){
    this.dialog.open(LineDetailComponent, {
      width: '500px',
      disableClose: true,
      data: this.linesMap[key]
    });
  }
}
