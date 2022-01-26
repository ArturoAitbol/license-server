import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-set-transfer-type',
  templateUrl: './set-transfer-type.component.html',
  styleUrls: ['./set-transfer-type.component.css']
})
export class SetTransferTypeComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = '';
  public title: string = '';
  actionToEdit: any = {};
  selectedType: string = '';
  types: string[] = ['Consultative', 'Blind'];
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.selectedType = this.actionToEdit.value;
      // tslint:disable-next-line: triple-equals
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    // Only Polycom variables are applicable
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.vendor === 'Polycom');
    this.subscription = this.aeService.generateAction.subscribe(() => {
      this.insertAction();
    });
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    const item = { action: 'set_transfer_type', phone: this.selectedPhone, value: this.selectedType, continueonfailure: this.continueOnFailure };
    let query = this.selectedPhone + '.setTransferType("' + this.selectedType;
    query += `","${this.continueOnFailure}")`;
    this.action = { action: item, query: query };
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

