import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {LicenseConsumptionService} from './license-consumption.service';
import {environment} from '../../environments/environment';
import {LicenseConsumption} from "../model/license-consumption.model";
import {ConsumptionServiceMock} from '../../test/mock/services/license-consumption-service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let licenseConsumptionService: LicenseConsumptionService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Customer service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        licenseConsumptionService = new LicenseConsumptionService(httpClientSpy);
    });

    it('should make the proper http calls on updateLicenseConsumptionDetails())', (done: DoneFn) => {
        const updateLicenseConsumptionDetails: LicenseConsumption = {
            consumptionDate: "2022-08-21",
            version: "9.0.4.7",
            vendor: "Allworx",
            consumptionId: "bc12f1d1-8cf0-4d20-af81-fc11c12bf152",
            subaccountId: "403e139b-5d28-42cc-b339-7a5ef20f416b",
            model: "test",
            type: "test"
        };

        
        httpClientSpy.put.and.returnValue(ConsumptionServiceMock.updateLicenseConsumptionDetails(updateLicenseConsumptionDetails));
        licenseConsumptionService.updateLicenseConsumptionDetails(updateLicenseConsumptionDetails).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/licenseUsageDetails/' + updateLicenseConsumptionDetails.consumptionId, updateLicenseConsumptionDetails);
    });

    it('should make the proper calls on addLicenseConsumptionDetails()', (done: DoneFn) => {
        const updateLicenseConsumptionDetails: LicenseConsumption = {
            consumptionDate: "2022-08-21",
            version: "9.0.4.7",
            vendor: "Allworx",
            consumptionId: "bc12f1d1-8cf0-4d20-af81-fc11c12bf152",
            subaccountId: "403e139b-5d28-42cc-b339-7a5ef20f416b",
            model: "test",
            type: "test"
        };
        httpClientSpy.post.and.returnValue(ConsumptionServiceMock.addLicenseConsumptionDetails(updateLicenseConsumptionDetails));
        licenseConsumptionService.addLicenseConsumptionDetails(updateLicenseConsumptionDetails).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/licenseUsageDetails', updateLicenseConsumptionDetails);
    });

    it('should make the proper http calls on deleteLicenseConsumptionDetails()', (done: DoneFn) => {
        const updateLicenseConsumptionDetails: LicenseConsumption = {
            consumptionDate: "2022-08-21",
            version: "9.0.4.7",
            vendor: "Allworx",
            consumptionId: "bc12f1d1-8cf0-4d20-af81-fc11c12bf152",
            subaccountId: "403e139b-5d28-42cc-b339-7a5ef20f416b",
            model: "test",
            type: "test"
        };
        httpClientSpy.delete.and.returnValue(ConsumptionServiceMock.deleteLicenseConsumptionDetails(updateLicenseConsumptionDetails.consumptionId));
        licenseConsumptionService.deleteLicenseConsumptionDetails(updateLicenseConsumptionDetails.consumptionId).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/licenseUsageDetails/' + updateLicenseConsumptionDetails.consumptionId);
    });

    it('should make the proper http calls on getLicenseConsumptionDetails with years in the filters', (done: DoneFn) => {
        const expectedConsumptions: any = ConsumptionServiceMock.mockDetailedInfo;
        const expectedEquipmentConsumption: any = ConsumptionServiceMock.mockEquipmentInfo;
        const expectedSummaryConsumption: any = ConsumptionServiceMock.mockSummaryInfo;
        const filters = {year:"year", view: '', month: '', type:'', project: '', limit:'', offset:'', startDate: '', endDate: ''};
        const data = {view:''}
        httpClientSpy.get.and.returnValue(ConsumptionServiceMock.getLicenseConsumptionDetails(data));
        licenseConsumptionService.getLicenseConsumptionDetails(filters).subscribe({
            next: consumptions => {
                expect(consumptions).toEqual(expectedConsumptions);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalled();

        filters.month = 'month';
        httpClientSpy.get.and.returnValue(ConsumptionServiceMock.getLicenseConsumptionDetails(data));
        licenseConsumptionService.getLicenseConsumptionDetails(filters).subscribe({
            next: consumptions => {
                expect(consumptions).toEqual(expectedConsumptions);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalled();

        filters.type = 'type';
        httpClientSpy.get.and.returnValue(ConsumptionServiceMock.getLicenseConsumptionDetails(data));
        licenseConsumptionService.getLicenseConsumptionDetails(filters).subscribe({
            next: consumptions => {
                expect(consumptions).toEqual(expectedConsumptions);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalled();

        filters.project= 'projectId'
        httpClientSpy.get.and.returnValue(ConsumptionServiceMock.getLicenseConsumptionDetails(data));
        licenseConsumptionService.getLicenseConsumptionDetails(filters).subscribe({
            next: consumptions => {
                expect(consumptions).toEqual(expectedConsumptions);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalled();

        filters.limit = 'limit'
        httpClientSpy.get.and.returnValue(ConsumptionServiceMock.getLicenseConsumptionDetails(data));
        licenseConsumptionService.getLicenseConsumptionDetails(filters).subscribe({
            next: consumptions => {
                expect(consumptions).toEqual(expectedConsumptions);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalled();

        filters.offset = 'offset'
        httpClientSpy.get.and.returnValue(ConsumptionServiceMock.getLicenseConsumptionDetails(data));
        licenseConsumptionService.getLicenseConsumptionDetails(filters).subscribe({
            next: consumptions => {
                expect(consumptions).toEqual(expectedConsumptions);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalled();

        filters.startDate = 'startDate'
        filters.endDate = 'endDate'
        httpClientSpy.get.and.returnValue(ConsumptionServiceMock.getLicenseConsumptionDetails(data));
        licenseConsumptionService.getLicenseConsumptionDetails(filters).subscribe({
            next: consumptions => {
                expect(consumptions).toEqual(expectedConsumptions);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalled();

        const Summarydata = {view:'summary'}
        httpClientSpy.get.and.returnValue(ConsumptionServiceMock.getLicenseConsumptionDetails(Summarydata));
        licenseConsumptionService.getLicenseConsumptionDetails(filters).subscribe({
            next: consumptions => {
                expect(consumptions).toEqual(expectedSummaryConsumption);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalled();

        const equipmentdata = {view:'equipment'}
        httpClientSpy.get.and.returnValue(ConsumptionServiceMock.getLicenseConsumptionDetails(equipmentdata));
        licenseConsumptionService.getLicenseConsumptionDetails(filters).subscribe({
            next: consumptions => {
                expect(consumptions).toEqual(expectedEquipmentConsumption);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalled();
    });  
});
