import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-validate-login',
  templateUrl: './validate-login.component.html',
  styleUrls: ['./validate-login.component.css']
})
export class ValidateLoginComponent implements OnInit {
  action: any;
  emailAddress: string;
  password: string;
  username: string;
  actionToEdit: any;
  selectedResource: any;
  selectedState: string;
  resources: any = [];
  subscription: Subscription;
  continueOnFailure:boolean = false;
  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.selectedResource = '';
    this.selectedState = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.model.toString().toUpperCase() === 'WEBEX-TEAMS');
    if (this.actionToEdit) {
      this.selectedResource = this.actionToEdit.phone;
      this.selectedState = this.actionToEdit.callstate;
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
      action: 'validate_login',
      phone: this.selectedResource,
      callstate: this.selectedState,
      continueonfailure: this.continueOnFailure
    };
    let query = `${this.selectedResource}.validateLogin("${this.selectedState}"`;
    if( this.continueOnFailure !=null){
      query += `,"${this.continueOnFailure}"`;
  }
  query += ')';
    this.action = { action: item, query: query };
  }
}
