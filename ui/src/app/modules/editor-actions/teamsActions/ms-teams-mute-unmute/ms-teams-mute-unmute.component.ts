import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/model/constant';
import { Phone } from 'src/app/model/phone';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-ms-teams-mute-unmute',
  templateUrl: './ms-teams-mute-unmute.component.html',
  styleUrls: ['./ms-teams-mute-unmute.component.css']
})
export class MsTeamsMuteUnmuteComponent implements OnInit {
  conversations: any = [];
  callMuteType: string[] = ['All'];
  actionToEdit: any = {};
  resourcesBk: any = [];
  conversationsWithResources: any = [];
  continueOnFailure: boolean = false;
  resources: any = [];
  selectedResource = '';
  selectedConversation = '';
  selectedCallType: string;
  subscription: Subscription;
  action: any;
  selectedPhone = []
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.selectedCallType = "";
    this.conversations = this.aeService.getConversations();
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    this.resourcesBk = this.aeService.getFilteredResources(['Phone'])
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedResource = this.actionToEdit.phone;
      this.selectedCallType = this.actionToEdit.value;
      this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.getDeviceDetailsByConversationId();
    }
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }
  /**
   * listen for change event on conversation ID select
   * @returns void
   */
  onChangeConversations(): void {
    // tslint:disable-next-line: triple-equals
    if (this.selectedConversation != '') {
      this.getDeviceDetailsByConversationId();
    }
    // check if the existing resource found in the that conversation resource or not
    if (this.actionToEdit) {
      // tslint:disable-next-line: triple-equals
      this.selectedResource = this.resources.filter(e => e.name == this.selectedResource).length > 0 ? this.selectedResource : '';
    }
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
    } 
    if (RESULT && RESULT['resources'] && RESULT['resources'].length > 0) {
      this.resources = [... new Set(this.resources.concat(RESULT['resources']))];
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
    let query = '';
    const item = {
      action: 'mute_participants',
      phone: this.selectedResource,
      value: this.selectedCallType,
      conversationName: this.selectedConversation,
      continueonfailure: this.continueOnFailure
    };
    // tslint:disable-next-line:max-line-length
    query = this.selectedConversation + '.' + this.selectedResource + '.' + 'muteParticipant("' + this.selectedCallType.toLowerCase() + '"';
    if (this.continueOnFailure != null) {
      query += `,"${this.continueOnFailure}"`;
    }
    query += `)`;
    this.action = { action: item, query: query };
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
