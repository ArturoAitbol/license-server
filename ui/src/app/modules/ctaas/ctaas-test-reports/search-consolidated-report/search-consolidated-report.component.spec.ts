import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import moment from "moment";
import { of } from "rxjs";
import { DialogService } from "src/app/services/dialog.service";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { TestBedConfigBuilder } from "src/test/mock/TestBedConfigHelper.mock";
import { SearchConsolidatedReportComponent } from "./search-consolidated-report.component";

let consolidatedDateInstance: SearchConsolidatedReportComponent;
let fixture : ComponentFixture<SearchConsolidatedReportComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(SearchConsolidatedReportComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addProvider({provide: ActivatedRoute, useValue: {
        queryParams: of({
            type: 'Daily-FeatureFunctionality',
            param1: "value1",
        })
    }})
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(SearchConsolidatedReportComponent);
    consolidatedDateInstance = fixture.componentInstance;
    fixture.detectChanges();
}

describe('UI test if search consolidated date Component', () => {
    beforeEach(beforeEachFunction);

    it('should validate the components of the modal', () => {
        const modalTitle = fixture.nativeElement.querySelector('#modal-title');
        const typeLabel = fixture.nativeElement.querySelector('#type-label');
        const startDateLabel = fixture.nativeElement.querySelector('#start-date-label');
        const endDateLabel = fixture.nativeElement.querySelector('#end-date-label');
        
        expect(typeLabel.textContent).toBe('Choose report type');
        expect(modalTitle.textContent).toBe("Search a consolidated report");
        expect(startDateLabel.textContent).toBe("Start Date");
        expect(endDateLabel.textContent).toBe("End Date");
    });
});

describe('modal actions', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to consolidatedReport also open and close the modal', () => {
        spyOn(window, 'open').and.returnValue(null);
        spyOn(window, 'close').and.returnValue(null);
        spyOn(consolidatedDateInstance.dialogRef, 'close').and.callThrough();
        spyOn(consolidatedDateInstance, 'consolidatedReport').and.callThrough();

        consolidatedDateInstance.consolidatedReport();
        consolidatedDateInstance.onCancel();

        expect(consolidatedDateInstance.dialogRef.close).toHaveBeenCalled();
        expect(window.open).toHaveBeenCalled();
        expect(window.close).toHaveBeenCalled();
    });

    it('should make a call to toggleDateValue and set start date and min end date', () => {
        spyOn(consolidatedDateInstance, 'toggleDateValue').and.callThrough();
        const testDate = moment();
        consolidatedDateInstance.toggleDateValue(testDate);
        fixture.detectChanges();
        expect(consolidatedDateInstance.minEndDate).toEqual(testDate);
        expect(consolidatedDateInstance.startDate).toEqual(testDate);
    });

    it('shoudl make a call to toggleEndDate and set endDate value', () => {
        spyOn(consolidatedDateInstance, 'toggleEndDate').and.callThrough();
        const testDate = moment();
        consolidatedDateInstance.toggleEndDate(testDate);
        expect(consolidatedDateInstance.endDate).toEqual(testDate);
    });

    it('shoudl set min time with  00:00', () => {
        spyOn(consolidatedDateInstance, 'toggleEndDate').and.callThrough();
        consolidatedDateInstance.endDate  = moment().add(1, 'days');
        consolidatedDateInstance.startDate = moment();
        fixture.detectChanges(); 

        consolidatedDateInstance.validateTimers();
        expect(consolidatedDateInstance.minTime).toEqual("00:00")
    });

    it('shoudl set min time with  00:00', () => {
        spyOn(consolidatedDateInstance, 'toggleEndDate').and.callThrough();
        consolidatedDateInstance.endDate  = moment().add(1, 'days');
        consolidatedDateInstance.startDate = moment();
        fixture.detectChanges(); 
        
        consolidatedDateInstance.validateTimers();
        expect(consolidatedDateInstance.minTime).toEqual("00:00")
    });

    it('shoudl set min time', () => {
        spyOn(consolidatedDateInstance, 'toggleEndDate').and.callThrough();
        consolidatedDateInstance.endDate  = moment();
        consolidatedDateInstance.startDate = moment();
        consolidatedDateInstance.minTimeBK = "10:00";

        fixture.detectChanges(); 
        
        consolidatedDateInstance.validateTimers();
        expect(consolidatedDateInstance.minTime).toEqual("10:00")
    });

    it('should make a call onChangeStartTime', () => {
        spyOn(consolidatedDateInstance, 'onChangeStartTime').and.callThrough();

        consolidatedDateInstance.onChangeStartTime('02:00');

        expect(consolidatedDateInstance.minTime).toEqual('02:00');
        expect(consolidatedDateInstance.minTimeBK).toEqual('02:00');
    });

    it('should make a call endTimeChanged', () => {
        spyOn(consolidatedDateInstance, 'endtTimeChanged').and.callThrough();

        consolidatedDateInstance.endtTimeChanged('02:00');

        expect(consolidatedDateInstance.maxTime).toBe('02:00')
    })
});