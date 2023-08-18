import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";
import { DialogService } from "src/app/services/dialog.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { MapServiceMock } from "src/test/mock/services/map-service.mock";
import moment from "moment";
import { LineDetailComponent } from "./line-detail.component";

let lineComponentInstance: LineDetailComponent;
let fixture : ComponentFixture<LineDetailComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(LineDetailComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: MapServiceMock.selectedLine });
    configBuilder.addProvider({provide: ActivatedRoute, useValue: {
        queryParams: of({
            id: "f2b57afb-c389-48ec-a54b-7d8a05a51f32",
        })
    }})
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(LineDetailComponent);
    lineComponentInstance = fixture.componentInstance;
}


describe('fetch the data for the line', () => {
    beforeEach(beforeEachFunction)
    it('should open a new window with the data of the line', () => {
        spyOn(window, 'open').and.returnValue(null);
        spyOn(window, 'close').and.returnValue(null);
        spyOn(lineComponentInstance,'openNaviteDashboardWithSelectedData').and.callThrough();

        fixture.detectChanges();
        lineComponentInstance.openNaviteDashboardWithSelectedData();

        expect(window.open).toHaveBeenCalled();
    });

    it('should call onCancel', () => {
        spyOn(lineComponentInstance, 'onCancel').and.callThrough();
        spyOn(dialogService, 'close').and.callThrough();  
         
        fixture.detectChanges();
        lineComponentInstance.onCancel();

        expect(dialogService.close).toHaveBeenCalled();
    });
});