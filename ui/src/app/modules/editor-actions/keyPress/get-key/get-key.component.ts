import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-get-key',
  templateUrl: './get-key.component.html',
  styleUrls: ['./get-key.component.css']
})
export class GetKeyComponent implements OnInit {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = '';
  actionToEdit: any = {};
  yealinkLables: string[] = [];
  displayName: string;
  labels: string[] = ['BLF - Presence'];
  selectedLabel: string;
  variableName: string;
  continueOnFailure: boolean = false;

  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.displayName = '';
    this.selectedLabel = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.displayName = this.actionToEdit.configurationValue;
      this.selectedLabel = this.actionToEdit.calltype;
      this.variableName = this.actionToEdit.value;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');

    }
    this.resources = this.aeService.getFilteredResources(['Phone'])
      .filter((e: any) => e.vendor.toString().toLowerCase() === Constants.Yealink.toLowerCase() || e.vendor.toString().toLowerCase() === Constants.Polycom.toLowerCase());
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    let item = {
      action: 'get_key',
      phone: this.selectedPhone,
      configurationValue: this.displayName,
      calltype: this.selectedLabel,
      value: this.variableName,
      continueonfailure: this.continueOnFailure
    };
    let query = `${this.selectedPhone}.findKey(label=="${this.selectedLabel}",displayName=="${this.displayName}",variableName=="${this.variableName}"`;
    if (this.continueOnFailure != null) {
      query += `,"${this.continueOnFailure}"`;
    }
    query += ')';
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
