import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-get-transfer-type',
  templateUrl: './get-transfer-type.component.html',
  styleUrls: ['./get-transfer-type.component.css']
})
export class GetTransferTypeComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = '';
  public title: string = '';
  actionToEdit: any = {};
  result: any;
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.result = this.actionToEdit.resultIn;
      // tslint:disable-next-line: triple-equals
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    // Only Polycom variables are applicable
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.vendor === 'Polycom');
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    const item = { action: 'get_transfer_type', phone: this.selectedPhone, resultIn: this.result, continueonfailure: this.continueOnFailure };
    let query = this.selectedPhone + '.getTransferType("' + this.result;
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
