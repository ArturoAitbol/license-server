import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { MapComponent } from './map.component';
import { TestBedConfigBuilder } from 'src/test/mock/TestBedConfigHelper.mock';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { interval, of, throwError } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MapServiceMock } from 'src/test/mock/services/map-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import moment from 'moment';
import { SpotlightChartsServiceMock } from 'src/test/mock/services/spotlightCharts-service.mock';
import { Constants } from 'src/app/helpers/constants';
import { take } from 'rxjs/operators';

let mapComponentInstance: MapComponent;
let fixture : ComponentFixture<MapComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(MapComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addProvider({provide: ActivatedRoute, useValue: {
        queryParams: of({
            id: "f2b57afb-c389-48ec-a54b-7d8a05a51f32",
        })
    }})
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(MapComponent);
    mapComponentInstance = fixture.componentInstance;
}

describe('UI verification', () => {
    beforeEach(beforeEachFunction);
    it('should get the nodes and lines data', () => {
        spyOn(MapServiceMock, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'getMapSummary').and.callThrough();
        spyOn(SpotlightChartsServiceMock, 'getFilterOptions').and.callThrough();

        fixture.detectChanges();
        mapComponentInstance.getMapSummary();

        expect(MapServiceMock.getMapSummary).toHaveBeenCalled();
        expect(mapComponentInstance.mapData.length).toEqual(8);
    });

    it('should get the nodes and lines data and call draw lines and nodes', () => {
        spyOn(MapServiceMock, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'drawNodes').and.callThrough();
        spyOn(mapComponentInstance, 'drawLines').and.callThrough();

        fixture.detectChanges();
        mapComponentInstance.getMapSummary();

        expect(MapServiceMock.getMapSummary).toHaveBeenCalled();
        expect(mapComponentInstance.mapData.length).toEqual(8);
        expect(mapComponentInstance.drawLines).toHaveBeenCalled();
        expect(mapComponentInstance.drawNodes).toHaveBeenCalled();
    });

    it('should call line details', () => {
        const key = "41.88399, -87.619705 - 27.940102, -82.450195"
        spyOn(MapServiceMock, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'getMapSummary').and.callThrough();
        spyOn(SpotlightChartsServiceMock, 'getFilterOptions').and.callThrough();
        spyOn(mapComponentInstance.dialog, 'open').and.callThrough();


        fixture.detectChanges();
        mapComponentInstance.getMapSummary();
        mapComponentInstance.lineDetails(key)
        
        expect(mapComponentInstance.dialog.open).toHaveBeenCalled();
    });

    it('should call node details', () => {
        const key = "27.940102, -82.450195"
        spyOn(MapServiceMock, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'getMapSummary').and.callThrough();
        spyOn(SpotlightChartsServiceMock, 'getFilterOptions').and.callThrough();
        spyOn(mapComponentInstance.dialog, 'open').and.callThrough();


        fixture.detectChanges();
        mapComponentInstance.getMapSummary();
        mapComponentInstance.nodeDetails(key)
        
        expect(mapComponentInstance.dialog.open).toHaveBeenCalled();
    })
});


describe(' map errors tests', () => {
    beforeEach(beforeEachFunction);
    it('should return an error if something went wrong in getMapSummary', () => {
        const responseWithError = {error:"some error"};
        spyOn(MapServiceMock, 'getMapSummary').and.returnValue(throwError(responseWithError));
        spyOn(mapComponentInstance, 'getMapSummary').and.callThrough();
        spyOn(console, 'debug').and.callThrough();

        fixture.detectChanges();
        mapComponentInstance.getMapSummary();

        expect(mapComponentInstance.isLoadingResults).toBe(false);
        expect(console.debug).toHaveBeenCalledWith('error',{ error: 'some error' });
        expect(mapComponentInstance.isRequestCompleted).toBe(true);
    });

    it('should return an empty map', () => {
        spyOn(MapServiceMock, 'getMapSummary').and.returnValue(of({}));
        spyOn(mapComponentInstance, 'getMapSummary').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(console, 'debug').and.callThrough();

        fixture.detectChanges();
        mapComponentInstance.getMapSummary();

        expect(mapComponentInstance.isLoadingResults).toBe(false);
        expect(mapComponentInstance.isRequestCompleted).toBe(true);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('There is not data to display', '');

    });
});

describe('map filters test', () => {
    beforeEach(beforeEachFunction);
    it('should call a dateFilter', () => {
        spyOn(MapServiceMock, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'dateFilter').and.callThrough();

        fixture.detectChanges();
        mapComponentInstance.filterForm.get('startDateFilterControl').setValue(moment.utc());
        fixture.detectChanges();
        mapComponentInstance.dateFilter();


        expect(mapComponentInstance.dateFilter).toHaveBeenCalled();
        expect(mapComponentInstance.getMapSummary).toHaveBeenCalled();
        expect(mapComponentInstance.selectedRegions.length).toEqual(0);
    });

    it('should call addRegions and filter', () => {
        spyOn(MapServiceMock, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'addRegion').and.callThrough();
        spyOn(SpotlightChartsServiceMock, 'getFilterOptions').and.callThrough();
        fixture.detectChanges();
        mapComponentInstance.filterForm.get('region').setValue({
            "country": "United States",
            "state": "Texas",
            "city": "Woodville",
            "displayName": "Woodville, Texas, United States"
        });
        fixture.detectChanges();
        mapComponentInstance.addRegion();

        expect(mapComponentInstance.preselectedRegions.length).toEqual(1);
    });

    it('should remove a region in the filter', () => {
        spyOn(MapServiceMock, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'removeRegion').and.callThrough();
        spyOn(SpotlightChartsServiceMock, 'getFilterOptions').and.callThrough();
        mapComponentInstance.preselectedRegions = ["{country: United States, state: FL, city: null, displayName: FL, United States}"]
        fixture.detectChanges();
        mapComponentInstance.removeRegion("{country: United States, state: FL, city: null, displayName: FL, United States}");
        fixture.detectChanges();

        expect(mapComponentInstance.preselectedRegions.length).toEqual(0);
    });

    it('should call clearRegionsFilter', () => {
        spyOn(MapServiceMock, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'getMapSummary').and.callThrough();
        spyOn(mapComponentInstance, 'removeRegion').and.callThrough();
        spyOn(SpotlightChartsServiceMock, 'getFilterOptions').and.callThrough();
        mapComponentInstance.preselectedRegions = [{country: "United States", state: "FL", city: null, displayName: "FL, United States"}]
        fixture.detectChanges();
        mapComponentInstance.clearRegionsFilter();
        fixture.detectChanges();

        expect(mapComponentInstance.preselectedRegions.length).toEqual(0);
    });
});
