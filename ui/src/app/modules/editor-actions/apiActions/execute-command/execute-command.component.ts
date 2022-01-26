import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-execute-command',
  templateUrl: './execute-command.component.html',
  styleUrls: ['./execute-command.component.css']
})
export class ExecuteCommandComponent implements OnInit {
  action: any;
  subscription: Subscription;
  command: string;
  result: string;
  public title: string = "";
  actionToEdit: any = {};
  forceAction: boolean;
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.forceAction = false;
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.forceAction = this.actionToEdit.forceAction;
      this.command = this.actionToEdit.command;
      this.result = this.actionToEdit.resultIn;
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
  
  let item = { action: "executecommand", command: this.command, resultIn: this.result, forceAction: this.forceAction , continueonfailure: this.continueOnFailure, };
    let forceAction = (this.forceAction) ? " Force Action" : "";
    let query ='';
    query = "executeCommand(\"" + this.command + "\",\"" + this.result + "\"" ;
    if( this.continueOnFailure !=null){
      query += `,"${this.continueOnFailure}"`;
    }
    query += `)`;
    query +=forceAction
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}