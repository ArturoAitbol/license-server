import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { SubAccountService } from "src/app/services/sub-account.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { NoteService } from "src/app/services/notes.service";
import { MatDialogRef } from '@angular/material/dialog';
import { Note } from '../../../../model/note.model';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { FeatureToggleService } from "../../../../services/feature-toggle.service";

@Component({
    selector: 'app-add-notes-modal',
    templateUrl: './add-notes.component.html',
    styleUrls: ['./add-notes.component.css']
})
export class AddNotesComponent implements OnInit{

    isDataLoading = false;
    nativeHistoricalDashboardActive = false;

    noteForm = this.fb.group({
        content: ['', Validators.required]
    });
    private subaccountDetails: any;
    constructor(
        private fb: FormBuilder,
        private snackBarService: SnackBarService,
        private subaccountService: SubAccountService,
        private notesService: NoteService,
        private ctaasDashboardService: CtaasDashboardService,
        private ftService: FeatureToggleService,
        public dialogRef: MatDialogRef<AddNotesComponent>) {}

    ngOnInit() {
        this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
        this.nativeHistoricalDashboardActive = this.ftService.isFeatureEnabled('spotlight-historical-dashboard', this.subaccountDetails.id)
    }

    addNote() {
        this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
        this.isDataLoading = true;
        const currentReports = this.ctaasDashboardService.getReports();
        if (currentReports !== null || this.nativeHistoricalDashboardActive) {
            const noteToAdd: Note = {
                content: this.noteForm.get('content').value,
                subaccountId: this.subaccountDetails.id,
                status: 'Open',
                reports: this.nativeHistoricalDashboardActive ? [] : currentReports
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
        } else {
            this.snackBarService.openSnackBar('Reports are missing', 'Error adding note!');
        }
    }

    onCancel() {
        this.dialogRef.close('Cancel');
    }

}
