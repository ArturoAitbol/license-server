import { HttpClient } from "@angular/common/http";
import { LicenseServiceMock } from "src/test/mock/services/license-service.mock";
import { License } from "../model/license.model";
import { LicenseService } from "./license.service";


let httpClientSpy: jasmine.SpyObj<HttpClient>;
let licenseService: LicenseService;

describe('License service http requests test', () => {
    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        licenseService = new LicenseService(httpClientSpy);
    });

    it('should return a list with all licenses', (done: DoneFn) => {
        const expectedLicenses: any = LicenseServiceMock.licensesList;
        httpClientSpy.get.and.returnValue(LicenseServiceMock.getLicenseList());
        licenseService.getLicenseList().subscribe({
            next: licenses => {
                expect(licenses).toEqual(expectedLicenses);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
    });

    it('should return licenses list for specific subaccountId', (done: DoneFn) => {
        const subaccountId = "3819dc98-0e34-4237-ad0f-e79895b887e9";
        const expectedLicenses: any = LicenseServiceMock.filteredSubAccountIdList;
        httpClientSpy.get.and.returnValue(LicenseServiceMock.getLicenseList(subaccountId));
        licenseService.getLicenseList(subaccountId).subscribe({
            next: licenses => {
                expect(licenses).toEqual(expectedLicenses);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
    });

    it('should return expected license when retrieving per ID', (done: DoneFn) => {
        const id = "16f4f014-5bed-4166-b10a-808b2e6655e3";
        const expectedLicense: License = LicenseServiceMock.mockLicenseA;
        httpClientSpy.get.and.returnValue(LicenseServiceMock.getLicenseById(id));
        licenseService.getLicenseDetails(id).subscribe({
            next: license => {
                expect(license).toEqual(expectedLicense);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
    });

    it('should update license Status and return License with updated status', (done: DoneFn) => {
        const updatedLicense: License = {
            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
            id: '273a38b7-20a1-487e-82fb-8861d96280fe',
            status: 'Inactive',
            deviceLimit: "",
            tokensPurchased: 0,
            startDate: "",
            renewalDate: "",
            packageType: ""
        };

        const expectedLicense: License = LicenseServiceMock.updatedMockLicenseD;
        httpClientSpy.put.and.returnValue(LicenseServiceMock.updateLicense(updatedLicense));
        licenseService.updateLicenseDetails(updatedLicense).subscribe({
            next: license => {
                expect(license).toEqual(expectedLicense);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledTimes(1);
    });

    it('should delete license by ID return deleted license', (done: DoneFn) => {
        const licenseId = '273a38b7-20a1-487e-82fb-8861d96280fe';
        const expectedLicense: License = LicenseServiceMock.mockDeletedLicense;
        httpClientSpy.delete.and.returnValue(LicenseServiceMock.deleteLicense(licenseId));
        licenseService.deleteLicense(licenseId).subscribe({
            next: license => {
                expect(license).toEqual(expectedLicense);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledTimes(1);
    });

    it('should create a license and return created license', (done: DoneFn) => {
        const newLicense: License = {
            subaccountId: '2d298a66-5db2-4e25-bdfc-7f052ae4bc63',
            id: '5232b68b-e211-48a8-8ee2-44e505c0961f',
            status: 'Active',
            deviceLimit: "12",
            tokensPurchased: 120,
            startDate: "",
            renewalDate: "",
            packageType: ""
        };

        const expectedLicense: License = LicenseServiceMock.mockNewLicense;
        httpClientSpy.post.and.returnValue(LicenseServiceMock.createLicense(newLicense));
        licenseService.createLicense(newLicense).subscribe({
            next: license => {
                expect(license).toEqual(expectedLicense);
                done();
            },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    });
});