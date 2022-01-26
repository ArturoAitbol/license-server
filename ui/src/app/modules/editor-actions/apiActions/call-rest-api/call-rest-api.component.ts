import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-call-rest-api',
  templateUrl: './call-rest-api.component.html',
  styleUrls: ['./call-rest-api.component.css']
})
export class CallRestAPIComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  url: string;
  body: string;
  method: string = "";
  continueOnFailure: boolean = true;
  methods: any = ["POST", "PUT", "GET", "DELETE"];
  public title: string = "";
  actionToEdit: any = {};
  forceAction: boolean;

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.forceAction = false;
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.forceAction = this.actionToEdit.forceAction;
      this.url = this.actionToEdit.url;
      this.body = this.actionToEdit.messagebody;
      this.method = this.actionToEdit.httpmethod;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    let item = { action: "callrestapi", url: this.url, continueonfailure: this.continueOnFailure, httpmethod: this.method, messagebody: this.body, forceAction: this.forceAction };
    let forceAction = (this.forceAction) ? " Force Action" : "";
    let query = "callRESTApi(\"" + this.url + "\",\"" + this.method + "\",\"" + this.body + "\",\"" + this.continueOnFailure + "\")" + forceAction;
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}