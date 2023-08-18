import { ComponentFixture ,TestBed } from "@angular/core/testing";
import { AddNotesComponent } from "./add-notes.component";
import { MatDialogRef } from "@angular/material/dialog";
import { DialogService } from "../../../../services/dialog.service";
import { SnackBarServiceMock } from "../../../../../test/mock/services/snack-bar-service.mock";
import { SubaccountServiceMock } from "../../../../../test/mock/services/subaccount-service.mock";
import { DialogServiceMock } from "../../../../../test/mock/services/dialog-service.mock";
import { TestBedConfigBuilder } from "../../../../../test/mock/TestBedConfigHelper.mock";
import { NoteServiceMock } from "../../../../../test/mock/services/ctaas-note-service.mock";

let addNotesComponentInstance: AddNotesComponent;
let fixture : ComponentFixture<AddNotesComponent>;
const dialogService = new DialogServiceMock();

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddNotesComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(AddNotesComponent);
    addNotesComponentInstance = fixture.componentInstance;
    fixture.detectChanges();
}

describe('UI verification test for add notes component', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI and components to add a note', () => {
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const name = fixture.nativeElement.querySelector('#content-label');

        expect(h1.textContent).toBe('Add Note');
        expect(name.textContent).toBe(' Note content');
    });

    it('should enable the submit button when content is filled', () => {
        const addNoteForm = addNotesComponentInstance.noteForm;
        const submitButton = fixture.nativeElement.querySelector('#submit-note-button');
        addNoteForm.setValue({
            content: 'test content'
        });
        fixture.detectChanges();
        expect(submitButton.disabled).toBeFalse();
    });

    it('should disable the submit button if content is empty', () => {
        const addNoteForm = addNotesComponentInstance.noteForm;
        const submitButton = fixture.nativeElement.querySelector('#submit-note-button');
        addNoteForm.setValue({
            content: ''
        });
        expect(submitButton.disabled).toBeTrue();
    });
});

describe('addNote', () => {
    beforeEach(beforeEachFunction);
    it('should call proper services when the note content is valid', () => {
        spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
        spyOn(NoteServiceMock, 'createNote').and.callThrough();

        addNotesComponentInstance.noteForm.setValue({
            content: 'test content'
        });
        addNotesComponentInstance.addNote();

        expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
        expect(NoteServiceMock.createNote).toHaveBeenCalled();
    });

    it('should call error snackbar when the api response return an error', () => {
        spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar');
        spyOn(NoteServiceMock, 'createNote').and.callFake(NoteServiceMock.errorResponse);

        addNotesComponentInstance.addNote();

        expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(NoteServiceMock.errorMsg, 'Error adding note!');
    });

    it('should close the dialog when onCancel event function is called', () => {
        spyOn(dialogService, 'close').and.callThrough();

        addNotesComponentInstance.onCancel();

        expect(dialogService.close).toHaveBeenCalled();
    });
});
