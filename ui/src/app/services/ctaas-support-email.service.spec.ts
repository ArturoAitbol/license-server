import { CtaasSupportEmailService } from "./ctaas-support-email.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

let httpClientSpy: jasmine.SpyObj<HttpClient>;

let ctaasSupportEmailService: CtaasSupportEmailService;
describe('Auto Logout Service - ', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        ctaasSupportEmailService = new CtaasSupportEmailService(httpClientSpy);
    });

    it('should create a support email', () => {
        ctaasSupportEmailService.createSupportEmail({supportEmail: "name", ctaasSetupId: "id"});
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + "/ctaasSupportEmails", {supportEmail: "name", ctaasSetupId: "id"});
    });
    it('should delete a support email', () => {
        ctaasSupportEmailService.deleteSupportEmail("name");
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + "/ctaasSupportEmails/name");
    });
});