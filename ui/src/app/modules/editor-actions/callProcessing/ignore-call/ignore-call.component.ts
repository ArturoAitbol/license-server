import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';
import { Phone } from 'src/app/model/phone';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-ignore-call',
  templateUrl: './ignore-call.component.html',
  styleUrls: ['./ignore-call.component.css']
})
export class IgnoreCallComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = '';
  public title: string = '';
  actionToEdit: any = {};
  conversations: any = [];
  selectedConversation: string = '';
  resourcesBk: any;
  conversationsWithResources: any = [];
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    this.resourcesBk = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => (e.vendor.toString().toLowerCase() === 'polycom'))
    this.conversations = this.aeService.getConversations();

    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      // tslint:disable-next-line: max-line-length
      this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.getDeviceDetailsByConversationId();
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
    if (RESULT) {      // tslint:disable-next-line: triple-equals
      this.resources = this.resourcesBk.filter(e => e.name == RESULT.from || e.name == RESULT.to);
    }
    if (RESULT && RESULT['resources'] && RESULT['resources'].length > 0) {
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
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    const item = {
      action: 'ignore',
      conversationName: this.selectedConversation,
      phone: this.selectedPhone,
      continueonfailure: this.continueOnFailure
    };
    // tslint:disable-next-line: max-line-length
    let query = this.selectedConversation + '.' + this.selectedPhone + '.ignore(';
    if (this.continueOnFailure != null) {
      query += `"${this.continueOnFailure}"`;
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
