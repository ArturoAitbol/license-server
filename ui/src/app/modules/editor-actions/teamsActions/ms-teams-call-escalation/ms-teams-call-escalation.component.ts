import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/model/constant';
import { Phone } from 'src/app/model/phone';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-ms-teams-call-escalation',
  templateUrl: './ms-teams-call-escalation.component.html',
  styleUrls: ['./ms-teams-call-escalation.component.css']
})
export class MsTeamsCallEscalationComponent implements OnInit, OnDestroy {
  // CONSTANTS
  readonly ADD_PARTICIPANTS: string = 'Add Participants';
  readonly REMOVE_PARTICIPANTS: string = 'Remove Participants';

  selectedPhone: any = '';
  selectedConversation: any = '';
  selectedOption: any = '';
  options: string[] = [this.ADD_PARTICIPANTS, this.REMOVE_PARTICIPANTS];
  continueOnFailure: boolean = false;
  action: any;
  subscription: Subscription;
  actionToEdit: any = [];
  conversations: any = [];
  resources: any = [];
  resourcesBk: any = [];
  filteredResourceList: any = [];
  conversationsWithResources: any = [];
  participantsList: any = [];
  selectedParticipantsToAdd: any = [];
  selectedParticipantsToRemove: string = '';
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit(): void {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.conversations = this.aeService.getConversations();
    this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
    this.resourcesBk = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.vendor.toLowerCase() === Constants.MS.toLowerCase() && e.model && e.model.toLowerCase() === Constants.MS_TEAMS.toLowerCase());
    this.participantsList = this.aeService.getFilteredResources(['Phone'])
      .filter((e: Phone) => ((!e.model && e.vendor.toLowerCase() !== Constants.GS.toLowerCase()) || (e.model && e.model.toUpperCase() !== Constants.Webex.toUpperCase())));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.selectedConversation = this.actionToEdit.conversationName;
      this.selectedOption = this.actionToEdit.value;
      this.getDeviceDetailsByConversationId();
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      if (this.selectedOption === this.ADD_PARTICIPANTS) {
        this.selectedParticipantsToAdd = this.actionToEdit.parameters.map((e: any) => e.value);
      } else if (this.selectedOption === this.REMOVE_PARTICIPANTS) {
        this.selectedParticipantsToRemove = this.actionToEdit.parameters[0]['value'];
      }
      this.onChangeOptions(this.selectedOption);

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
    const RESULT = this.conversationsWithResources.filter(e => e.conversationName == this.selectedConversation)[0];
    if (RESULT) {
      this.resources = this.resourcesBk.filter(e => e.name == RESULT.from || e.name == RESULT.to);
    }
    if (RESULT && RESULT['resources'] && RESULT['resources'].length > 0) {
      this.resources = [... new Set(this.resources.concat(RESULT['resources']))];
      this.resources = this.resources.filter(e => e.vendor.toLowerCase() === Constants.MS.toLowerCase() && e.model && e.model.toLowerCase() === Constants.MS_TEAMS.toLowerCase());
    }
  }
  /**
   * on change phone dropdown
   */
  onChangePhone(): void {
    if (this.selectedOption) {
      this.onChangeOptions(this.selectedOption);
    }
  }
  /**
   * listen for change event on conversation ID select
   * @returns void
   */
  onChangeConversations(): void {
    if (this.selectedConversation != '') {
      this.getDeviceDetailsByConversationId();
    }
    // check if the existing resource found in the that conversation resource or not
    if (this.actionToEdit) {
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
    let data: string;
    let selectedParticipants = [];
    if (this.selectedOption === this.ADD_PARTICIPANTS) {
      data = '[' + [...this.selectedParticipantsToAdd] + ']';
      selectedParticipants = this.selectedParticipantsToAdd.map((e: string, index: number) => ({ parameter: 'Phone' + (index + 1), value: e }));
    } else if (this.selectedOption === this.REMOVE_PARTICIPANTS) {
      data = this.selectedParticipantsToRemove;
      selectedParticipants.push({ parameter: 'Phone1', value: this.selectedParticipantsToRemove });
    }
    const item = {
      action: 'msft_call_escalation',
      phone: this.selectedPhone,
      conversationName: this.selectedConversation,
      parameters: selectedParticipants,
      value: this.selectedOption,
      continueonfailure: this.continueOnFailure
    };
    let query = `${this.selectedConversation}.callEscallation("${this.selectedPhone}", ${this.selectedOption}-${data}`;
    if (this.continueOnFailure != null) {
      query += `, "${this.continueOnFailure}"`;
    }
    query += `)`;
    this.action = { action: item, query: query };
  }
  /**
  * on change options dropwdown
  * @param value: string 
  */
  onChangeOptions(value: string): void {
    // get the resources involved in selected conversation ID
    const resourcesInConversation: string[] = this.aeService.getResourcesInConversation(this.selectedConversation);
    switch (value) {
      case this.ADD_PARTICIPANTS:
        this.filteredResourceList = this.participantsList
          .filter((e: Phone) => !resourcesInConversation.includes(e.name));
        break;
      case this.REMOVE_PARTICIPANTS:
        const resourcesDetails = this.participantsList.filter((e: Phone) => resourcesInConversation.filter((e1: string) => e.name == e1));
        this.filteredResourceList = resourcesDetails.filter((e: Phone) => e.name !== this.selectedPhone);
        break;
    }
  }
  /**
   * on change participants to add
   * @param value:any 
   */
  onChangeParticipant(value: any): void { }
  /**
   * on change participants to remove
   * @param value: string 
   */
  onChangeRemoveParticipant(value: string): void {
    let REMOVEPARTICIPANTSVALUE = value;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
