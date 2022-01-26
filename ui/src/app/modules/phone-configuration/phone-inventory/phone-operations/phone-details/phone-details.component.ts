import {Component, OnDestroy, OnInit} from '@angular/core';
import {PhoneConfigurationService} from 'src/app/services/phone-configuration.service';
import {PhoneService} from 'src/app/services/phone.service';
import {ToastrService} from 'ngx-toastr';
import {interval, Subscription} from 'rxjs';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {PhoneConfComponent} from './phone-conf/phone-conf.component';
import {Utility} from '../../../../../helpers/Utility';

@Component({
    selector: 'app-phone-details',
    templateUrl: './phone-details.component.html',
    styleUrls: ['./phone-details.component.css']
})
export class PhoneDetailsComponent implements OnInit, OnDestroy {

    basicInfo: any = [];
    lineInfo: any = [];
    networkConfig: any = [];
    detailsView = 'basic';
    phone: any;
    subscription: Subscription;
    subscriptionButton: Subscription;
    mosScoreSubscription: Subscription;
    imgSrc = 'assets/images/loading.gif';
    nonExecutionStatus: any = ['completed', 'failed'];
    enabledSync = false;
    enabledReboot = false;
    modalRef: BsModalRef;
    modalConfig: any = {backdrop: true, class: 'modal-dialog-centered modal-xl', ignoreBackdropClick: true};
    buttonDetails: any;
    captureText = 'Start Packet Capture';
    buttonClicked = false;
    mosScoreDetails: any = {};
    firmwareStatus: any = ['INITIATED', 'INPROGRESS', 'REBOOTING'];
    logLevels: string[] = ['EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG'];
    selectedLogType: string;
    enabledLoggingLevel = false;

    constructor(private phoneConfigurationService: PhoneConfigurationService,
                private phoneService: PhoneService,
                private toastr: ToastrService,
                private modalService: BsModalService) {
    }

    checkButtonStats() {
        let response = false;
        if (this.firmwareStatus.includes(this.basicInfo.firmwareUpgradeStatus)) {
            response = true;
        }
        return response;
    }

    refreshOnRunningActions() {
        if (this.detailsView === 'management') {
            this.getPhoneDetails(this.phone.id);
            // tslint:disable-next-line:triple-equals
            if (this.basicInfo.syncupState && this.basicInfo.syncupState == 'COMPLETED' && this.enabledSync) {
                this.toastr.success('Phone Sync successfully completed', 'Success');
                this.enabledSync = false;
            }
            // tslint:disable-next-line:triple-equals
            if (this.basicInfo.syncupState && this.basicInfo.syncupState == 'FAILED' && this.enabledSync) {
                this.toastr.error('Phone Sync failed to complete', 'Error');
                this.enabledSync = false;
            }

            // tslint:disable-next-line:triple-equals
            if (this.basicInfo.rebootStatus && this.basicInfo.rebootStatus == 'COMPLETED' && this.enabledReboot) {
                this.toastr.success('Phone Reboot successfully completed', 'Success');
                this.enabledReboot = false;
            }
            // tslint:disable-next-line:triple-equals
            if (this.basicInfo.rebootStatus && this.basicInfo.rebootStatus == 'FAILED' && this.enabledReboot) {
                this.toastr.success('Phone Reboot failed to completed', 'Error');
                this.enabledReboot = false;
            }
            if (this.basicInfo.loggingLevelStatus && this.enabledLoggingLevel) {
                // tslint:disable-next-line:triple-equals
                if (this.basicInfo.loggingLevelStatus == 'COMPLETED') {
                    this.toastr.success('Set Phone Logging Level successfully completed', 'Success');
                    // tslint:disable-next-line:triple-equals
                } else if (this.basicInfo.loggingLevelStatus == 'FAILED') {
                    this.toastr.success('Set Phone Logging Level failed to completed', 'Error');
                }
                this.enabledReboot = false;
            }
        }
    }

    refreshOnEasyButton() {
        if (this.detailsView === 'troubleshoot') {
            this.easyButtonDetails();
        }
    }

    hideModal() {
        this.phoneConfigurationService.phoneOperationsHide.emit();
    }

    ngOnInit() {
        this.selectedLogType = 'DEBUG';
        this.logLevels = Utility.sortListInAscendingOrderWithoutKey(this.logLevels);
        this.phone = this.phoneConfigurationService.getPhone();
        this.getPhoneDetails(this.phone.id);
        this.phoneConfigurationService.hideConfModal.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
        });
        this.subscription = interval(5000).subscribe(val => this.refreshOnRunningActions());
        this.subscriptionButton = interval(5000).subscribe(val => this.refreshOnEasyButton());
    }

    changeView(selected: string) {
        switch (selected) {
            case 'basic':
                this.detailsView = 'basic';
                break;
            case 'management':
                this.detailsView = 'management';
                this.checkButtonName();
                break;
            case 'network':
                this.detailsView = 'network';
                break;
            case 'troubleshoot':
                this.detailsView = 'troubleshoot';
                this.easyButtonDetails();
                break;
        }
    }

    checkValidButtonName() {
        let response = false;
        if (this.basicInfo.traceStatus) {
            if (this.basicInfo.traceStatus.includes('_') && !this.basicInfo.traceStatus.toLowerCase().includes('failed')) {
                response = true;
            }
        }
        return response;
    }

    checkButtonName() {
        if (this.basicInfo.traceStatus) {
            switch (this.basicInfo.traceStatus.toLowerCase()) {
                case 'completed':
                    this.captureText = 'Start Packet Capture';
                    if (this.buttonClicked) {
                        this.getLogs();
                    }
                    break;
                case 'stopped':
                case 'failed_to_start':
                    this.captureText = 'Start Packet Capture';
                    break;
                case 'yet_to_start':
                case 'initiated_start_trace':
                case 'started':
                case 'failed_to_stop':
                    this.captureText = 'Stop Packet Capture';
                    break;
            }
        } else {
            this.captureText = 'Start Packet Capture';
        }
    }

    getPhoneDetails(phoneId: any) {
        this.phoneService.getPhoneDetails(phoneId).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error getting phone details: ' + response.response.message, 'Error');
            } else {
                this.basicInfo = response.response.details.basicInfo;
                this.selectedLogType = (this.basicInfo.loggingLevel) ? this.basicInfo.loggingLevel : 'DEBUG';
                if (this.basicInfo.subModel != null) {
                    this.imgSrc = 'assets/images/phones/' + this.basicInfo.subModel + '.png';
                } else {
                    this.imgSrc = 'assets/images/phones/generic.png';
                }
                this.lineInfo = response.response.details.lineInfo;
                this.networkConfig = response.response.details.networkConfig;
                this.checkButtonName();
            }
        });
    }

    /**
     * trace capture
     */
    traceOperations() {
        if (Utility.userEnabled('ROLE_PHONE_PACKETCAPTURE')) {
            if (this.basicInfo.traceStatus) {
                switch (this.basicInfo.traceStatus.toLowerCase()) {
                    case 'completed':
                    case 'failed_to_start':
                    case 'failed_to_get':
                    case 'stopped':
                        this.checkButtonName();
                        this.startTraceCapture();
                        break;
                    case 'yet_to_start':
                    case 'initiated_start_trace':
                    case 'started':
                    case 'failed_to_stop':
                        this.checkButtonName();
                        this.stopTraceCapture();
                        break;
                }
            } else {
                this.checkButtonName();
                this.startTraceCapture();
            }
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    startTraceCapture() {
        this.phoneService.startCapture(this.phone).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error starting capture: ' + response.response.message, 'Error');
            } else {
                this.toastr.success(response.response.message, 'Success');
            }
            this.getPhoneDetails(this.phone.id);
        });
    }

    stopTraceCapture() {
        this.phoneService.stopCapture(this.phone).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error canceling capture: ' + response.response.message, 'Error');
            } else {
                this.toastr.success(response.response.message, 'Success');
            }
            this.getPhoneDetails(this.phone.id);
        });
    }

    getLogs() {
        this.phoneService.getLogs(this.phone).subscribe((response: any) => {
            const type = {type: 'application/octet-stream'};
            this.downloadFile(response, this.phone.name + '.pcap.zip', type);
        });
        this.buttonClicked = false;
    }

    getPacketCapture() {
        if (Utility.userEnabled('ROLE_PHONE_PACKETCAPTURE')) {
            this.phoneService.getPacketCapture(this.phone).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error acquiring packet capture: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success(response.response.message, 'Success');
                    this.buttonClicked = true;
                }
                this.getPhoneDetails(this.phone.id);
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * reboot phone
     */
    rebootPhone(): void {
        if (Utility.userEnabled('ROLE_PHONE_REBOOT')) {
            this.phoneService.rebootPhone(this.phone).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error rebooting phone: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success(response.response.message, 'Success');
                    this.enabledReboot = true;
                }
                this.getPhoneDetails(this.phone.id);
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * sync phone
     */
    syncPhoneConfig(): void {
        if (Utility.userEnabled('ROLE_PHONE_SYNC')) {
            this.phoneService.syncPhoneConfig(this.phone).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error syncing phone: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success(response.response.message, 'Success');
                    this.enabledSync = true;
                }
                this.getPhoneDetails(this.phone.id);
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * view phone config
     */
    singlePhoneConfig() {
        if (Utility.userEnabled('ROLE_PHONE_VIEWCONFIG')) {
            this.phoneConfigurationService.setViewType(true);
            this.phoneConfigurationService.setPhone(this.phone);
            this.modalRef = this.modalService.show(PhoneConfComponent, {
                backdrop: true,
                class: 'modal-dialog-centered modal-lg',
                ignoreBackdropClick: true
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * easy button
     */
    easyButton(): void {
        if (Utility.userEnabled('ROLE_PHONE_EASYBUTTON')) {
            this.phoneService.easyButton(this.phone).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success(response.response.message, 'Success');
                }
                this.easyButtonDetails();
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    easyButtonDetails(): void {
        this.phoneService.easyButtonDetails(this.phone).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error: ' + response.response.message, 'Error');
            } else {
                this.buttonDetails = response.response.easyButton;
            }
        });
    }

    /**
     * to initiate the MOS Score
     */
    initiateMOSScore(): void {
        if (Utility.userEnabled('ROLE_PHONE_MOSSCORE')) {
            this.phoneService.initiateMOSScore(this.phone.id).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success('Success: ' + response.response.message, 'Success');
                    this.mosScoreSubscription = interval(5000).subscribe(val => this.getMOSScoreDetails());
                }
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * get the MOS Score
     * interval of 5 sec
     */
    getMOSScoreDetails(): void {
        this.phoneService.getMOSScoreDetails(this.phone.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error: ' + response.response.message, 'Error');
            } else {
                if (response.response.phonedto) {
                    this.basicInfo = response.response.phonedto;
                    // tslint:disable-next-line:max-line-length
                    if (this.basicInfo.mosScoreStatus && (this.basicInfo.mosScoreStatus.toString().toUpperCase() === 'FAILED' || this.basicInfo.mosScoreStatus.toString().toUpperCase() === 'COMPLETED')) {
                        if (this.mosScoreSubscription) {
                            this.mosScoreSubscription.unsubscribe();
                        }
                    }
                }
            }
        });
    }

    multiplePhoneConfig() {
        this.phoneConfigurationService.setViewType(false);
        this.phoneConfigurationService.setPhone(this.phone);
        this.modalRef = this.modalService.show(PhoneConfComponent, this.modalConfig);
    }

    executionChecker(value: any) {
        let response = false;
        if (value != null) {
            if (this.nonExecutionStatus.includes(value.toLowerCase())) {
                response = true;
            }
        }
        return response;
    }

    downloadLogs(item: any) {
        this.phoneService.easyButtonLogs(item.macAddress).subscribe((response: any) => {
            const type = {type: 'application/octet-stream'};
            this.downloadFile(response, item.prtFileName, type);
        });
    }

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

    getColor(state: string) {
        if (state) {
            switch (state.toLowerCase()) {
                case 'completed':
                    return '#0E8B18';
                case 'failed':
                    return '#CB3333';
                default:
                    return '#7694B7';
            }
        }
    }

    getClass(value: any) {
        switch (value.toLowerCase()) {
            case 'completed':
                return 'fa fa-check';
            default:
                return 'fa fa-times';
        }
    }

    getStyle(value: any) {
        switch (value.toLowerCase()) {
            case 'completed':
                return 'green';
            default:
                return 'red';
        }
    }

    /**
     * start debugging with the select debug type
     */
    startDebugging(): void {
        this.phoneService.setDebugging(this.phone.id, this.selectedLogType).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error: ' + response.response.message, 'Error');
            } else {
            }
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.subscriptionButton) {
            this.subscriptionButton.unsubscribe();
        }
        if (this.mosScoreSubscription) {
            this.mosScoreSubscription.unsubscribe();
        }
    }
}
