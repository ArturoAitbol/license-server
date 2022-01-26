import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { ConversationName } from 'src/app/helpers/conversation-name';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-validate-mic',
  templateUrl: './validate-mic.component.html',
  styleUrls: ['./validate-mic.component.css']
})
export class ValidateMicComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any = [];
  selectedPhone: string;
  selectedPhoneObj: any = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
  micState = 'mute';
  actionToEdit: any = {};
  conversations: any = [];
  selectedConversation: string;
  resourcesBk: any;
  conversationsWithResources: any = [];
  continueOnFailure: boolean = false;

  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.selectedPhone = '';
    this.selectedConversation = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.conversations = this.aeService.getConversations();
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    this.resources = this.resourcesBk = this.aeService.getFilteredResources(['Phone'])
      .filter((e: Phone) => (e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() && e.model.toUpperCase() === Constants.Webex.toUpperCase()) || (e.vendor.toUpperCase() === Constants.MS.toUpperCase() && e.model.toUpperCase() === Constants.MS_TEAMS.toUpperCase()))
    if (this.actionToEdit) {
      if (this.actionToEdit.conversationName) {
        // tslint:disable-next-line: max-line-length
        this.selectedConversation = this.actionToEdit.conversationName ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
        this.getDeviceDetailsByConversationId();
      }
      this.selectedPhone = this.actionToEdit.phone;
      this.micState = this.actionToEdit.callstate;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.resources.some(resource => {
        if (this.selectedPhone == resource.name) {
          this.selectedPhoneObj = resource;
          return true;
        }
      });
    }
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  /**
   * get resources based on selected conversation ID
   * @returns void
   */
  getDeviceDetailsByConversationId(): void {
    // tslint:disable-next-line: triple-equals
    const RESULT = this.conversationsWithResources.filter(e => e.conversationName == this.selectedConversation)[0];
    if (RESULT) {
      // tslint:disable-next-line: triple-equals
      this.resources = this.resourcesBk.filter(e => e.name == RESULT.from || e.name == RESULT.to);
    } if (RESULT && RESULT['resources'] && RESULT['resources'].length > 0) {
      this.resources = [... new Set(this.resources.concat(RESULT['resources']))];
    }
  }

  /**
   * listen for change event on conversation ID select
   * @returns void
   */
  onChangeConversations(): void {
    // tslint:disable-next-line: triple-equals
    if (this.selectedConversation != '') {
      this.getDeviceDetailsByConversationId();
    } else {
      this.resources = this.resourcesBk;
    }
    // check if the existing resource found in the that conversation resource or not
    if (this.actionToEdit) {
      // tslint:disable-next-line: triple-equals
      this.selectedPhone = this.resources.filter(e => e.name == this.selectedPhone).length > 0 ? this.selectedPhone : '';
    }
  }


  createAction() {
    const item = {
      action: 'validate_mic',
      phone: this.selectedPhone,
      callstate: this.micState,
      conversationName: (this.selectedConversation !== '') ? this.selectedConversation : ConversationName.NO_CONVERSATION,
      continueonfailure: this.continueOnFailure
    };
    let query = '';
    if (this.selectedConversation !== '') {
      query += this.selectedConversation + '.';
    }
    query += `${this.selectedPhone}.validateMic(micState=='${this.micState}'`;
    if (this.continueOnFailure != null) {
      query += `,"${this.continueOnFailure}"`;
    }
    query += ')';
    this.action = { action: item, query: query };
  }

  /**
   * on select resource
   * @param value:string
   */
  onSelectPhone(value: string) {
    if (value == undefined || value == '') {
      this.selectedPhoneObj = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
    } else if (value) {
      this.selectedPhoneObj = this.resources.filter(e => e.name === value)[0];
    }
  }

  onSelectLine(value: any) {
  }


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
