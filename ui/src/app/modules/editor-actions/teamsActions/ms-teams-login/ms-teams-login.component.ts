import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-ms-teams-login',
  templateUrl: './ms-teams-login.component.html',
  styleUrls: ['./ms-teams-login.component.css']
})
export class MSTeamsLoginComponent implements OnInit {
  action: any;
  actionToEdit: any;
  selectedResource: any;
  selectedUser: any;
  resources: any = [];
  users: any = [];
  subscription: Subscription;
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.selectedResource = '';
    this.selectedUser = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resources = this.aeService.getFilteredResources(['Phone'])
      .filter((e: Phone) => e.vendor.toUpperCase() === Constants.MS.toUpperCase() && e.model.toUpperCase() === Constants.MS_TEAMS.toUpperCase());
    this.users = this.aeService.getFilteredResources(['User']);
    if (this.actionToEdit) {
      this.selectedResource = this.actionToEdit.phone;
      this.selectedUser = this.actionToEdit.user;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
  }

  /**
   * cancel action
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
  }

  /**
   * create action
   */
  createAction() {
    const item = {
      action: 'login',
      phone: this.selectedResource,
      user: this.selectedUser,
      continueonfailure: this.continueOnFailure
    };
    const query = `${this.selectedResource}.login(user="${this.selectedUser}","${this.continueOnFailure}")`;
    this.action = { action: item, query: query };
  }

}
