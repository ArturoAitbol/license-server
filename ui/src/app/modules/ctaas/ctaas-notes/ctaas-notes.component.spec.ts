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
import { NoteServiceMock } from '../../../../test/mock/services/note-service.mock';
import { NoteService } from '../../../services/notes.service';
import { SubAccountService } from '../../../services/sub-account.service';
import { SubaccountServiceMock } from '../../../../test/mock/services/subaccount-service.mock';
import { Note } from '../../../model/note.model';

let spotlightNotesComponentTestInstance: CtaasNotesComponent;
let fixture : ComponentFixture<CtaasNotesComponent>;

const RouterMock = {
    navigate: (commands: string[]) => {}
};

const dialogServiceMock = new DialogServiceMock();

const beforeEachFunction = () =>{
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
    spotlightNotesComponentTestInstance = fixture.componentInstance;
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
        spyOn(MsalServiceMock.instance,'getActiveAccount').and.callThrough();

        fixture.detectChanges();

        expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
        expect(NoteServiceMock.getNoteList).toHaveBeenCalled();
        expect(MsalServiceMock.instance.getActiveAccount).toHaveBeenCalled();
        expect(spotlightNotesComponentTestInstance.actionMenuOptions).toEqual(['Close Note']);
    });

    it('should change the loading-related variables if getNotes() got an error',()=>{
        spyOn(NoteServiceMock,'getNoteList').and.returnValue(throwError("error"));

        fixture.detectChanges();

        expect(spotlightNotesComponentTestInstance.isLoadingResults).toBeFalse();
        expect(spotlightNotesComponentTestInstance.isRequestCompleted).toBeTrue();
    });

    it('should sort the table after calling sortData() according to the set arguments',()=>{
        spotlightNotesComponentTestInstance.notesData = NoteServiceMock.unsortedNotesList.notes;
        spotlightNotesComponentTestInstance.sortData({active: "status", direction: "asc"});
        expect(spotlightNotesComponentTestInstance.notesData).toEqual(NoteServiceMock.sortedByStatusAsc.notes);

        spotlightNotesComponentTestInstance.sortData({active: "status", direction: "desc"});
        expect(spotlightNotesComponentTestInstance.notesData).toEqual(NoteServiceMock.sortedByStatusDesc.notes);

        spotlightNotesComponentTestInstance.notesDataBk = NoteServiceMock.unsortedNotesList.notes;
        spotlightNotesComponentTestInstance.sortData({active: "status", direction: ''});
        expect(spotlightNotesComponentTestInstance.notesData).toEqual(NoteServiceMock.unsortedNotesList.notes);

        spotlightNotesComponentTestInstance.notesData = NoteServiceMock.unsortedNotesList.notes;
        spotlightNotesComponentTestInstance.sortData({active: "openDate", direction: "asc"});
        expect(spotlightNotesComponentTestInstance.notesData).toEqual(NoteServiceMock.sortedByOpenDateAsc.notes);

        spotlightNotesComponentTestInstance.sortData({active: "openDate", direction: "desc"});
        expect(spotlightNotesComponentTestInstance.notesData).toEqual(NoteServiceMock.sortedByOpenDateDesc.notes);
    });
});

describe('Notes dialog calls and interactions', ()=>{

    beforeEach(beforeEachFunction);

    it('should execute rowAction() with expected data given set arguments',()=>{
        spyOn(spotlightNotesComponentTestInstance,'onCloseNote');
        const note: Note = NoteServiceMock.mockNoteA;
        const selectedTestData = { selectedRow: note, selectedOption: undefined, selectedIndex: 'selectedTestItem'};

        selectedTestData.selectedOption = spotlightNotesComponentTestInstance.CLOSE_NOTE;
        spotlightNotesComponentTestInstance.rowAction(selectedTestData);
        expect(spotlightNotesComponentTestInstance.onCloseNote).toHaveBeenCalledWith(note);

    });

    it('should delete note if the operation is confirmed in confirmDialog after calling onCloseNote()',()=>{
        spyOn(dialogServiceMock,'confirmDialog').and.callThrough();
        spyOn(NoteServiceMock,'closeNote').and.callThrough();
        spyOn(spotlightNotesComponentTestInstance,'fetchNoteList');
        const note: Note = NoteServiceMock.mockNoteA;

        dialogServiceMock.setExpectedConfirmDialogValue(true);
        spotlightNotesComponentTestInstance.onCloseNote(note);

        expect(dialogServiceMock.confirmDialog).toHaveBeenCalled();
        expect(NoteServiceMock.closeNote).toHaveBeenCalledWith(note.id);
        expect(spotlightNotesComponentTestInstance.fetchNoteList).toHaveBeenCalled();
    });


    it('should not delete note if the operation is NOT confirmed in confirmDialog after calling onCloseNote()',()=>{
        spyOn(dialogServiceMock,'confirmDialog').and.callThrough();
        spyOn(NoteServiceMock,'closeNote').and.callThrough();
        spyOn(spotlightNotesComponentTestInstance,'fetchNoteList');

        dialogServiceMock.setExpectedConfirmDialogValue(false);
        spotlightNotesComponentTestInstance.onCloseNote(NoteServiceMock.mockNoteA);

        expect(dialogServiceMock.confirmDialog).toHaveBeenCalled();
        expect(NoteServiceMock.closeNote).not.toHaveBeenCalled();
        expect(spotlightNotesComponentTestInstance.fetchNoteList).not.toHaveBeenCalled();
    });
});
