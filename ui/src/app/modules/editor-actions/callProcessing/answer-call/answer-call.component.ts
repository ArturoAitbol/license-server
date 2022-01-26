import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/model/constant';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-answer-call',
  templateUrl: './answer-call.component.html',
  styleUrls: ['./answer-call.component.css']
})
export class AnswerCallComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedResource: any = '';
  selectedDeviceLine: any = 'Line1';
  lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
  actionToEdit: any = {};
  public title = '';
  conversations: any = [];
  selectedConversation = '';
  resourcesBk: any;
  continueOnFailure: boolean = false;
  conversationsWithResources: any = [];
  // group ehnacement changes
  answerTypeList: string[] = ['By Phone', 'By Group'];
  selectedAnswerType: string = 'By Phone';
  phoneInventoryList: any = [];
  groupInventoryList: any = [];
  groupResourcesList: any = [];
  groupResourcesListBk: any = [];
  _isGroupResource: boolean = false;
  selectedGroupResource: string = '';
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.conversations = this.aeService.getConversations();
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    this.resourcesBk = this.phoneInventoryList = this.aeService.getFilteredResources([Constants.PHONE_RESOURCE]);
    this.groupInventoryList = this.aeService.getFilteredResources([Constants.GROUP_RESOURCE]);
    if (this.actionToEdit) {
      this.selectedAnswerType = (this.actionToEdit.resourceGroup) ? 'By Group' : 'By Phone';
      this.onChangeAnswerType(this.selectedAnswerType);
      this._isGroupResource = (this.actionToEdit.resourceGroup);
      if (this._isGroupResource) {
        this.selectedResource = this.actionToEdit.resourceGroup;
        this.selectedGroupResource = this.actionToEdit.phone;
        this.onSelectResource();
      } else {
        this.selectedResource = this.actionToEdit.phone;
      }
      this.selectedDeviceLine = 'Line' + this.actionToEdit.line;
      // tslint:disable-next-line: max-line-length
      this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.getDeviceDetailsByConversationId();
    }
    this.subscription = this.aeService.generateAction.subscribe(res => {
      this.insertAction();
    });
  }

  /**
   * get resources based on selected conversation ID
   * @returns void
   */
  getDeviceDetailsByConversationId(): void {
    const RESULT = this.conversationsWithResources.filter(e => e.conversationName == this.selectedConversation)[0];
    const type = (this.selectedAnswerType == 'By Group') ? Constants.GROUP_RESOURCE : Constants.PHONE_RESOURCE;
    if (RESULT) {
      this.resources = this.resourcesBk.filter(e => (e.name == RESULT.from || e.name == RESULT.to) && e.type == type);
    }
    if (RESULT && RESULT['resources'] && RESULT['resources'].length > 0) {
      this.resources = [... new Set(this.resources.concat(RESULT['resources']).filter(e => e.type == type))];
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
      this.selectedResource = this.resources.filter(e => e.name == this.selectedResource).length > 0 ? this.selectedResource : '';
    }
  }
  /**
   * on change answer type
   * @param value: any 
   */
  onChangeAnswerType(value: any) {
    this.selectedResource = '';
    this.selectedGroupResource = '';
    switch (value) {
      case 'By Group':
        this._isGroupResource = true;
        this.resourcesBk = this.groupInventoryList;
        this.getDeviceDetailsByConversationId();
        break;
      case 'By Phone':
      default:
        this._isGroupResource = false;
        this.resourcesBk = this.phoneInventoryList;
        this.getDeviceDetailsByConversationId();
        break;
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
      action: 'answer',
      phone: (this.selectedGroupResource) ? this.selectedGroupResource : this.selectedResource,
      conversationName: this.selectedConversation,
      continueonfailure: this.continueOnFailure,
      resourceGroup: (this.selectedGroupResource) ? this.selectedResource : null,
      // line: this.selectedDeviceLine.toString().toLowerCase().replace('line', '')
    };
    let query = '';
    if (this.selectedGroupResource) {
      query = `${this.selectedConversation}.${this.selectedResource}(${this.selectedGroupResource}).answer(`;
    } else {
      query = this.selectedConversation + '.' + this.selectedResource + '.answer(';
    }
    if (this.continueOnFailure != null) {
      query += `"${this.continueOnFailure}"`;
    }
    query += `)`;
    this.action = { action: item, query: query };
  }
  /**
   * on change resource
   */
  onSelectResource() {
    if (this._isGroupResource) {
      this.groupResourcesList = this.groupResourcesListBk = this.aeService.getGroupResourcesByGroupName(this.selectedResource);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
