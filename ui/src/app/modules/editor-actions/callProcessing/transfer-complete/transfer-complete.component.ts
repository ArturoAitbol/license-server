import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-transfer-complete',
  templateUrl: './transfer-complete.component.html',
  styleUrls: ['./transfer-complete.component.css']
})
export class TransferCompleteComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedDevice: any = '';
  selectedDeviceLine: any = 'Line1';
  lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
  public title: string = '';
  actionToEdit: any = {};
  selectedConversation: string = '';
  selectedIntermediateConv: string = '';
  resourcesBk: any;

  conversations: any = [];
  conversationsWithResources: any = [];
  intermediateConversations: any = [];
  details: any = [];
  continueOnFailure:boolean =false;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    this.resourcesBk = this.aeService.getFilteredResources(['Phone']);
    this.conversations = this.aeService.getConversations();
    this.intermediateConversations = this.aeService.fetchIntermediateConversations;

    if (this.actionToEdit) {
      // tslint:disable-next-line: max-line-length
      this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
      // tslint:disable-next-line: max-line-length
      this.selectedIntermediateConv = (this.actionToEdit.intermediateConvName) ? this.actionToEdit.intermediateConvName : this.aeService.DEFAULT_INTERMEDIATE_CONVERSATION_NAME;
      this.getDeviceDetailsByConversationId();
      this.selectedDevice = this.actionToEdit.phone;
      this.selectedDeviceLine = 'Line' + this.actionToEdit.line;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');

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
    // tslint:disable-next-line: triple-equals
    const RESULT = this.conversationsWithResources.filter(e => e.conversationName == this.selectedConversation)[0];
    if (RESULT) {    // tslint:disable-next-line: triple-equals
      this.resources = this.resourcesBk.filter(e => e.name == RESULT.from || e.name == RESULT.to);
    }
  }

  /**
   * to add the intermediate resource to the selected conversation id
   */
  private addIntermediateResourcesToConversation(): void {
    // tslint:disable-next-line: triple-equals
    const RESULT = this.conversationsWithResources.filter(e => e.conversationName == this.selectedConversation)[0];
    this.conversationsWithResources.forEach((element, index) => {
      this.intermediateConversations.forEach(conv => {
        if (element['conversationName'] == conv && !this.checkWhetherResourceAleadyExist(element['to'])) {
          const toResource = this.resourcesBk.filter(e => e.name == element['to'])[0];
          this.details.push(toResource);
        }
      });
    });

    if (this.details.length > 0) {
      this.conversationsWithResources.forEach(e => {
        if (e.conversationName == RESULT.conversationName) {
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
  /**
   * check whether the resource already exist in the conversation resources or not
   */
  checkWhetherResourceAleadyExist(toResource): boolean {
    return (this.resources.filter(e => e.name == toResource).length > 0) ? true : false;
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
      // tslint:disable-next-line: max-line-length
      this.selectedIntermediateConv = (this.actionToEdit.intermediateConvName) ? this.actionToEdit.intermediateConvName : this.aeService.DEFAULT_INTERMEDIATE_CONVERSATION_NAME;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.addIntermediateResourcesToConversation();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    const item = {
      action: 'xfer_complete',
      conversationName: this.selectedConversation,
      intermediateConvName: this.selectedIntermediateConv,
      phone: this.selectedDevice,
      continueonfailure: this.continueOnFailure
      // line: this.selectedDeviceLine.toString().toLowerCase().replace('line', '')
    };
    // tslint:disable-next-line: max-line-length
    let query = this.selectedConversation + '.' + this.selectedDevice + '.transferComplete(' + this.selectedIntermediateConv ;
    if (this.continueOnFailure != null) {
      query += `,"${this.continueOnFailure}"`;
    }
   query += `)`;
    this.action = { action: item, query: query };
  }

  onSelectDevice(value: any) {
  }

  onSelectDeviceLine(value: any) {
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
