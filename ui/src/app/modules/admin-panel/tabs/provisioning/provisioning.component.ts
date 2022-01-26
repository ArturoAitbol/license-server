import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { interval, Subscription } from 'rxjs';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { ToastrService } from 'ngx-toastr';
import { ProvisioningService } from 'src/app/services/provisioning.service';
import { NewProvisioningComponent } from './new-provisioning/new-provisioning.component';
import { EditProvisioningComponent } from './edit-provisioning/edit-provisioning.component';
import { Utility } from '../../../../helpers/Utility';
import { PhoneOptionsService } from 'src/app/services/phone-options.service';
import { DataTableService } from 'src/app/services/data-table.service';
import { Constants } from 'src/app/model/constant';


@Component({
    selector: 'provisioning-tab',
    templateUrl: './provisioning.component.html',
    styleUrls: ['./provisioning.component.css']
})
export class ProvisioningComponent implements OnInit, OnDestroy {
    private currentPop: any;
    instances: any = [];
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-md', ignoreBackdropClick: true };
    modalRef: BsModalRef;
    totalPortions: number;
    instanceColumns: any;
    subscription: Subscription;
    refreshSubscription: Subscription;
    scrollEventSubscription: Subscription;
    @ViewChild('instancesGrid', { static: true }) instancesGrid: DataTableComponent;
    @Input() searchQuery: string;
    isRequestCompleted: boolean;
    disabledDownloadButton: boolean = false;
    inProgressToastId:any;
    constructor(private modalService: BsModalService,
        private toastService: ToastrService,
        private phoneOptionService: PhoneOptionsService,
        private dataTableService: DataTableService,
        private provisioningService: ProvisioningService) {
        this.isRequestCompleted = false;
    }

    /**
     * load instances
     */
    loadInstances(): void {
        this.isRequestCompleted = false;
        this.subscription = this.provisioningService.getInstances().subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Couldn\'t load Broadsoft Instances: ' + response.response.message, 'Error');
                this.isRequestCompleted = true;
            } else {
                // set relay list in in-memory
                this.phoneOptionService.setRelayList = response.oprs;
                this.instances = response.response.callServers;
                this.instances.forEach((item: any) => {
                    if (item.oprDto) {
                        item.relayName = item.oprDto.name;
                    }
                });
                this.instances = Utility.sortByLastModifiedDateInDescOrder(this.instances);
                this.isRequestCompleted = true;

            }
        }, () => {
            this.isRequestCompleted = true;
        });
    }

    ngOnInit() {
        this.initGridProperties();
        this.loadInstances();
        this.getWidthPortions();
        this.provisioningService.createdInstance.subscribe((response: any) => {
            this.closeModal();
            this.loadInstances();
        });
        this.provisioningService.closeModal.subscribe((response: any) => {
            this.closeModal();
        });

        this.refreshSubscription = interval(10000).subscribe(val => {
            this.loadInstances();
        });

        //listen for data table scroll event
        this.scrollEventSubscription = this.dataTableService.scrollEvent.subscribe(() => {
            if (this.currentPop) {
                this.currentPop.hide();
            }
        });
    }

    getColumnWidth(column: any): any {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    getWidthPortions(): void {
        this.totalPortions = 0;
        this.instanceColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    private initGridProperties(): void {
        this.instanceColumns = [
            { field: 'name', header: 'Server Name', width: 15, suppressHide: true },
            { field: 'vendor', header: 'Vendor', width: 15, suppressHide: true },
            { field: 'model', header: 'Model', width: 13, suppressHide: true },
            { field: 'ipAddress', header: 'IP Address', width: 15, suppressHide: true },
            { field: 'relayName', header: 'Relay Name', width: 10, suppressHide: true },
            { field: 'port', header: 'Server Port', width: 10, suppressHide: true },
            { field: 'connectionProtocol', header: 'Protocol', width: 10, suppressHide: true },
            { field: 'syncStatus', header: 'Status', width: 10, suppressHide: true },
            { field: '_', header: '', width: 10, suppressHide: true, suppressSort: true },
            { field: '_', header: '', width: 10, suppressHide: true, suppressSort: true },
            { field: 'syncEndTs', header: 'Last Updated', width: 15, suppressHide: true },
            { field: '_', header: 'Completed/Total', width: 15, suppressHide: true, suppressSort: true },
            { field: '_', header: '', width: 5, suppressHide: true, suppressSort: true }
        ];
    }

    /**
     * perform sync instance for selected instance
     */
    syncInstance(instance: any): void {
        this.provisioningService.syncInstance(instance.id).subscribe((response: any) => {
            if (!response.success) {
                let errorMsg: string = response.response.message;
                if (errorMsg.includes('INPROGRESS')) {
                    errorMsg = errorMsg.replace('INPROGRESS', 'In Progress');
                } else if (errorMsg.includes('INITIATED')) {
                    errorMsg = errorMsg.replace('INITIATED', 'Initiated');
                }
                this.toastService.error('Error trying to sync instance: ' + errorMsg);
            } else {
                this.toastService.success('Instance sync up started successfully', 'Success');
                this.loadInstances();
            }
        });
    }

    /**
     * open a modal for new instance
     */
    newInstance(): void {
        this.modalRef = this.modalService.show(NewProvisioningComponent, this.modalConfig);
    }

    /**
     * open a modal for edit instance
     */
    editInstance(instance: any): void {
        this.provisioningService.setInstance(instance);
        this.modalRef = this.modalService.show(EditProvisioningComponent, this.modalConfig);
    }

    /**
     * perform delete of selected instance
     */
    deleteInstance(instance: any): void {
        this.provisioningService.deleteInstance(instance.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Error trying to delete instance: ' + response.response.message);
            } else {
                this.toastService.success('Instance deleted successfully', 'Success');
                this.loadInstances();
            }
        });
    }

    /***
     * get color
     * @param item:string
     */
    getColor(item: string): string {
        if (item) {
            switch (item.toLowerCase()) {
                case 'completed':
                    return '#0E8B18';
                case 'failed':
                    return '#CB3333';
                case 'initiated':
                case 'inprogress':
                    return '#7694B7';
            }
        }
    }

    /**
     * close the if any modal object exist
     */
    closeModal(): void {
        if (this.modalRef) {
            this.modalRef.hide();
        }
    }

    /**
     * close the if any popover exist
     */
    closeOldPop(popover: any): void {
        if (this.currentPop && this.currentPop !== popover) {
            this.currentPop.hide();
        }
        this.currentPop = popover;
    }

    /**
     * close the if any modal object exist
     */
    downloadLog(item: any): void {
        this.disabledDownloadButton = true;
        this.inProgressToastId = this.toastService.info( "Downloading logs is in progress ...",'Info', { disableTimeOut: true }).toastId;
        this.provisioningService.downloadServerFailureLogs(item.id).subscribe((response: any) => {
            const type = { type: 'application/octet-stream' };
            this.downloadFile(response, item.name + 'FailureLogs.log', type);
            this.disabledDownloadButton = false;
        },() =>{
            this.disabledDownloadButton = false;
            this.toastService.remove(this.inProgressToastId);
        });
    }

    /**
     * download file from blob
     */
    downloadFile(data: any, filename: string, type: any) {
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
        this.toastService.remove(this.inProgressToastId);
    }

    /**
     * based on the condition, gives the popover position
     * @returns: string
     */
    getPlacementPosition(item: any): string {
        // tslint:disable-next-line: triple-equals
        if (this.instances.indexOf(item) == (this.instances.length - 1)) {
            return 'left';
        }
        return 'bottom';
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
        if (this.scrollEventSubscription) {
            this.scrollEventSubscription.unsubscribe();
        }
    }
}
