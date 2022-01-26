import { AfterViewChecked, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Constants } from 'src/app/model/constant';

class PhoneDetails {
    phoneTag = '';
    ipAddress = '';
    macAddress = '';
    primaryExtn = '';
    primaryUser = '';
}

@Component({
    selector: 'test-details',
    templateUrl: './test-details.component.html',
    styleUrls: ['./test-details.component.css']
})
export class TestDetailsComponent implements OnInit, AfterViewChecked {
    @Input() tests: any;
    @ViewChild('template', { static: true }) template: TemplateRef<any>;
    private currentPop: any;
    modalRef: BsModalRef;
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-xl', ignoreBackdropClick: true };
    projectId: any;
    currentDetail: any;
    mosScoreDetailsList: any = [];
    currentTest: any;
    totalPortions: number = 0;
    detailColumns: any = [{}];
    stepColumns: any = [];
    stepPortions: number = 0;
    logAsText: string = 'Logs are not available';
    executionStatus: any = ['initializing', 'running', 'canceling', 'aborting', 'interrupting', 'queued'];
    phoneDetails: PhoneDetails[] = [];
    items: any = [];
    MAX_VALUE = 5;
    _showCallStats: boolean;
    mosScoreValues: any = [];
    disabledDownloadButton: boolean = false;
    inProgressToastId:any;
    readonly mosScoresArray: string[] = [
        'PESQ',
        'PESQ-LQ',
        'PESQ-LQO',
        'MOS-LQ',
        'MOS-CQ',
        'PacketsSent',
        'PacketsReceived',
        'TxMOSLQ',
        'TxPayloadSize',
        'Category',
        'OctetsReceived',
        'MaxJitter',
        'TxCodec',
        'TxMOSCQ',
        'Jitter',
        'RxPayloadSize',
        'PacketsLost',
        'Latency',
        'OctetsSent',
        'Ref',
        'RxMOSLQ',
        'RxCodec',
        'PacketsExpected',
        'RxMOSCQ',
        'codec',
        'average_jitter',
        'delay',
        'package_total_loss',
        'framerate',
        'max_jitter',
        'loss_rate',
        'width',
        'bitrate',
        'height',
        'Decode_Latency',
        'Packets_Lost',
        'Decoder',
        'Gap_Duration',
        'Remote_Hold',
        'Call_Appearance',
        'Peer_Phone',
        'Encoder',
        'Packets_Sent',
        'Call_State',
        'Burst_Duration',
        'Round_Trip_Delay',
        'Bytes_Sent',
        'Duration',
        'Bytes_Received',
        'Mapped_RTP_Port',
        'Packet_Discarded',
        'Discard_Rate',
        'Type',
        'Callback',
        'Packets_Received',
        'Tone',
        'R_Factor',
        'Peer_Name'
    ];
    constructor(private projectService: ProjectViewService,
        private route: ActivatedRoute, private router: Router,
        private modalService: BsModalService,
        private toastr: ToastrService) {
    }

    ngOnInit() {
        this.items.length = this.MAX_VALUE;
        this._showCallStats = false;
        this.initGridProperties();
        this.route.paramMap.subscribe((paramMap: any) => {
            this.projectId = paramMap.params.id;
        });
        this.getStepPortions();
        this.getWidthPortions();
    }

    ngAfterViewChecked() {
        const openSingle = JSON.parse(localStorage.getItem('openSingle'));
        if (openSingle) {
            setTimeout(() => {
                const index = this.tests.map(test => test.status.toLowerCase()).indexOf(openSingle.type.toLowerCase());
                this.showReport(this.template, this.tests[index]);
            }, 1000);
            localStorage.removeItem('openSingle');
        }
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    editTestScript(test: any) {
        this.router.navigate(['/testCase/' + test.testId]);
    }

    getWidthPortions() {
        this.totalPortions = 0;
        this.detailColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    getStepPortions() {
        this.stepPortions = 0;
        this.stepColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.stepPortions += column.width;
            }
        });
    }

    getStepsWidth(column: any) {
        return (column.width * 100 / this.stepPortions) + '%';
    }

    initGridProperties() {
        this.detailColumns = [
            { field: 'id', header: 'ID', width: 15, suppressHide: true },
            { field: 'status', header: 'Status', width: 15, suppressHide: true },
            { field: 'startDate', header: 'Start Date', width: 15, suppressHide: true },
            { field: 'endDate', header: 'End Date', width: 15, suppressHide: true },
            { field: '', header: '', width: 10, suppressHide: true }
        ];

        this.stepColumns = [
            { field: 'resource', header: 'Variable', width: 20, suppressHide: true, suppressSort: true },
            { field: 'mac', header: 'MAC', width: 20, suppressHide: true, suppressSort: true },
            { field: 'ipAddress', header: 'IP Address', width: 15, suppressHide: true, suppressSort: true },
            { field: 'primaryUser', header: 'Primary User', width: 30, suppressHide: true, suppressSort: true },
            { field: 'primaryExtension', header: 'Primary Extension', width: 30, suppressHide: true, suppressSort: true },
            { field: 'email', header: 'Email', width: 30, suppressHide: true, suppressSort: true }  
        ];
    }

    closeOldPop(popover: any) {
        if (this.currentPop && this.currentPop !== popover) {
            this.currentPop.hide();
        }
        this.currentPop = popover;
    }

    showReport(template: TemplateRef<any>, test: any) {
        switch (test.status) {
            case 'ABORTED':
                this.toastr.info('Test Case Execution aborted', 'Info');
                break;
            case 'INTERRUPTED':
                this.toastr.info('Test Case Execution Interrupted: ' + test.interruptedReason, 'Info');
                break;
            default:
                if (test.interruptedReason && test.interruptedReason != '') {
                    this.toastr.error(test.interruptedReason, 'Error');
                } else {
                    this.projectService.getTestReport(test.id).subscribe((response: any) => {
                        if (!response.success) {
                            this.toastr.error('Couldn\'t load test details: ' + response.response.message, 'Error');
                            this.currentDetail = null;
                        } else {
                            if (response.response.subResult.resources == null || response.response.subResult.resources.length == 0) {
                                this.phoneDetails = [];
                                response.response.subResult.testResultResourceDtos.forEach(e => {
                                    this.phoneDetails.push(e);
                                });
                            } else {
                                this.phoneDetails = response.response.subResult.resources;
                            }
                            this.currentTest = test;
                            this.currentDetail = response.response.subResult;
                            this.mosScoreDetailsList = this.currentDetail.mosScores;
                            if (this.mosScoreDetailsList && this.mosScoreDetailsList.length > 0) {
                                this.mosScoreValues = [];
                                // set all keys to lowercase in the array
                                const mosScoreItems: string[] = this.mosScoresArray.map(e => e.toLowerCase());
                                this.mosScoreDetailsList.forEach((e: any) => {
                                    const obj: [] = e.mosScoreKeyalueArray
                                        .filter((e2: { label: string }) => mosScoreItems.includes(e2.label.toLowerCase()));
                                    this.mosScoreValues = this.mosScoreValues.concat(obj);
                                });
                                // get the highest value in tha array
                                const highValueObj = this.mosScoreValues.sort((a: any, b: any) => a.value - b.value).reverse()[0];
                                // set maxmium value 
                                if (highValueObj.label != 'PESQ-LQ' && highValueObj.label != 'PESQ-LQO' && highValueObj.label != 'PESQ') {                            // set the max value for the progress bar
                                    this.MAX_VALUE = Math.ceil(highValueObj.value / 100) * 100;
                                }
                            }
                            if (this.currentDetail.logs.length > 0) {
                                this.logAsText = this.currentDetail.logs.join('\n');
                            }
                            this.modalRef = this.modalService.show(template, this.modalConfig);
                        }
                    });
                }

                break;
        }
    }

    hideModal() {
        if (this.modalRef) {
            this.modalRef.hide();
            this._showCallStats = false;
        }
    }

    getColor(result: string) {
        if (result) {
            switch (result.toLowerCase()) {
                case 'pass':
                    return '#0E8B18';
                case 'fail':
                    return '#CB3333';
                default:
                    return '#000000';
            }
        }
    }

    statusColor(status: string) {
        switch (status.toLowerCase()) {
            case 'passed':
                return '#0E8B18';
            case 'failed':
                return '#CB3333';
            default:
                return '#000000';
        }
    }
    /**
     * download log
     * @param item: any
     */
    downloadLog(item: any) {
        if (item.isLogAvailable) {
            this.inProgressToastId =  this.toastr.info( "Downloading logs is in progress ...",'Info', { disableTimeOut: true }).toastId;
            const url = this.projectId + '/' + item.id;
            this.disabledDownloadButton = true;
            this.projectService.downloadLogs(url).subscribe((response: any) => {
                this.downloadFile(response, item.downloadLogName);
                this.disabledDownloadButton = false;
            } , () =>{
                       this.disabledDownloadButton = false;
                       this.toastr.remove(this.inProgressToastId);
                    });
        } else {
            this.toastr.error("Logs are no longer available", "Error");
            this.disabledDownloadButton = false;
        }
    }

    private downloadFile(data: any, filename: string) {
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
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
        this.toastr.remove(this.inProgressToastId);
    }
    viewOrCloseMediaStats(){
        this._showCallStats = !this._showCallStats;
    }

}
