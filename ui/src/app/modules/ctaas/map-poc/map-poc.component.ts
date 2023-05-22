import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
  maxDate: any;
  map:any;
  nodesMap:any = {};
  linesMap:any = {};
  nodeIcon:any;
  startDate:any;
  endDate:any;
  mapStartView: any[] = [];
  filterForm = this.fb.group({
    // fromRegionFilterControl: [''],
    // toRegionFilterControl: [''],
    startDateFilterControl: ['',[Validators.required]],
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
    this.startDate = moment.utc().format("YYYY-MM-DDT00:00:00")+'Z';
    //this.endDate =  moment.utc().format("YYYY-MM-DDTHH:mm:ss")+'Z'
    this.initColumns();
    this.calculateTableHeight();
    this.map = L.map('map'); 
    this.getMapSummary();
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
    this.baseMap(this.map);
  }

  private getNodeData(index, fromRegion, toRegion) {
    if(fromRegion) {
      if (!this.nodesMap[fromRegion]) {
        let newRegionObj = {
          region: this.mapData[index].from,
          totalCalls: this.mapData[index].totalCalls,
          callsOriginated: {
            passed: this.mapData[index].passed,
            failed: this.mapData[index].failed,
            total: this.mapData[index].totalCalls, 
            polqa: 0,
            receivedJitter: 0,
            roundTripTime: 0,
            receivedPacketLoss: 0
          },
          callsTerminated: {passed: 0,failed: 0, total: 0, polqa: 0, receivedJitter: 0, roundTripTime: 0, receivedPacketLoss: 0}
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
        if(this.nodesMap[fromRegion].callsOriginated.receivedJitter < this.mapData[index].receivedJitter)
          this.nodesMap[fromRegion].callsOriginated.receivedJitter = this.mapData[index].receivedJitter;
        if(this.nodesMap[fromRegion].callsOriginated.roundTripTime < this.mapData[index].roundTripTime)
          this.nodesMap[fromRegion].callsOriginated.roundTripTime = this.mapData[index].roundTripTime;
        if(this.nodesMap[fromRegion].callsOriginated.receivedPacketLoss < this.mapData[index].receivedPacketLoss)
          this.nodesMap[fromRegion].callsOriginated.receivedPacketLoss = this.mapData[index].receivedPacketLoss;
        this.nodesMap[fromRegion].totalCalls += this.mapData[index].totalCalls;
      }
    }
    if(toRegion) {
      if (!this.nodesMap[toRegion]) {
        let newRegionObj = {
          region: this.mapData[index].to,
          totalCalls: this.mapData[index].totalCalls,
          callsOriginated: {passed: 0,failed: 0, total: 0, polqa: 0, receivedJitter: 0,roundTripTime: 0, receivedPacketLoss: 0},
          callsTerminated: {
            passed: this.mapData[index].passed,
            failed: this.mapData[index].failed,
            total: this.mapData[index].totalCalls, 
            polqa: 0,
            receivedJitter: 0,
            roundTripTime: 0,
            receivedPacketLoss: 0
          }
        }
        if (this.mapData[index].polqa)
          newRegionObj.callsTerminated.polqa = this.mapData[index].polqa;
        this.nodesMap[toRegion] = newRegionObj;
      } else {
        this.nodesMap[toRegion].callsTerminated.passed += this.mapData[index].passed;
        this.nodesMap[toRegion].callsTerminated.failed += this.mapData[index].failed;
        this.nodesMap[toRegion].callsTerminated.total += this.mapData[index].totalCalls;
        if (this.mapData[index].polqa && this.nodesMap[toRegion].callsTerminated.polqa > this.mapData[index].polqa)
          this.nodesMap[toRegion].callsTerminated.callsTerminated.polqa = this.mapData[index].polqa;
        if(this.nodesMap[toRegion].callsTerminated.receivedJitter < this.mapData[index].receivedJitter)
          this.nodesMap[toRegion].callsTerminated.receivedJitter = this.mapData[index].receivedJitter;
        if(this.nodesMap[toRegion].callsTerminated.roundTripTime < this.mapData[index].roundTripTime)
          this.nodesMap[toRegion].callsTerminated.roundTripTime = this.mapData[index].roundTripTime;
        if(this.nodesMap[toRegion].callsTerminated.receivedPacketLoss < this.mapData[index].receivedPacketLoss)
          this.nodesMap[toRegion].callsTerminated.receivedPacketLoss = this.mapData[index].receivedPacketLoss;
        if (fromRegion !== toRegion)
          this.nodesMap[toRegion].totalCalls += this.mapData[index].totalCalls;
      }
    }
  }

  private getLineData(index, fromRegion, toRegion) {
    const fromTo = fromRegion + " - " + toRegion;
    const toFrom = toRegion + " - " + fromRegion;
    const uniqueKey = this.linesMap[fromTo]? fromTo : toFrom;

    if (!this.linesMap[uniqueKey]){
      this.linesMap[uniqueKey] = this.mapData[index];
      this.linesMap[uniqueKey].polqa = 0;
    }
    else {
      this.linesMap[uniqueKey].passed += this.mapData[index].passed;
      this.linesMap[uniqueKey].failed += this.mapData[index].failed;
      this.linesMap[uniqueKey].totalCalls += this.mapData[index].totalCalls;
      if (this.linesMap[uniqueKey].polqa && this.linesMap[uniqueKey].polqa > this.mapData[index].polqa)
        this.linesMap[uniqueKey].polqa = this.mapData[index].polqa;
      if(this.linesMap[uniqueKey].receivedJitter < this.mapData[index].receivedJitter)
        this.linesMap[uniqueKey].receivedJitter = this.mapData[index].receivedJitter;
      if(this.linesMap[uniqueKey].roundTripTime < this.mapData[index].roundTripTime)
        this.linesMap[uniqueKey].roundTripTime = this.mapData[index].roundTripTime;
      if(this.linesMap[uniqueKey].receivedPacketLoss < this.mapData[index].receivedPacketLoss)
        this.linesMap[uniqueKey].receivedPacketLoss = this.mapData[index].receivedPacketLoss;
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
      if(this.linesMap[key].failed > 1 && this.linesMap[key].failed < 5 || this.linesMap[key].polqa >= 2  && this.linesMap[key].polqa < 3)
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
    this.mapData = [];
    this.mapStartView = [];
    this.linesMap = {};
    this.nodesMap = {};
    this.isLoadingResults = true;
    this.isRequestCompleted = false;
    const subaccountId = this.subaccountService.getSelectedSubAccount().id;
    // this.esriService.getMapSummary(this.startDate,subaccountId).subscribe((res:any)=>{
    //   if(res){
    //     let parsedSummaryData = []
    //     res.map((summaryData, index) => {
    //       summaryData = {...summaryData, 
    //       fromLocation: summaryData.from.city + ", " + summaryData.from.state + ", " + summaryData.from.country,
    //       toLocation: summaryData.to.city + ", " + summaryData.to.state + ", " + summaryData.to.country
    //     }
    //     parsedSummaryData[index] = summaryData;
    //   });
    //   console.log("test",parsedSummaryData)
    //     this.mapData = parsedSummaryData
    //     this.processMapData();
    //     this.drawNodes();
    //     this.drawLines();
    //     this.isLoadingResults = false;
    //     this.isRequestCompleted = true;
    //   }
    // });
    this.mapData = [
      {
          "totalCalls": 178,
          "receivedPacketLoss": 0.59,
          "sentBitrate": 40,
          "polqa": 0,
          "roundTripTime": 227,
          "from": {
              "country": "America",
              "city": "Plano",
              "location": {
                  "x": -96.69924999999995,
                  "y": 33.020790000000034
              },
              "state": "texas"
          },
          "receivedJitter": 15.59,
          "to": {
              "country": "America",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "passed": 178,
          "failed": 0,
          "fromLocation": "Plano, texas, America",
          "toLocation": "Dallas, Texas, America"
      },
      {
          "totalCalls": 2,
          "receivedPacketLoss": 0,
          "sentBitrate": 38.857142857142854,
          "polqa": 0,
          "roundTripTime": 118,
          "from": {
              "country": "America",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "receivedJitter": 9.62,
          "to": {
              "country": "America",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "passed": 2,
          "failed": 0,
          "fromLocation": "Dallas, Texas, America",
          "toLocation": "Dallas, Texas, America"
      },
      {
          "totalCalls": 92,
          "receivedPacketLoss": 0.59,
          "sentBitrate": 36.18652849740933,
          "polqa": 1.89,
          "roundTripTime": 227,
          "from": {
              "country": "America",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "receivedJitter": 15.59,
          "to": {
              "country": "America",
              "city": "Plano",
              "location": {
                  "x": -96.69924999999995,
                  "y": 33.020790000000034
              },
              "state": "Texas"
          },
          "passed": 92,
          "failed": 0,
          "fromLocation": "Dallas, Texas, America",
          "toLocation": "Plano, Texas, America"
      },
      {
          "totalCalls": 9,
          "receivedPacketLoss": 0.01,
          "sentBitrate": 36,
          "polqa": 2.58,
          "roundTripTime": 202,
          "from": {
              "country": "America",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "receivedJitter": 8.91,
          "to": {
              "country": "US",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "passed": 9,
          "failed": 0,
          "fromLocation": "Dallas, Texas, America",
          "toLocation": "Dallas, Texas, US"
      },
      {
          "totalCalls": 9,
          "receivedPacketLoss": 0,
          "sentBitrate": 36,
          "polqa": 2.49,
          "roundTripTime": 199,
          "from": {
              "country": "America",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "receivedJitter": 11.31,
          "to": {
              "country": "US",
              "city": "Plano",
              "location": {
                  "x": -96.69924999999995,
                  "y": 33.020790000000034
              },
              "state": "Texas"
          },
          "passed": 9,
          "failed": 0,
          "fromLocation": "Dallas, Texas, America",
          "toLocation": "Plano, Texas, US"
      },
      {
          "totalCalls": 91,
          "receivedPacketLoss": 0.8,
          "sentBitrate": 36,
          "polqa": 1.37,
          "roundTripTime": 226,
          "from": {
              "country": "America",
              "city": "Plano",
              "location": {
                  "x": -96.69924999999995,
                  "y": 33.020790000000034
              },
              "state": "Texas"
          },
          "receivedJitter": 13.35,
          "to": {
              "country": "America",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "passed": 88,
          "failed": 3,
          "fromLocation": "Plano, Texas, America",
          "toLocation": "Dallas, Texas, America"
      },
      {
          "totalCalls": 9,
          "receivedPacketLoss": 0,
          "sentBitrate": 36,
          "polqa": 2.53,
          "roundTripTime": 223,
          "from": {
              "country": "US",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "receivedJitter": 12.73,
          "to": {
              "country": "America",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "passed": 9,
          "failed": 0,
          "fromLocation": "Dallas, Texas, US",
          "toLocation": "Dallas, Texas, America"
      },
      {
          "totalCalls": 10,
          "receivedPacketLoss": 0,
          "sentBitrate": 36.232142857142854,
          "polqa": 2.53,
          "roundTripTime": 206,
          "from": {
              "country": "US",
              "city": "Plano",
              "location": {
                  "x": -96.69924999999995,
                  "y": 33.020790000000034
              },
              "state": "Texas"
          },
          "receivedJitter": 11.78,
          "to": {
              "country": "America",
              "city": "Dallas",
              "location": {
                  "x": -96.79511999999994,
                  "y": 32.77822000000003
              },
              "state": "Texas"
          },
          "passed": 10,
          "failed": 0,
          "fromLocation": "Plano, Texas, US",
          "toLocation": "Dallas, Texas, America"
      }
    ]
    this.isLoadingResults = false;
    this.isRequestCompleted = true;
    //this.mapData = parsedSummaryData
    this.processMapData();
    this.drawNodes();
    this.drawLines();
  }
  
  dateFilter(){
    this.isLoadingResults = true;
    if(this.filterForm.get('startDateFilterControl').value !== ''){
      let selectedStartDate = moment.utc(this.filterForm.get('startDateFilterControl').value).format('YYYY-MM-DDT00:00:00')+'Z';
      //let selectedEndDate = moment.utc(this.filterForm.get('endDateFilterControl').value).format('YYYY-MM-DDT23:59:59')+'Z';
      this.startDate = selectedStartDate;
      //this.endDate = selectedEndDate;
      this.getMapSummary();
      this.isRequestCompleted = false;
    }
    this.isRequestCompleted = false;
  }

  sortData(option: any){

  }

  onChangeButtonToggle(){
   
  }

  nodeDetails(key:any){
    this.dialog.open(NodeDetailComponent, {
      width: '800px',
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
