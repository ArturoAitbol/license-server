import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { CtaasSetupServiceMock } from "src/test/mock/services/ctaas-setup.service.mock";
import { CtaasSetupService } from "./ctaas-setup.service";

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let ctaasSetupService = new CtaasSetupService(httpClientSpy);
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Ctaas setup service http reques test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient',  ['get', 'put']);
        ctaasSetupService = new CtaasSetupService(httpClientSpy);
    });

    it('should make the proper calls on getSubaccountCtaasSetupDetails()', (done: DoneFn) => {
        let params = new HttpParams();
        params = params.set('subaccountId', 'fbb2d912-b202-432d-8c07-dce0dad51f7f');
        httpClientSpy.get.and.returnValue(CtaasSetupServiceMock.getSubaccountCtaasSetupDetails('fbb2d912-b202-432d-8c07-dce0dad51f7f'));
        ctaasSetupService.getSubaccountCtaasSetupDetails('fbb2d912-b202-432d-8c07-dce0dad51f7f').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/ctaasSetups', { headers, params });
    });

    it('should make the proper http call on updateCtaasSetupDetailsById()', (done: DoneFn) => {
        const updateSetup: any = {
            azureResourceGroup: 'az-tap',
            id: 'd973456e-049a-4490-ad4c-c3fc9205d50f',
            onBoardingComplete: true,
            status: 'SETUP_READY',
            subaccountId: 'fc7a78c2-d0b2-4c81-9538-321562d426c7',
            tapUrl: 'www.taptekvizion.com',
        }
        httpClientSpy.put.and.returnValue(CtaasSetupServiceMock.updateCtaasSetupDetailsById(updateSetup.subaccountId));
        ctaasSetupService.updateCtaasSetupDetailsById(updateSetup.subaccountId,updateSetup).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/ctaasSetups' + `/${updateSetup.subaccountId}`,updateSetup, { headers });
    });

    it('should make the proper call on updateSubaccountCtaasDetails', (done: DoneFn) => {
        const setupDetails = {
            onBoardingComplete: true, 
            ctaasSetupId: 'd973456e-049a-4490-ad4c-c3fc9205d50f'
        }
        httpClientSpy.put.and.returnValue(CtaasSetupServiceMock.updateSubaccountCtaasDetails(setupDetails.onBoardingComplete, setupDetails.ctaasSetupId));
        ctaasSetupService.updateSubaccountCtaasDetails(setupDetails).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/ctaasSetups' + `/onBoarding/${setupDetails.ctaasSetupId}`, setupDetails)
    });
});