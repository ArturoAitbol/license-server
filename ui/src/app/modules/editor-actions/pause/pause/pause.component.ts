import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-pause',
  templateUrl: './pause.component.html',
  styleUrls: ['./pause.component.css']
})
export class PauseComponent implements OnInit {
  action: any;
  subscription: Subscription;
  seconds: any = "5";
  public title: string = "";
  actionToEdit: any = {};
  forceAction: boolean;
  continueOnFailure: boolean= false;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.forceAction = false;
    if (this.actionToEdit) {
      this.seconds = this.actionToEdit.value;
      this.forceAction = this.actionToEdit.forceAction;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    })
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    let item = { action: 'pause', value: this.seconds, forceAction: this.forceAction, continueonfailure: this.continueOnFailure};
    let forceAction = (this.forceAction) ? " Force Action" : "";
    let query = "pause(\"" + this.seconds + "\""  ;
    if( this.continueOnFailure !=null){
      query += `,"${this.continueOnFailure}"`;
    }
    query += ')'
    query += forceAction 
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}
