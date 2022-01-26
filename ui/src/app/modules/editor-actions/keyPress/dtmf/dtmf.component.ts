import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Constants } from 'src/app/model/constant';
import { Phone } from 'src/app/model/phone';

@Component({
    selector: 'app-dtmf',
    templateUrl: './dtmf.component.html',
    styleUrls: ['./dtmf.component.css']
})
export class DtmfComponent implements OnInit {
    dtmfCodes: any;
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
            this.dtmfCodes = this.actionToEdit.value;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
        }
        this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.vendor.toLowerCase() !== Constants.MS.toLowerCase());
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
            action: 'dtmf',
            phone: this.selectedPhone,
            line: this.selectedLine.toString().toLowerCase().replace('line', ''),
            value: this.dtmfCodes,
            continueonfailure: this.continueOnFailure
        };
        let query = this.selectedPhone + '.' + this.selectedLine.toString().toLowerCase() + '.playDtmf("' + this.dtmfCodes.toString() + '"';
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
