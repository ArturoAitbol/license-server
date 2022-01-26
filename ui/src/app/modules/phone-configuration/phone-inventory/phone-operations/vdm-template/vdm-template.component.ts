import { Component, OnInit, ViewEncapsulation, TemplateRef, OnDestroy } from '@angular/core';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PhoneService } from 'src/app/services/phone.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Subscription, interval } from 'rxjs';
import { Utility } from 'src/app/helpers/Utility';

@Component({
  selector: 'app-vdm-template',
  templateUrl: './vdm-template.component.html',
  styleUrls: ['./vdm-template.component.css']
})
export class VdmTemplateComponent implements OnInit, OnDestroy {
  config: any = {};
  selectedTemplate: any = {};
  private deviceSoftKeys: any = {};
  savedTemplate: any = { name: '', phoneId: '', dnd: 'No' };
  configDetailsBk: any = { timeFormate: '', dateFormate: '', dnd: 'No', displayName: '' };
  modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-md', ignoreBackdropClick: true };

  private currentPop: any;
  phones: any = [];
  phonesFromStorage: any = [];
  totalPortions: number;
  templatesArray: any = [];
  phoneNamesList: any = [{ id: 'all', name: 'All' }];
  phoneInventoryColumns: any = [];
  selectedPhonesList: string[] = [];
  callStateList: any[] = [];
  softKeys: any[] = [];
  speedDials: any = [];
  enhancedLines: any = [];

  originalBodyHeight: any = '200px';
  bodyHeight: any = '200px';

  dnd: string;
  displayName: string;
  dateFormate: string;
  timeFormate: string;
  description: string;
  selectedTemplateId: string;
  phoneModel: string;
  selectedFailure: string;
  private serverTime: string;

  private _isLinkStatusUp: boolean;
  selectAllUnSelectedSoftKeys: boolean;
  selectAllSelectedSoftKeys: boolean;

  modalRef: BsModalRef;
  phoneListsubscription: Subscription;
  checkChangeSubscription: Subscription;

  softKeysSelected: any = [];
  softKeysNoSelected: any = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private phoneService: PhoneService,
    private toastService: ToastrService,
    private modalService: BsModalService) {

  }
  ngOnInit() {
    this.dnd = this.description = '';
    this.selectedTemplateId = this.displayName = '';
    this.dateFormate = '';
    this.timeFormate = '';
    this.selectAllUnSelectedSoftKeys = this.selectAllSelectedSoftKeys = false;
    this.phonesFromStorage = JSON.parse(localStorage.getItem('current-phone-template'));
    this.phoneNamesList = this.phoneNamesList.concat(this.phonesFromStorage);
    this.initGridProperties();
    this.initCallStates();
    this.initSoftKeys();
    this.initSpeedDials();
    this.getWidthPortions();
    this.route.paramMap.subscribe((paramMap: any) => {
      this.savedTemplate.model = this.phoneModel = paramMap.params.model.split('-')[1];
      this.fetchTemplatesList();
      const phoneIds: string[] = this.phonesFromStorage.map((item: any) => item.id);
      this.phoneService.fetchPhonesListForTemplate(phoneIds).subscribe((response: any) => {
        if (!response.success) {
        } else {
          this._isLinkStatusUp = response.linkStatus;
          this.phones = response.response.vdmTemplateDetails;
          this.serverTime = response.serverTime;
        }
      });
      this.checkChangeSubscription = interval(5000).subscribe(() => {
        // this.loadSelectedPhones();
        this.checkAvailableUpdate();
      });
    });
  }

  initGridProperties() {
    this.phoneInventoryColumns = [
      { field: 'name', header: 'Name', width: 5, suppressHide: false, filter: '' },
      { field: 'macAddress', header: 'MAC', width: 8, suppressHide: false, filter: '' },
      { field: 'ipAddress', header: 'IP Address', width: 8, suppressHide: false, filter: '' },
      { field: 'vendor', header: 'Vendor', width: 5, suppressHide: false, filter: '' },
      { field: 'model', header: 'Model', width: 5, suppressHide: false, filter: '' },
      { field: 'phoneState', header: 'onPOINT Connection', width: 8, suppressHide: false, filter: '' },
      { field: 'applyChangesStatus', header: 'Template Status', width: 8, suppressHide: false, filter: '' },
      { field: '_', header: '', width: 5, suppressHide: true, suppressSort: true }
    ];
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
          { value: 'em_login', name: 'Sign in' },
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
          { value: 'bridgein', name: 'Bridge in' }
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

  initSpeedDials(): void {
    this.speedDials = [];
    for (let i = 1; i <= 8; i++) {
      const speed = {
        name: '',
        number: '',
        index: (i + 1).toString()
      };
      this.speedDials.push(speed);
    }
    // this.speedDials.sort((a, b) => a.index > b.index ? 1 : -1);
  }

  /**
   * assign width
   * @param column: any
   */
  getColumnWidth(column: any) {
    return (column.width * 100 / this.totalPortions) + '%';
  }

  getWidthPortions() {
    this.totalPortions = 0;
    this.phoneInventoryColumns.forEach((column: any) => {
      if (!column.hidden) {
        this.totalPortions += column.width;
      }
    });
  }

  /**
   * popover placement
   * @param item: any
   */
  getPlacement(item: any) {
    if (this.phones.indexOf(item) >= (this.phones.length - 2)) {
      return 'top';
    }
    return 'bottom';
  }

  /**
   * close the old popover if exist
   * @param popover: any
   */
  closeOldPop(popover: any) {
    if (this.currentPop && this.currentPop !== popover) {
      this.currentPop.hide();
    }
    this.currentPop = popover;
  }

  /**
   * set color
   * @param state: string
   */
  getColor(state: string) {
    if (state) {
      switch (state.toLowerCase()) {
        case 'available':
        case 'completed':
          return '#0E8B18';
        case 'offline':
        case 'failed':
          return '#CB3333';
        case 'initiated':
        case 'inprogress':
        case 'unavailable':
          return '#7694B7';
      }
    }
  }

  /**
   *   navigate to visual device management page
   * @param phone: any
   */
  visualDeviceManagement(phone?: any) {
    // display error message when link is down
    if (!this._isLinkStatusUp) {
      this.toastService.error(Utility.LINK_IS_DOWN_MSG, 'Error');
    } else {
      if (Utility.userEnabled('ROLE_PHONE_VDM')) {
        localStorage.setItem('current-model-phone', this.phoneModel);
        this.router.navigate(['/phoneConfiguration/' + phone.phoneId + '/vdm']);
      } else {
        this.toastService.warning('User doesn\'t have permissions to execute this action', 'Warning');
      }
    }
  }

  /**
   * service call to check for changes
   */
  checkAvailableUpdate() {
    this.phoneService.getUpdateStatus(this.serverTime).subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error('Error on phone refresh service', 'Error');
      } else {
        this._isLinkStatusUp = response.linkStatus;
        if (response.response.changesAvalable) {
          const phoneIds: string[] = this.phonesFromStorage.map((item: any) => item.id);
          if (phoneIds && phoneIds.length > 0) {
            this.phoneService.fetchPhonesListForTemplate(phoneIds).subscribe((res: any) => {
              if (!res.success) {
              } else {
                this.phones = res.response.vdmTemplateDetails;
                // tslint:disable-next-line: max-line-length triple-equals
                const statusList = this.phones.filter((phone: any) => (phone.applyChangesStatus && (phone.applyChangesStatus.toString().toUpperCase() == 'COMPLETED' || phone.applyChangesStatus.toString().toUpperCase() == 'FAILED')));
                if (statusList.length > 0) {
                  this.phoneListsubscription.unsubscribe();
                }
              }
            });
          }
        }
      }
    });
  }

  /**
   * service call to load selected phones from phone inventory by sending phoneIds
   */
  loadSelectedPhones(): void {
    const phoneIds: string[] = this.phonesFromStorage.map((item: any) => item.id);
    if (phoneIds && phoneIds.length > 0) {
      this.phoneListsubscription = interval(2000).subscribe(() => {
        this.phoneService.fetchPhonesListForTemplate(phoneIds).subscribe((response: any) => {
          if (!response.success) {
          } else {
            this.phones = response.response.vdmTemplateDetails;
            this.serverTime = response.serverTime;
            // tslint:disable-next-line: max-line-length triple-equals
            const statusList = this.phones.filter((phone: any) => (phone.applyChangesStatus && (phone.applyChangesStatus.toString().toUpperCase() == 'COMPLETED' || phone.applyChangesStatus.toString().toUpperCase() == 'FAILED')));
            if (statusList.length > 0) {
              this.phoneListsubscription.unsubscribe();
            }
          }
        });
      });
    } else {
      this.phoneListsubscription.unsubscribe();
    }
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
      this.softKeys.forEach((softKey: any) => {
        if (!softKey.saved) {
          softKey.selected = this.selectAllUnSelectedSoftKeys;
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
    let position = this.softKeysSelected.length;
    this.softKeys.forEach(softKey => {
      if (softKey.selected) {
        delete softKey.selected;
        softKey.saved = true;
        softKey.index = position++;
      }
    });
    this.softKeysNoSelectedRefresh();
    this.softKeysSelectedRefresh();
    this.selectAllUnSelectedSoftKeys = false;
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
    this.selectAllSelectedSoftKeys = false;
  }

  /**
   * listen for changes made by check-box in un selected soft keys
   * @param softKey: any
   */
  onChangeUnSelectedSoftKeys(softKey: any): void {
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
      this.toastService.error('Select just one softkey please', 'Warning');
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
      this.toastService.error('Select just one softkey please', 'Warning');
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
   * on view apply change failure reason
   * @param item: any
   */
  onClickFailureReason(template: any, item: any): void {
    this.selectedFailure = item.applyChangesFailureReason;
    if (this.selectedFailure !== '') {
      this.modalRef = this.modalService.show(template, this.modalConfig);
    }
  }

  /**
   * save template details
   */
  saveTemplateConfigurations(): void {
    const config: any = {};
    config.displayName = this.displayName;
    config.dnd = this.dnd;
    config.timeFormate = this.timeFormate;
    config.dateFormate = this.dateFormate;
    config.softKeysData = this.callStateList;
    config.speedDialsData = this.speedDials;
    config.enhancedLineData = null;
    config.phoneVDMIds = this.phones.map((item: any) => item.vdmId);

    this.phoneService.saveVDMTemplateConfigDetails(config).subscribe((response: any) => {
      if (!response.success) {
        if (response.response.message) {
          this.toastService.error('Error applying configurations: ' + response.response.message, 'Error');
        } else if (response.message) {
          this.toastService.error('Error applying configurations: ' + response.message, 'Error');
        }
      } else {
        this.toastService.success(response.response.message, 'Success');
        this.loadSelectedPhones();
      }
    });
  }

  /**
   *  on change template drop-down
   */
  onChangeTemplate(): void {
    // reset softkey on change template
    this.initCallStates();
    this.initSoftKeys();
    if (this.selectedTemplateId !== '') {
      this.selectedTemplate = this.templatesArray.filter((template: any) => template.id === this.selectedTemplateId)[0];
      this.getTemplateConfigDetails();
    } else if (this.selectedTemplateId === '') {
      // this.displayName = this.configDetailsBk.displayName;
      // this.dnd = this.configDetailsBk.dnd;
      // this.timeFormate = this.configDetailsBk.timeFormate;
      // this.dateFormate = this.configDetailsBk.dateFormate;
      // this.description = '';
      // this.initSpeedDials();
      this.resetFormFields();
    }
  }

  /**
   * on select apply change drop-down
   */
  onChangeSelectedPhones(data: any[]): void {
    // tslint:disable-next-line: triple-equals
    const len = data.filter(e => e.id == 'all').length;
    if (len > 0) {
      this.selectedPhonesList = this.phones.map((item: any) => item.vdmId);
    } else {
      this.selectedPhonesList = data.map((item: any) => item.vdmId);
    }
  }

  /**
   * fetch the respective template config details
   */
  getTemplateConfigDetails(): void {
    this.phoneService.getVDMTemplateConfigDetails(this.selectedTemplateId).subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error('Error while fetching VDM template config details: ' + response.response.message, 'Error');
      } else {
        this.configDetailsBk = response.response.visualDeviceConfigDetails;
        // tslint:disable-next-line: max-line-length
        this.displayName = (response.response.visualDeviceConfigDetails.displayName != null) ? response.response.visualDeviceConfigDetails.displayName : '';
        // this.model = this.visualDeviceDetails.model;
        // tslint:disable-next-line: max-line-length
        this.dateFormate = response.response.visualDeviceConfigDetails.dateFormate != null ? response.response.visualDeviceConfigDetails.dateFormate : '';
        // tslint:disable-next-line: max-line-length
        this.timeFormate = response.response.visualDeviceConfigDetails.timeFormate != null ? response.response.visualDeviceConfigDetails.timeFormate : '';
        // tslint:disable-next-line: max-line-length
        this.dnd = (response.response.visualDeviceConfigDetails.dnd != null) ? response.response.visualDeviceConfigDetails.dnd : 'No';
        // tslint:disable-next-line: max-line-length
        this.description = (response.response.visualDeviceConfigDetails.description != null) ? response.response.visualDeviceConfigDetails.description : '';
        this.deviceSoftKeys = response.response.visualDeviceConfigDetails.softKeysData;
        // load soft keys data, when data exist
        if (this.deviceSoftKeys.length > 0) {
          this.loadSelectedSofKeys();
        }
        this.speedDials = response.response.visualDeviceConfigDetails.speedDialsData;
        // check for speed-dials, else load with default
        if (this.speedDials == null || this.speedDials.length === 0) {
          this.initSpeedDials();
        }
      }
    });
  }

  /**
   * delete selected VDM
   */
  onDeleteTemplate(): void {
    this.phoneService.deleteVDMTemplate(this.selectedTemplateId).subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error('Error while deleting VDM template: ' + response.response.message, 'Error');
      } else {
        this.selectedTemplateId = '';
        this.selectedTemplate = {};
        this.fetchTemplatesList();
        this.toastService.success(response.response.message, 'Success');
        if (this.modalRef) {
          this.modalRef.hide();
        }
      }
    });
  }

  resizeBody(option: string) {
    if (option === 'open') {
      this.bodyHeight = (document.getElementById('modalBody').offsetHeight + 250).toString() + 'px';
    } else {
      this.bodyHeight = 'auto';
    }
  }

  /**
   * save the template name
   */
  saveTemplateDetails(): void {
    if (this.selectedTemplateId === '') {
      const data = this.savedTemplate;
      data.timeFormate = this.timeFormate;
      data.dateFormate = this.dateFormate;
      data.dnd = this.dnd;
      data.displayName = this.displayName;
      data.description = this.description;
      data.softKeysData = this.callStateList;
      data.speedDialsData = this.speedDials;
      let _checkForSoftKeysChanges = true;
      // tslint:disable-next-line: triple-equals
      const _checkForSpeedDialChanges = !this.speedDials.some(e => e.number && e.name != '');
      loop: for (let index = 0; index < this.callStateList.length; index++) {
        const element = this.callStateList[index]['softKeys'].filter((e: any) => e.saved);
        if (element.length > 0) {
          _checkForSoftKeysChanges = false;
          break loop;
        }
      }
      // tslint:disable-next-line: max-line-length  triple-equals
      if (data.timeFormate != '' || data.dateFormate != '' || data.dnd != '' || data.displayName != '' || !_checkForSoftKeysChanges || !_checkForSpeedDialChanges) {
        this.phoneService.saveVDMTemplate(data).subscribe((response: any) => {
          if (!response.success) {
            this.toastService.error('Error while saving VDM template: ' + response.response.message, 'Error');
          } else {
            this.toastService.success(response.response.message, 'Success');
            this.resetFormFields();
            this.fetchTemplatesList();
          }
        });
      } else {
        this.toastService.warning('Select any one field is mandatory', 'Warning');
      }
    } else {
      this.saveTemplateConfigurations();
    }
  }

  /**
   * fetch all the VDM templates list
   */
  fetchTemplatesList(): void {
    this.phoneService.getVDMTemplatesList(this.savedTemplate).subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error('Error while fetching VDM template lists: ' + response.response.message, 'Error');
      } else {
        this.templatesArray = response.response.vdmTemplates;
      }
    });
  }


  /**
   * navigate back to phones
   */
  backToPhones(): void {
    this.router.navigateByUrl('/phoneConfiguration');
  }

  /**
   * reset the form fields
   */
  resetFormFields(): void {
    this.timeFormate = '';
    this.dateFormate = '';
    this.dnd = '';
    this.displayName = '';
    this.description = '';
    this.savedTemplate.name = '';
    this.initCallStates();
    this.initSpeedDials();
  }

  ngOnDestroy(): void {
    if (this.phoneListsubscription) {
      this.phoneListsubscription.unsubscribe();
    }

    if (this.checkChangeSubscription) {
      this.checkChangeSubscription.unsubscribe();
    }
  }

}
