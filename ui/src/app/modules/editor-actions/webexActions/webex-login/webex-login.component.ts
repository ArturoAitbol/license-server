import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-webex-login',
  templateUrl: './webex-login.component.html',
  styleUrls: ['./webex-login.component.css']
})
export class WebexLoginComponent implements OnInit {
  action: any;
  emailAddress: string;
  password: string;
  username: string;
  actionToEdit: any;
  selectedResource: any;
  resources: any = [];
  subscription: Subscription;
  continueOnFailure:boolean = false;
  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.selectedResource = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.model.toString().toUpperCase() === 'WEBEX-TEAMS');
    if (this.actionToEdit) {
      this.emailAddress = this.actionToEdit.value;
      this.selectedResource = this.actionToEdit.phone;
      this.password = this.actionToEdit.password;
      this.username = (this.actionToEdit.userId) ? this.actionToEdit.userId : '';
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
    let item: any = {};
    item = {
      action: 'login',
      phone: this.selectedResource,
      value: this.emailAddress,
      password: this.password,
      userId: (this.username) ? this.username : '',
      continueonfailure: this.continueOnFailure
    };
    let query = `${this.selectedResource}.login(email="${this.emailAddress}"`;
    if (this.username != '') {
      query = `${this.selectedResource}.login(email="${this.emailAddress}", username="${this.username}"`;
    }
    if( this.continueOnFailure !=null){
      query += `,"${this.continueOnFailure}"`;
  }
  query += ')';
    this.action = { action: item, query: query };
  }

}
