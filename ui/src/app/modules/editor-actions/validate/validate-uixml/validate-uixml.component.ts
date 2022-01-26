import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { Constants } from 'src/app/model/constant';
import { ConversationName } from 'src/app/helpers/conversation-name';

@Component({
  selector: 'app-validate-uixml',
  templateUrl: './validate-uixml.component.html',
  styleUrls: ['./validate-uixml.component.css']
})
export class ValidateUixmlComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  expression = '';
  operators: any = ['==', '<=', '>=', '<', '>', '!='];
  operator = '';
  value = '';
  continueOnFailure = false;
  actionToEdit: any = {};
  resourceKeyList: string[];
  selectedResourceKey: string;
  selectedResource: string;
  widgets: any = [];
  polyWidgetsList: any = [
    'CStatusWidget',
    'CLocalStatusWidget',
    'CPolyCallMgr',
    'CLineKeyWidget',
    'CPolySoftkey',
    'CPolyFocusedCallView'
  ];
  selectedWidget: string;
  position: string;
  validateTypesArray: any[];
  // validateTypes: string[] = ['Missed Call', 'Line Label', 'BLF - Presence', 'BLF - State', 'Soft Key'];
  validateTypes: string[] = ['Missed Call', 'Line Label', 'BLF - Presence', 'BLF - State', 'Soft Key', 'Message Waiting', 'BLF - Call Park', 'Date & Time', 'ACD Agent State']

  // validateTypesBK: string[] = ['Missed Call', 'Line Label', 'Caller ID', 'BLF - Presence', 'BLF - State', 'Soft Key'];
  validateTypesBK: string[] = ['Caller ID', 'Missed Call', 'Line Label', 'BLF - Presence', 'BLF - State', 'Soft Key', 'Message Waiting', 'BLF - Call Park', 'Date & Time', 'ACD Agent State', 'Speed Dial']

  validateWebexType = ['Caller ID', 'HuntGroup Caller ID'];
  validateTeamsType =['Caller ID'];
  // validateYealinkType = ['Soft Key', 'Message Waiting', 'BLF - Call Park', 'Date & Time', 'ACD Agent State']
  validateYealinkType = ['Missed Call', 'Line Label', 'BLF - Presence', 'BLF - State', 'Soft Key', 'Speed Dial'];


  selectedValidateType: string;
  states: string[] = ['Idle', 'Busy', 'Offering'];
  acdStates: string[] = ['Sign-in', 'signout', 'unavailable', 'incoming call/ringing', 'connected', 'hold', 'Available', 'Wrap-up'];
  selectedState: string;
  selectedACDState: string;
  selectedResourceLine: string;
  selectedFindBy: string;
  callerNumber: string;
  ledstatus = 'none';
  modes: any = ['Idle', 'Ringing', 'CallOut', 'Talking', 'Park'];
  // tslint:disable-next-line:max-line-length
  flash: any = ['Slower', 'Faster', 'Lighting'];
  selectedMode1: string;
  callerName: string;
  selectedFlashType: string;
  selectedPhoneObj: any = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
  public selectedVendor: any = [];
  selectedType: string;
  huntGroupName: string;
  checkAbsence: boolean;
  selectedConversation: string = '';
  conversations: any = [];
  conversationsWithResources: any = [];
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.checkAbsence = false;
    this.huntGroupName = '';
    this.selectedType = '';
    this.selectedFlashType = this.selectedMode1 = '';
    this.selectedResourceKey = '';
    this.selectedResource = '';
    this.selectedWidget = '';
    this.selectedValidateType = '';
    this.selectedFindBy = 'Line Key';
    this.selectedState = '';
    this.callerName = '';
    this.callerNumber = '';
    this.widgets = [...this.polyWidgetsList];
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.conversations = this.aeService.getConversations();
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    this.resources = this.aeService.getFilteredResources(['Phone'])
      .filter((e: Phone) => e.model.toLowerCase() === Constants.Webex.toLowerCase() || e.vendor.toLowerCase() === Constants.Polycom.toLowerCase() || e.vendor.toLowerCase() === Constants.Yealink.toLowerCase()||e.vendor.toUpperCase() === Constants.MS.toUpperCase() && e.model.toUpperCase() === Constants.MS_TEAMS.toUpperCase());
    this.resourceKeyList = this.aeService.getUiXMLResourceKeys();
    if (this.actionToEdit) {
      if (this.actionToEdit.conversationName && !this.actionToEdit.line) {
        // tslint:disable-next-line: max-line-length
        this.selectedConversation = this.actionToEdit.conversationName ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
        this.getDeviceDetailsByConversationId();
    } else if (!this.actionToEdit.conversationName && this.actionToEdit.line) {
        this.selectedConversation = '';
    }
      this.checkAbsence = JSON.parse(this.actionToEdit.filter);
      this.value = this.actionToEdit.value;
      this.selectedResource = this.actionToEdit.phone;
      this.selectedMode1 = this.actionToEdit.selectedMode1;
      this.selectedFlashType = this.actionToEdit.selectedFlashType;
      // tslint:disable-next-line: triple-equals
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.selectedResourceKey = this.actionToEdit.resultIn;
      this.selectedValidateType = this.actionToEdit.calltype;
      if (this.selectedValidateType) {
        this.onSelectResource(this.selectedResource);
      }
      this.position = (this.actionToEdit.prefix) ? this.actionToEdit.prefix : '';
      this.selectedResourceLine = (this.actionToEdit.line) ? this.actionToEdit.line : this.actionToEdit.value;
      if (this.actionToEdit.line) {
        this.selectedFindBy = 'Line Key';
      } else {
        this.selectedFindBy = 'Display Name';
      }
      if (this.actionToEdit.callerName) {
        this.callerName = this.actionToEdit.callerName;
      }
      if (this.actionToEdit.callerNumber) {
        this.callerNumber = this.actionToEdit.callerNumber;
      }
      this.selectedType = this.actionToEdit.dialingType;
      this.huntGroupName = this.actionToEdit.configurationParameter;
      this.resources.some(resource => {
        if (this.selectedResource == resource.name) {
          this.selectedPhoneObj = resource;
          return true;
        }
      });
      if (this.selectedPhoneObj.model && this.selectedPhoneObj.model.toLowerCase() === Constants.Webex.toLowerCase()) {
        this.validateTypes = this.validateWebexType;
      } else {
        this.validateTypes = this.validateTypesBK;
      }
      if (this.actionToEdit.command) {
        const _values = this.actionToEdit.command.toString().split(',');
        this.selectedMode1 = _values[0];
        this.selectedFlashType = _values[1];
      }
      this.ledstatus = this.actionToEdit.ledstatus;
      this.selectedState = this.actionToEdit.callstate;
      this.selectedACDState = this.actionToEdit.value;
      // tslint:disable-next-line: triple-equals
      if (!this.resourceKeyList.some(e => e == this.actionToEdit.resultIn)) {
        this.selectedResourceKey = '';
      }
    }
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    let item: any = {};
    let query = '';
    if (this.selectedPhoneObj.model && this.selectedPhoneObj.model.toLowerCase() == Constants.Webex.toLowerCase()) {
      item = {
        action: 'validate_ui_xml',
        phone: this.selectedResource,
        resultIn: null,
        calltype: this.selectedValidateType,
        dialingType: this.selectedType,
        configurationParameter: (this.selectedValidateType === 'HuntGroup Caller ID' && this.huntGroupName != '') ? this.huntGroupName : null,
        continueonfailure: null,
        selectedMode1: null,
        selectedFlashType: null,
        ledstatus: null,
        command: null,
        prefix: null,
        line: null,
        value: null,
        callstate: null,
        callerName: (this.callerName != '') ? this.callerName : null,
        callerNumber: null,
        filter: null
      };
      query = `${this.selectedResource}.validateUi(validate=="${this.selectedValidateType}",type=="${this.selectedType}"`;
      if (this.huntGroupName && this.huntGroupName !== '') {
        query += `,huntGroup=="${this.huntGroupName}"`;
      }
      if (this.callerName && this.callerName !== '') {
        query += `,name=="${this.callerName}"`;
      }
      if (this.callerNumber && this.callerNumber !== '' && this.disableNumberFieldForWebex()) {
        item.callerNumber = this.callerNumber;
        query += `,number=="${this.callerNumber}"`;
      }
      query += `)`;

    } else if(this.selectedPhoneObj.vendor.toUpperCase() === Constants.MS.toUpperCase() && this.selectedPhoneObj.model.toUpperCase() === Constants.MS_TEAMS.toUpperCase()) {
      item = {
        action: 'validate_ui_xml',
        phone: this.selectedResource,
        calltype: this.selectedValidateType,
        dialingType: this.selectedType,
        conversationName: (this.selectedConversation != '') ? this.selectedConversation : ConversationName.NO_CONVERSATION,
        continueonfailure: null,
        selectedMode1: null,
        selectedFlashType: null,
        ledstatus: null,
        command: null,
        prefix: null,
        line: null,
        value: null,
        callstate: null,
        callerName: (this.callerName != '') ? this.callerName : null,
        callerNumber: null,
        filter: null

      };
      query = `${this.selectedResource}.validateUi(validate=="${this.selectedValidateType}",type=="${this.selectedType}"`;
      if (this.callerName && this.callerName !== '') {
        query += `,name=="${this.callerName}"`;
      }
      if (this.callerNumber && this.callerNumber !== '' && this.disableNumberFieldForWebex()) {
        item.callerNumber = this.callerNumber;
        query += `,number=="${this.callerNumber}"`;
      }
      query += `)`;

    } else {
      item = {
        action: 'validate_ui_xml',
        phone: this.selectedResource,
        resultIn: this.selectedResourceKey,
        calltype: this.selectedValidateType,
        continueonfailure: this.continueOnFailure,
        selectedMode1: this.selectedMode1,
        selectedFlashType: this.selectedFlashType,
        ledstatus: this.ledstatus,
        command: (this.selectedPhoneObj.vendor.toLowerCase() === 'yealink') ? this.selectedMode1 + ',' + this.selectedFlashType : null,
        prefix: null,
        line: null,
        value: null,
        callstate: null,
        callerName: null,
        callerNumber: null,
        filter: String(this.checkAbsence)
      };
      query = `${this.selectedResource}`;
      if (this.selectedResourceKey)
        query += `.${this.selectedResourceKey}`;
      query += `.validateUi(validate=="${this.selectedValidateType}"`;
      switch (this.selectedValidateType) {
        case 'BLF - Call Park':
        case 'BLF - Presence': {
          item.line = (this.selectedFindBy === 'Line Key') ? this.selectedResourceLine : null;
          item.value = (this.selectedFindBy === 'Display Name') ? this.selectedResourceLine : this.value;
          // tslint:disable-next-line: max-line-length
          const findByType = (this.selectedFindBy === 'Line Key') ? `line=="${this.selectedResourceLine}"` : `displayName=="${this.selectedResourceLine}"`;
          if (this.selectedValidateType === 'BLF - Presence') {
            query += `,${findByType},"${this.continueOnFailure}","${this.checkAbsence}")`;
          } else {
            query += `,${findByType},"${this.continueOnFailure}")`;
          } break;
        }
        case 'Speed Dial': {
          item.line = (this.selectedFindBy === 'Line Key') ? this.selectedResourceLine : null;
          item.value = (this.selectedFindBy === 'Display Name') ? this.selectedResourceLine : this.value;
          const findByType = (this.selectedFindBy === 'Line Key') ? `line=="${this.selectedResourceLine}"` : `displayName=="${this.selectedResourceLine}"`;
          if (this.selectedValidateType === 'Speed Dial') {
            query += `,${findByType},"${this.continueOnFailure}","${this.checkAbsence}")`;
          } else {
            query += `,${findByType},"${this.continueOnFailure}")`;
          } break;
        }
        case 'BLF - State': {
          item.line = (this.selectedFindBy === 'Line Key') ? this.selectedResourceLine : null;
          item.value = (this.selectedFindBy === 'Display Name') ? this.selectedResourceLine : this.value;
          item.callstate = this.selectedState;
          item.continueonfailure = this.continueOnFailure;
          item.ledstatus = this.ledstatus;
          item.command = (this.selectedPhoneObj.vendor.toLowerCase() === 'yealink') ? this.selectedMode1 + ',' + this.selectedFlashType : null;
          item.selectedMode1 = this.selectedMode1;
          item.selectedFlashType = this.selectedFlashType;
          // tslint:disable-next-line: max-line-length
          const findByType = (this.selectedFindBy === 'Line Key') ? `line=="${this.selectedResourceLine}"` : `displayName=="${this.selectedResourceLine}"`;
          query += `,${findByType},state=="${this.selectedState}","color="${this.ledstatus}", mode="${this.selectedMode1},flash="${this.selectedFlashType}","${this.continueOnFailure}")`;
          break;
        }
        case 'Caller ID': {
          item.callerName = this.callerName;
          item.callerNumber = this.callerNumber;
          if (this.callerName && this.callerName !== '') {
            query += `,name=="${this.callerName}"`;
          }
          if (this.callerNumber && this.callerNumber !== '') {
            item.callerNumber = this.callerNumber;
            query += `,number=="${this.callerNumber}"`;
          }
          query += `,"${this.continueOnFailure}")`;
          break;
        }
        case 'Message Waiting': query += `,"${this.continueOnFailure}")`;
          break;
        case 'Soft Key':
          item.value = this.value;
          query += `,softkey=="${this.value}"`;
          if (this.position && this.position !== '') {
            item.prefix = this.position;
            query += `,position=="${this.position}"`;
          }
          query += `,"${this.continueOnFailure}","${this.checkAbsence}")`;
          break;
        case 'ACD Agent State': {
          item.value = this.selectedACDState;
          item.continueonfailure = this.continueOnFailure;
          // tslint:disable-next-line: max-line-length

          query += `,state=="${this.selectedACDState}","${this.continueOnFailure}")`;
          break;
        }
        default:
          item.value = this.value;
          if (this.selectedValidateType === 'Line Label') {
            query += `,value=="${this.value}","${this.continueOnFailure}","${this.checkAbsence}")`;
          } else if (this.selectedValidateType === 'Missed Call') {
            // Check if check absence if false, so we have value input field
            if (!this.checkAbsence) {
              query += `,value=="${this.value}","${this.continueOnFailure}","${this.checkAbsence}")`;
            } else {
              item.value = '';
              // if check absence if true, we don't have value input field
              query += `,"${this.continueOnFailure}","${this.checkAbsence}")`;
            }
          } else {
            query += `,value=="${this.value}","${this.continueOnFailure}")`;
          }
          break;
      }
    }
    this.action = { action: item, query: query };
  }

  onSelectResource(value: string) {
    if (value == undefined || value == '') {
      this.selectedPhoneObj = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
    } else if (value) {
      this.selectedPhoneObj = this.resources.filter(e => e.name === value)[0];
    }
    // if (this.selectedPhoneObj.model.toLowerCase() === Constants.Webex.toLowerCase()) {
    //   this.validateTypesArray = this.validateWebexType;
    // } else if (this.selectedPhoneObj.vendor.toLowerCase() == Constants.Yealink.toLowerCase()) {
    //   this.validateTypesArray = this.validateYealinkType;
    // } else {
    //   this.validateTypesArray = this.validateTypesBK;
    // }
    switch (this.selectedPhoneObj.vendor.toLowerCase()) {
      case 'cisco':
        if (this.selectedPhoneObj.model.toLowerCase() === Constants.Webex.toLowerCase()) {
          this.selectedFindBy = 'Line Key';
          this.validateTypesArray = this.validateWebexType;
        }
        break;
      case 'polycom':
        this.selectedFindBy = 'Display Name';
        this.validateTypesArray = this.validateTypesBK;
        break;
      case 'yealink':
        this.selectedFindBy = 'Line Key';
        this.validateTypesArray = this.validateYealinkType;
        break;
      case 'microsoft':
        this.validateTeamsType = this.validateTeamsType;
      default:
        this.selectedFindBy = 'Line Key';
        this.validateTypesArray = this.validateTypesBK;
        break;
    }
  }

  onChangeFindBy(): void {
    this.selectedResourceLine = '';
  }
  /**
   * on change type dropdown
   * @param value: string 
   */
  onChangeType(value: string): void {

  }
  onChangeConversations(): void {
    // tslint:disable-next-line: triple-equals
    if (this.selectedConversation != '') {
        this.getDeviceDetailsByConversationId();
    }
}
getDeviceDetailsByConversationId(): void {
  // tslint:disable-next-line: triple-equals
  const RESULT = this.conversationsWithResources.filter(e => e.conversationName == this.selectedConversation)[0];
}
  onChangeValidateType(event: any): void {
    this.value = '';
    this.selectedState = '';
    this.position = '';
    this.selectedResourceLine = '';
    this.callerName = '';
    this.callerNumber = '';
    this.huntGroupName = '';
  }
  /**
   * show second row where value and continue on failure based on the condition
   */
  canDisplaySecondRow(): boolean {
    return this.selectedValidateType != '' &&
      this.selectedValidateType !== 'HuntGroup Caller ID' &&
      this.selectedValidateType !== 'Caller ID' &&
      this.selectedValidateType != 'Soft Key' &&
      !this.selectedValidateType.includes('BLF') &&
      this.selectedValidateType !== 'ACD Agent State' &&
      this.selectedValidateType !== 'Speed Dial';
  }
  /**
   * check condition to enable Check Absence
   */
  canEnableCheckAbsence(): boolean {
    return this.selectedValidateType === 'Soft Key' ||
      this.selectedValidateType === 'Missed Call' ||
      this.selectedValidateType === 'Line Label' ||
      this.selectedValidateType === 'BLF - Presence' ||
      this.selectedValidateType === 'Speed Dial';
  }
  /**
   * disable Number field when Webex is the resource when type is Call History
   */
  disableNumberFieldForWebex(): boolean {
    return !(this.selectedValidateType === 'Caller ID' &&
      this.selectedType !== '' && this.selectedType === 'Call History' &&
      this.selectedPhoneObj.model && this.selectedPhoneObj.model.toLowerCase() === Constants.Webex.toLowerCase());
  }
  /**
   * Enable Value input field based on condition
   */
  enableValueInputField(): boolean {
    switch (this.selectedValidateType) {
      // hide value input field if the validate type is Message Waiting 
      case 'Message Waiting': return false;
      // hide value input field if the validate type is Missed Call and Check Absence is true
      case 'Missed Call': return !this.checkAbsence;
      default: return true;
    }
  }
  /**
   * check condition to enable Check Feature
   */
  canEnableCheckFeature(): boolean {
    return this.selectedValidateType === 'Missed Call';
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
