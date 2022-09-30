import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {UsageDetailService} from './usage-detail.service';
import {environment} from '../../environments/environment';
import {UsageDetailServiceMock} from '../../test/mock/services/usage-detail-service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let usageDetailService: UsageDetailService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Customer service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        usageDetailService = new UsageDetailService(httpClientSpy);
    });

    // it('should make the proper http calls on deleteUsageDetails()', (done: DoneFn) => {
    //     let usageDetail : {consumptionId: string; dayOfWeek: number; id: string; macAddress: string; modifiedBy: string; serialNumber: string; usageDate: string;};
    //     usageDetail = UsageDetailServiceMock.usageDetail;
    //     httpClientSpy.delete.and.returnValue(UsageDetailServiceMock.deleteUsageDetails(usageDetail));
    //     usageDetailService.deleteUsageDetails(usageDetail).subscribe({
    //         next: () => { done(); },
    //         error: done.fail
    //     });
    //     expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/customerAdminEmails/' + usageDetail.id);
    // });

    it('should make the proper calls on createUsageDetails()', (done: DoneFn) => {
        let usageDetail : {consumptionId: string; dayOfWeek: number; id: string; macAddress: string; modifiedBy: string; serialNumber: string; usageDate: string;};
        usageDetail = UsageDetailServiceMock.usageDetail;
        httpClientSpy.post.and.returnValue(UsageDetailServiceMock.createUsageDetails());
        usageDetailService.createUsageDetails(usageDetail).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/usageDetails/'+usageDetail.id, usageDetail);
    });

    it('should make the proper http calls on getUsageDetailsByConsumptionId()', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(UsageDetailServiceMock.getUsageDetailsByConsumptionId('483b7876-9be9-4bfa-b097-275bea5ac9a0'));

        params.append('consumptionId', '483b7876-9be9-4bfa-b097-275bea5ac9a0');
        usageDetailService.getUsageDetailsByConsumptionId('483b7876-9be9-4bfa-b097-275bea5ac9a0').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/usageDetails/'+'483b7876-9be9-4bfa-b097-275bea5ac9a0', { headers });

        usageDetailService.getUsageDetailsByConsumptionId('483b7876-9be9-4bfa-b097-275bea5ac9a0').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/usageDetails/'+'483b7876-9be9-4bfa-b097-275bea5ac9a0', { headers });
    });
});
