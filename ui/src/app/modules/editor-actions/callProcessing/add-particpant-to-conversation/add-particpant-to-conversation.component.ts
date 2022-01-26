import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/model/constant';
import { Phone } from 'src/app/model/phone';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-add-particpant-to-conversation',
  templateUrl: './add-particpant-to-conversation.component.html',
  styleUrls: ['./add-particpant-to-conversation.component.css']
})
export class AddParticpantToConversationComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedDevice: any = '';
  actionToEdit: any = {};
  public title = '';
  conversations: any = [];
  selectedConversation = '';
  resourcesBk: any;
  conversationsWithResources: any = [];
  details: any = [];
  selectedDeviceLine: any = 'Line1';
  lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
  isResourceWebex: boolean;
  _canEnableLine: boolean;
  resourceVendor: string;
  resourceNotInConversationList: any = [];
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this._canEnableLine = true;
    this.isResourceWebex = false;
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.conversations = this.aeService.getConversations();
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    this.resourcesBk = this.resources = this.aeService.getFilteredResources([Constants.PHONE_RESOURCE, Constants.GROUP_RESOURCE]);
    if (this.actionToEdit) {
      // tslint:disable-next-line: max-line-length
      this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
      this.getDeviceDetailsByConversationId();
      if (this.actionToEdit.phone) {
        this.resourceVendor = this.getResourceVendor(this.actionToEdit.phone);
      } else {
        this.resourceVendor = null;
      }
      this._canEnableLine = this.canShowLines();
      this.selectedDevice = (this.actionToEdit.phone) ? this.actionToEdit.phone : this.actionToEdit.resourceGroup;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    this.subscription = this.aeService.generateAction.subscribe(() => {
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
    let resultResources = [];
    if (RESULT && RESULT.resources) {
      resultResources = RESULT.resources.map(e => e.name);
    }
    if (RESULT) {
      // tslint:disable-next-line: triple-equals max-line-length
      this.resources = this.resourcesBk.filter(e => e.name == RESULT.from || e.name == RESULT.to || (resultResources.length > 0 && resultResources.includes(e.name)));
    }
    const resourcesNames = this.resources.map(e => e.name);
    if (RESULT && RESULT['resources'] && RESULT['resources'].length > 0) {
      this.resources = [... new Set(this.resources.concat(RESULT['resources']))];
    }
    this.resourceNotInConversationList = [];
    this.resourcesBk.forEach((element: any) => {
      if (!resourcesNames.includes(element.name)) {
        this.resourceNotInConversationList.push(element);
      }
    });
    if (this.actionToEdit) {
      if (this.actionToEdit.resourceGroup) {
        const selectedGroup = this.aeService.getGroupResources().find(e => e.groupName == this.actionToEdit.resourceGroup);
        if (selectedGroup) {
          selectedGroup['resources'].forEach((e: string) => {
            const element = this.resourcesBk.filter((e1: any) => e1.name == e)[0];
            this.resourceNotInConversationList.push(element);
          });
        }
      }
      const element = this.resourcesBk.filter(e => e.name == this.actionToEdit.phone || e.name == this.actionToEdit.resourceGroup)[0];
      this.resourceNotInConversationList.push(element);

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
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
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
      action: 'add_phone_to_conversation',
      phone: (this.resourceVendor) ? this.selectedDevice : null,
      resourceGroup: (!this.resourceVendor) ? this.selectedDevice : null, // set group resource
      conversationName: this.selectedConversation,
      line: this.selectedDeviceLine.toString().toLowerCase().replace('line', ''),
      value: (!this.canShowLines()) ? true : false,
      continueonfailure: this.continueOnFailure
      // set to validate whether phone is webex or not
    };
    let query = '';
    this.addResourceToConversation();
    if (!this.canShowLines()) {
      // tslint:disable-next-line: max-line-length
      query = this.selectedConversation + '.' + this.selectedDevice + '.addResourceToConversation(';
    } else {
      // tslint:disable-next-line: max-line-length
      query = this.selectedConversation + '.' + this.selectedDevice + '.' + this.selectedDeviceLine.toString().toLowerCase() + '.addPhoneToConversation(';
    }
    query += `"${this.continueOnFailure}")`;
    this.action = { action: item, query: query };
  }

  onSelectDevice(value: any) {
    this.resourceVendor = this.getResourceVendor(value);
    this._canEnableLine = this.canShowLines();
  }
  onSelectDeviceLine(value: any) {
  }

  private addResourceToConversation(): void {
    // tslint:disable-next-line: triple-equals
    const RESULT = this.conversationsWithResources.filter(e => e.conversationName == this.selectedConversation)[0];
    // check point whether the resource type is group or not
    if (!this.resourceVendor) {
      const groups = this.aeService.getGroupResources();
      const group = this.resourcesBk.filter((e: Phone) => e.name == this.selectedDevice);
      // here group binded resources and group are added to the conversation resources  
      this.details = groups.filter((e: { groupName: string, resources: string[] }) => e.groupName == this.selectedDevice)[0]['resources']
        .map((resourceName: any) => this.resourcesBk.filter((e1: any) => e1.name == resourceName)[0]).concat(group);
    } else {
      this.details = this.resourcesBk.filter(e => e.name == this.selectedDevice);
    }
    this.conversationsWithResources.forEach(e => {
      if (e.conversationName == RESULT.conversationName) {
        if (e['resources']) {
          if (this.actionToEdit) {
            const indexValue = e['resources'].findIndex(e1 => e1.name == this.actionToEdit.phone || e1.name == this.actionToEdit.resourceGroup);
            e['resources'].splice(indexValue, 1);
            if (this.actionToEdit.resourceGroup) {
              const resourcesListInGroup = this.aeService.getGroupResources().find(e => e.groupName == this.actionToEdit.resourceGroup);
              resourcesListInGroup['resources'].forEach((e1: string) => {
                const index = e['resources'].findIndex(e2 => e2.name == e1);
                e['resources'].splice(index, 1);
              })
            }
          }
          e['resources'] = [...new Set(e['resources'].concat(this.details))];
        } else {
          e['resources'] = this.details;
        }
      }
    });
    this.aeService.setConversationsWithUsers = this.conversationsWithResources;
  }
  /**
     * get the resource vendor
     * @param value: string
     * @return: string
     */
  getResourceVendor(value: string): string {
    const phone: Phone = this.resourcesBk.find(resource => resource.name === value);
    if (phone && phone.model) {
      this.isResourceWebex = phone.model.toUpperCase() === 'WEBEX-TEAMS';
    } else { this.isResourceWebex = false; }

    return (phone.vendor) ? phone.vendor.toLowerCase() : null;
  }
  /**
   * enable Line dropdown based on condition
   */
  canShowLines(): boolean {
    return (!this.resourceVendor || this.resourceVendor === 'microsoft' || this.isResourceWebex) ? false : true;
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
