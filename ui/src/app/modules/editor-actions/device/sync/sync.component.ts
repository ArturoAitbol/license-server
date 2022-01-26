import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/model/constant';
import { Phone } from 'src/app/model/phone';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.css']
})
export class SyncComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  phones: any;
  servers: any;
  selectedPhone: any = '';
  selectedServer: any = '';
  syncTypes: any = [
    { name: 'Phone', value: 'phone' },
    { name: 'Call Server', value: 'callServer' },
    { name: 'Both', value: 'both' }];
  selectedSync: string = '';
  actionToEdit: any = {};
  continueOnFailure: boolean = false;

  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      // tslint:disable-next-line: triple-equals
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.selectedSync = this.actionToEdit.syncType;
      this.selectedPhone = this.actionToEdit.phone;
      if (this.actionToEdit.server != null) {
        this.selectedServer = this.actionToEdit.server;
      }
    }
    // Only Cisco and Polycom variables are applicable
    this.phones = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) =>  (e.vendor.toString().toLowerCase() === Constants.Cisco.toLowerCase() && e.model.toString().toLowerCase() === 'mpp')||
    e.vendor.toString().toLowerCase() === 'polycom'  );
    this.servers = this.aeService.getFilteredResources(['Server']);
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  cleanValues() {
    this.selectedPhone = '';
    this.selectedServer = '';
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    let action: any;
    let query: any;
    switch (this.selectedSync) {
      case 'phone':
        action = { action: 'phone_sync', syncType: this.selectedSync, phone: this.selectedPhone };
        query = this.selectedPhone + '.sync(';
        action.continueonfailure = this.continueOnFailure;
        query += `"${this.continueOnFailure}")`;
        this.action = { action: action, query: query };
        break;
      case 'callServer':
        action = { action: 'phone_sync', syncType: this.selectedSync, server: this.selectedServer, phone: this.selectedPhone };
        query = `${this.selectedPhone}.sync("CallServer", ${this.selectedServer}`;
        action.continueonfailure = this.continueOnFailure;
        query += `,"${this.continueOnFailure}")`;

        this.action = { action: action, query: query };
        break;
      case 'both':
        action = { action: 'phone_sync', syncType: this.selectedSync, server: this.selectedServer, phone: this.selectedPhone };
        query = `${this.selectedPhone}.sync("Phone&CallServer", ${this.selectedServer}`;
        action.continueonfailure = this.continueOnFailure;
        query += `,"${this.continueOnFailure}")`;
        this.action = { action: action, query: query };
        break;
    }
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
