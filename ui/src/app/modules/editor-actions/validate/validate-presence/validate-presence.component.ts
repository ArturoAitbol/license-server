import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-validate-presence',
  templateUrl: './validate-presence.component.html',
  styleUrls: ['./validate-presence.component.css']
})
export class ValidatePresenceComponent implements OnInit {
  action: any;
  subscription: Subscription;
  resources: any = [];
  actionToEdit: any = {};
  selectedResource: string;
  selectedValidateType: string;
  validateTypes: string[] = ['Active', 'On a call'];
  continueOnFailure: boolean = false;

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.selectedValidateType = '';
    this.selectedResource = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.model && e.model.toUpperCase() === Constants.Webex);
    if (this.actionToEdit) {
      this.selectedResource = this.actionToEdit.phone;
      this.selectedValidateType = this.actionToEdit.value;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });

  }
  cancel() {
    this.aeService.cancelAction.emit();
  }
  createAction() {
    const item = {
      action: 'validate_presence',
      phone: this.selectedResource,
      value: this.selectedValidateType,
      continueonfailure: this.continueOnFailure
    };
    let query = `${this.selectedResource}.validatePresence(validate=="${this.selectedValidateType}"`;
    if (this.continueOnFailure != null) {
      query += `,"${this.continueOnFailure}"`;
    }
    query += ')';
    this.action = { action: item, query: query };
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  onSelectResource(value: string): void { }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
