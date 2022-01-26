import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Action } from 'src/app/model/action';
import { Constants } from 'src/app/model/constant';
import { Phone } from 'src/app/model/phone';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-add-resource-to-group',
  templateUrl: './add-resource-to-group.component.html',
  styleUrls: ['./add-resource-to-group.component.css']
})
export class AddResourceToGroupComponent implements OnInit {
  action: any;
  resources: any = [];
  resourcesBk: any = [];
  groupResources: any = [];
  actionToEdit: any = {};
  conversations: any = [];
  selectedConversation = '';
  conversationsWithResources: any = [];
  continueOnFailure: boolean = false;
  selectedResource: string = '';
  selectedGroupResources: string[] = [];
  // Subscription
  subscription: Subscription;

  constructor(private aeService: AutomationEditorService) { }
  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resources = this.aeService.getFilteredResources([Constants.PHONE_RESOURCE])
      .filter((x: Phone) => x.vendor.toLowerCase() === Constants.MS.toLowerCase() && x.model && x.model.toLowerCase() === Constants.MS_TEAMS.toLowerCase());
    this.groupResources = this.aeService.getFilteredResources([Constants.GROUP_RESOURCE]);
    this.conversations = this.aeService.getConversations();
    // while edit action
    if (this.actionToEdit) {
      this.selectedResource = this.actionToEdit.resourceGroup;
      this.selectedGroupResources = this.actionToEdit.value.split(',');
      this.selectedConversation = this.actionToEdit.conversationName;
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

  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    const groupResourcesObject: { groupName: string, resources: string[] } = { groupName: this.selectedResource, resources: this.selectedGroupResources };
    this.aeService.setGroupResources(groupResourcesObject);
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    const item: Action | any = {
      action: 'add_resource_to_group',
      resourceGroup: this.selectedResource,
      value: this.selectedGroupResources.join(','),
      conversationName: this.selectedConversation
    }
    let query = `${this.selectedResource}.addResourcesToGroup([${this.selectedGroupResources}])`;
    this.action = { action: item, query: query };
  }
  /**
   * on change event of resource dropdown
   * @param value: any 
   */
  onSelectResource(value: any): void {
  }

  /**
   * on change event of group resource dropdown
   * @param value: any 
   */
  onSelectGroupResources(value: any): void { }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
