import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-webex-logout',
  templateUrl: './webex-logout.component.html',
  styleUrls: ['./webex-logout.component.css']
})
export class WebexLogoutComponent implements OnInit {
  action: any;
  emailAddress: string;
  password: string;
  username: string;
  actionToEdit: any;
  resources: any;
  selectedResource: any;
  subscription: Subscription;
  continueOnFailure:boolean = false;
  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.selectedResource = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.model.toString().toUpperCase() === 'WEBEX-TEAMS');
    if (this.actionToEdit) {
      this.selectedResource = this.actionToEdit.phone;
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
    let query = `${this.selectedResource}.logout(`;
    item = {
      action: 'logout',
      phone: this.selectedResource,
      continueonfailure: this.continueOnFailure
    }
    if( this.continueOnFailure !=null){
      query += `"${this.continueOnFailure}"`;
  }
  query += ')';
    this.action = { action: item, query: query };
  }
}
