import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
    selector: 'app-filter-trace',
    templateUrl: './filter-trace.component.html',
    styleUrls: ['./filter-trace.component.css']
})
export class FilterTraceComponent implements OnInit, OnDestroy {
    action: any;
    subscription: Subscription;
    variables: any;
    inTrace: string = '';
    outTrace: string = '';
    expression: string;
    maxWait: string = '10';
    result: string;
    continueOnFailure: boolean = false;
    public title: string = "";
    actionToEdit: any = {};

    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            this.inTrace = this.actionToEdit.inTrace;
            this.outTrace = this.actionToEdit.outTrace;
            this.expression = this.actionToEdit.filter;
            this.maxWait = this.actionToEdit.maxWait;
            this.result = this.actionToEdit.resultIn;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
        }
        this.variables = this.aeService.getFilteredResources(['Trace']);
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
            action: 'filter_trace',
            filter: this.expression,
            inTrace: this.inTrace,
            outTrace: this.outTrace,
            maxWait: this.maxWait,
            resultIn: this.result,
            continueonfailure: this.continueOnFailure
        };
        let query = this.outTrace + '=' + this.inTrace + '.filterTrace("' + this.expression + '","' + this.maxWait + '","' + this.result + '","' + this.continueOnFailure + '")';
        this.action = { action: item, query: query };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
