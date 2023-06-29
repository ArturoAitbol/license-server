import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { MapService } from "./map.service";
import { MapServiceMock } from "src/test/mock/services/map-service.mock";
import moment from "moment";
import { environment } from "src/environments/environment";

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let mapService: MapService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Customer service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        mapService = new MapService(httpClientSpy);
    });

    it('should make the proper http calls on getMapSummary', (done: DoneFn) => {
        let params = new HttpParams();
        httpClientSpy.get.and.returnValue(MapServiceMock.getMapSummary());
        let date = moment.utc('2023-06-28 00:00:00');
        params = params.set('startDate', moment.utc().format("2023-06-28 00:00:00"));
        params = params.set('endDate',moment.utc().format("2023-06-28 00:00:00"));   
        params = params.set('subaccountId','f5a609c0-8b70-4a10-9dc8-9536bdb5652c');   
        params = params.set('regions',JSON.stringify([{
            'country': 'United States',
            'state': 'FL',
            'city': 'Tampa',
        }]));
        mapService.getMapSummary(date,'f5a609c0-8b70-4a10-9dc8-9536bdb5652c',[{country: 'United States', state: 'FL', city: 'Tampa'}]).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/spotlighCharts/mapSummary', { headers, params });

        mapService.getMapSummary(date,'f5a609c0-8b70-4a10-9dc8-9536bdb5652c',[{country: 'United States', state: 'FL', city: 'Tampa'}]).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/spotlighCharts/mapSummary', { headers, params });
    });

});
