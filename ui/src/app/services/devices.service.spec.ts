import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { DevicesService } from './devices.service';
import { environment } from '../../environments/environment';
import { Device } from "../model/device.model";
import { DevicesServiceMock } from '../../test/mock/services/devices-service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let devicesService: DevicesService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Customer service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        devicesService = new DevicesService(httpClientSpy);
    });

    it('should make the proper http calls on getDevicesList()', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(DevicesServiceMock.getDevicesList());

        devicesService.getDevicesList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/devices', { headers, params });

        params.append('subaccountId', '755955b7-4100-4328-9f6e-7038b92e4a02');
        params.append('vendor', 'Panasonic');
        params.append('product', 'KX-NS700');
        params.append('version', 'v007.00138');
        devicesService.getDevicesList('755955b7-4100-4328-9f6e-7038b92e4a02').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/devices', { headers, params });

        devicesService.getDevicesList(null, 'Panasonic').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/devices', { headers, params });

        devicesService.getDevicesList(null, null, 'PBX').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/devices', { headers, params });


        devicesService.getDevicesList(null, null, null).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/devices', { headers, params });

    });

    it('should make the proper http calls on getDeviceById()', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(DevicesServiceMock.getDeviceById('755955b7-4100-4328-9f6e-7038b92e4a02'));

        devicesService.getDevicesList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/devices', { headers, params });

        params.append('id', '755955b7-4100-4328-9f6e-7038b92e4a02');
        devicesService.getDeviceById('755955b7-4100-4328-9f6e-7038b92e4a02').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/devices', { headers, params });
    });

    it('should make the proper http calls on updateDevice())', (done: DoneFn) => {
        const date = new Date();
        const updateDevice: Device = {
            supportType: false,
            product: "OfficeServ 7100",
            vendor: "Samsung",
            granularity: "week",
            id: "4119fcd9-b40f-40a1-9d72-0d6f84db04b2",
            version: "5.0.3",
            tokensToConsume: 2,
            type: "test",
            deprecatedDate: "29-05-2022",
            startDate: date,
            subaccountId: "4119fcd9-b40f-40a1-9d72-0d6f84db04b2"
        };
        httpClientSpy.put.and.returnValue(DevicesServiceMock.updateDevice(updateDevice));
        devicesService.updateDevice(updateDevice).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/devices/' + updateDevice.id, updateDevice);
    });

    it('should make the proper calls on createDevice()', (done: DoneFn) => {
        const date = new Date();
        const deviceToCreate: Device = {
            supportType: false,
            product: "OfficeServ 7100",
            vendor: "Samsung",
            granularity: "week",
            id: "4119fcd9-b40f-40a1-9d72-0d6f84db04b2",
            version: "5.0.3",
            tokensToConsume: 2,
            type: "test",
            deprecatedDate: "29-05-2022",
            startDate: date,
            subaccountId: "4119fcd9-b40f-40a1-9d72-0d6f84db04b2"
        };
        httpClientSpy.post.and.returnValue(DevicesServiceMock.createDevice(deviceToCreate));
        devicesService.createDevice(deviceToCreate).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/devices', deviceToCreate);
    });

    it('should make the proper calls on getDevicesTypesList()', (done: DoneFn) => {
        httpClientSpy.get.and.returnValue(DevicesServiceMock.getDevicesTypesList());

        devicesService.getDevicesTypesList().subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/deviceTypes', { headers });
    });
});
