import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import { DialogService } from 'src/app/services/dialog.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Utility } from 'src/app/helpers/utils';
import {NoteService} from '../../../services/notes.service';
import {SubAccountService} from '../../../services/sub-account.service';
import {AddStakeHolderComponent} from '../ctaas-stakeholder/add-stake-holder/add-stake-holder.component';
import {AddNotesComponent} from './add-notes/add-notes.component';

@Component({
    selector: 'spotlight-notes',
    templateUrl: './ctaas-notes.component.html',
    styleUrls: ['./ctaas-notes.component.css']
})
export class CtaasNotesComponent implements OnInit {
    tableMaxHeight: number;
    displayedColumns: any[] = [];
    notesData: any = [];
    notesDataBk: any = [];
    actionMenuOptions: any = [];
    isLoadingResults = false;
    isRequestCompleted = false;
    readonly CLOSE_NOTE = 'Close Note';
    readonly ADD_NOTE = 'Close Note';

    readonly options = {
        CLOSE_NOTE: this.CLOSE_NOTE
    }
    constructor(
        private msalService: MsalService,
        public dialog: MatDialog,
        private snackBarService: SnackBarService,
        private dialogService: DialogService,
        private noteService: NoteService,
        private subAccountService: SubAccountService
    ) { }
    /**
     * calculate table height based on the window height
     */
    private calculateTableHeight() {
        this.tableMaxHeight = window.innerHeight // doc height
            - (window.outerHeight * 0.01 * 2) // - main-container margin
            - 60 // - route-content margin
            - 20 // - dashboard-content padding
            - 30 // - table padding
            - 32 // - title height
            - (window.outerHeight * 0.05 * 2); // - table-section margin
    }
    /**
     * initialize the columns settings
     */
    initColumns(): void {
        this.displayedColumns = [
            { name: 'Status', dataKey: 'status', position: 'left', isSortable: true },
            { name: 'Content', dataKey: 'content', position: 'left', isSortable: true },
            { name: 'Open Date', dataKey: 'openDate', position: 'left', isSortable: true },
            { name: 'Opened By', dataKey: 'openedBy', position: 'left', isSortable: true },
            { name: 'Close Date', dataKey: 'closeDate', position: 'left', isSortable: true },
            { name: 'Closed By', dataKey: 'closedBy', position: 'left', isSortable: true },
        ];
    }
    /**
     * get action menu options
     */
    private getActionMenuOptions() {
        const roles: string[] = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
        this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "noteOptions")
    }
    /**
     * fetch note data
     */
    fetchNoteList(): void {
        this.isRequestCompleted = false;
        this.isLoadingResults = true;
        this.noteService.getNoteList(this.subAccountService.getSelectedSubAccount().id).subscribe((res) => {
            this.isRequestCompleted = true;
            this.notesData = res.notes;
            this.isLoadingResults = false;
        }, err => {
            console.debug('error', err);
            this.isLoadingResults = false;
            this.isRequestCompleted = true;
        });
    }

    ngOnInit(): void {
        this.calculateTableHeight();
        this.getActionMenuOptions();
        this.initColumns();
        this.fetchNoteList();
    }

    /**
     * sort table
     * @param sortParameters: Sort
     * @returns notesData
     */
    sortData(sortParameters: Sort): any[] {
        const keyName = sortParameters.active;
        if (sortParameters.direction === 'asc') {
            this.notesData = this.notesData.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
        } else if (sortParameters.direction === 'desc') {
            this.notesData = this.notesData.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
        } else {
            return this.notesData = this.notesData;
        }
    }
    /**
     * action row click event
     * @param object: { selectedRow: any, selectedOption: string, selectedIndex: string }
     */
    rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
        const { selectedRow, selectedOption, selectedIndex } = object;
        console.log(selectedRow);
        switch (selectedOption) {
            case this.CLOSE_NOTE:
                this.onCloseNote(selectedRow);
                break;
        }
    }
    /**
     * on click delete note
     * @param selectedRow: any
     */
    onCloseNote(selectedRow: any): void {
        this.dialogService.confirmDialog({
            title: 'Confirm Action',
            message: 'Do you want to confirm this action?',
            confirmCaption: 'Close Note',
            cancelCaption: 'Cancel',
        }).subscribe((confirmed) => {
            if (confirmed) {
                const noteId = selectedRow.id;
                this.deleteNote(noteId);
            }
        });
    }
    /**
     * delete selected note details by id
     * @param noteId: string
     */
    deleteNote(noteId: string): void {
        this.noteService.closeNote(noteId).subscribe((response: any) => {
            if (response) {
                const { error } = response;
                if (error) {
                    this.snackBarService.openSnackBar(response.error, 'Error while deleting Note');
                } else {
                    this.notesDataBk = this.notesData = [];
                    this.fetchNoteList();
                }
            } else {
                this.snackBarService.openSnackBar('Closed Note successfully', '');
                this.notesDataBk = this.notesData = [];
                this.fetchNoteList();
            }
        });
    }

    openDialog(type: string){
        let dialogRef;
        switch (type) {
            case this.ADD_NOTE:
                dialogRef = this.dialog.open(AddNotesComponent, {
                    width: '400px',
                    disableClose: false
                });
                break;
        }
        dialogRef.afterClosed().subscribe((res: any) => {
            if (res) {
                this.notesDataBk = this.notesData = [];
                this.fetchNoteList();
            }
        });
    }

    addNote() {
        this.openDialog(this.ADD_NOTE);
    }
}
