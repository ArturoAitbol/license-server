import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
@Component({
    selector: 'app-system-log-level',
    templateUrl: './system-log-level.component.html',
    styleUrls: ['./system-log-level.component.css']
})
export class SystemLogLevelComponent implements OnInit {

    loglevel: any;
    action: any;
    subscription: Subscription;
    resources: any;
    selectedPhone: any = '';
    selectedLogLevel: any = '0';
    loglevels: any = ['0', '1', '2', '3', '4', '5', '6'];
    public title: string = '';
    actionToEdit: any = {};
    continueOnFailure: boolean = false;

    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            this.selectedPhone = this.actionToEdit.phone;
            this.selectedLogLevel = this.actionToEdit.value;
            // tslint:disable-next-line: triple-equals
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
        }
        this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.vendor === 'Yealink');
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
            action: 'system_log_level',
            phone: this.selectedPhone,
            value: this.selectedLogLevel,
            continueonfailure: this.continueOnFailure
        };
        let query = this.selectedPhone + '.systemloglevel("' + this.selectedLogLevel.toString() + '"';
        query += `,"${this.continueOnFailure}")`;
        this.action = { action: item, query: query };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
