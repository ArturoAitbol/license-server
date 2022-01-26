import { Component, OnDestroy, OnInit } from '@angular/core';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { ToastrService } from 'ngx-toastr';
import { PhoneService } from 'src/app/services/phone.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { interval, Subscription } from 'rxjs';
import { PhoneConfComponent } from '../phone-details/phone-conf/phone-conf.component';
import { Utility } from 'src/app/helpers/Utility';

@Component({
    selector: 'app-troubleshooting',
    templateUrl: './troubleshooting.component.html',
    styleUrls: ['./troubleshooting.component.css']
})
export class TroubleshootingComponent implements OnInit, OnDestroy {
    basicInfo: any = [];
    phone: any;
    subscriptionButton: Subscription;
    // imgSrc: string | ArrayBuffer = 'assets/images/loading.gif';
    imgSrc: string | ArrayBuffer;
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-xl' };
    buttonDetails: any;
    isEasyButtonClicked: boolean;
    modalRef: BsModalRef;
    imageClass: string;
    _isShowMore: boolean;
    _canViewCallInfoLogs: boolean;
    callLogsInitGrid: any = [{ name: 'Call Type' }, { name: 'Call Details' }, { name: 'Time of Call' }];
    phoneCallLogsDetailsList: any = [];
    constructor(private phoneConfigurationService: PhoneConfigurationService,
        private phoneService: PhoneService,
        private toastr: ToastrService,
        private modalService: BsModalService) {
    }

    ngOnInit() {
        this.isEasyButtonClicked = false;
        this._isShowMore = false;
        this._canViewCallInfoLogs = false;
        this.phone = this.phoneConfigurationService.getPhone();
        this.getPhoneDetails(this.phone.id);
        this.easyButtonDetails();
        this.phoneConfigurationService.hideConfModal.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
        });
    }

    /**
     * fetch phone details based on the id
     * @param phoneId: any
     */
    getPhoneDetails(phoneId: any) {
        this.phoneService.getPhoneDetails(phoneId).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error getting phone details: ' + response.response.message, 'Error');
            } else {
                this.basicInfo = response.response.details.basicInfo;
            }
        });
    }

    /**
     *
     */
    easyButton() {
        this.phoneService.easyButton(this.phone).subscribe((response: any) => {
            if (!response.success) {
                if (response.response.message.toString().toLowerCase().includes('initiated')) {
                    this.toastr.error('Troubleshooting already initiated', 'Error');
                } else if (response.response.message.toString().toLowerCase().includes('inprogress')) {
                    this.toastr.error('Troubleshooting already in progress', 'Error');
                }
                // this.toastr.error('Error: ' + response.response.message, 'Error');
            } else {
                if (response.response.message.toString().toLowerCase().includes('initiated')) {
                    this.toastr.success('Troubleshooting initiated successfully', 'Success');
                } else if (response.response.message.toString().toLowerCase().includes('inprogress')) {
                    this.toastr.success('Troubleshooting is in progress', 'Success');
                }
            }
            this.isEasyButtonClicked = false;
            this.buttonDetails = {};
            this.closeSubscription();
            this.easyButtonDetails();
        });
    }

    /**
     * service call to download the logs
     * @param item: any
     */
    downloadLogs(item: any) {
        this.phoneService.easyButtonLogs(this.phone.id).subscribe((response: any) => {
            const type = { type: 'application/octet-stream' };
            this.downloadFile(response, item.prtFileName, type);
        });
    }

    /**
     * download the file
     * @param data :any
     * @param filename :string
     * @param type: any
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
    }

    /**
     * service call to fetch the easy button details,
     * makes service call until the status is COMPLETED OR FAILED for every 3 seconds
     */
    easyButtonDetails(): void {
        this.subscriptionButton = interval(3000).subscribe(() => {
            this.phoneService.easyButtonDetails(this.phone).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error: ' + response.response.message, 'Error');
                } else {
                    // tslint:disable-next-line:max-line-length
                    if (response.response.easyButton.prtStatus &&
                        (response.response.easyButton.prtStatus.toString().toUpperCase() === 'INITIATED' ||
                            response.response.easyButton.prtStatus.toString().toUpperCase() === 'INPROGRESS' ||
                            response.response.easyButton.prtStatus.toString().toUpperCase() === 'COMPLETED' ||
                            response.response.easyButton.prtStatus.toString().toUpperCase() === 'FAILED')) {
                        this.buttonDetails = response.response.easyButton;
                        // tslint:disable-next-line: max-line-length
                        this.phoneCallLogsDetailsList = this.buttonDetails['phoneCallLogsDtos'].sort((e1: any, e2: any) => (e1.type > e2.type) ? 1 : (e1.type < e2.type) ? -1 : 0);
                        this.phone.outBoundCallNumber = this.buttonDetails.outBoundCallNumber;
                        if (response.response.easyButton.deviceFile) {
                            const b64File = response.response.easyButton.deviceFile;
                            const blobFile = this.b64toBlob(b64File, 'image/png', 512);
                            const reader = new FileReader();
                            reader.onload = (e: Event) => {
                                this.imgSrc = reader.result;
                                this.imageClass = 'mx-auto d-block img-fluid';
                            };
                            reader.readAsDataURL(blobFile);
                        } else {
                            this.imgSrc = null;
                        }
                        // tslint:disable-next-line:max-line-length triple-equals
                        if (this.buttonDetails.completedDate != null && this.buttonDetails.dnd != '' && this.buttonDetails.outboundCallStatus != '' && this.buttonDetails.prtStatus != null && this.buttonDetails.registrationStatus != '') {
                            this.isEasyButtonClicked = true;
                        }
                    }
                    // tslint:disable-next-line:max-line-length
                    if (response.response.easyButton && response.response.easyButton.prtStatus != null && (response.response.easyButton.prtStatus.toString().toUpperCase() === 'COMPLETED' || response.response.easyButton.prtStatus.toString().toUpperCase() === 'FAILED')) {
                        this.closeSubscription();
                    }
                }
            });
        });
    }

    /**
     * convert byte array to blob
     * @param b64Data:any
     * @param contentType:string
     * @param sliceSize:number
     */
    b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || 'image/png';
        sliceSize = sliceSize || 512;
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    /**
     * emit event to hide the open modal
     */
    hideModal(): void {
        this.closeSubscription();
        this.phoneConfigurationService.phoneOperationsHide.emit();
    }

    /**
     * modal the compare the phone configuration file
     */
    multiplePhoneConfig(): void {
        if (Utility.userEnabled('ROLE_PHONE_COMPARECONFIG')) {
            this.phoneConfigurationService.setViewType(false);
            this.phoneConfigurationService.setPhone(this.phone);
            this.modalRef = this.modalService.show(PhoneConfComponent, this.modalConfig);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * @return color based on the status
     * @param value :any
     */
    getStyle(value: any) {
        if (value) {
            switch (value.toLowerCase()) {
                case 'completed':
                    return 'green';
                case 'failed':
                    return 'red';
                default:
                    return 'red';
            }
        }
    }

    /**
     * @return string based on the condition
     * @param value: any
     */
    getClass(value: any): string {
        if (value.toLowerCase() === 'completed') {
            return 'fa fa-check';
        }
        return 'fa fa-times';
    }

    /**
     * show more action
     */
    showMore(): void {
        this._isShowMore = !this._isShowMore;
    }
    /**
     * 
     */
    viewCallLogs(): void {
        this._canViewCallInfoLogs = !this._canViewCallInfoLogs;
    }
    /**
     * close the subscription interval
     */
    closeSubscription(): void {
        if (this.subscriptionButton) {
            this.subscriptionButton.unsubscribe();
        }
    }

    ngOnDestroy(): void {
        this.closeSubscription();
    }
}
