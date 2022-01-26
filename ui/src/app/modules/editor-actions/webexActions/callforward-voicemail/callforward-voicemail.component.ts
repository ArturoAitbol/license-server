import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-callforward-voicemail',
  templateUrl: './callforward-voicemail.component.html',
  styleUrls: ['./callforward-voicemail.component.css']
})
export class CallforwardVoicemailComponent implements OnInit {
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
    const item = {
      action: 'voicemail',
      phone: this.selectedResource,
      continueonfailure: this.continueOnFailure
    };
    const query = `${this.selectedResource}.voiceMail().${this.continueOnFailure}`;
    this.action = { action: item, query: query };
  }
}
