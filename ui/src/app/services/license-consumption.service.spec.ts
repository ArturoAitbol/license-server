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
});
