import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { Constants } from 'src/app/model/constant';

@Component({
    selector: 'app-conference-start',
    templateUrl: './conference-start.component.html',
    styleUrls: ['./conference-start.component.css']
})
export class ConferenceStartComponent implements OnInit, OnDestroy {
    action: any;
    subscription: Subscription;
    resources: any;
    lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
    callVia: any = 'DID';
    selectedFrom: any = '';
    selectedFromLine: any = 'Line1';
    selectedTo: any = '';
    selectedToLine: any = 'Line1';
    vias: any = ['E164', 'EXTENSION', 'DID', 'DIGITS', 'SIP-URI'];
    digits: string = '';
    public title: string = '';
    actionToEdit: any = {};
    prefix: string;
    tailing: string;
    conversations: any = [];
    selectedConversation: string = '';
    intermediateConversation: string = '';
    allResources: any = [];
    resourcesBk: any;
    conversationsWithResources: any = [];

    selectedDialingType: string;
    fromResourceVendor: string;
    continueOnFailure:boolean =false;
    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.prefix = '';
        this.tailing = '';
        this.selectedDialingType = 'Enbloc';
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        this.conversations = this.aeService.getConversations();
        this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
        this.allResources = this.resourcesBk = this.aeService.getFilteredResources(['Phone']).filter((e:any)=>(!e.model || (e.model && e.model.toUpperCase() !== Constants.Webex)));

        if (this.actionToEdit) {
            // tslint:disable-next-line: max-line-length
            this.intermediateConversation = (this.actionToEdit.intermediateConvName) ? this.actionToEdit.intermediateConvName : this.aeService.DEFAULT_INTERMEDIATE_CONVERSATION_NAME;
            this.selectedFrom = this.actionToEdit.from;
            this.selectedFromLine = 'Line' + this.actionToEdit.fromLine;
            if (this.actionToEdit.to != null) {
                this.selectedTo = this.actionToEdit.to;
            }
            if (this.actionToEdit.toLine != null) {
                this.selectedToLine = 'Line' + this.actionToEdit.toLine;
            }
            // tslint:disable-next-line: max-line-length
            this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
            this.getDeviceDetailsByConversationId();
            this.callVia = this.actionToEdit.callVia;
            this.digits = this.actionToEdit.value;
            this.prefix = this.actionToEdit.prefix;
            this.tailing = this.actionToEdit.tailing;
            this.fromResourceVendor = this.getResourceVendor(this.actionToEdit.from);
            this.selectedDialingType = (this.actionToEdit.dialingType) ? this.actionToEdit.dialingType : 'Enbloc';
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
        }
        this.subscription = this.aeService.generateAction.subscribe((res: any) => {
            this.insertAction();
        });
    }


    /**
     * get resources based on selected conversation ID
     * @returns void
     */
    getDeviceDetailsByConversationId(): void {
        // tslint:disable-next-line: triple-equals
        const RESULT = this.conversationsWithResources.filter(e => e.conversationName == this.selectedConversation)[0];
        if (RESULT) {
            // tslint:disable-next-line: triple-equals
            this.resources = this.resourcesBk.filter(e => e.name == RESULT.from || e.name == RESULT.to);
        }
        if (RESULT && RESULT['resources'] && RESULT['resources'].length > 0) {
            this.resources = [... new Set(this.resources.concat(RESULT['resources']))];
        }
    }

    /**
     * listen for change event on conversation ID select
     * @returns void
     */
    onChangeConversations(): void {
        // tslint:disable-next-line: triple-equals
        if (this.selectedConversation != '') {
            this.getDeviceDetailsByConversationId();
        }
        // check if the existing resource found in the that conversation resource or not
        if (this.actionToEdit) {
            // tslint:disable-next-line: triple-equals
            this.selectedFrom = this.resources.filter(e => e.name == this.selectedFrom).length > 0 ? this.selectedFrom : '';
            // tslint:disable-next-line: triple-equals
            this.selectedTo = this.allResources.filter(e => e.name == this.selectedTo).length > 0 ? this.selectedTo : '';
        }
    }


    cancel() {
        this.aeService.cancelAction.emit();
    }

    insertAction() {
        this.createAction();
        this.aeService.insertAction.emit(this.action);
        this.aeService.addIntermediateConv$.emit(this.intermediateConversation);
    }

    createAction() {
        let item: any = {};
        let query: any = '';
        query = this.intermediateConversation + ' = ' + this.selectedConversation + '.';
        if (this.callVia.toLowerCase() !== 'digits') {
            item = {
                action: 'conf_start',
                from: this.selectedFrom,
                fromLine: this.selectedFromLine.toString().toLowerCase().replace('line', ''),
                to: this.selectedTo,
                toLine: this.selectedToLine.toString().toLowerCase().replace('line', ''),
                callVia: this.callVia,
                prefix: (this.prefix !== '') ? this.prefix : null,
                tailing: (this.tailing !== '') ? this.tailing : null,
                conversationName: this.selectedConversation,
                intermediateConvName: this.intermediateConversation,
                // tslint:disable-next-line:max-line-length
                dialingType: (this.fromResourceVendor === 'polycom') ? this.selectedDialingType : null,
                continueonfailure: this.continueOnFailure 

            };
            // tslint:disable-next-line:max-line-length
            query += this.selectedFrom + '.' + this.selectedFromLine.toString().toLowerCase() + '.conferenceStart(' + this.selectedTo + '.' + this.selectedToLine.toString().toLowerCase() + ',' + this.callVia ;
        } else {
            item = {
                action: 'conf_start',
                from: this.selectedFrom,
                fromLine: this.selectedFromLine.toString().toLowerCase().replace('line', ''),
                value: this.digits,
                callVia: this.callVia,
                prefix: (this.prefix !== '') ? this.prefix : null,
                tailing: (this.tailing !== '') ? this.tailing : null,
                conversationName: this.selectedConversation,
                intermediateConvName: this.intermediateConversation,
                // tslint:disable-next-line:max-line-length
                dialingType: (this.fromResourceVendor === 'polycom') ? this.selectedDialingType : null,
                continueonfailure: this.continueOnFailure 

            };
            // tslint:disable-next-line:max-line-length
            query += this.selectedFrom + '.' + this.selectedFromLine.toString().toLowerCase() + '.conferenceStart(' + this.digits + ',' + this.callVia ;
        }
        if( this.continueOnFailure !=null){
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

        this.action = { action: item, query: query };
    }

    onSelectFrom(value: any) {
        this.fromResourceVendor = this.getResourceVendor(value);
    }

    /**
       * get the resource vendor
       * @param value: string
       * @return: string
       */
    getResourceVendor(value: string): string {
        const phone: Phone = this.resources.find(resource => resource.name === value);
        return phone.vendor.toLowerCase();
    }
    onSelectFromLine(value: any) {
    }

    onSelectTo(value: any) {
    }

    onSelectToLine(value: any) {
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
