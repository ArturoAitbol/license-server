import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';

@Component({
  selector: 'app-hotelingguest-checkout',
  templateUrl: './hotelingguest-checkout.component.html',
  styleUrls: ['./hotelingguest-checkout.component.css']
})
export class HotelingguestCheckoutComponent implements OnInit, OnDestroy {

  action: any;
  subscription: Subscription;
  resources: any;
  selectedDevice: any = '';
  selectedDeviceLine: any = 'Line1';
  lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
  username: string;
  password: string;
  actionToEdit: any = {};
  continueOnFailure: boolean = false;

  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedDevice = this.actionToEdit.phone;
      this.selectedDeviceLine = 'Line' + this.actionToEdit.line;
      this.username = this.actionToEdit.userId;
      this.password = this.actionToEdit.hotelingPassword;
      // tslint:disable-next-line: triple-equals
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    // Only Cisco-MPP variables are applicable
    this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.vendor.toLowerCase() === 'cisco' && e.model.toLowerCase() === 'mpp');
    this.subscription = this.aeService.generateAction.subscribe(res => {
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
    const item = {
      action: 'hoteling_guest_checkout',
      phone: this.selectedDevice,
      line: this.selectedDeviceLine.toString().toLowerCase().replace('line', ''),
      continueonfailure: this.continueOnFailure
      // userId: this.username,
      // hotelingPassword: this.password
    };
    // tslint:disable-next-line: max-line-length
    // let query = this.selectedDevice + '.' + this.selectedDeviceLine.toString().toLowerCase() + '.hotelingguestcheckout("' + this.username + '","' + this.password + '")';
    let query = this.selectedDevice + '.' + this.selectedDeviceLine.toString().toLowerCase() + '.hotelingguestcheckout(';
    query += `"${this.continueOnFailure}")`;
    this.action = { action: item, query: query };
  }

  onSelectDevice(value: any) {
  }

  onSelectDeviceLine(value: any) {
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
