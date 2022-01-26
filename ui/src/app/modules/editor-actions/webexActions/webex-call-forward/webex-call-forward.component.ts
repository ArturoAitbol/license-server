import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-webex-call-forward',
  templateUrl: './webex-call-forward.component.html',
  styleUrls: ['./webex-call-forward.component.css']
})
export class WebexCallForwardComponent implements OnInit {
  action: any;
  actions: any = [];
  emailAddress: string;
  password: string;
  username: string;
  actionToEdit: any;
  resources: any;
  selectedResource: any;
  callForwardingList: any = [{ phone: '', diversionReason: '', diversionDestination: '', state: '' }];
  diversionReasonList: any = [{ name: 'Always' }, { name: 'Busy' }];
  subscription: Subscription;
  forceAction: boolean;
  continueOnFailure:boolean = false;
  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.forceAction = false;
    this.selectedResource = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.model.toString().toUpperCase() === 'WEBEX-TEAMS');
    if (this.actionToEdit) {
      this.forceAction = this.actionToEdit.forceAction;
      this.callForwardingList[0].phone = this.actionToEdit.phone;
      this.callForwardingList[0].diversionDestination = this.actionToEdit.calltype;
      this.callForwardingList[0].diversionReason = this.actionToEdit.value;
      this.callForwardingList[0].state = this.actionToEdit.resetType;
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
    // can edit only one action
    if (this.actionToEdit) {
      this.aeService.insertAction.emit(this.actions[0]);
    } else {
      this.aeService.insertMultipleActions.emit(this.actions);
    }
  }

  /**
   * create action
   */
  createAction() {
    let item: any = {};
    let query = '';
    this.callForwardingList.forEach((element: any) => {
      item = {
        action: 'callForwarding',
        phone: element.phone,
        value: element.diversionReason,
        calltype: (element.state == 'Enable') ? element.diversionDestination : '',
        resetType: element.state,
        forceAction: this.forceAction,
        continueonfailure: this.continueOnFailure
      }
      let forceAction = (this.forceAction) ? " Force Action" : "";
      if (element.state == 'Enable') {
        query = `${element.phone}.callForward(diversionReason="${element.diversionReason}",setNumber="${element.diversionDestination}",state="${element.state}"` ;
      } else {
        query = `${element.phone}.callForward(diversionReason="${element.diversionReason}",state="${element.state}"`;
      }
      if( this.continueOnFailure !=null){
        query += `,"${this.continueOnFailure}"`;
      }
      query += ')';
      query +=forceAction;
       const obj = { action: item, query: query };
      this.actions.push(obj);
    });
  }
  /**
   * add a new line of call forwarding fields
   */
  add(): void {
    this.callForwardingList.push({ phone: '', diversionReason: '', diversionDestination: '', state: '' });
  }
  /**
   * delete selected line
   */
  delete(index: number): void {
    this.callForwardingList.splice(index, 1);
  }
}
