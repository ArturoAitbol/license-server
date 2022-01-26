import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'end-call',
  templateUrl: './end-call.component.html',
  styleUrls: ['./end-call.component.css']
})
export class EndCallComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedDevice: any = '';
  selectedDeviceLine: any = 'Line1';
  lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
  public title: string = '';
  actionToEdit: any = {};
  conversations: any = [];
  selectedConversation: string = '';
  resourcesBk: any;
  conversationsWithResources: any = [];
  forceAction: boolean;
  continueOnFailure:boolean = false;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.selectedDevice= '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    this.resources = this.resourcesBk = this.aeService.getFilteredResources(['Phone']);
    this.conversations = this.aeService.getConversations();
    this.forceAction = false;
    if (this.actionToEdit) {
      this.selectedDevice = this.actionToEdit.phone;
      this.selectedDeviceLine = 'Line' + this.actionToEdit.line;
      // tslint:disable-next-line: max-line-length
      this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
      // this.getDeviceDetailsByConversationId();
      this.forceAction = this.actionToEdit.forceAction;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    this.subscription = this.aeService.generateAction.subscribe(res => {
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

  createAction() {
    const item = {
      action: 'end',
      conversationName: this.selectedConversation,
      phone: this.selectedDevice,
      forceAction: this.forceAction,
      continueonfailure: this.continueOnFailure 
      // line: this.selectedDeviceLine.toString().toLowerCase().replace('line', '')
    };
    let query = '';
    query = this.selectedConversation + '.' + this.selectedDevice + '.disconnect(' ;
    let forceAction = (this.forceAction) ? " Force Action" : "";
    // tslint:disable-next-line: max-line-length
    if( this.continueOnFailure !=null){
      query += `"${this.continueOnFailure}"`;
    }
    query += `)`;
    query +=forceAction
    this.action = { action: item, query: query };
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
      this.selectedDevice = this.resources.filter(e => e.name == this.selectedDevice).length > 0 ? this.selectedDevice : '';
    }
  }
  onSelectDevice(event: any) {
    this.selectedDevice = event.target.value;
  }

  onSelectDeviceLine(value: any) {
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
