// import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
// import { MapService } from "./map.service";
// import { MapServiceMock } from "src/test/mock/services/map-service.mock";
// import moment from "moment";
// import { environment } from "src/environments/environment";

// let httpClientSpy: jasmine.SpyObj<HttpClient>;
// let mapService: MapService;
// const headers = new HttpHeaders();
// headers.append('Content-Type', 'application/json');

// fdescribe('Customer service http requests test', () => {
//     beforeEach(async () => {
//         httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
//         mapService = new MapService(httpClientSpy);
//     });

//     it('should make the proper http calls on getMapSummary', (done: DoneFn) => {
//         let params = new HttpParams();
//         httpClientSpy.get.and.returnValue(MapServiceMock.getMapSummary());
//         let date = moment.utc();
//         params = params.set('startDate', moment.utc().format("YYYY-MM-DD 00:00:00"));
//         params = params.set('endDate',moment.utc().format("YYYY-MM-DD HH:mm:ss"));   
//         params = params.set('subaccountId','f5a609c0-8b70-4a10-9dc8-9536bdb5652c');   
//         params = params.set('regions','[{country: "United States", state: "FL", city: null}]');
//         mapService.getMapSummary(date,'f5a609c0-8b70-4a10-9dc8-9536bdb5652c',[{country: "United States", state: "FL", city: null}]).subscribe({
//             next: () => { done(); },
//             error: done.fail
//         });
//         expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/spotlighCharts/mapSummary', { headers, params });

//         // params.append('startDate', date.format("YYYY-MM-DD 00:00:00"));
//         // params.append('endDate', date.format("YYYY-MM-DD HH:mm:ss"));   
//         // params.append('subaccountId','f5a609c0-8b70-4a10-9dc8-9536bdb5652c');   
//         // params.append('regions','[{country: "United States", state: "FL", city: null}]');
//         mapService.getMapSummary(date,'f5a609c0-8b70-4a10-9dc8-9536bdb5652c',[{country: "United States", state: "FL", city: null}]).subscribe({
//             next: () => { done(); },
//             error: done.fail
//         });
//         expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/spotlighCharts/mapSummary', { headers, params });
//     });

// });
