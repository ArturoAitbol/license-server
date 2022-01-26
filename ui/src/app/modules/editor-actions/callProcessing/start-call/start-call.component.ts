import { Component, OnDestroy, OnInit } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';
import { Phone } from '../../../../model/phone';
import { Constants } from 'src/app/model/constant';

@Component({
    selector: 'start-call',
    templateUrl: './start-call.component.html',
    styleUrls: ['./start-call.component.css']
})
export class StartCallComponent implements OnInit, OnDestroy {
    action: any;
    subscription: Subscription;
    resources: any;
    lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
    callVia: string = 'DID';
    selectedFrom: any = '';
    selectedFromLine: any = 'Line1';
    selectedTo: any = '';
    selectedToLine: any = 'Line1';
    vias: string[] = ['E164', 'EXTENSION', 'DID', 'DIGITS', 'SIP-URI'];
    viasBk: string[] = ['E164', 'EXTENSION', 'DID', 'DIGITS', 'SIP-URI'];
    digits: string = '';
    actionToEdit: any = {};
    prefix: string;
    tailing: string;
    public title: string = '';
    conversationId: string = '';
    selectedDialingType: string;
    fromResourceVendor: string;
    toResourceVendor: string;
    isFromResourceWebex: boolean;
    isToResourceWebex: boolean;
    _canEnableFromLine: boolean;
    _canEnableToLine: boolean;
    videoSelected: boolean;
    forceAction: boolean;
    continueOnFailure: boolean = false;
    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.forceAction = false;
        this.videoSelected = false;
        this._canEnableFromLine = true;
        this._canEnableToLine = true;
        this.isFromResourceWebex = false;
        this.isToResourceWebex = false;
        this.prefix = '';
        this.tailing = '';
        this.selectedDialingType = 'Enbloc';
        this.resources = this.aeService.getFilteredResources(['Phone']);
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            if (this.actionToEdit.operator) {
                this.videoSelected = (this.actionToEdit.operator.toString().toLowerCase() === 'video');
            } else {
                this.videoSelected = false;
            }
            let toPhone: Phone;
            if (this.actionToEdit.to) {
                toPhone = this.resources.find(resource => resource.name === this.actionToEdit.to);
                if (toPhone.model && toPhone.model == 'WEBEX-TEAMS') {
                    this.isToResourceWebex = true;
                }
            }
            // tslint:disable-next-line: max-line-length
            this.conversationId = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
            this.selectedFrom = this.actionToEdit.from;
            this.onSelectFrom(this.selectedFrom);
            this.selectedFromLine = 'Line' + ((this.actionToEdit.fromLine) ? this.actionToEdit.fromLine : '1');
            if (this.actionToEdit.to != null) {
                this.selectedTo = this.actionToEdit.to;
            }
            if (this.actionToEdit.toLine != null) {
                this.selectedToLine = 'Line' +((this.actionToEdit.toLine) ? this.actionToEdit.toLine : '1');
            }
            this.callVia = this.actionToEdit.callVia;
            this.digits = this.actionToEdit.value;
            this.prefix = this.actionToEdit.prefix;
            this.tailing = this.actionToEdit.tailing;
            this.forceAction = this.actionToEdit.forceAction;
            this.fromResourceVendor = this.getResourceVendor(this.actionToEdit.from, 'from');
            this._canEnableFromLine = this.canShowLines('from');
            if (this.actionToEdit.to) {
                this.toResourceVendor = this.getResourceVendor(this.actionToEdit.to, 'to');
                this._canEnableToLine = this.canShowLines('to');
                this.onSelectTo(this.actionToEdit.to);
            }
            this.selectedDialingType = (this.actionToEdit.dialingType) ? this.actionToEdit.dialingType : 'Enbloc';
            this.onChangeDialingType(this.selectedDialingType);
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
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
        this.aeService.addedConversation.emit(this.conversationId);
    }

    createAction() {
        let item: any = {};
        let query = '';
        query = this.conversationId + ' = ';
        if (this.callVia.toLowerCase() !== 'digits') {
            const typeCall: string = (this.videoSelected) ? '.videoCall(' : '.call(';
            item = {
                action: 'call',
                conversationName: this.conversationId,
                from: this.selectedFrom,
                // tslint:disable-next-line: max-line-length
                fromLine: (this.fromResourceVendor === 'microsoft' || this.isFromResourceWebex) ? null : this.selectedFromLine.toString().toLowerCase().replace('line', ''),
                to: this.selectedTo,
                // tslint:disable-next-line: max-line-length
                toLine: (this.toResourceVendor === 'microsoft' || this.isToResourceWebex) ? null : this.selectedToLine.toString().toLowerCase().replace('line', ''),
                callVia: this.callVia,
                prefix: (this.prefix !== '') ? this.prefix : null,
                tailing: (this.tailing !== '') ? this.tailing : null,
                // tslint:disable-next-line:max-line-length
                dialingType: (this.fromResourceVendor === 'polycom') ? this.selectedDialingType : null,
                operator: (this.videoSelected) ? 'video' : 'audio',
                continueonfailure: this.continueOnFailure
            };
            // tslint:disable-next-line: max-line-length
            const fromLine = (this.fromResourceVendor !== 'microsoft' && !this.isFromResourceWebex) ? '.' + this.selectedFromLine.toString().toLowerCase() : '';
            // tslint:disable-next-line: max-line-length
            const toLine = (this.toResourceVendor !== 'microsoft' && !this.isToResourceWebex) ? '.' + this.selectedToLine.toString().toLowerCase() : '';
            // tslint:disable-next-line:max-line-length
            query += this.selectedFrom + fromLine + typeCall + this.selectedTo + toLine + ',' + this.callVia;
        } else {
            item = {
                action: 'call',
                from: this.selectedFrom,
                fromLine: this.selectedFromLine.toString().toLowerCase().replace('line', ''),
                value: this.digits,
                callVia: this.callVia,
                prefix: (this.prefix !== '') ? this.prefix : null,
                tailing: (this.tailing !== '') ? this.tailing : null,
                conversationName: this.conversationId,
                forceAction: this.forceAction,
                // tslint:disable-next-line:max-line-length
                dialingType: (this.fromResourceVendor === 'polycom') ? this.selectedDialingType : null,
                continueonfailure: this.continueOnFailure
            };
            // tslint:disable-next-line:max-line-length
            query += this.selectedFrom + '.' + this.selectedFromLine.toString().toLowerCase() + '.call(' + this.digits + ',' + this.callVia;
        }
        if (this.continueOnFailure != null) {
            query += `,"${this.continueOnFailure}"`;
        }
        query += `)`;
        if (this.fromResourceVendor === 'polycom') {
            query += `.dialingType("${this.selectedDialingType}")`;
        }
        if (this.prefix && this.prefix !== '') {
            query += `.prefix("${this.prefix}")`;
        }

        if (this.tailing && this.tailing !== '') {
            query += `.tailing("${this.tailing}")`;
        }

        let forceAction = (this.forceAction) ? " Force Action" : "";
        query += forceAction;
        this.action = { action: item, query: query };
    }

    /**
     * on change From resource
     * @param value: string 
     */
    onSelectFrom(value: string) {
        this.fromResourceVendor = this.getResourceVendor(value, 'from');
        this._canEnableFromLine = this.canShowLines('from');
        if (this._canEnableFromLine) {
            this.selectedFromLine = (this.selectedFromLine) ? this.selectedFromLine : 'Line1';
        }
        if (this.toResourceVendor && this.toResourceVendor === Constants.MS.toLowerCase()) {
            this.vias = ['DID', 'URI'];
        } else if (this.fromResourceVendor.toLowerCase() === Constants.GS.toLowerCase()) {
            this.vias = ['EXTENSION', 'DID', 'DIGITS', 'SIP-URI'];
        } else if (this.fromResourceVendor.toLowerCase() === Constants.Polycom.toLowerCase()) {
            this.onChangeDialingType(this.selectedDialingType);
        } else if (this.fromResourceVendor === Constants.MS.toLowerCase() && this.toResourceVendor && this.toResourceVendor !== Constants.MS.toLowerCase()) {
            this.vias = ['E164', 'DID', 'DIGITS'];
        } else if (this.toResourceVendor && this.toResourceVendor.toLowerCase() !== Constants.MS.toLowerCase()) {
            this.vias = ['E164', 'EXTENSION', 'DID', 'DIGITS', 'SIP-URI'];
        }
    }

    /**
     * get the resource vendor
     * @param value: string
     * @return: string
     */
    getResourceVendor(value: string, type: string): string {
        const phone: Phone = this.resources.find(resource => resource.name === value);
        switch (type) {
            case 'from': if (phone.model) {
                this.isFromResourceWebex = phone.model.toUpperCase() === 'WEBEX-TEAMS';
            } else { this.isFromResourceWebex = false; }
                break;
            case 'to': if (phone.model) {
                this.isToResourceWebex = phone.model.toUpperCase() === 'WEBEX-TEAMS';
            } else { this.isToResourceWebex = false; }
                break;
        }
        return phone.vendor.toLowerCase();
    }

    onSelectFromLine(value: any) {
    }

    /**
     * on change To resource
     * @param value: any 
     */
    onSelectTo(value: any) {
        this.toResourceVendor = this.getResourceVendor(value, 'to');
        this._canEnableToLine = this.canShowLines('to');
        if (this._canEnableToLine) {
            this.selectedToLine = (this.selectedToLine) ? this.selectedToLine : 'Line1';
        }
        if (this.toResourceVendor === Constants.MS.toLowerCase()) {
            this.vias = ['DID', 'URI'];
        } else if (this.fromResourceVendor === Constants.MS.toLowerCase() && this.toResourceVendor !== Constants.MS.toLowerCase()) {
            this.vias = ['E164', 'DID', 'DIGITS'];
        } else {
            this.vias = ['E164', 'EXTENSION', 'DID', 'DIGITS', 'SIP-URI'];
        }
    }

    onSelectToLine(value: any) {
    }

    /**
     * enable respective Line dropdown based on condition
     * @param type: string
     */
    canShowLines(type: string): boolean {
        switch (type) {
            case 'from': if (this.fromResourceVendor === 'microsoft' || this.isFromResourceWebex) {
                return false;
            }
                return true;
            case 'to': if (this.toResourceVendor === 'microsoft' || this.isToResourceWebex) {
                return false;
            }
                return true;
        }
        return true;
    }
    /**
     * on change dialing type
     */
    onChangeDialingType(value: string): void {
        // remove SIP-URI from via if Dialing Type is Digit-by-Digit
        if (value === 'Digit-by-digit') {
            this.callVia = (this.callVia === 'SIP-URI') ? '' : this.callVia;
            this.vias = ['E164', 'EXTENSION', 'DID', 'DIGITS'];
        } else {
            this.vias = this.viasBk;
        }
        if (this.fromResourceVendor === Constants.MS.toLowerCase() && this.toResourceVendor !== Constants.MS.toLowerCase()) {
            this.vias = ['E164', 'DID', 'DIGITS'];
        } else if (this.toResourceVendor && this.toResourceVendor === Constants.MS.toLowerCase()) {
            this.vias = ['DID', 'URI'];
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
