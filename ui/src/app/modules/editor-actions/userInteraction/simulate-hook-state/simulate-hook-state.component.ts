import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';

@Component({
  selector: 'app-simulate-hook-state',
  templateUrl: './simulate-hook-state.component.html',
  styleUrls: ['./simulate-hook-state.component.css']
})
export class SimulateHookStateComponent implements OnInit, OnDestroy {

  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = ''
  public title: string = '';
  actionToEdit: any = {};
  selectedType: any = 'Up';
  continueOnFailure: boolean = false;

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.selectedType = this.actionToEdit.hookType;
      // tslint:disable-next-line: triple-equals
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.vendor === 'Polycom');
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  createAction() {
    const item = {
      action: 'simulate_hook_state',
      phone: this.selectedPhone,
      hookType: this.selectedType,
      continueonfailure: this.continueOnFailure
    };
    let query = this.selectedPhone + '.simulatehookstate("' + this.selectedType + '"';
    query += `,"${this.continueOnFailure}")`;
    this.action = { action: item, query: query };
  }

  onSelectPhone(value: any) {
  }


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


}

