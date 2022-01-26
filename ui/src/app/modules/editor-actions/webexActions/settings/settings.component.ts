import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: string;
  selectedConfig: string;
  selectedState: string;
  ansConfirmState: string;
  number: string;
  actionToEdit: any = {};
  configList: any = [
    { label: 'Answer calls with my video on' },
    { label: 'Simultaneous Ring' }
  ];
  continueOnFailure:boolean = false;
  forceAction: boolean;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.selectedPhone = '';
    this.selectedConfig = '';
    this.selectedState = '';
    this.ansConfirmState ='Disable';
    this.forceAction = false;
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resources = this.aeService.getFilteredResources(['Phone'])
      .filter(e => e.vendor.toLowerCase() === 'cisco' && e.model && e.model.toLowerCase() === 'webex-teams');
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.selectedConfig = this.actionToEdit.value;
      this.selectedState = this.actionToEdit.resetType;
      this.number = this.actionToEdit.calltype;
      this.ansConfirmState = this.actionToEdit.resultIn;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.forceAction = this.actionToEdit.forceAction;
    }
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
    let query = '';
    // const configLabel = this.configList.filter(e => e.value == this.selectedConfig)[0]['label'];
    const item = {
      action: 'webex_setConfig',
      phone: this.selectedPhone,
      value: this.selectedConfig,
      resetType: this.selectedState,
      calltype: (this.selectedConfig === 'Simultaneous Ring' && this.selectedState === 'Enable') ? this.number : null,
      resultIn : this.ansConfirmState,
      continueonfailure: this.continueOnFailure,
      forceAction: this.forceAction,
    };
    let forceAction = (this.forceAction) ? " Force Action" : "";
    if (this.selectedConfig === 'Simultaneous Ring') {
      query = `${this.selectedPhone}.settings(config=="${this.selectedConfig}",state=="${this.selectedState}"`;
      // query += (this.selectedState === 'Enable') ? `,number=="${this.number}")` : `)` ;
      query += (this.selectedState === 'Enable') ? `,number=="${this.number}"` :  `` ;
      query +=(this.ansConfirmState==='Disable') ? `, Answer-confirmation ==" ${this.ansConfirmState}"`: `` ;
    } else {
      query = `${this.selectedPhone}.settings(config=="${this.selectedConfig}",state=="${this.selectedState}"`;
    }
    if( this.continueOnFailure !=null){
      query += `,"${this.continueOnFailure}"`;
    }
    query += ')'+forceAction;
    this.action = { action: item, query: query };
  }
  /**
   * on change simultaneous state dropdown
   * @param value: string 
   */
  onChangeSimultaneousState(value: string): void {
    this.number = '';
  }
  onChangeAnsConfirmState(event:string) : void{

  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
