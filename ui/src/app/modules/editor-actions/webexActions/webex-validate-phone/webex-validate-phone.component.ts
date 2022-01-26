import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-webex-validate-phone',
  templateUrl: './webex-validate-phone.component.html',
  styleUrls: ['./webex-validate-phone.component.css']
})
export class WebexValidatePhoneComponent implements OnInit {
  action: any;
  actionToEdit: any;
  resources: any;
  selectedResource: any;
  state: string;
  subscription: Subscription;
  continueOnFailure:boolean = false;
  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.selectedResource = '';
    this.state = 'connected';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.model.toString().toUpperCase() === 'WEBEX-TEAMS');
    if (this.actionToEdit) {
      this.selectedResource = this.actionToEdit.phone;
      this.state = this.actionToEdit.value;
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
    let query = `${this.selectedResource}.validatePhone(state="${this.state}"`;
    if( this.continueOnFailure !=null){
      query += `,"${this.continueOnFailure}"`;
    }
    query += ')';
    item = {
      action: 'validate_phone',
      phone: this.selectedResource,
      value: this.state,
      continueonfailure: this.continueOnFailure
    }
    this.action = { action: item, query: query };
  }
}
