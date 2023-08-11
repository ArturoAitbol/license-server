import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DialogService } from "src/app/services/dialog.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { CtaasNotesComponent } from './ctaas-notes.component';
import { NoteServiceMock } from '../../../../test/mock/services/ctaas-note-service.mock';
import { SubaccountServiceMock } from '../../../../test/mock/services/subaccount-service.mock';
import { Note } from '../../../model/note.model';
import { AddNotesComponent } from "./add-notes/add-notes.component";
import { CtaasSetupServiceMock } from "../../../../test/mock/services/ctaas-setup.service.mock";
import { BannerServiceMock } from "../../../../test/mock/services/alert-banner-service.mock";
import { BannerComponent } from "../banner/banner.component";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';
import { Constants } from "src/app/helpers/constants";
import { FeatureToggleServiceMock } from "../../../../test/mock/services/feature-toggle-service.mock";
import { environment } from 'src/environments/environment';

let ctaasNotesComponent: CtaasNotesComponent;
let fixture: ComponentFixture<CtaasNotesComponent>;

const dialogServiceMock = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CtaasNotesComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogServiceMock });
    configBuilder.addDeclaration(BannerComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(CtaasNotesComponent);
    ctaasNotesComponent = fixture.componentInstance;
}

describe('Notes UI verification tests', () => {

    beforeEach(beforeEachFunction);

    it('should load correct data columns for the table', () => {
        fixture.detectChanges();

        const headers: HTMLElement[] = fixture.nativeElement.querySelectorAll('.mat-sort-header-content');
        expect(headers[0].innerText).toBe('Status');
        expect(headers[1].innerText).toBe('Content');
        expect(headers[2].innerText).toBe('Open Date');
        expect(headers[3].innerText).toBe('Opened By');
        expect(headers[4].innerText).toBe('Close Date');
        expect(headers[5].innerText).toBe('Closed By');
    });
});

describe('Notes data collection and parsing tests', () => {

    beforeEach(beforeEachFunction);

    it('should make a call to get selected Customer, notes and actionMenuOptions', () => {
        spyOn(NoteServiceMock, 'getNoteList').and.callThrough();
        spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
        spyOn(MsalServiceMock.instance, 'getActiveAccount').and.returnValue(MsalServiceMock.mockIdTokenClaimsSubaccountRole);

        fixture.detectChanges();

        expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
        expect(NoteServiceMock.getNoteList).toHaveBeenCalled();
        expect(MsalServiceMock.instance.getActiveAccount).toHaveBeenCalled();
        expect(ctaasNotesComponent.actionMenuOptions).toEqual(['Close Note', 'View Dashboard']);
    });

    it('should change the loading-related variables if getNotes() got an error', () => {
        spyOn(NoteServiceMock, 'getNoteList').and.returnValue(throwError("error"));

        fixture.detectChanges();

        expect(ctaasNotesComponent.isLoadingResults).toBeFalse();
        expect(ctaasNotesComponent.isRequestCompleted).toBeTrue();
    });

    it('should sort the table after calling sortData() according to the set arguments', () => {
        ctaasNotesComponent.notesData = NoteServiceMock.unsortedNotesList.notes;
        ctaasNotesComponent.sortData({ active: "status", direction: "asc" });
        expect(ctaasNotesComponent.notesData).toEqual(NoteServiceMock.sortedByStatusAsc.notes);

        ctaasNotesComponent.sortData({ active: "status", direction: "desc" });
        expect(ctaasNotesComponent.notesData).toEqual(NoteServiceMock.sortedByStatusDesc.notes);

        ctaasNotesComponent.notesDataBk = NoteServiceMock.unsortedNotesList.notes;
        ctaasNotesComponent.sortData({ active: "status", direction: '' });
        expect(ctaasNotesComponent.notesData).toEqual(NoteServiceMock.unsortedNotesList.notes);

        ctaasNotesComponent.notesData = NoteServiceMock.unsortedNotesList.notes;
        ctaasNotesComponent.sortData({ active: "openDate", direction: "asc" });
        expect(ctaasNotesComponent.notesData).toEqual(NoteServiceMock.sortedByOpenDateAsc.notes);

        ctaasNotesComponent.sortData({ active: "openDate", direction: "desc" });
        expect(ctaasNotesComponent.notesData).toEqual(NoteServiceMock.sortedByOpenDateDesc.notes);
    });
});

describe('Notes dialog calls and interactions', () => {

    beforeEach(beforeEachFunction);

    it('should execute rowAction() with expected data given set arguments', () => {
        spyOn(ctaasNotesComponent, 'onCloseNote');
        spyOn(ctaasNotesComponent, 'viewDashboard');

        const note: Note = NoteServiceMock.mockNoteA;
        const selectedTestData = { selectedRow: note, selectedOption: undefined, selectedIndex: 'selectedTestItem' };

        selectedTestData.selectedOption = ctaasNotesComponent.CLOSE_NOTE;
        ctaasNotesComponent.rowAction(selectedTestData);
        expect(ctaasNotesComponent.onCloseNote).toHaveBeenCalledWith(note);

        selectedTestData.selectedOption = ctaasNotesComponent.VIEW_DASHBOARD;
        ctaasNotesComponent.rowAction(selectedTestData);
        expect(ctaasNotesComponent.viewDashboard).toHaveBeenCalledWith(note);

    });

    it('should delete note if the operation is confirmed in confirmDialog after calling onCloseNote()', () => {
        spyOn(dialogServiceMock, 'confirmDialog').and.callThrough();
        spyOn(NoteServiceMock, 'closeNote').and.callThrough();
        spyOn(ctaasNotesComponent, 'fetchNoteList');
        const note: Note = NoteServiceMock.mockNoteA;

        dialogServiceMock.setExpectedConfirmDialogValue(true);
        ctaasNotesComponent.onCloseNote(note);

        expect(dialogServiceMock.confirmDialog).toHaveBeenCalled();
        expect(NoteServiceMock.closeNote).toHaveBeenCalledWith(note.id);
        expect(ctaasNotesComponent.fetchNoteList).toHaveBeenCalled();
    });


    it('should not delete note if the operation is NOT confirmed in confirmDialog after calling onCloseNote()', () => {
        spyOn(dialogServiceMock, 'confirmDialog').and.callThrough();
        spyOn(NoteServiceMock, 'closeNote').and.callThrough();
        spyOn(ctaasNotesComponent, 'fetchNoteList');

        dialogServiceMock.setExpectedConfirmDialogValue(false);
        ctaasNotesComponent.onCloseNote(NoteServiceMock.mockNoteA);

        expect(dialogServiceMock.confirmDialog).toHaveBeenCalled();
        expect(NoteServiceMock.closeNote).not.toHaveBeenCalled();
        expect(ctaasNotesComponent.fetchNoteList).not.toHaveBeenCalled();
    });

    it('should not delete note if the call closeNote() throws an error', () => {
        const responseWithError = { error: "some error" };
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(NoteServiceMock, 'closeNote').and.returnValue(throwError(responseWithError));
        spyOn(ctaasNotesComponent, 'fetchNoteList');

        ctaasNotesComponent.closeNote(NoteServiceMock.mockNoteA.id);

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(responseWithError.error, 'Error while deleting Note');
        expect(NoteServiceMock.closeNote).toHaveBeenCalled();
        expect(ctaasNotesComponent.fetchNoteList).not.toHaveBeenCalled();
    });

    it('should open a dialog with the AddNote component after calling addNote()', () => {
        spyOn(MatDialogMock, 'open').and.callThrough();
        spyOn(ctaasNotesComponent, 'fetchNoteList');
        spyOn(ctaasNotesComponent, 'addNote').and.callThrough();
        spyOn(ctaasNotesComponent, 'openDialog').and.callThrough();

        ctaasNotesComponent.addNote();

        expect(ctaasNotesComponent.openDialog).toHaveBeenCalledWith(ctaasNotesComponent.ADD_NOTE);
        expect(MatDialogMock.open).toHaveBeenCalledWith(AddNotesComponent, jasmine.any(Object));
        expect(ctaasNotesComponent.fetchNoteList).toHaveBeenCalled();
    });

    it('should show the historical dashboard when calling viewDashboard()', () => {
        spyOn(MatDialogMock, 'open').and.callThrough();
        spyOn(ctaasNotesComponent, 'fetchNoteList').and.callThrough();
        spyOn(ctaasNotesComponent, 'viewDashboard').and.callThrough();
        spyOn(ctaasNotesComponent, 'openDialog').and.callThrough();
        spyOn(window,'open');
        spyOn(FeatureToggleServiceMock, 'isFeatureEnabled').and.returnValue(false);
        const note: Note = NoteServiceMock.mockNoteA;
        ctaasNotesComponent.fetchNoteList();

        ctaasNotesComponent.viewDashboard(note);

        const subaccountDetails = SubaccountServiceMock.getSelectedSubAccount();
        const featureUrl = `${environment.BASE_URL}/#${Constants.SPOTLIGHT_DASHBOARD_PATH}?subaccountId=${subaccountDetails.id}&noteId=${note.id}`;
        expect(window.open).toHaveBeenCalledWith(featureUrl);
    });

    it('should call onChangeTogle with true', () => {
        spyOn(ctaasNotesComponent, 'onChangeToggle').and.callThrough();

        fixture.detectChanges();
        ctaasNotesComponent.actionMenuOptions = ['Close Note', 'View Dashboard'];
        ctaasNotesComponent.onChangeToggle(true);

        expect(ctaasNotesComponent.toggleStatus).toBeTrue();
    });

    it('should call onChangeTogle with false', () => {
        spyOn(ctaasNotesComponent, 'onChangeToggle').and.callThrough();

        fixture.detectChanges();
        ctaasNotesComponent.onChangeToggle(false);

        expect(ctaasNotesComponent.toggleStatus).toBeFalse();
    });
});

describe('Ctaas Notes - maintenance mode', () => {
    beforeEach(beforeEachFunction);
    it('should open an alert banner when maintenance mode is enabled', fakeAsync(() => {
        spyOn(CtaasSetupServiceMock, "getSubaccountCtaasSetupDetails").and.returnValue(of({ ctaasSetups: [CtaasSetupServiceMock.testSetupMaintenance] }));
        spyOn(BannerServiceMock, "open").and.callThrough();
        fixture.detectChanges();
        tick();
        expect(BannerServiceMock.open).toHaveBeenCalledWith('ALERT', Constants.MAINTENANCE_MODE_ALERT, jasmine.any(Object), "alert");
        discardPeriodicTasks();
    }));
});
