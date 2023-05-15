import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as L from 'leaflet';
import moment from 'moment';
import { Observable, zip } from 'rxjs';
import { EsriServicesService } from 'src/app/services/map-poc.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { NodeDetailComponent } from './node-detail/node-detail.component';
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
  nodesMap:any = new Map()
  fromArray: any[]=[]
  nodesData: any[]=[];
  fromRegion: string;
  toRegion:string;
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

  readonly GOOD_STATE: string  = "good";
  readonly MID_STATE: string  = "mid";
  readonly BAD_STATE: string  = "bad";
  readonly GOOD_COLOR: string = "green";
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
      { name: 'Country', dataKey: 'country', position: 'left', isSortable: true },
      { name: 'From', dataKey: 'from', position: 'left', isSortable: true },
      { name: 'To', dataKey: 'to', position: 'left', isSortable: true },
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
  
  drawFunction(fromToList: any){
    for(let i=0 ; i < this.mapData.length; i++){
      try{
        let coordinatesArray = [];
        coordinatesArray[0] = new L.LatLng(fromToList[i].from?.location?.y,fromToList[i].from?.location?.x);
        coordinatesArray[1] = new L.LatLng(fromToList[i].to?.location?.y, fromToList[i].to?.location?.x);
        //this.statusOfTheLines(this.map,this.GOOD_STATE,coordinatesArray);
        
        this.fromRegion = fromToList[i].from.location.y + ", " + fromToList[i].from.location.x;
        this.toRegion = fromToList[i].to.location.y + ", " + fromToList[i].to.location.x;
        if(!this.nodesMap.has(this.fromRegion)) {
          let newRegionObj = {
            region: fromToList[i].from,
            totalCalls: fromToList[i].totalCalls,
            callsOriginated: {passed: fromToList[i].passed,failed: fromToList[i].failed, total: fromToList[i].totalCalls, polqa: 0, callsTitle: 'Calls originated'},
            callsTerminated: {passed: 0,failed: 0, total: 0, polqa: 0}
          }
          if(fromToList[i].polqa){
            newRegionObj.callsOriginated.polqa = fromToList[i].polqa;
          }
          this.nodesMap.set(this.fromRegion, newRegionObj);
        } else {
          let fromRegionObj = this.nodesMap.get(this.fromRegion);
          fromRegionObj.callsOriginated.passed += fromToList[i].passed;
          fromRegionObj.callsOriginated.failed += fromToList[i].failed;
          fromRegionObj.callsOriginated.total += fromToList[i].totalCalls;
          if(fromRegionObj.callsOriginated.polqa > fromToList[i].polqa)
            fromRegionObj.callsTerminated.polqa = fromToList[i].polqa;
          fromRegionObj.totalCalls += fromToList[i].totalCalls;
          this.nodesMap.set(this.fromRegion, fromRegionObj);
        }
        if(!this.nodesMap.has(this.toRegion)) {
          let newRegionObj = {
            region: fromToList[i].to,
            totalCalls: fromToList[i].totalCalls,
            callsOriginated: {passed: 0,failed: 0, total: 0, polqa: 0},
            callsTerminated: {passed: fromToList[i].passed,failed: fromToList[i].failed, total: fromToList[i].totalCalls, polqa: 0,callsTitle: 'Calls Terminated'}
          }
          if(fromToList[i].polqa){
            newRegionObj.callsTerminated.polqa = fromToList[i].polqa;
          }
          this.nodesMap.set(this.toRegion, newRegionObj);
        } else {
          let toRegionObj = this.nodesMap.get(this.toRegion);
          toRegionObj.callsTerminated.passed += fromToList[i].passed;
          toRegionObj.callsTerminated.failed += fromToList[i].failed;
          toRegionObj.callsTerminated.total += fromToList[i].totalCalls;
          if(toRegionObj.callsTerminated.polqa > fromToList[i].polqa)
            toRegionObj.callsTerminated.polqa = fromToList[i].polqa;
          if(this.fromRegion !== this.toRegion)
            toRegionObj.totalCalls += fromToList[i].totalCalls;
          this.nodesMap.set(this.fromRegion, toRegionObj);
        }
      }catch(error){
        console.log(error)
      }
    }
    console.log(this.nodesMap)
    //this.drawLines(this.map);
    this.drawNodesLatLong(this.map,this.GOOD_STATE);
  }

  baseMap(map: any): void {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  }
  statusOfTheLines(map: any, status: string, coordinatesArray:any[]):void {
    let pointsOfPoly;
    console.log("cord",coordinatesArray)
    switch(status) {
      case this.GOOD_STATE:
          pointsOfPoly = new L.Polyline(coordinatesArray, {
          color: this.GOOD_COLOR,
          weight: this.LINE_WEIGHT,
          smoothFactor: this.LINE_SMOOTH_FACTOR
        });
        pointsOfPoly.addTo(map);
       this.drawNodesLatLong(map,this.GOOD_COLOR);
        break;
      case this.MID_STATE:
          pointsOfPoly = new L.Polyline(coordinatesArray, {
          color: this.MID_COLOR,
          weight: this.LINE_WEIGHT,
          smoothFactor: this.LINE_SMOOTH_FACTOR
        });
        pointsOfPoly.addTo(map);
       // this.drawNodesLatLong(map,this.MID_COLOR);
        break; 
      case this.BAD_STATE:
        pointsOfPoly = new L.Polyline(coordinatesArray, {
        color: this.BAD_COLOR,
        weight: this.LINE_WEIGHT,
        smoothFactor: this.LINE_SMOOTH_FACTOR
        });
        //pointsOfPoly.bindPopup(locationMessage)
        pointsOfPoly.addTo(map);
       // this.drawNodesLatLong(map,this.BAD_COLOR);
        break;
      default:
        break;
    }
  }

  drawLines(map:any){
    let pointsOfPoly;
    let coordinatesArray = [];
    coordinatesArray[0] = new L.LatLng(this.nodesMap.get(this.fromRegion).region.location.y,this.nodesMap.get(this.fromRegion).region.location.x);
    coordinatesArray[1] = new L.LatLng(this.nodesMap.get(this.toRegion).region.location.y,this.nodesMap.get(this.toRegion).region.location.x);
    console.log("coord2",coordinatesArray)
    pointsOfPoly = new L.Polyline(coordinatesArray, {
      color: this.GOOD_COLOR,
      weight: this.LINE_WEIGHT,
      smoothFactor: this.LINE_SMOOTH_FACTOR
    });
    pointsOfPoly.addTo(map);
  }

  drawNodesLatLong(map:any, color: string):void {
    console.log("map:",this.nodesData)
    for(const [key, value] of this.nodesMap){
      console.log("value:",value)
      let latlong = new L.LatLng(value.region.location.y, value.region.location.x)
      let node = L.circle(latlong, {
        color: color,
        fillColor: color,
        fillOpacity: 0.1,
        radius: 1000,
      }).addTo(map);
      node.on('click', (e) =>{
        this.testFunc(e)
      })
    }
  }

  getMapSummary(){
    this.isLoadingResults = true;
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    this.esriService.getMapSummary(moment("05-04-2023"),moment("05-08-2023"),subaccountId).subscribe(res=>{
      if(res){
        this.mapData = res;
        this.drawFunction(this.mapData)
        this.isLoadingResults = false;
      }
    });
  }
  
  sortData(option: any){

  }

  onChangeButtonToggle(){
   
  }

  testFunc(data:any){
    console.log("1", this.nodesMap, data.target._latlng.lat,data.target._latlng.lng);
    let nodeRegion = this.nodesMap.get(data.target._latlng.lat + ", " + data.target._latlng.lng);
    this.dialog.open(NodeDetailComponent, {
      width: '500px',
      disableClose: true,
      data: nodeRegion
    });
  }
}
