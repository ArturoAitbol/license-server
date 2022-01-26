import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from '../../../../services/automation-editor.service';
import { Phone } from '../../../../model/phone';

@Component({
    selector: 'app-conference-remove-participant',
    templateUrl: './conference-remove-participant.component.html',
    styleUrls: ['./conference-remove-participant.component.css']
})
export class ConferenceRemoveParticipantComponent implements OnInit, OnDestroy {
    action: any;
    subscription: Subscription;
    resources: any = [];
    conversations: any = [];
    selectedResource = '';
    selectedConversation = '';
    actionToEdit: any = {};
    resourcesBk: any;
    conversationsWithResources: any = [];
    continueOnFailure: boolean= false;

    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.conversations = this.aeService.getConversations();
        this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
        // Only Yealink variables are applicable
        this.resourcesBk = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.vendor.toLowerCase() === 'yealink');
        this.subscription = this.aeService.generateAction.subscribe((res: any) => {
            this.insertAction();
        });
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            this.selectedResource = this.actionToEdit.phone;
            // tslint:disable-next-line: max-line-length
            this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');

            this.getDeviceDetailsByConversationId();
        }
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
            this.selectedResource = this.resources.filter(e => e.name == this.selectedResource).length > 0 ? this.selectedResource : '';
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
        }
    }

    cancel() {
        this.aeService.cancelAction.emit();
    }

    insertAction() {
        this.createAction();
        this.aeService.insertAction.emit(this.action);
    }

    createAction() {
        const item = {
            action: 'conf_remove',
            phone: this.selectedResource,
            conversationName: this.selectedConversation,
            continueonfailure: this.continueOnFailure
        };
        let query = this.selectedConversation + '.' + this.selectedResource + '.conferenceRemoveParticipant(';
        if( this.continueOnFailure !=null){
            query += `"${this.continueOnFailure}"`;
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

