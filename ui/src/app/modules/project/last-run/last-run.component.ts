import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'last-run',
    templateUrl: './last-run.component.html',
    styleUrls: ['./last-run.component.css']
})
export class LastRunComponent implements OnInit {
    @Input() run: any;
    @Input() instances: any = [];
    @Input() multiple: boolean;
    totalPortions: number;
    runColumns: any = [{}];
    runDetails: boolean;
    modalRef: BsModalRef;
    executionStatus: any = ['initializing', 'canceling', 'aborting', 'interrupting'];
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-lg', ignoreBackdropClick: true };
    disabledReportButton: boolean = false;
    disabledDownloadButton: boolean = false;
    inProgressToastId:any;
    inProgresReportToastId:any;
    constructor(private modalService: BsModalService,
        private projectService: ProjectViewService,
        private toastr: ToastrService) {
    }

    ngOnInit() {
        this.initGridProperties();
        this.getWidthPortions();
    }

    showRunDetails(data?: any) {
        this.runDetails = !this.runDetails;
        if (data) {
            this.instances.some((element, index) => {
                if (element.id == data.id) {
                    element.show = !data.show;
                }
                return element.id == data.id;
            });
        }
    }

    /**
     * display modal, when status is "FAIL TO START" project
     * @param template:any
     */
    onStatusClick(template: any): void {
        // tslint:disable-next-line:triple-equals
        if (this.run.status == 'FAIL TO START') {
            this.modalRef = this.modalService.show(template, {
                backdrop: true,
                class: 'modal-dialog-centered modal-md',
                ignoreBackdropClick: true
            });
        }
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    downloadLogs(item: any) {
        if (item.logsAvailable) {
            this.inProgressToastId = this.toastr.info( "Downloading logs is in progress ...",'Info' ,  { disableTimeOut: true }).toastId;
            this.disabledDownloadButton= true;
            this.projectService.downloadLogs(item.id).subscribe((response: any) => {
                let type = { type: 'application/octet-stream' };
                this.downloadFile(response, item.downloadLogName, type);
                this.disabledDownloadButton = false;
            },() =>{this.disabledDownloadButton = false;
                    this.toastr.remove(this.inProgressToastId);
            });
        } else {
            this.toastr.error("Logs are no longer available", "Error");
            this.disabledDownloadButton = false;
        }
    }

    downloadReport(item: any) {
        this.disabledReportButton = true;
        this.inProgresReportToastId = this.toastr.info( "Downloading Report is in progress ...",'Info' , { disableTimeOut: true }).toastId;
        this.projectService.downloadReports(item.id).subscribe((response: any) => {
            let type = { type: 'application/vnd.ms-excel' };
            this.downloadFile(response, item.reportName, type);
            this.disabledReportButton = false;
        },()=>{ this.disabledReportButton = false;
            this.toastr.remove(this.inProgresReportToastId);
        });
    }

    private downloadFile(data: any, filename: string, type: any) {
        var blob = new Blob([data], type);
        var url = window.URL.createObjectURL(blob);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            let a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
        if(this.inProgressToastId){
        this.toastr.remove(this.inProgressToastId);
        }
        if(this.inProgresReportToastId){
        this.toastr.remove(this.inProgresReportToastId);
        }
    }

    private getWidthPortions() {
        this.totalPortions = 0;
        this.runColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    private initGridProperties() {
        this.runColumns = [
            { field: 'runNo', header: 'Run#', width: 3, suppressHide: true },
            { field: 'status', header: 'Status', width: 7, suppressHide: true },
            { field: 'totalCount', header: 'Totals', width: 50, suppressHide: true },
            { field: 'startDate', header: 'Start Time', width: 12, suppressHide: true },
            { field: 'endDate', header: 'End Time', width: 12, suppressHide: true },
            { field: 'download', header: '', width: 8, suppressHide: true },
            { field: 'report', header: '', width: 8, suppressHide: true }
        ];
    }
}
