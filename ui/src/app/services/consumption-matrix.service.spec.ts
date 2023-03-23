import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { ConsumptionMatrixServiceMock } from "src/test/mock/services/consumption-matrix-service.mock";
import { IConsumptionMatrixEntry } from "../model/consumption-matrix-entry.model";
import { ConsumptionMatrixService } from "./consumption-matrix.service";

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let consumptionMatrixService: ConsumptionMatrixService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('consumption matrix service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        consumptionMatrixService = new ConsumptionMatrixService(httpClientSpy);
    });

    it('should  make the proper http calls on getConsumptionMatrix', (done: DoneFn) => {
        httpClientSpy.get.and.returnValues(ConsumptionMatrixServiceMock.getConsumptionMatrix());
        consumptionMatrixService.getConsumptionMatrix().subscribe({
            next: () => {done();},
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/consumptionMatrix', { headers })
    });

    it('should make a proper http calls on createConsumptionMatrix', (done: DoneFn) => {
        const createConsumptionMatrix: IConsumptionMatrixEntry = {
            updatedBy: "",
            tokens: "2",
            id: "c56b6a5b-520d-47a4-b215-316b913d971c",
            dutType: "Device/Phone/ATA",
            callingPlatform: "CCaaS"
        }

        httpClientSpy.post.and.returnValue(ConsumptionMatrixServiceMock.createConsumptionMatrix(createConsumptionMatrix));
        consumptionMatrixService.createConsumptionMatrix(createConsumptionMatrix).subscribe({
            next: () => {done();},
            error: done.fail
        });

        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/consumptionMatrix', createConsumptionMatrix);
    });

    it('should make the proper http calls on updateConsumptionMatrix', (done: DoneFn) => {
        const updateConsumptionMatrix: IConsumptionMatrixEntry = {
            updatedBy: "",
            tokens: "2",
            id: "c56b6a5b-520d-47a4-b215-316b913d971c",
            dutType: "Device/Phone/ATA",
            callingPlatform: "CCaaS"
        }
        httpClientSpy.put.and.returnValue(ConsumptionMatrixServiceMock.updateConsumptionMatrix(updateConsumptionMatrix.id, updateConsumptionMatrix));
        consumptionMatrixService.updateConsumptionMatrix(updateConsumptionMatrix.id, updateConsumptionMatrix).subscribe({
            next: () => {done();},
            error: done.fail
        });

        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/consumptionMatrix' + `/${updateConsumptionMatrix.id}`,updateConsumptionMatrix, {headers});
    });

    it('should make the proper http calls on deleteConsumptionEntry', (done: DoneFn) => {
        const consumptionMatrixId = "c56b6a5b-520d-47a4-b215-316b913d971c";

        httpClientSpy.delete.and.returnValue(ConsumptionMatrixServiceMock.deleteConsumptionEntry(consumptionMatrixId));
        consumptionMatrixService.deleteConsumptionEntry(consumptionMatrixId).subscribe({
            next: () => {done();},
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/consumptionMatrix' + `/${consumptionMatrixId}`);
    });
});
