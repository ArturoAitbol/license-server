import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Utility } from 'src/app/helpers/Utility';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from '../../../../model/phone';


@Component({
    selector: 'app-validate-led-status',
    templateUrl: './validate-led-status.component.html',
    styleUrls: ['./validate-led-status.component.css']
})
export class ValidateLedStatusComponent implements OnInit, OnDestroy {

    action: any;
    subscription: Subscription;
    resources: any = [];
    lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
    selectedPhone: any = '';
    selectedPhoneObj: any = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
    selectedLine: any = 'Line1';
    ledStatus = 'none';
    // tslint:disable-next-line:max-line-length
    modes: any = ['None', 'ringing', 'hold', 'talking', 'message', 'miscall', 'acd slert', 'mute', 'power saving', 'common', 'autop', 'off'];
    // tslint:disable-next-line:max-line-length
    flash: any = ['None', 'slower', 'normal', 'fast', 'faster', 'alternate', 'lighting', 'off'];
    selectedMode: string;
    selectedFlashType: string;
    states: any = [{ label: "Off", value: "off" }, { label: "Call Offering", value: "callOffering" }, { label: "Locked Out", value: "lockedOut" }, { label: "Flash", value: "flash" }, { label: "None", value: "none" }];
    selectedState: string;
    public title = '';
    actionToEdit: any = {};
    continueOnFailure: boolean = false;
    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.selectedFlashType = this.selectedMode = '';
        this.selectedState = 'none';
        this.states = Utility.sortListInAscendingOrder(this.states, 'label', false);
        this.resources = this.aeService.getFilteredResources(['Phone'])
            .filter((e: Phone) => e.vendor.toLowerCase() === 'polycom' || e.vendor.toLowerCase() === 'yealink');
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            if (this.actionToEdit.callstate) {
                this.selectedState = this.actionToEdit.callstate;
            }
            if (this.actionToEdit.value) {
                const _values = this.actionToEdit.value.toString().split(',');
                this.selectedMode = _values[0];
                this.selectedFlashType = _values[1];
            }
            this.selectedPhone = this.actionToEdit.phone;
            this.selectedLine = 'Line' + this.actionToEdit.line;
            this.ledStatus = this.actionToEdit.ledstatus;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
            this.resources.some(resource => {
                // tslint:disable-next-line:triple-equals
                if (this.selectedPhone == resource.name) {
                    this.selectedPhoneObj = resource;
                    return true;
                }
            });
        }
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
        let query = '';
        const item = {
            action: 'validate_led_status',
            phone: this.selectedPhone,
            line: this.selectedLine.toString().toLowerCase().replace('line', ''),
            ledstatus: this.ledStatus,
            callstate: (this.selectedPhoneObj.vendor.toLowerCase() === 'polycom') ? this.selectedState : null,
            value: (this.selectedPhoneObj.vendor.toLowerCase() === 'yealink') ? this.selectedMode + ',' + this.selectedFlashType : null,
            continueonfailure: this.continueOnFailure
        };
        if (this.selectedPhoneObj.vendor.toLowerCase() === 'polycom') {
            // tslint:disable-next-line:max-line-length
            query = this.selectedPhone + '.' + this.selectedLine.toLowerCase() + '.validateledstatus(color=\'' + this.ledStatus + '\',state=\'' + this.selectedState + '\'';
        } else {
            // tslint:disable-next-line:max-line-length
            query = this.selectedPhone + '.' + this.selectedLine.toLowerCase() + '.validateledstatus(color=\'' + this.ledStatus + '\', ' + 'mode=\'' + this.selectedMode + '\', ' + 'flash=\'' + this.selectedFlashType + '\'';
        }
        if( this.continueOnFailure !=null){
            query += `,"${this.continueOnFailure}"`;
        }
        query += ')';
        this.action = { action: item, query: query };
    }

    /**
     * on select resource
     * @param value:string
     */
    onSelectPhone(value: string) {
        // tslint:disable-next-line:triple-equals
        if (value == undefined || value == '') {
            this.selectedPhoneObj = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
        } else if (value) {
            this.selectedPhoneObj = this.resources.filter(e => e.name === value)[0];
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
