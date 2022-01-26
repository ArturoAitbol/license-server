import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-webex-call-pickup',
  templateUrl: './webex-call-pickup.component.html',
  styleUrls: ['./webex-call-pickup.component.css']
})
export class WebexCallPickupComponent implements OnInit {

  action: any;
  subscription: Subscription;
  resources: any = [];
  selectedPhone: any = '';
  selectedToPhone: any = '';
  actionToEdit: any = {};
  conversations: any = [];
  selectedConversation = '';
  resourcesBk: any = [];
  allResources: any = [];
  fromResources: any = [];
  conversationsWithResources: any = [];
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    this.conversations = this.aeService.getConversations();
    this.resources = this.resourcesBk = this.aeService.getFilteredResources(['Phone'])
      .filter((e: any) => e.model.toString().toUpperCase() === Constants.Webex);
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      // tslint:disable-next-line: max-line-length
      this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
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
    }
    // check if the existing resource found in the that conversation resource or not
    if (this.actionToEdit) {
      // tslint:disable-next-line: triple-equals
      this.selectedPhone = this.resources.filter(e => e.name == this.selectedPhone).length > 0 ? this.selectedPhone : '';
      // this.selectedToPhone = this.allResources.filter(e => e.name == this.selectedToPhone).length > 0 ? this.selectedToPhone : '';
    }
  }

  /**
   * cancel modal
   */
  cancel() {
    this.aeService.cancelAction.emit();
  }

  /**
   * insert action
   */
  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
    const index = this.conversationsWithResources.findIndex(e => e['conversationName'] == this.selectedConversation);
    const data = this.conversationsWithResources[index];
    this.conversationsWithResources[index] = data;
    this.aeService.setConversationsWithUsers = this.conversationsWithResources;
  }

  /**
   * create action
   */
  createAction() {
    const item = {
      action: 'callPickup',
      phone: this.selectedPhone,
      conversationName: this.selectedConversation,
      continueonfailure: this.continueOnFailure
    };
    let query = this.selectedConversation + '.' + this.selectedPhone + '.callPickup(';
    if( this.continueOnFailure !=null){
      query += `"${this.continueOnFailure}"`;
    } 
    query += ')';
    this.action = { action: item, query: query };
  }

  /**
 * check whether the resource already exist in the conversation resources or not
 */
  checkWhetherResourceAleadyExist(): boolean {
    // tslint:disable-next-line: triple-equals
    return (this.conversationsWithResources.filter(e => e.name == this.selectedToPhone).length > 0) ? true : false;
  }


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
