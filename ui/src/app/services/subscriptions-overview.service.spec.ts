import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { SubscriptionsOverviewServiceMock } from "src/test/mock/services/subscriptions-overview.service.mock";
import { SubscriptionsOverviewService } from "./subscriptions-overview.service";

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let subscriptionsOverviewService: SubscriptionsOverviewService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe(' Subscriptions-overview service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
        subscriptionsOverviewService = new SubscriptionsOverviewService(httpClientSpy)
    });

    it('should make the proper http calls on getSubscriptionsList', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(SubscriptionsOverviewServiceMock.getSubscriptionsList());

        subscriptionsOverviewService.getSubscriptionsList().subscribe({
            next: () => {done();},
            error: done.fail
        });

        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/subscriptions', {headers});
    });
});
