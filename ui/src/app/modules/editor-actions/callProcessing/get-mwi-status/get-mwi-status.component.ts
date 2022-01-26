import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-get-mwi-status',
  templateUrl: './get-mwi-status.component.html',
  styleUrls: ['./get-mwi-status.component.css']
})
export class GetMwiStatusComponent implements OnInit, OnDestroy {

  action: any;
  subscription: Subscription;
  command: string;
  result: string;
  public title: string = '';
  actionToEdit: any = {};
  resources: any;
  selectedDevice: any = '';

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.vendor == 'Polycom');
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.result = this.actionToEdit.resultIn;
      this.selectedDevice = this.actionToEdit.phone;
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
    const item = { action: 'check_mwi', resultIn: this.result, phone: this.selectedDevice };
    const query = `${this.selectedDevice}.getMwiStatus(${this.result})`;
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
