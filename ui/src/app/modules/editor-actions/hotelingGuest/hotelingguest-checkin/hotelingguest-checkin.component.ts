import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';

@Component({
    selector: 'app-hotelingguest-checkin',
    templateUrl: './hotelingguest-checkin.component.html',
    styleUrls: ['./hotelingguest-checkin.component.css']
})
export class HotelingguestCheckinComponent implements OnInit {
    action: any;
    subscription: Subscription;
    resources: any;
    selectedDevice: any = '';
    selectedDeviceLine: any = 'Line1';
    lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
    username: string;
    password: string;
    public title: string = "";
    actionToEdit: any = {};
    continueOnFailure: boolean = false;

    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            this.selectedDevice = this.actionToEdit.phone;
            this.selectedDeviceLine = "Line" + this.actionToEdit.line;
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
        let item = {
            action: 'hoteling_guest_checkin',
            phone: this.selectedDevice,
            line: this.selectedDeviceLine.toString().toLowerCase().replace('line', ''),
            userId: this.username,
            hotelingPassword: this.password,
            continueonfailure: this.continueOnFailure
        };
        let query = this.selectedDevice + '.' + this.selectedDeviceLine.toString().toLowerCase() + '.hotelingguestcheckin("' + this.username + '","' + this.password + '"';
        query += `,"${this.continueOnFailure}")`;
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
