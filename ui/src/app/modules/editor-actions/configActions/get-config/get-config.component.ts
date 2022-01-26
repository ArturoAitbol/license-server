import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/model/constant';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
    selector: 'app-get-config',
    templateUrl: './get-config.component.html',
    styleUrls: ['./get-config.component.css']
})
export class GetConfigComponent implements OnInit {

    action: any;
    subscription: Subscription;
    resources: any;
    variables: any;
    selectedDevice: any = '';
    maxWait: string = '10';
    result: string;
    configParam: string;
    continueOnFailure: boolean = false;
    public title: string = "";
    actionToEdit: any = {};

    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            this.selectedDevice = this.actionToEdit.phone;
            this.configParam = this.actionToEdit.configurationParameter;
            this.result = this.actionToEdit.resultIn;
            this.maxWait = this.actionToEdit.maxWait;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
        }
        // Only Cisco and Polycom variables are applicable
        this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => ((e.vendor.toString().toLowerCase() === Constants.Cisco.toLowerCase() && e.model.toString().toLowerCase() === 'mpp') || e.vendor.toString().toLowerCase() === 'polycom' || e.vendor.toString().toLowerCase() === 'yealink'));
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
            action: 'get_config',
            phone: this.selectedDevice,
            maxWait: this.maxWait,
            configurationParameter: this.configParam,
            resultIn: this.result,
            continueonfailure: this.continueOnFailure
        };
        let query = this.selectedDevice + '.getConfig("' + this.configParam + '","' + this.maxWait + '","' + this.continueOnFailure + '","' + this.result + '")';
        this.action = { action: item, query: query };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onSelectDevice(value: any) {
    }
}
