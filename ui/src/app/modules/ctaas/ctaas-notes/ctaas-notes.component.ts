import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import { DialogService } from 'src/app/services/dialog.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Utility } from 'src/app/helpers/utils';
import {NoteService} from '../../../services/notes.service';
import {SubAccountService} from '../../../services/sub-account.service';
import {AddNotesComponent} from './add-notes/add-notes.component';
import { Note } from 'src/app/model/note.model';
import { DatePipe } from '@angular/common';
import { BannerService } from "../../../services/banner.service";
import { CtaasSetupService } from "../../../services/ctaas-setup.service";
import { Subject } from "rxjs";
import { Constants } from 'src/app/helpers/constants';
import { environment } from 'src/environments/environment';
import moment from 'moment';

@Component({
    selector: 'app-ctaas-notes',
    templateUrl: './ctaas-notes.component.html',
    styleUrls: ['./ctaas-notes.component.css'],
    providers: [ DatePipe ]
})
export class CtaasNotesComponent implements OnInit, OnDestroy {
    tableMaxHeight: number;
    displayedColumns: any[] = [];
    notesData: any = [];
    notesDataBk: any = [];
    actionMenuOptions: any = [];
    isLoadingResults = false;
    isRequestCompleted = false;
    toggleStatus = false;
    addNoteDisabled = false;
    maintenanceModeEnabled = false;
    private subaccountDetails: any;
    private onDestroy: Subject<void> = new Subject<void>();
    readonly CLOSE_NOTE = 'Close Note';
    readonly ADD_NOTE = 'Close Note';
    readonly VIEW_DASHBOARD = 'View Dashboard';

    readonly options = {
        CLOSE_NOTE: this.CLOSE_NOTE,
        VIEW_DASHBOARD: this.VIEW_DASHBOARD
    }
    constructor(
        private msalService: MsalService,
        public dialog: MatDialog,
        private snackBarService: SnackBarService,
        private dialogService: DialogService,
        private noteService: NoteService,
        private subAccountService: SubAccountService,
        private bannerService: BannerService,
        private ctaasSetupService: CtaasSetupService) {}
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
        if(!this.maintenanceModeEnabled) {
            const roles: string[] = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
            this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "noteOptions");
        }
    }
    /**
     * fetch note data
     */
    fetchNoteList(): void {
        this.subaccountDetails = this.subAccountService.getSelectedSubAccount();
        this.isRequestCompleted = false;
        this.isLoadingResults = true;
        this.noteService.getNoteList(this.subaccountDetails.id).subscribe((res) => {
            this.isRequestCompleted = true;
            this.notesDataBk = res.notes.map(note => {
                note.openDate = moment(note.openDate, 'yyyy-MM-DD  hh:mm:ss').format('yyyy-MM-DD  h:mm:ss');
                if(note.closeDate) {
                    note.closeDate = moment(note.closeDate, 'yyyy-MM-DD  hh:mm:ss').format('yyyy-MM-DD  h:mm:ss');
                }
                return note;
            });
            this.notesData = this.notesDataBk.filter(x => x.status === 'Open');
            this.isLoadingResults = false;
        }, err => {
            console.debug('error', err);
            this.isLoadingResults = false;
            this.isRequestCompleted = true;
        });
    }

    ngOnInit(): void {
        this.subaccountDetails = this.subAccountService.getSelectedSubAccount();
        this.calculateTableHeight();
        this.initColumns();
        this.fetchNoteList();
        this.checkMaintenanceMode();
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
        switch (selectedOption) {
            case this.CLOSE_NOTE:
                this.onCloseNote(selectedRow);
                break;
            case this.VIEW_DASHBOARD:
                this.viewDashboard(selectedRow);
                break;
        }
    }

    /**
     * on click view dashboard
     * @param note: Note
     */
    viewDashboard(note: Note): void{
        const featureUrl = `${environment.BASE_URL}/#${Constants.SPOTLIGHT_DASHBOARD_PATH}?subaccountId=${this.subaccountDetails.id}&noteId=${note.id}`;
        window.open(featureUrl);
    }

    /**
     * on click close note
     * @param selectedRow: any
     */
    onCloseNote(selectedRow: any): void {
        this.dialogService.confirmDialog({
            title: 'Confirm Action',
            message: 'Are you sure you want to close the note created on '+ selectedRow.openDate +'?',
            confirmCaption: 'Close Note',
            cancelCaption: 'Cancel',
        }).subscribe((confirmed) => {
            if (confirmed) {
                const noteId = selectedRow.id;
                this.closeNote(noteId);
            }
        });
    }
    /**
     * close selected note by id
     * @param noteId: string
     */
    closeNote(noteId: string): void {
        this.noteService.closeNote(noteId).subscribe(() => {
            this.snackBarService.openSnackBar('Note closed successfully', '');
            this.notesDataBk = this.notesData = [];
            this.fetchNoteList();
        },(err)=>{
            this.snackBarService.openSnackBar(err.error, 'Error while deleting Note');
        });
    }

    openDialog(type: string){
        let dialogRef;
        switch (type) {
            case this.ADD_NOTE:
                dialogRef = this.dialog.open(AddNotesComponent, {
                    width: '85vw',
                    maxHeight: '90vh',
                    maxWidth: '30vw',
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

    onChangeToggle(flag: boolean): void {
        this.toggleStatus = flag;
        if (flag) {
            let closeNoteIndex = this.actionMenuOptions.indexOf('Close Note');
            if (closeNoteIndex != -1)
                this.actionMenuOptions.splice(closeNoteIndex, 1);
            this.notesData = this.notesDataBk.filter(x => x.status === 'Closed');
        } else {
            this.getActionMenuOptions();
            this.notesData = this.notesDataBk.filter(x => x.status === 'Open');
        }
    }

    ngOnDestroy() {
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    private checkMaintenanceMode() {
        this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountDetails.id).subscribe(res => {
            const ctaasSetupDetails = res['ctaasSetups'][0];
            if (ctaasSetupDetails.maintenance) {
                this.addNoteDisabled = true;
                this.bannerService.open("ALERT", Constants.MAINTENANCE_MODE_ALERT, this.onDestroy, "alert");
                this.maintenanceModeEnabled = true;
            }
            this.getActionMenuOptions();
        })
    }
}
