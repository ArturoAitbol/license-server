import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Subscription, interval } from 'rxjs';
import { DataTableComponent } from '../../../../generics/data-table/data-table.component';
import { ToastrService } from 'ngx-toastr';
import { RelayService } from '../../../../services/relay.service';
import { Utility } from '../../../../helpers/Utility';
import { EditRelayComponent } from './edit-relay/edit-relay.component';
import { DataTableService } from 'src/app/services/data-table.service';
import { Constants } from 'src/app/model/constant';

@Component({
    selector: 'app-relay',
    templateUrl: './relay.component.html',
    styleUrls: ['./relay.component.css']
})
export class RelayComponent implements OnInit, OnDestroy {
    private currentPop: any;
    relaysList: any = [];
    $relaysListBk: any = [];
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-md', ignoreBackdropClick: true };
    modalRef: BsModalRef;
    totalPortions: number;
    relayColumns: any;
    @ViewChild('relayGrid', { static: false }) relayGrid: DataTableComponent;
    @Input() searchQuery: string;
    // flags
    allItemsSelected: boolean;
    markedItems: boolean;
    filtering: boolean;
    selectedRelaysBar: boolean;
    // counter
    selectedQty: number;
    filteredListQty: number;
    downloadMsg = 'Download started. Please wait...';
    downloadInfoToastId: any;
    inProgressToastId:any;
    // flag
    _isDownloadStarted: boolean;
    // subscription
    subscription: Subscription;
    anyChangeSubscription: Subscription;
    scrollEventSubscription: Subscription;
    serverTime: string;
    isRequestCompleted: boolean;
    disabledDownloadButton: boolean = false;
    constructor(private modalService: BsModalService,
        private toastService: ToastrService,
        private dataTableService: DataTableService,
        private relayService: RelayService) {
        this.isRequestCompleted = false;
    }

    ngOnInit() {
        this._isDownloadStarted = false;
        this.selectedQty = this.filteredListQty = 0;
        this.selectedRelaysBar = this.allItemsSelected = this.markedItems = this.filtering = false;
        this.initGridProperties();
        this.getWidthPortions();
        this.loadRelays();
        this.relayService.closeModal.subscribe(() => {
            this.loadRelays();
            this.closeModal();
        });

        // interval for every 5 seconds that checks for changes in relays
        this.anyChangeSubscription = interval(5000).subscribe(() => this.checkForAnyChange());
        //listen for data table scroll event
        this.scrollEventSubscription = this.dataTableService.scrollEvent.subscribe(() => {
            if (this.currentPop) {
                this.currentPop.hide();
            }
        });
    }

    /**
     * load relay list
     */
    loadRelays(): void {
        this.isRequestCompleted = false;
        this.subscription = this.relayService.getAllRelays().subscribe((response: any) => {
            if (response.serverTime) {
                this.serverTime = response.serverTime;
            }
            if (!response.success) {
                this.toastService.error(response.response.message, 'Error');
                this.isRequestCompleted = true;
            } else {
                this.$relaysListBk = this.relaysList = response.response.oprs;
                this.isRequestCompleted = true;
            }
        }, () => {
            this.isRequestCompleted = true;
        });
    }

    /**
     * checks for any changes in the relay
     */
    checkForAnyChange(): void {
        // sends request when serverTime has value
        if (this.serverTime) {
            this.relayService.anyChangeInRelay(this.serverTime).subscribe((response: any) => {
                if (!response.success) {
                    this.toastService.error('Error on relay refresh service', 'Error');
                } else {
                    if (response.response.changesAvalable) {
                        this.loadRelays();
                    }
                }
            });
        }
    }

    /**
     * calculate the column width
     * @param column: any
     */
    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    /**
     * calculate the total portions
     */
    getWidthPortions(): void {
        this.totalPortions = 0;
        this.relayColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    private initGridProperties(): void {
        this.relayColumns = [
            { field: '_', header: '', width: 2, suppressHide: true, suppressSort: true },
            { field: 'name', header: 'Name', width: 15, suppressHide: false },
            { field: 'description', header: 'Description', width: 20, suppressHide: false },
            { field: 'version', header: 'Version', width: 20, suppressHide: false },
            { field: 'oprUuid', header: 'UUID', width: 15, suppressHide: false },
            { field: 'status', header: 'Status', width: 10, suppressHide: false },
            { field: '_', header: '', width: 5, suppressHide: true, suppressSort: true }
        ];
    }

    /**
     * select all items
     */
    selectAll() {
        this.relaysList.forEach((phone: any) => {
            phone.selected = this.allItemsSelected;
            if (phone.filtered) {
                phone.selected = this.allItemsSelected;
            }
        });
        this.selectedRelaysBar = this.allItemsSelected;
        this.updateFilteredRelaysCounter();
        this.updateSelectedRelaysCounter();
    }

    /**
     * check if all items selected or not
     */
    checkIfAllItemsSelected(): void {
        this.updateFilteredRelaysCounter();
        this.updateSelectedRelaysCounter();

        // tslint:disable-next-line: triple-equals
        if (this.selectedQty == this.filteredListQty && this.filteredListQty > 0) {
            this.allItemsSelected = true;
        } else {
            this.allItemsSelected = false;
        }
        if (this.relaysList.length > 0) {
            // tslint:disable-next-line: triple-equals
            this.allItemsSelected = this.relaysList.every((item: any) => item.selected == true);
        } else {
            this.allItemsSelected = this.markedItems = false;
        }
        this.selectedRelaysBar = this.selectedQty > 0;
    }

    /**
     * update the filtered list quantity
     */
    updateFilteredRelaysCounter() {
        this.filteredListQty = 0;
        this.relaysList.forEach((phoneList: any) => {
            if (phoneList.filtered) {
                this.filteredListQty++;
            }
        });
    }

    /**
     * update the selected list quantity
     */
    updateSelectedRelaysCounter() {
        this.selectedQty = 0;
        this.relaysList.forEach((phoneList: any) => {
            if (phoneList.selected) {
                this.selectedQty++;
            }
        });
    }

    toggleVisibility(e?: any) {
        this.markedItems = true;
        for (let i = 0; i < this.relaysList.length; i++) {
            if (!this.relaysList[i].selected) {
                this.markedItems = false;
                break;
            }
        }
    }

    /**
     * edit relay details
     * @param relay: any
     */
    editRelay(relay: any): void {
        this.relayService.setRelay(relay);
        this.modalRef = this.modalService.show(EditRelayComponent, {
            backdrop: true,
            class: 'modal-dialog-centered',
            ignoreBackdropClick: true
        });
    }

    /**
     * delete relay
     * @param relay: any
     */
    deleteSelectedRelay(relay: any): void {
        this.relayService.deleteParticularRelay(relay.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error(response.response.message, 'Error');
            } else {
                this.toastService.success('Relay successfully deleted', 'Success');
                this.loadRelays();
            }
        });
    }

    /**
     * check whether any item is selected or not
     * @return: boolean
     */
    getDeleteStatus(): boolean {
        let response = true;
        if (this.selectedRelaysBar) {
            response = false;
        }
        // check for any available
        // tslint:disable-next-line: triple-equals
        if (this.relaysList.some((e: any) => e.selected == true)) {
            response = this.relaysList.some((e: any) => e.status.toString().toLowerCase() === 'available' &&
                // tslint:disable-next-line: triple-equals
                ((this.searchQuery == '') ? (e.selected == true) : e.selected == true && e.filtered == true));
        }
        return response;
    }

    /**
     * delete selected relays from checkbox
     */
    deleteRelay(): void {
        const toDelete = this.relaysList
            // tslint:disable-next-line: triple-equals
            .filter((e: any) => (this.searchQuery == '') ? (e.selected == true) : e.selected == true && e.filtered == true)
            .map((e: any) => e.id);
        if (toDelete.length > 1) {
            this.relayService.deleteMultipleRelays(toDelete).subscribe((response: any) => {
                if (!response.success) {
                    this.toastService.error('Error trying to delete relays: \nMessage:' + response.response.message, 'Error');
                } else {
                    this.loadRelays();
                    this.toastService.success('Relays successfully deleted!', 'Success');
                }
            });
        } else {
            this.relayService.deleteParticularRelay(toDelete[0]).subscribe((response: any) => {
                if (!response.success) {
                    this.toastService.error(response.response.message, 'Error');
                } else {
                    this.toastService.success('Relay successfully deleted', 'Success');
                    this.loadRelays();
                }
            });
        }
    }

    /***
     * get color
     * @param item:string
     */
    getColor(item: string): string {
        if (item) {
            return Utility.getColorCode(item);
        }
    }

    /**
     * check for any hidden column
     */
    checkAllHidden() {
        let response = false;
        let counter = 0;
        this.relayColumns.forEach((column: any) => {
            if (!column.hidden) {
                counter++;
            }
        });
        // tslint:disable-next-line:triple-equals
        response = counter == this.relayColumns.length;
        return response;
    }

    /**
     * filter the data by advanced search
     */
    filterData(): void {
        this.relaysList = this.$relaysListBk;
        let filterCount = 0;
        this.relayColumns.forEach((column: any) => {
            if (column.filter) {
                filterCount++;
                const filter = { key: column.field, value: column.filter.toUpperCase() };
                this.relaysList = this.relaysList.filter((item) => {
                    // tslint:disable-next-line:triple-equals
                    if (item[filter.key] != undefined) {
                        return item[filter.key].toUpperCase().indexOf(filter.value) > -1;
                    }
                });
            }
        });
        this.filtering = filterCount > 0;
    }

    /**
     * close the modal
     */
    closeModal(): void {
        if (this.modalRef) {
            this.modalRef.hide();
        }
    }

    /**
     * close the old popover if exist and open new popover
     * @param popover: any
     */
    closeOldPop(popover: any): void {
        if (this.currentPop && this.currentPop !== popover) {
            this.currentPop.hide();
        }
        this.currentPop = popover;
    }

    /**
     * get the download relay name
     */
    fetchDownloadFileName(): void {
        this.disabledDownloadButton = true;
        this.inProgressToastId =this.toastService.info( "Downloading Relay Installer is in progress ...",'Info', { disableTimeOut: true }).toastId;
      
        this.relayService.getDownloadRelayName().subscribe((res: any) => {
            if (!res.success) {
                // tslint:disable-next-line: triple-equals
                if (res.response.message == 'notFound') {
                    this.toastService.error('Installer not found', 'Error');
                } else {
                    this.toastService.error(res.response.message, 'Error');
                }
                this._isDownloadStarted = false;
                this.toastService.remove(this.inProgressToastId);
            } else {
                this._isDownloadStarted = true;
                this.toastService.remove(this.inProgressToastId);
                if (this.relaysList.length > 0) {
                    this.downloadInfoToastId = this.toastService.info(this.downloadMsg, 'Info', { disableTimeOut: true }).toastId;
                }
                this.downloadRelayFile(res.response.fileName);
                this.disabledDownloadButton = false;
            }
        },()=>{  this.disabledDownloadButton = false;
            this.toastService.remove(this.inProgressToastId);
         });
    }

    /**
     * download the relay file service call
     */
    downloadRelayFile(fileName: string): void {
        this.relayService.downloadRelay().subscribe((res: any) => {
            this._isDownloadStarted = false;
            // this.toastService.remove(this.downloadInfoToastId);
            const type = { type: 'application/octet-stream' };
            this.downloadFile(res, fileName, type);
        });
    }

    /**
     * download file to the PC
     */
    private downloadFile(data: any, filename: string, type: any) {
        const blob = new Blob([data], type);
        const url = window.URL.createObjectURL(blob);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
        if(this.downloadInfoToastId){
            this.toastService.remove(this.downloadInfoToastId);
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.anyChangeSubscription) {
            this.anyChangeSubscription.unsubscribe();
        }
        if (this.scrollEventSubscription) {
            this.scrollEventSubscription.unsubscribe();
        }
    }
}
