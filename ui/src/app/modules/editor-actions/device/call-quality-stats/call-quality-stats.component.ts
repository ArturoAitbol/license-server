import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';


@Component({
    selector: 'app-call-quality-stats',
    templateUrl: './call-quality-stats.component.html',
    styleUrls: ['./call-quality-stats.component.css']
})
export class CallQualityStatsComponent implements OnInit {


    action: any;
    subscription: Subscription;
    resources: any;
    keyName: string = '';
    selectedPhone: any;
    public title: string = "";
    actionToEdit: any = {};
    isKeyNameExist: boolean;
    continueOnFailure: boolean = false;

    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.isKeyNameExist = false;
        this.selectedPhone = '';
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            // tslint:disable-next-line: triple-equals
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
            this.selectedPhone = this.actionToEdit.phone;
            this.keyName = this.actionToEdit.resultIn;
        }
        // Only Cisco variables are applicable
        this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.vendor === 'Cisco' || e.vendor === 'Polycom' || e.vendor == 'Yealink' || e.vendor == 'Microsoft');
        this.subscription = this.aeService.generateAction.subscribe((res: any) => {
            this.insertAction();
        });
    }
    onChangeResultKey(value: string) {
        const keyNamesList: string[] = this.aeService.getCallQltyResourceKeys().filter(e => e != null && e != undefined);
        this.isKeyNameExist = keyNamesList.some((e: string) => e.toLowerCase() === value.toLowerCase());
    }
    insertAction() {
        if (this.actionToEdit) {
            const keyNamesList: string[] = this.aeService.getCallQltyResourceKeys();
            const index: number = keyNamesList.indexOf(this.actionToEdit.resultIn);
            if ((index != undefined || index != null) && index != -1) {
                // keyNamesList.splice(index, 1, this.keyName);
                // this.aeService.setUiXMLResourceKeys(keyNamesList);
                this.aeService.deleteCallQltyResourceKeys(this.actionToEdit.resultIn);
                this.aeService.addcallQltyResourceKeys(this.keyName);
                this.createAction();
                this.aeService.editAction.emit(this.action);
            }
        } else {
            this.aeService.addcallQltyResourceKeys(this.keyName);
            this.createAction();
            this.aeService.insertAction.emit(this.action);
        }

    }

    createAction() {
        let action = {
            action: 'call_quality_stats',
            phone: this.selectedPhone,
            resultIn: this.keyName,
            continueonfailure: this.continueOnFailure
        };
        let query = `${this.selectedPhone}.callQualityStats(resultKey="${this.keyName}","${this.continueOnFailure}")`;
        this.action = { action: action, query: query };
    }
    onSelectDevice(value: any) {
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
