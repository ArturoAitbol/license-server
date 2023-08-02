import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { SubAccountService } from "src/app/services/sub-account.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { NoteService } from "src/app/services/notes.service";
import { MatDialogRef } from '@angular/material/dialog';
import { Note } from '../../../../model/note.model';

@Component({
    selector: 'app-add-notes-modal',
    templateUrl: './add-notes.component.html',
    styleUrls: ['./add-notes.component.css']
})
export class AddNotesComponent implements OnInit{

    isDataLoading = false;

    noteForm = this.fb.group({
        content: ['', Validators.required]
    });
    private subaccountDetails: any;
    constructor(
        private fb: FormBuilder,
        private snackBarService: SnackBarService,
        private subaccountService: SubAccountService,
        private notesService: NoteService,
        public dialogRef: MatDialogRef<AddNotesComponent>) {}

    ngOnInit() {
        this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    }

    addNote() {
        this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
        this.isDataLoading = true;
        const noteToAdd: Note = {
            content: this.noteForm.get('content').value,
            subaccountId: this.subaccountDetails.id,
            status: 'Open'
        };
        this.notesService.createNote(noteToAdd).subscribe((res: any) => {
            if (!res.error) {
                this.snackBarService.openSnackBar('Note added successfully!', '');
                this.isDataLoading = false;
                this.dialogRef.close(res);
            } else {
                this.snackBarService.openSnackBar(res.error, 'Error adding note!');
                this.isDataLoading = false;
            }
        });

    }

    onCancel() {
        this.dialogRef.close('Cancel');
    }

}
