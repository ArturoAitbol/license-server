import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { Constants } from 'src/app/model/constant';

@Component({
    selector: 'app-dial-digit',
    templateUrl: './dial-digit.component.html',
    styleUrls: ['./dial-digit.component.css']
})
export class DialDigitComponent implements OnInit {
    digits: any;
    action: any;
    subscription: Subscription;
    resources: any;
    selectedPhone: any = '';
    selectedLine: any = 'Line1';
    lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
    public title: string = '';
    actionToEdit: any = {};
    continueOnFailure: boolean = false;

    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            this.selectedPhone = this.actionToEdit.phone;
            this.selectedLine = 'Line' + this.actionToEdit.line;
            this.digits = this.actionToEdit.value;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');

        }
        this.resources = this.aeService.getFilteredResources(['Phone'])
            .filter((phone: Phone) => phone.vendor.toLowerCase() !== Constants.Cisco.toLowerCase());
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
        let item = {
            action: 'dial',
            phone: this.selectedPhone,
            line: this.selectedLine.toString().toLowerCase().replace('line', ''),
            value: this.digits,
            continueonfailure: this.continueOnFailure
        };
        let query = this.selectedPhone + '.' + this.selectedLine.toString().toLowerCase() + '.dial("' + this.digits.toString() + '"';
        if (this.continueOnFailure != null) {
            query += `,"${this.continueOnFailure}"`;
        }
        query += ')';
        this.action = { action: item, query: query };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
