import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { Constants } from 'src/app/model/constant';


@Component({
    selector: 'app-reboot-device',
    templateUrl: './reboot-device.component.html',
    styleUrls: ['./reboot-device.component.css']
})
export class RebootDeviceComponent implements OnInit, OnDestroy {

    action: any;
    subscription: Subscription;
    resources: any;
    selectedPhone: any;
    actionToEdit: any = {};
    selectedType: string;
    selectedResourceType: string;
    continueOnFailure: boolean = false;
    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.selectedPhone = '';
        this.selectedType = '';
        this.resources = this.aeService.getFilteredResources(['Phone'])
        .filter((e: Phone) =>
        ((e.vendor.toString().toLowerCase() === Constants.Cisco.toLowerCase() && e.model.toString().toLowerCase() === 'mpp')||
            e.vendor.toString().toLowerCase() === 'polycom' ||
            e.vendor.toString().toLowerCase() === 'yealink'));
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            // tslint:disable-next-line: triple-equals
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
            this.selectedPhone = this.actionToEdit.phone;
            const data = this.resources.filter(e => e.name == this.selectedPhone);
            this.selectedResourceType = data.length > 0 ? data[0]['vendor'] : '';
            // tslint:disable-next-line: triple-equals
            if (this.actionToEdit.action == 'restart_device') {
                this.selectedType = 'restart';
                // tslint:disable-next-line: triple-equals
            } else if (this.actionToEdit.action == 'reset_device') {
                this.selectedType = 'reset';
            } else {
                this.selectedType = 'reboot';
            }
        }
        this.subscription = this.aeService.generateAction.subscribe((res: any) => {
            this.insertAction();
        });
    }

    insertAction() {
        this.createAction();
        this.aeService.insertAction.emit(this.action);
    }

    /**
     * on change resource
     */
    onChangeResource(): void {
        // tslint:disable-next-line: triple-equals
        this.selectedResourceType = this.resources.filter(e => e.name == this.selectedPhone).map(e => e.vendor)[0];
    }

    createAction() {
        let item: any = {}, query = '';
        if (this.selectedType === 'reboot' || this.selectedResourceType.toString().toLowerCase() === Constants.Cisco.toLowerCase()) {
            item = { action: 'reboot_device', phone: this.selectedPhone };
            query = this.selectedPhone + '.rebootDevice(';
        } else if (this.selectedType === 'restart') {
            item = { action: 'restart_device', phone: this.selectedPhone };
            query = this.selectedPhone + '.restartDevice(';
        } else if (this.selectedType === 'reset') {
            item = { action: 'reset_device', phone: this.selectedPhone };
            query = this.selectedPhone + '.resetDevice(';
        }
        item.continueonfailure = this.continueOnFailure;
        query += `"${this.continueOnFailure}")`;
        this.action = { action: item, query: query };
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
