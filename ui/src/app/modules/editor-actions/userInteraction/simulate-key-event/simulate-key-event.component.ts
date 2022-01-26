import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { Utility } from '../../../../helpers/Utility';

@Component({
    selector: 'app-simulate-key-event',
    templateUrl: './simulate-key-event.component.html',
    styleUrls: ['./simulate-key-event.component.css']
})
export class SimulateKeyEventComponent implements OnInit, OnDestroy {
    action: any;
    subscription: Subscription;
    resources: any;
    selectedPhone: any = '';
    public title: string = '';
    actionToEdit: any = {};
    selectedType: any = '';
    value: string;
    replaceText: string;
    selectedKey: string;
    keyNameList: string[];
    selectedResourceKey: string;
    selectedResourceLine: string;
    resourceKeyList: string[];
    polyKeyNameList: string[] = [
        'Applications', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'Delete',
        'Dialpad0', 'Dialpad1', 'Dialpad2', 'Dialpad3', 'Dialpad4', 'Dialpad5', 'Dialpad6', 'Dialpad7', 'Dialpad8', 'Dialpad9',
        'DialpadStar', 'DialpadPound', 'Handsfree', 'Home', 'Headset', 'MicMute', 'Menu', 'Redial',
        'SoftKey1', 'SoftKey2', 'SoftKey3', 'SoftKey4', 'SoftKey5',
        'Select', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10', 'Line11', 'Line12',
        'Transfer', 'VolDown', 'VolUp'];
    yealinkKeyNameList: string[] = [
        'Headset', 'Handfree', 'Message', 'Mute', 'Hold', 'Transfer', 'Redial', 'Ok', 'Linekey1', 'Linekey2', 'Linekey3', 'Linekey4',
        'Linekey5', 'Linekey6', 'Linekey7', 'Linekey8', 'Linekey9', 'Linekey10', 'Soft1', 'Soft2', 'Soft3', 'Soft4', 'Cancel',
        'Left', 'Up', 'Right', 'Down', 'Volumedown', 'Volumeup'
    ];
    actionTypeList: string[];
    selectedKeyName: string;
    selectedDisplayName: string;
    selectedResourceType: string;
    yealinkLabelList: string[] = ['BLF - Presence'];
    selectedLabel: string;
    continueOnFailure: boolean = false;
    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.selectedLabel = '';
        this.selectedResourceKey = '';
        this.keyNameList = this.polyKeyNameList;
        this.selectedKeyName = '';
        this.selectedKey = 'Key Name';
        this.polyKeyNameList = Utility.sortListInAscendingOrderWithoutKey(this.polyKeyNameList);
        this.yealinkKeyNameList = Utility.sortListInAscendingOrderWithoutKey(this.yealinkKeyNameList);
        // tslint:disable-next-line: triple-equals
        this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.vendor == 'Polycom' || e.vendor === 'Yealink');
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        this.resourceKeyList = this.aeService.getUiXMLResourceKeys();
        if (this.actionToEdit) {
            this.selectedPhone = this.actionToEdit.phone;
            this.selectedType = this.actionToEdit.eventType;
            this.selectedKeyName = this.actionToEdit.value;
            this.selectedResourceKey = this.actionToEdit.resultIn;
            this.selectedDisplayName = this.actionToEdit.configurationValue;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
            // this.selectedKeyName = (this.actionToEdit.configurationValue) ? this.actionToEdit.configurationValue : this.actionToEdit.value;
            if (this.actionToEdit.configurationValue) {
                this.selectedKey = 'Key Label';
            } else {
                this.selectedKey = 'Key Name';
            }
            this.selectedLabel = this.actionToEdit.calltype;
            const vendor: string = Utility.getVendorNameByResource(this.resources, this.selectedPhone);
            this.selectedResourceType = vendor.toLowerCase();
            if (vendor.toLowerCase() === 'yealink') {
                this.keyNameList = this.yealinkKeyNameList;
                this.selectedType = 'click';
                this.actionTypeList = ['click', 'down', 'up'];
            } else if (vendor.toLowerCase() === 'polycom') {
                this.keyNameList = this.polyKeyNameList;
                this.actionTypeList = ['Tap'];
                this.selectedType = 'Tap';
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

    cancel() {
        this.aeService.cancelAction.emit();
    }

    /**
     * on change resoure
     */
    onChangeResource(): void {
        const vendor: string = this.resources.filter((e: Phone) => e.name === this.selectedPhone)[0]['vendor'];
        this.selectedResourceType = vendor.toLowerCase();
        this.selectedKeyName = '';
        if (vendor.toLowerCase() === 'yealink') {
            this.keyNameList = this.yealinkKeyNameList;
            this.selectedType = 'click';
            this.actionTypeList = ['click', 'down', 'up'];
        } else if (vendor.toLowerCase() === 'polycom') {
            this.keyNameList = this.polyKeyNameList;
            this.actionTypeList = ['Tap'];
            this.selectedType = 'Tap';
        }
    }

    createAction() {
        let query = '';
        const item = {
            action: 'simulate_key_event',
            phone: this.selectedPhone,
            value: (this.selectedKeyName) ? this.selectedKeyName : '',
            configurationValue: (this.selectedDisplayName) ? this.selectedDisplayName : '',
            eventType: this.selectedType,
            resultIn: (this.selectedKey === 'Key Label' && this.selectedResourceType === 'yealink') ? null : this.selectedResourceKey,
            calltype: (this.selectedKey === 'Key Label' && this.selectedResourceType === 'yealink') ? this.selectedLabel : null,
            continueonfailure: this.continueOnFailure
        };
        // tslint:disable-next-line: max-line-length
        if (this.selectedKey === 'Key Label') {
            if (this.selectedResourceType === 'yealink') {
                query = `${this.selectedPhone}.simulateKeyEvent(type=="${this.selectedType}",label=="${this.selectedLabel}",displayName=="${this.selectedDisplayName}"`;
            } else
                query = this.selectedPhone + '.simulateKeyEvent(type==\'' + this.selectedType + '\'' + ',keyLabel==\'' + this.selectedDisplayName + '\'';
        } else {
            query = this.selectedPhone + '.simulateKeyEvent(type==\'' + this.selectedType + '\'' + ',keyName==\'' + this.selectedKeyName + '\'' ;
        }
        if( this.continueOnFailure !=null){
            query += `,"${this.continueOnFailure}"`;
        }
        query += ')';
        this.action = { action: item, query: query };
    }
    /**
     * on change key dropdown
     */
    onChangeKey(): void {
        this.selectedDisplayName = '';
        this.selectedKeyName = '';
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
