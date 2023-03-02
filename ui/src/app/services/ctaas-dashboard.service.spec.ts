import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { CtaasDashboardServiceMock } from "src/test/mock/services/ctaas-dashboard-service.mock";
import { CtaasDashboardService } from "./ctaas-dashboard.service";

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let ctaasDashboardService = new CtaasDashboardService(httpClientSpy);
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe(' Ctaas dashboard http request test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
        ctaasDashboardService = new CtaasDashboardService(httpClientSpy);
    });

    it('should make the proper calls on getCtaasDashboardDetails', (done: DoneFn) => {
        const dashboardData: any = {
            reportType: 'Weekly-FeatureFunctionality',
            subaccountId: 'fbb2d912-b202-432d-8c07-dce0dad51f7f',
            timestampId:'230129233129'
        }
        let params = new HttpParams();
        params = params.set('timestampId','230129233129');

        httpClientSpy.get.and.returnValue(CtaasDashboardServiceMock.getCtaasDashboardDetails('fbb2d912-b202-432d-8c07-dce0dad51f7f','Weekly-FeatureFunctionality','230129233129'));
        ctaasDashboardService.getCtaasDashboardDetails('fbb2d912-b202-432d-8c07-dce0dad51f7f','Weekly-FeatureFunctionality','230129233129').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/ctaasDashboard' +`/${dashboardData.subaccountId}` + `/${dashboardData.reportType}`, {params});
    });

    it('should make the proper calls on getCtaasDashboardDetailedReport', (done: DoneFn) => {
        const dashboardData: any = {
            reportType: 'Weekly-FeatureFunctionality',
            subaccountId: 'fbb2d912-b202-432d-8c07-dce0dad51f7f',
            timestampId:'230129233129',
            startDate:'230227002031',
            endDate:'230227054902'
        }
        let params = new HttpParams();
        params = params.set('reportType', dashboardData.reportType);
        params = params.set('startDate', dashboardData.startDate);
        params = params.set('endDate', dashboardData.endDate);

        httpClientSpy.get.and.returnValue(CtaasDashboardServiceMock.getCtaasDashboardDetailedReport());
        ctaasDashboardService.getCtaasDashboardDetailedReport(dashboardData.subAccountId, dashboardData.reportType, dashboardData.startDate, dashboardData.endDate).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/ctaasDashboardReport' + `/${dashboardData.subAccountId}`, {params})
    });

    it('should make the proper call on getCtaasPowerBiDashboardDetails', (done:DoneFn) => {
        httpClientSpy.get.and.returnValue(CtaasDashboardServiceMock.getCtaasPowerBiDashboardDetails('fbb2d912-b202-432d-8c07-dce0dad51f7f'));
        ctaasDashboardService.getCtaasPowerBiDashboardDetails('fbb2d912-b202-432d-8c07-dce0dad51f7f').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/spotlightDashboard' + `/${'fbb2d912-b202-432d-8c07-dce0dad51f7f'}`)
    });

    it('should make the proper calls on downloadCtaasDashboardDetailedReport', (done: DoneFn) => {
        const blob = new Blob([JSON.stringify(CtaasDashboardServiceMock.dashboardDetailedReport, null, 2)], {
            type: "application/json",
        });
        httpClientSpy.post.and.returnValue(CtaasDashboardServiceMock.downloadCtaasDashboardDetailedReport(blob));
        ctaasDashboardService.downloadCtaasDashboardDetailedReport(blob).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/ctaasDashboard/downloadReport', { detailedReport: blob }, {responseType:'blob' as 'json'} )
    });
});