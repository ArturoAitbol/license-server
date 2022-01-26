import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhoneService } from 'src/app/services/phone.service';
import { interval, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuditLogsService } from '../../../../../services/audit-logs.service';

@Component({
    selector: 'app-vdm',
    templateUrl: './vdm.component.html',
    styleUrls: ['./vdm.component.css']
})
export class VdmComponent implements OnInit, OnDestroy {
    visualDeviceDetails: any;
    lcdDetails: any = undefined;
    callStateList: any[] = [];
    softKeys: any[] = [];
    phoneSubscription: Subscription;
    image: any = 'assets/images/loading.gif';
    imageBk: any;
    imagePhone = 'assets/images/loading.gif';
    spinnerImage: any = 'assets/images/loading.gif';
    imageClass: string;
    hostname: string;
    model: string;
    dnd: string;
    templateDND: string = 'No';
    displayName: string;
    dateFormate = '';
    timeFormate = '';
    speedDials: any = [];
    enhancedLines: any = [];
    speedDialsAsArray: any = [];
    auditLogs: any = [];
    templatesArray: any = [];
    selectedTemplate: any = {};
    selectedTemplateId: string = '';
    savedTemplate: any = { name: '', phoneId: '', dnd: 'No' };
    auditLogsHeader: any = ['Created at', 'Owner'];
    deviceSoftKeys: any = {};
    errorMessage: string;
    private phoneId: string;
    modalRef: BsModalRef;
    // subscriptions
    phoneLCDSubscription: Subscription;
    phoneConfigSubscription: Subscription;
    anyChangeSubscription: Subscription;
    // flags
    hasVisualDetails: boolean;
    isPhoneOffline: boolean;
    isVisualInfoStatusFailed: boolean;
    doesLCDFound: boolean;
    currentSubmodel: any;
    canViewAuditLogs: boolean;
    softKeysSelected: any = [];
    softKeysNoSelected: any = [];
    entriesList: any = [{ functionType: 'Speed Dial' }];
    selectAllUnSelectedSoftKeys = false;
    selectAllSelectedSoftKeys = false;
    configDetailsBk: any = {};
    showRestartIcon: boolean;
    $selectedIndex: number = -1;
    $selectedSoftKeysList: any = [];
    serverTime: string;

    // counter
    imageCounter: number;
    constructor(private phoneService: PhoneService,
        private auditLogsService: AuditLogsService,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastrService,
        private modalService: BsModalService) {
    }

    ngOnInit(): void {
        this.imageCounter = 0;
        this.model = localStorage.getItem('current-model-phone');
        this.serverTime = localStorage.getItem('server-time');
        this.imageClass = 'loading' + this.model;
        this.showRestartIcon = false;
        this.hasVisualDetails = false;
        this.isVisualInfoStatusFailed = false;
        this.isPhoneOffline = this.canViewAuditLogs = false;
        this.errorMessage = 'Fail to load the page.';
        this.initCallStates();
        this.initSoftKeys();
        this.route.paramMap.subscribe((paramMap: any) => {
            this.phoneId = paramMap.params.id;
            // save the phoneId & model details for save template
            this.savedTemplate.phoneId = this.phoneId;
            this.savedTemplate.model = this.model;
            this.initiatePhoneLCDDetails();
            // to get the VDM templates list
            // this.fetchTemplatesList();
            // this.getVDMAuditLogs();
            setTimeout(() => {
                this.initiateVisualConfig();
            }, 3000);

        });

        this.anyChangeSubscription = interval(5000).subscribe(() => {
            this.checkForAnyChanges();
        });
    }

    /**
     * check for any changes
     */
    checkForAnyChanges(): void {
        this.phoneService.vdmAnyChange(this.serverTime, this.phoneId).subscribe((response: any) => {
            this.isPhoneOffline = response.phoneReboot;
            if (response.phoneReboot) {
                this.imageClass = 'loading' + this.model;
                this.image = null;
                this.isPhoneOffline = this.showRestartIcon = response.phoneReboot;
                this.imageCounter++;
            } else if (this.imageCounter >= 1 && !response.phoneReboot) {
                this.image = this.imageBk;
                this.imageClass = 'model' + this.model;
                this.isPhoneOffline = this.showRestartIcon = response.phoneReboot;
            }
        });

    }
    /**
     * to initiate phone information
     * @return void
     */
    initiateVisualConfig(): void {
        this.hasVisualDetails = false;
        this.isVisualInfoStatusFailed = false;
        this.phoneService.initiateVisualConfig(this.phoneId).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error(response.response.message, 'Error');
            } else {
                this.getPhoneConfigDetails();
            }
        });
    }

    /**
     * get phone config details
     */
    getPhoneConfigDetails(): void {
        this.phoneConfigSubscription = interval(3000).subscribe(() => {
            this.phoneService.getVisualConfigDetails(this.phoneId).subscribe((response: any) => {
                // tslint:disable-next-line:max-line-length
                if (response.response.visualDeviceConfigDetails && (response.response.visualDeviceConfigDetails.visualDeviceConfigStatus.toString().toUpperCase() === 'COMPLETED' || response.response.visualDeviceConfigDetails.visualDeviceConfigStatus.toString().toUpperCase() === 'FAILED')) {
                    this.configDetailsBk = this.visualDeviceDetails = response.response.visualDeviceConfigDetails;
                    this.phoneConfigSubscription.unsubscribe();
                    this.deviceSoftKeys = this.visualDeviceDetails.softKeysData;
                    this.speedDials = this.visualDeviceDetails.speedDialsData;

                    this.enhancedLines = this.visualDeviceDetails.enhancedLineData;
                    this.enhancedLines.forEach((enhancedLine: any) => {
                        if (enhancedLine.functionType === 'sd') {
                            enhancedLine.functionType = 'Speed Dial';
                        }
                    });
                    if (this.deviceSoftKeys.length > 0) {
                        this.loadSelectedSofKeys();
                    }
                    this.hostname = this.visualDeviceDetails.hostName;
                    this.displayName = this.visualDeviceDetails.displayName;
                    // this.model = this.visualDeviceDetails.model;
                    this.dnd = this.visualDeviceDetails.dnd;
                    this.dateFormate = this.visualDeviceDetails.dateFormate != null ? this.visualDeviceDetails.dateFormate : '';
                    this.timeFormate = this.visualDeviceDetails.timeFormate != null ? this.visualDeviceDetails.timeFormate : '';
                }
            });
        });
    }

    /**
     * initiate phone LCD Details
     */
    initiatePhoneLCDDetails(): void {
        this.phoneService.initiateVisualLCD(this.phoneId).subscribe((response: any) => {
            if (this.isPhoneOffline) {
                this.showRestartIcon = true;
            } else if (!response.success) {
                this.showRestartIcon = false;
                this.image = null;
                this.imageClass = 'loading' + this.model;
                // this.toastService.error(response.response.message, 'Error');
                if (this.phoneLCDSubscription) {
                    this.phoneLCDSubscription.unsubscribe();
                }
            } else {
                // tslint:disable-next-line:triple-equals
                if (response.response.phone.visualDeviceStatus != 'INITIATED') {
                    this.toastService.error('Error acquiring phone information', 'Error');
                } else {
                    this.lcdDetails = {};
                    this.getPhoneLCDDetails();
                }
            }
        });
    }

    /**
     * get phone LCD Details
     */
    getPhoneLCDDetails(): void {
        this.phoneLCDSubscription = interval(1000).subscribe(() => {
            this.phoneService.getVisualLCD(this.phoneId).subscribe((response: any) => {
                if (response.response.visualDeviceDetails &&
                    (response.response.visualDeviceDetails.visualDeviceStatus.toString().toUpperCase() === 'COMPLETED' ||
                        response.response.visualDeviceDetails.visualDeviceStatus.toString().toUpperCase() === 'FAILED')) {
                    this.lcdDetails = response.response.visualDeviceDetails;
                    this.hostname = this.lcdDetails.hostName;
                    // this.model = this.lcdDetails.model;
                    if (this.lcdDetails.vdFile) {
                        this.doesLCDFound = true;
                        const b64File = this.lcdDetails.vdFile;
                        const blobFile = this.b64toBlob(b64File, 'image/png', 512);
                        const reader = new FileReader();
                        reader.onload = (e: Event) => {
                            this.imageBk = this.image = reader.result;
                            this.imageClass = 'model' + this.model;
                        };
                        reader.readAsDataURL(blobFile);
                    } else {
                        this.image = null;
                        this.doesLCDFound = false;
                    }
                    this.phoneLCDSubscription.unsubscribe();
                }
            });
        });
    }

    /**
     * navigate to phone configuration tab
     */
    backToPhones(): void {
        this.router.navigateByUrl('/phoneConfiguration');
    }

    /**
     * base64 to blob conversion
     * @param b64Data:any
     * @param contentType:any
     * @param sliceSize:number
     */
    b64toBlob(b64Data: any, contentType: any, sliceSize: number) {
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
        return new Blob(byteArrays, { type: contentType });
    }

    /**
     * initiate Call States
     */
    initCallStates(): void {
        this.callStateList = [
            {
                callState: 'Idle_Key_List',
                name: 'Idle',
                softKeys: [
                    { value: 'em_login', name: 'Sign In' },
                    { value: 'acd_login', name: 'Agent Sign In' },
                    { value: 'acd_logout', name: 'Agent Sign Out' },
                    { value: 'astate', name: 'Agent Status' },
                    { value: 'avail', name: 'Avail' },
                    { value: 'unavail', name: 'Unavail' },
                    { value: 'redial', name: 'Redial' },
                    { value: 'recents', name: 'Recents' },
                    { value: 'cfwd', name: 'Forward' },
                    { value: 'dnd', name: 'DND' },
                    { value: 'lcr', name: 'Call Rtn' },
                    { value: 'pickup', name: 'PickUp' },
                    { value: 'gpickup', name: 'GrPickup' },
                    { value: 'unpark', name: 'Unpark' },
                    { value: 'em_logout', name: 'Sign out' },
                    { value: 'guestin', name: 'Guest Login' },
                    { value: 'guestout', name: 'Guest Logout' },
                    { value: 'callretrieve', name: 'Retrieve' },
                    { value: 'bridgein', name: 'Bridge In' }
                ]
            },
            {
                callState: 'Missed_Call_Key_List',
                name: 'Missed Call',
                softKeys: [
                    { value: 'lcr|1', name: 'Call Rtn' },
                    { value: 'back|3', name: 'Back' },
                    { value: 'miss|4', name: 'Miss' }
                ]
            },
            {
                callState: 'Off_Hook_Key_List',
                name: 'Off Hook',
                softKeys: [
                    { value: 'option', name: 'Option' },
                    { value: 'redial', name: 'Redial' },
                    { value: 'cancel', name: 'Cancel' },
                    { value: 'dir', name: ' Dir' },
                    { value: 'cfwd', name: 'Forward' },
                    { value: 'dnd', name: 'DND' },
                    { value: 'lcr', name: 'Call Rtn' },
                    { value: 'unpark', name: 'Unpark' },
                    { value: 'pickup', name: 'PickUp' },
                    { value: 'gpickup', name: 'GrPickup' }
                ]
            },
            {
                callState: 'Dialing_Input_Key_List',
                name: 'Dialing Input Key',
                softKeys: [{ value: 'option|1', name: 'Option' }, { value: 'call|2', name: 'Call' }, {
                    value: 'Delchar|3',
                    name: 'delChar'
                }, { value: 'cancel|4', name: 'Cancel' }]
            },
            { callState: 'Progressing_Key_List', name: 'Progressing', softKeys: [{ value: 'endcall|2', name: 'End call' }] },
            {
                callState: 'Connected_Key_List',
                name: 'Connected',
                softKeys: [{ value: 'hold|1', name: 'Hold' }, { value: 'endcall|2', name: 'End call' }, {
                    value: 'conf|3',
                    name: 'Conference'
                }, { value: 'xfer|4', name: 'Transfer' }, { value: 'Bxfer', name: 'BlindXfer' }, {
                    value: 'confLx',
                    name: 'Conf line'
                }, { value: 'xferLx', name: 'Xfer line' }, { value: 'park', name: 'Call Park' }, {
                    value: 'phold',
                    name: 'PrivHold'
                }, { value: 'crdstart', name: 'Record' }, { value: 'crdpause', name: 'PauseRec' }, {
                    value: 'crdresume',
                    name: 'ResumeRec'
                }, { value: 'crdstop', name: 'StopRec' }, { value: 'dnd', name: 'DND' }]
            },
            {
                callState: 'Start-Xfer_Key_List',
                name: 'Start Transfer',
                softKeys: [{ value: 'hold|1', name: 'Hold' }, { value: 'endcall|2', name: 'End call' }, {
                    value: 'xfer|3',
                    name: 'Transfer'
                }, { value: 'dnd', name: 'DND' }]
            },
            {
                callState: 'Start-Conf_Key_List',
                name: 'Start Conference',
                softKeys: [{ value: 'hold|1', name: 'Hold' }, { value: 'endcall|2', name: 'End call' }, {
                    value: 'conf|3',
                    name: 'Conference'
                }, { value: 'dnd', name: 'DND' }]
            },
            {
                callState: 'Conferencing_Key_List',
                name: 'Conferencing',
                softKeys: [
                    { value: 'hold|1', name: 'Hold' },
                    { value: 'endcall|2', name: 'End call' },
                    { value: 'join|4', name: 'Join' },
                    { value: 'Phold', name: 'PrivHold' },
                    { value: 'Crdstart|5', name: 'Record' },
                    { value: 'crdpause|5', name: 'PauseRec' },
                    { value: 'Crdresume|5', name: 'ResumeRec' },
                    { value: 'Crdstop|6', name: 'StopRec' },
                    { value: 'dnd', name: 'DND' }]
            },
            { callState: 'Releasing_Key_List', name: 'Releasing', softKeys: [{ value: 'endcall|2', name: 'End call' }] },
            {
                callState: 'Hold_Key_List',
                name: 'Hold',
                softKeys: [{ value: 'resume|1', name: 'Resume' }, { value: 'endcall|2', name: 'End call' }, {
                    value: 'newcall|3',
                    name: 'New Call'
                }, { value: 'redial', name: 'Redial' }, { value: 'dir', name: 'Dir' }, { value: 'cfwd', name: 'Forward' }, {
                    value: 'dnd',
                    name: 'DND'
                }, { value: 'callpush', name: 'Call push' }]
            },
            {
                callState: 'Ringing_Key_List',
                name: 'Ringing',
                softKeys: [{ value: 'answer|1', name: 'Answer' }, { value: 'ignore|2', name: 'Decline' }, {
                    value: 'ignoresilent|3',
                    name: 'Ignore'
                }]
            },
            {
                callState: 'Shared_Active_Key_List',
                name: 'Shared Active',
                softKeys: [{ value: 'newcall|1', name: 'New call' }, { value: 'barge|2', name: 'Barge' }, {
                    value: 'bargesilent|3',
                    name: 'BargeSilent'
                }, { value: 'cfwd|4', name: 'Forward' }, { value: 'dnd|5', name: 'DND' }]
            },
            {
                callState: 'Shared_Held_Key_List',
                name: 'Shared Held',
                softKeys: [{ value: 'resume|1', name: 'Resume' }, { value: 'barge|2', name: 'Barge' }, {
                    value: 'cfwd|3',
                    name: 'Forward'
                }, { value: 'dnd|4', name: 'DND' }]
            }
        ];
    }

    /**
     * set the soft keys to softKeys array
     */
    initSoftKeys(): void {
        this.softKeys = this.callStateList[0].softKeys;
    }

    /**
     * call state
     * @param callStateRequest:string
     */
    selectCallState(callStateRequest: string): void {
        this.callStateList.forEach(callState => {
            // tslint:disable-next-line:triple-equals
            if (callState.callState == callStateRequest) {
                this.softKeys = callState.softKeys;
            }
        });
    }

    /**
     * on select all option
     * @param type: string
     */
    onSelectAll(type: string): void {
        if (type === 'selectedSoftKeys') {
            this.softKeys.forEach((softKey: any) => {
                if (softKey.saved) {
                    softKey.selected = this.selectAllSelectedSoftKeys;
                }
            });
        } else if (type === 'unSelectedSoftKeys') {
            this.$selectedSoftKeysList = [];
            this.softKeys.forEach((softKey: any) => {
                if (softKey.saved) {
                    this.$selectedSoftKeysList.push(softKey);
                }
                // assign the select all value to all the soft keys in the unselected/available list
                softKey.selected = this.selectAllUnSelectedSoftKeys;
                // allow only when select all is true and saved is false
                if (!softKey.saved && this.selectAllUnSelectedSoftKeys) {
                    // softKey.selected = this.selectAllUnSelectedSoftKeys;
                    this.$selectedSoftKeysList.push(softKey);
                }
            });
        }
    }

    /**
     * load selected soft keys
     */
    loadSelectedSofKeys(): void {
        this.callStateList.forEach((callState, index = 0) => {
            let counter = 0;
            callState.softKeys.forEach(softKey => {
                this.deviceSoftKeys[index].softKeys.forEach(element => {
                    // tslint:disable-next-line:triple-equals
                    if (softKey.value == element.value) {
                        softKey.saved = true;
                        softKey.index = counter++;
                    }
                });
            });
        });
    }

    loadSpeedDials() {
        for (let index = 0; index < 9; index++) {
            // tslint:disable-next-line:triple-equals
            if (this.speedDials[index].index != index + 1) {
                const speed = {
                    name: '',
                    number: '',
                    index: (index + 1).toString()
                };
                this.speedDials.push(speed);
                this.speedDials.sort((a, b) => a.index > b.index ? 1 : -1);
            }
        }
    }

    /**
     * make a service call
     */
    onRefresh(): void {
        this.imageCounter = 0;
        if (!this.isPhoneOffline) {
            this.toastService.success('Phone screen refreshed successfully', 'Success');
            this.image = this.spinnerImage;
        } else {
            this.image = null;
        }
        this.imageClass = 'loading' + this.model;
        // this.hostname = this.model = null;
        this.showRestartIcon = this.doesLCDFound = false;
        // this.initiateVisualConfig();
        this.initiatePhoneLCDDetails();
    }

    /**
     * save configuration changes
     */
    saveConfigurations(actionName: string): void {
        const config: any = this.visualDeviceDetails;
        delete (config.vdFile);
        config.displayName = this.displayName;

        if (actionName === 'displayName') {
            // tslint:disable-next-line: max-line-length
            config.hostName = config.speedDialsData = config.softKeysData = config.dnd = config.dateFormate = config.timeFormate = config.enhancedLineData = null;
        } else if (actionName === 'dnd') {
            config.dnd = this.dnd;
            // tslint:disable-next-line:max-line-length
            config.hostName = config.speedDialsData = config.softKeysData = config.displayName = config.dateFormate = config.timeFormate = config.enhancedLineData = null;
        } else if (actionName === 'enhancedLines') {
            this.enhancedLines.forEach((enhancedLine: any) => {
                if (enhancedLine.functionType === 'Speed Dial') {
                    enhancedLine.functionType = 'sd';
                }
            });
            config.enhancedLineData = this.enhancedLines;
            // tslint:disable-next-line:max-line-length
            config.hostName = config.speedDialsData = config.softKeysData = config.dnd = config.displayName = config.dateFormate = config.timeFormate = null;
        } else if (actionName === 'softKeys') {
            config.softKeysData = this.callStateList;
            // tslint:disable-next-line:max-line-length
            config.hostName = config.speedDialsData = config.displayName = config.dnd = config.dateFormate = config.timeFormate = config.enhancedLineData = null;
        } else if (actionName === 'speedDials') {
            config.speedDialsData = this.speedDials;
            // tslint:disable-next-line:max-line-length
            config.hostName = config.softKeysData = config.displayName = config.dnd = config.dateFormate = config.timeFormate = config.enhancedLineData = null;
        }
        this.phoneService.applyVisualConfigs(config).subscribe((response: any) => {
            if (!response.success) {
                if (response.response.message && !response.response.message.toString().toLowerCase().includes('already')) {
                    this.toastService.error('Error applying configurations: ' + response.response.message, 'Error');
                } else if (response.message && !response.message.toString().toLowerCase().includes('already')) {
                    this.toastService.error('Error applying configurations: ' + response.message, 'Error');
                } else if (response.message && response.message.toString().toLowerCase().includes('already')) {
                    this.toastService.warning(response.message, 'Warning');
                } else if (response.response.message && response.response.message.toString().toLowerCase().includes('already')) {
                    this.toastService.warning(response.response.message, 'Warning');
                }
            } else {
                this.enhancedLines.forEach((enhancedLine: any) => {
                    if (enhancedLine.functionType === 'sd') {
                        enhancedLine.functionType = 'Speed Dial';
                    }
                });
                this.toastService.success(response.response.message, 'Success');
            }
        });
    }



    /**
     * filter the soft keys that are not selected
     */
    softKeysNoSelectedRefresh() {
        this.softKeysNoSelected = this.softKeys.filter(softKey => !softKey.saved);
        return this.softKeysNoSelected;
    }

    /**
     * filter the soft keys that are selected
     */
    softKeysSelectedRefresh() {
        this.softKeysSelected = this.softKeys.filter(softKey => softKey.saved).sort((a, b) => a.index > b.index ? 1 : -1);
        return this.softKeysSelected;
    }

    /**
     * save the selected soft keys
     */
    saveSoftKeys(): void {
        // let position = this.softKeysSelected.length;
        this.$selectedSoftKeysList.forEach((e, i) => {
            e.index = i;
        });
        this.softKeys.forEach(softKey => {
            // if (softKey.selected) {
            //     delete softKey.selected;
            //     softKey.saved = true;
            // softKey.index = position++;
            // }
            this.$selectedSoftKeysList.forEach(key => {
                if (key.value == softKey.value) {
                    delete softKey.selected;
                    softKey.saved = true;
                    softKey.index = key.index;
                }
            });
        });
        this.softKeysNoSelectedRefresh();
        this.softKeysSelectedRefresh();
        this.selectAllSelectedSoftKeys = this.selectAllUnSelectedSoftKeys = false;
    }

    /**
     * un-save the soft keys
     */
    unsaveSoftKeys(): void {
        this.softKeys.forEach(softKey => {
            if (softKey.selected) {
                delete softKey.selected;
                delete softKey.saved;
                delete softKey.index;
            }
        });
        this.$selectedSoftKeysList = [];
        this.softKeysSelected.forEach((element, index = 0) => {
            this.softKeys.forEach(softKey => {
                // tslint:disable-next-line:triple-equals
                if (softKey == element) {
                    softKey.index = index++;
                }
            });
        });
        this.softKeysNoSelectedRefresh();
        this.softKeysSelectedRefresh();
        this.selectAllUnSelectedSoftKeys = this.selectAllSelectedSoftKeys = false;
    }

    /**
     * listen for changes made by check-box in un selected soft keys
     * @param softKey: any
     */
    onChangeUnSelectedSoftKeys(softKey: any): void {
        if (softKey.selected) {
            if (this.$selectedSoftKeysList.findIndex(e => e.value == softKey.value) == -1) {
                this.$selectedSoftKeysList.push(softKey);
            }
        } else if (!softKey.selected) {
            const indexValue = this.$selectedSoftKeysList.findIndex(e => e.value == softKey.value);
            this.$selectedSoftKeysList.splice(indexValue, 1);
        }
        // tslint:disable-next-line: triple-equals
        this.selectAllUnSelectedSoftKeys = this.softKeysNoSelected.every(key => key.selected == true);
    }

    /**
     * listen for changes made by check-box in selected soft keys
     * @param softKey: any
     */
    onChangeSelectedSoftKeys(softKey: any): void {
        // tslint:disable-next-line: triple-equals
        this.selectAllSelectedSoftKeys = this.softKeysSelected.every(key => key.selected == true);
    }

    /**
     * to move the soft keys to top
     */
    upSoftKey(): void {
        let softKeyChoosed;
        if (this.softKeysSelected.filter(element => element.selected).length != 1) {
            this.toastService.warning('Select just one softkey please', 'Warning');
        } else {
            softKeyChoosed = this.softKeysSelected.find(element => element.selected);
            if (softKeyChoosed.index > 0) {
                var itemMove = this.softKeysSelected[softKeyChoosed.index];
                this.softKeysSelected[softKeyChoosed.index] = this.softKeysSelected[softKeyChoosed.index - 1];
                this.softKeysSelected[softKeyChoosed.index - 1] = itemMove;
                this.softKeysSelected.forEach((item, index = 0) => {
                    item.index = index++;
                });
            }
        }
    }

    /**
     * to move soft keys to bottom
     */
    downSoftKey(): void {
        let softKeyChoosed;
        if (this.softKeysSelected.filter(element => element.selected).length != 1) {
            this.toastService.warning('Select just one softkey please', 'Warning');
        } else {
            softKeyChoosed = this.softKeysSelected.find(element => element.selected);
            if (softKeyChoosed.index < this.softKeysSelected.length - 1) {
                var itemMove = this.softKeysSelected[softKeyChoosed.index];
                this.softKeysSelected[softKeyChoosed.index] = this.softKeysSelected[softKeyChoosed.index + 1];
                this.softKeysSelected[softKeyChoosed.index + 1] = itemMove;
                this.softKeysSelected.forEach((item, index = 0) => {
                    item.index = index++;
                });
            }
        }
    }

    /**
     * apply changes to the date-format
     */
    applyChangesDate(): void {
        const config: any = this.visualDeviceDetails;
        delete (config.vdFile);
        config.dateFormate = this.dateFormate;
        config.timeFormate = this.timeFormate;
        // set other keys as null while making service call
        config.softKeysData = config.speedDialsData = config.displayName = config.dnd = null;
        this.phoneService.applyVisualConfigs(config).subscribe((response: any) => {
            if (!response.success) {
                if (response.response.message && !response.response.message.toString().toLowerCase().includes('already')) {
                    this.toastService.error('Error applying configurations: ' + response.response.message, 'Error');
                } else if (response.message && !response.message.toString().toLowerCase().includes('already')) {
                    this.toastService.error('Error applying configurations: ' + response.message, 'Error');
                } else if (response.message && response.message.toString().toLowerCase().includes('already')) {
                    this.toastService.warning(response.message, 'Warning');
                } else if (response.response.message && response.response.message.toString().toLowerCase().includes('already')) {
                    this.toastService.warning(response.response.message, 'Warning');
                }
            } else {
                this.toastService.success(response.response.message, 'Success');
            }
        });
    }

    /**
     * open modal with screen
     * @param template: TemplateRef
     */
    openModal(template: TemplateRef<any>) {
        const classType = 'modal-dialog-centered modal-xl';
        this.modalRef = this.modalService.show(template,
            Object.assign({}, { class: classType })
        );
    }

    /**
     * get audit log details by phoneId
     */
    getVDMAuditLogs(): void {
        this.auditLogsService.getAuditLogs(this.phoneId, 'VDM').subscribe((response: any) => {
            this.auditLogs = response.response.auditLogs;
            this.auditLogs.forEach(e => {
                const data = e['actionDescription'].split('|');
            });
        });
    }

    /**
     * on view audit logs
     */
    onViewAuditLogs(): void {
        this.canViewAuditLogs = !this.canViewAuditLogs;
    }

    ngOnDestroy(): void {
        localStorage.removeItem('server-time');
        if (this.phoneSubscription) {
            this.phoneSubscription.unsubscribe();
        }
        if (this.phoneLCDSubscription) {
            this.phoneLCDSubscription.unsubscribe();
        }

        if (this.phoneConfigSubscription) {
            this.phoneConfigSubscription.unsubscribe();
        }
        if (this.anyChangeSubscription) {
            this.anyChangeSubscription.unsubscribe();
        }

    }
}
