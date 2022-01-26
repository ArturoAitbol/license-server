import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/model/constant';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';

@Component({
  selector: 'app-key-press',
  templateUrl: './key-press.component.html',
  styleUrls: ['./key-press.component.css']
})
export class KeyPressComponent implements OnInit {

  action: any;
  subscription: Subscription;
  resources: any;
  lines: any = ["Line1", "Line2", "Line3", "Line4", "Line5", "Line6", "Line7", "Line8", "Line9", "Line10"];
  dialpads: any = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  selectedPhone: any = ""
  selectedLine: any = "Line1";
  selectedDialpad: any = "";
  others: string = "voiceMail";
  dialKey: string = "none";
  lineKey: string = "none";
  public title: string = "";
  actionToEdit: any = {};
  continueOnFailure: boolean = false;

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.selectedLine = this.actionToEdit.value;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    this.resources = this.aeService.getFilteredResources(['Phone'])
      .filter((e: Phone) => (!e.model || (e.model && (e.model.toUpperCase() !== Constants.Webex && e.model.toUpperCase() !== Constants.MS_TEAMS))));
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }
  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    let content = "";
    if (this.lineKey == "lineKey")
      content = this.selectedLine.toString().toLowerCase();
    if (this.lineKey == "dialKey")
      content = this.selectedDialpad.toString().toLowerCase();
    if (this.lineKey != "lineKey" && this.lineKey != "dialKey")
      content = this.lineKey;
    content = this.selectedLine;
    let item = { action: "key_press", phone: this.selectedPhone, value: content, continueonfailure: this.continueOnFailure };
    let query = this.selectedPhone + ".keypress(\"" + content + "\"";
    if (this.continueOnFailure != null) {
      query += `,"${this.continueOnFailure}"`;
    }
    query += ')';
    this.action = { action: item, query: query };
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}
