import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { throwError } from "rxjs";
import { DialogService } from "src/app/services/dialog.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SharedModule } from "../../shared/shared.module";
import { CtaasNotesComponent } from './ctaas-notes.component';
import { NoteServiceMock } from '../../../../test/mock/services/ctaas-note-service.mock';
import { NoteService } from '../../../services/notes.service';
import { SubAccountService } from '../../../services/sub-account.service';
import { SubaccountServiceMock } from '../../../../test/mock/services/subaccount-service.mock';
import { Note } from '../../../model/note.model';
import { AddNotesComponent } from "./add-notes/add-notes.component";
import { CtaasHistoricalDashboardComponent } from "../ctaas-historical-dashboard/ctaas-historical-dashboard.component";

let ctaasNotesComponent: CtaasNotesComponent;
let fixture : ComponentFixture<CtaasNotesComponent>;

const RouterMock = {
    navigate: (commands: string[]) => { return; }
};

const dialogServiceMock = new DialogServiceMock();

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations:[CtaasNotesComponent],
        imports: [CommonModule,SharedModule,BrowserAnimationsModule],
        providers: [
            {
                provide: MatDialog,
                useValue: MatDialogMock
            },
            {
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            },
            {
                provide: Router,
                useValue: RouterMock
            },
            {
                provide: MsalService,
                useValue: MsalServiceMock
            },
            {
                provide: SubAccountService,
                useValue: SubaccountServiceMock
            },
            {
                provide: NoteService,
                useValue: NoteServiceMock
            },
            {
                provide: DialogService,
                useValue: dialogServiceMock
            },
            {
                provide: HttpClient,
                useValue: HttpClient
            }
        ]
    });
    fixture = TestBed.createComponent(CtaasNotesComponent);
    ctaasNotesComponent = fixture.componentInstance;
}

describe('Notes UI verification tests',()=>{

    beforeEach(beforeEachFunction);

    it('should load correct data columns for the table', ()=>{
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

describe('Notes data collection and parsing tests',()=>{

    beforeEach(beforeEachFunction);

    it('should make a call to get selected Customer, notes and actionMenuOptions',()=>{
        spyOn(NoteServiceMock,'getNoteList').and.callThrough();
        spyOn(SubaccountServiceMock,'getSelectedSubAccount').and.callThrough();
        spyOn(MsalServiceMock.instance,'getActiveAccount').and.returnValue(MsalServiceMock.mockIdTokenClaimsSubaccountRole);

        fixture.detectChanges();

        expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
        expect(NoteServiceMock.getNoteList).toHaveBeenCalled();
        expect(MsalServiceMock.instance.getActiveAccount).toHaveBeenCalled();
        expect(ctaasNotesComponent.actionMenuOptions).toEqual(['Close Note','View Dashboard']);
    });

    it('should change the loading-related variables if getNotes() got an error',()=>{
        spyOn(NoteServiceMock,'getNoteList').and.returnValue(throwError("error"));

        fixture.detectChanges();

        expect(ctaasNotesComponent.isLoadingResults).toBeFalse();
        expect(ctaasNotesComponent.isRequestCompleted).toBeTrue();
    });

    it('should sort the table after calling sortData() according to the set arguments',()=>{
        ctaasNotesComponent.notesData = NoteServiceMock.unsortedNotesList.notes;
        ctaasNotesComponent.sortData({active: "status", direction: "asc"});
        expect(ctaasNotesComponent.notesData).toEqual(NoteServiceMock.sortedByStatusAsc.notes);

        ctaasNotesComponent.sortData({active: "status", direction: "desc"});
        expect(ctaasNotesComponent.notesData).toEqual(NoteServiceMock.sortedByStatusDesc.notes);

        ctaasNotesComponent.notesDataBk = NoteServiceMock.unsortedNotesList.notes;
        ctaasNotesComponent.sortData({active: "status", direction: ''});
        expect(ctaasNotesComponent.notesData).toEqual(NoteServiceMock.unsortedNotesList.notes);

        ctaasNotesComponent.notesData = NoteServiceMock.unsortedNotesList.notes;
        ctaasNotesComponent.sortData({active: "openDate", direction: "asc"});
        expect(ctaasNotesComponent.notesData).toEqual(NoteServiceMock.sortedByOpenDateAsc.notes);

        ctaasNotesComponent.sortData({active: "openDate", direction: "desc"});
        expect(ctaasNotesComponent.notesData).toEqual(NoteServiceMock.sortedByOpenDateDesc.notes);
    });
});

describe('Notes dialog calls and interactions', ()=>{

    beforeEach(beforeEachFunction);

    it('should execute rowAction() with expected data given set arguments',()=>{
        spyOn(ctaasNotesComponent,'onCloseNote');
        spyOn(ctaasNotesComponent,'viewDashboard');

        const note: Note = NoteServiceMock.mockNoteA;
        const selectedTestData = { selectedRow: note, selectedOption: undefined, selectedIndex: 'selectedTestItem'};

        selectedTestData.selectedOption = ctaasNotesComponent.CLOSE_NOTE;
        ctaasNotesComponent.rowAction(selectedTestData);
        expect(ctaasNotesComponent.onCloseNote).toHaveBeenCalledWith(note);

        selectedTestData.selectedOption = ctaasNotesComponent.VIEW_DASHBOARD;
        ctaasNotesComponent.rowAction(selectedTestData);
        expect(ctaasNotesComponent.viewDashboard).toHaveBeenCalledWith(note);

    });

    it('should delete note if the operation is confirmed in confirmDialog after calling onCloseNote()',()=>{
        spyOn(dialogServiceMock,'confirmDialog').and.callThrough();
        spyOn(NoteServiceMock,'closeNote').and.callThrough();
        spyOn(ctaasNotesComponent,'fetchNoteList');
        const note: Note = NoteServiceMock.mockNoteA;

        dialogServiceMock.setExpectedConfirmDialogValue(true);
        ctaasNotesComponent.onCloseNote(note);

        expect(dialogServiceMock.confirmDialog).toHaveBeenCalled();
        expect(NoteServiceMock.closeNote).toHaveBeenCalledWith(note.id);
        expect(ctaasNotesComponent.fetchNoteList).toHaveBeenCalled();
    });


    it('should not delete note if the operation is NOT confirmed in confirmDialog after calling onCloseNote()',()=>{
        spyOn(dialogServiceMock,'confirmDialog').and.callThrough();
        spyOn(NoteServiceMock,'closeNote').and.callThrough();
        spyOn(ctaasNotesComponent,'fetchNoteList');

        dialogServiceMock.setExpectedConfirmDialogValue(false);
        ctaasNotesComponent.onCloseNote(NoteServiceMock.mockNoteA);

        expect(dialogServiceMock.confirmDialog).toHaveBeenCalled();
        expect(NoteServiceMock.closeNote).not.toHaveBeenCalled();
        expect(ctaasNotesComponent.fetchNoteList).not.toHaveBeenCalled();
    });

    it('should not delete note if the call closeNote() throws an error',()=>{
        const responseWithError = {error:"some error"};
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
        spyOn(NoteServiceMock,'closeNote').and.returnValue(throwError(responseWithError));
        spyOn(ctaasNotesComponent,'fetchNoteList');

        ctaasNotesComponent.closeNote(NoteServiceMock.mockNoteA.id);

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(responseWithError.error, 'Error while deleting Note');
        expect(NoteServiceMock.closeNote).toHaveBeenCalled();
        expect(ctaasNotesComponent.fetchNoteList).not.toHaveBeenCalled();
    });

    it('should open a dialog with the AddNote component after calling addNote()',()=>{
        spyOn(MatDialogMock,'open').and.callThrough();
        spyOn(ctaasNotesComponent,'fetchNoteList');
        spyOn(ctaasNotesComponent,'addNote').and.callThrough();
        spyOn(ctaasNotesComponent,'openDialog').and.callThrough();

        ctaasNotesComponent.addNote();

        expect(ctaasNotesComponent.openDialog).toHaveBeenCalledWith(ctaasNotesComponent.ADD_NOTE);
        expect(MatDialogMock.open).toHaveBeenCalledWith(AddNotesComponent,jasmine.any(Object));
        expect(ctaasNotesComponent.fetchNoteList).toHaveBeenCalled();
    });

    it('should show the historical dashboard when calling viewDashboard()',()=>{
        spyOn(MatDialogMock,'open').and.callThrough();
        spyOn(ctaasNotesComponent,'fetchNoteList');
        spyOn(ctaasNotesComponent,'viewDashboard').and.callThrough();
        spyOn(ctaasNotesComponent,'openDialog').and.callThrough();
        const note: Note = NoteServiceMock.mockNoteA;

        ctaasNotesComponent.viewDashboard(note);

        expect(ctaasNotesComponent.openDialog).toHaveBeenCalledWith(ctaasNotesComponent.VIEW_DASHBOARD,note);
        expect(MatDialogMock.open).toHaveBeenCalledWith(CtaasHistoricalDashboardComponent,jasmine.any(Object));
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
