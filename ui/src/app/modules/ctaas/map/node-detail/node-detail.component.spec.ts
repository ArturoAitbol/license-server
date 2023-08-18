import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NodeDetailComponent } from "./node-detail.component";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";
import { DialogService } from "src/app/services/dialog.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { MapServiceMock } from "src/test/mock/services/map-service.mock";
import moment from "moment";

let nodeComponentInstance: NodeDetailComponent;
let fixture : ComponentFixture<NodeDetailComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(NodeDetailComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: MapServiceMock.selectedNode });
    configBuilder.addProvider({provide: ActivatedRoute, useValue: {
        queryParams: of({
            id: "f2b57afb-c389-48ec-a54b-7d8a05a51f32",
        })
    }})
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(NodeDetailComponent);
    nodeComponentInstance = fixture.componentInstance;
}


describe('fetch the data for the node', () => {
    beforeEach(beforeEachFunction)
    it('should open a new window with the data of the node', () => {
        spyOn(window, 'open').and.returnValue(null);
        spyOn(window, 'close').and.returnValue(null);
        spyOn(nodeComponentInstance,'openNativeDashboardWithSelectedData').and.callThrough();

        fixture.detectChanges();
        nodeComponentInstance.openNativeDashboardWithSelectedData();

        expect(window.open).toHaveBeenCalled();
    });

    it('should call onCancel', () => {
        spyOn(nodeComponentInstance, 'onCancel').and.callThrough();
        spyOn(dialogService, 'close').and.callThrough();   
        
        fixture.detectChanges();
        nodeComponentInstance.onCancel();

        expect(dialogService.close).toHaveBeenCalled();
    });
});