import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Constants } from 'src/app/model/constant';
import { Phone } from 'src/app/model/phone';

@Component({
  selector: 'app-merge-call',
  templateUrl: './merge-call.component.html',
  styleUrls: ['./merge-call.component.css']
})
export class MergeCallComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = '';
  actionToEdit: any = {};
  conversations: any = [];
  selectedConversation: string;
  resourcesBk: any;
  conversationsWithResources: any = [];
  details: any = [];
  selectedIntermediateConv: string;
  continueOnFailure: boolean = false;
  selectedCategoryObj: any;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.selectedCategoryObj = JSON.parse(localStorage.getItem('selectedCategory'));
    if (this.selectedCategoryObj.category === Constants.WEBEX_ACTIONS_CATEGORY) {
      this.resourcesBk = this.aeService.getFilteredResources(['Phone'])
        .filter((e: Phone) => e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() && e.model && e.model.toLowerCase() === Constants.Webex.toLowerCase());
    } else {
      this.resourcesBk = this.aeService.getFilteredResources(['Phone'])
        .filter((e: Phone) => e.vendor.toLowerCase() === Constants.MS.toLowerCase() && e.model && e.model.toLowerCase() === Constants.MS_TEAMS.toLowerCase());
    }
    this.selectedConversation = '';
    this.selectedIntermediateConv = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    // this.resourcesBk = this.aeService.getFilteredResources(['Phone'])
    //   .filter(e => e.vendor.toLowerCase() === 'cisco' && e.model && e.model.toLowerCase() === 'webex-teams');
    this.conversations = this.aeService.getConversations();
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      // tslint:disable-next-line: max-line-length
      this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
      this.selectedIntermediateConv = this.actionToEdit.intermediateConvName;
      this.getDeviceDetailsByConversationId();
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
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
      if (this.selectedCategoryObj.category === Constants.WEBEX_ACTIONS_CATEGORY) {
        RESULT['resources'] = this.aeService.getFilteredResources(['Phone'])
          .filter((e: Phone) => e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() && e.model && e.model.toLowerCase() === Constants.Webex.toLowerCase());
      } else {
        RESULT['resources'] = this.aeService.getFilteredResources(['Phone'])
          .filter((e: Phone) => e.vendor.toLowerCase() === Constants.MS.toLowerCase() && e.model && e.model.toLowerCase() === Constants.MS_TEAMS.toLowerCase());
      }

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
    }
    // check if the existing resource found in the that conversation resource or not
    if (this.actionToEdit) {
      // tslint:disable-next-line: triple-equals
      this.selectedPhone = this.resources.filter(e => e.name == this.selectedPhone).length > 0 ? this.selectedPhone : '';
    }
  }

  cancel() {
    localStorage.removeItem('selectedCategory');
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    localStorage.removeItem('selectedCategory');
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    const item = {
      action: (this.selectedCategoryObj.category === Constants.WEBEX_ACTIONS_CATEGORY) ? 'merge_call' : 'msft_merge_call',
      phone: this.selectedPhone,
      conversationName: this.selectedConversation,
      intermediateConvName: this.selectedIntermediateConv,
      continueonfailure: this.continueOnFailure
    };
    this.addIntermediateResourcesToConversation();
    // tslint:disable-next-line: max-line-length
    let query = this.selectedConversation + '.' + this.selectedPhone + '.mergeCall(' + this.selectedIntermediateConv;
    if (this.continueOnFailure != null) {
      query += `,"${this.continueOnFailure}"`;
    }
    query += ')';
    this.action = { action: item, query: query };
  }
  /**
    * to add the intermediate resource to the selected conversation id
    */
  private addIntermediateResourcesToConversation(): void {
    // tslint:disable-next-line: triple-equals
    const RESULT = this.conversationsWithResources.filter(e => e.conversationName == this.selectedConversation)[0];
    if (RESULT) {
      const fromResource = this.resourcesBk.filter(e => e.name == RESULT['from'])[0];
      this.details.push(fromResource);
      const toResource = this.resourcesBk.filter(e => e.name == RESULT['to'])[0];
      this.details.push(toResource);
    }

    if (this.details.length > 0) {
      this.conversationsWithResources.forEach(e => {
        if (e.conversationName == this.selectedIntermediateConv) {
          if (e['resources']) {
            e['resources'] = [...new Set(e['resources'].concat(this.details))];
          } else {
            e['resources'] = this.details;
          }
        }
      });
      this.aeService.setConversationsWithUsers = this.conversationsWithResources;
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
