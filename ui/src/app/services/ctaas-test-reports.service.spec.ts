import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { TestReportsServiceMock } from "src/test/mock/services/ctaas-test-reports.service.mock";
import { CtaasTestReportsService } from "./ctaas-test-reports.service";

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let testReportsService: CtaasTestReportsService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Note service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
        testReportsService = new CtaasTestReportsService(httpClientSpy);
    });

    it('it should make the proper call to getTestReportsList()', (done: DoneFn) => {
        let params = new HttpParams();
        httpClientSpy.get.and.returnValue(TestReportsServiceMock.getTestReportsList());
        const subaccount  = {
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a'
        }
        const reportType = {
            reportType: 'feature'
        }
        const timestamp = {
            timestamp: '2023-01-12T00:00:00.000Z'
        }

        params = params.set('reportType', 'feature');
        params = params.set('timestamp', '2023-01-12T00:00:00.000Z');
        testReportsService.getTestReportsList(subaccount.subaccountId, reportType.reportType, timestamp.timestamp).subscribe({
            next:() => {done();},
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/reports/' +subaccount.subaccountId, {headers,params})
    });
});