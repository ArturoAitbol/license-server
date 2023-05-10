import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Observable, zip } from 'rxjs';
import { EsriServicesService } from 'src/app/services/map-poc.service';
@Component({
  selector: 'app-map-poc',
  templateUrl: './map-poc.component.html',
  styleUrls: ['./map-poc.component.css']
})
export class MapPocComponent implements OnInit {

  constructor(private esriService: EsriServicesService) { }

  zipLatLong: any = []; 
  zipLatLong2: any = [];
  latitudeAndLongitudeOfLines: any = [];
  readonly GOOD_STATE: string  = "good";
  readonly MID_STATE: string  = "mid";
  readonly BAD_STATE: string  = "bad";
  readonly GOOD_COLOR: string = "green";
  readonly MID_COLOR: string = "orange";
  readonly BAD_COLOR: string = "red";
  readonly LINE_WEIGHT: number = 4;
  readonly LINKED: string = 'Linked';
  readonly HEAT: string = 'Heat';
  readonly LINE_SMOOTH_FACTOR: number = 1;
  zipList: number[] = [10001, 91911, 75001];
  zipList2: number[] = [80014, 68516, 59901];
  zipList3: number[] = [46077, 65721, 93611];
  zipList4: string[] = ["10001, New York, New York", '91911', '75001'];
  zipList5: string[] = ['80014', '68516', '59901'];
  zipList6: string[] = ['46077', '65721', '93611'];

  zipList7: string[] = ['46077', '65721', '93611'];
  zipList8: string[] = ['46077', '65721', '93611'];

  directionData: any[] = [{city:'Plano', state:'Texas',coordinates:[33.020790000000034,-96.69924999999995]},
  {city:'Columbus', state:'Minnesota',coordinates:[45.265050000000031,-93.05105999999995]},
  {city:' Oklahoma City', state:'Oklahoma',coordinates:[35.472030000000075,-97.521069999999952]}];

  ngOnInit(): void {
    var map = L.map('map').setView([39.09973,-94.57857], 5); 
    this.baseMap(map);
    //this.linesAndMarkers(map, this.BAD_STATE, this.zipList4);
    this.linesAndMarkers(map,  this.GOOD_STATE, this.zipList5);
    // this.linesAndMarkers(map, this.MID_STATE, this.zipList6);
  }

  linesAndMarkers(map: any, status: string, zipcode: any):void {
    //this.convertZipCodeToLatLong(zipcode).subscribe((res:any)=> {
    //Plano texas, Columbus Minnesota, Oklahoma City Oklahoma
      let res = [{city:'Plano', state:'Texas',coordinates:[33.020790000000034,-96.69924999999995]},
        {city:'Columbus', state:'Minnesota',coordinates:[45.265050000000031,-93.05105999999995]},
        {city:' Oklahoma City', state:'Oklahoma',coordinates:[35.472030000000075,-97.521069999999952]}]

      for(let i = 0; i< res.length; i++){
        let latLngcoordinates = res[i].coordinates;
        this.latitudeAndLongitudeOfLines[i] = new L.LatLng(latLngcoordinates[0], latLngcoordinates[1]);
      }
      this.statusOfTheLines(map,status,res);
    //});
  }

  baseMap(map: any): void {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  }

  // createNode(map:any, actualCoordinates:any, color:string){
  //   let node;
  //   for(let i = 0; i < actualCoordinates.length; i++){
  //     let nodeLatitudeLongitude = actualCoordinates[i];
  //     node = L.circle(nodeLatitudeLongitude, {
  //       color: color,
  //       fillColor: color,
  //       fillOpacity: 0.5,
  //       radius: 500
  //       });
  //     node.addTo(map);
  //     node.bindPopup(nodeLatitudeLongitude[2]);
  //   }
  // }

  statusOfTheLines(map: any, status: string, latlng:any):void {
    let pointsOfPoly;
    console.log(latlng)
    switch(status) {
      case this.GOOD_STATE:
          pointsOfPoly = new L.Polyline(this.latitudeAndLongitudeOfLines, {
          color: this.GOOD_COLOR,
          weight: this.LINE_WEIGHT,
          smoothFactor: this.LINE_SMOOTH_FACTOR
        });
        pointsOfPoly.bindPopup('ads')
        pointsOfPoly.addTo(map);
        this.drawNodesLatLong(map,latlng,this.GOOD_COLOR);
        break;
      case this.MID_STATE:
          pointsOfPoly = new L.Polyline(this.latitudeAndLongitudeOfLines, {
          color: this.MID_COLOR,
          weight: this.LINE_WEIGHT,
          smoothFactor: this.LINE_SMOOTH_FACTOR
        });
        pointsOfPoly.addTo(map);
        this.drawNodesLatLong(map,latlng,this.MID_COLOR);
        break; 
      case this.BAD_STATE:
        pointsOfPoly = new L.Polyline(this.latitudeAndLongitudeOfLines, {
        color: this.BAD_COLOR,
        weight: this.LINE_WEIGHT,
        smoothFactor: this.LINE_SMOOTH_FACTOR
        });
        pointsOfPoly.addTo(map);
        this.drawNodesLatLong(map,latlng,this.BAD_COLOR);
        break;
      default:
        break;
    }
  }

  // convertZipCodeIntoLatLong(zipCodes: number[]):void {
  //   for(let i = 0; i < zipCodes.length ; i++){
  //     this.zipLatLong[i] = convert.zipConvert(zipCodes[i]);
  //     this.zipLatLong[i] = this.zipLatLong[i].split(',');
  //     this.zipLatLong[i] = this.zipLatLong[i].map((x:string) => Number(x));
  //   }
  // }

  drawNodesLatLong(map:any, latLongList:any, color: string):void {
    for(let i = 0 ; i< latLongList.length; i++){
      L.circle(latLongList[i], {
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: 30000
      }).addTo(map);
    }
  }

  convertZipCodeToLatLong(zipCodes: string[]): Observable<any>{
    return new Observable<any>(obs => {
      const observablesArray = []
      for (let i = 0; i < zipCodes.length; i++) {
        observablesArray.push(this.esriService.getLocationData(zipCodes[i]));
      }
      zip(...observablesArray).subscribe((response: any) => {
        obs.next(response.map((response: any) => {
          return [ response.candidates[0].location.y, response.candidates[0].location.x ]
        }));
        obs.complete();
      });
    });
  }

  // onChangeButtonToggle2(zipCodes: string){
  //   // this.esriService.zip2(zipCodes).subscribe(res => {
  //   //   console.log(res)
  //   // })
  //   const observablesArray = []
  //   this.esriService.getLocationData(zipCodes).subscribe(res => {
  //     console.log(res)
  //   })
  // }
  onChangeButtonToggle(){
   
  }
}
