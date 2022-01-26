import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/model/constant';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from '../../../../model/phone';

@Component({
    selector: 'app-mute',
    templateUrl: './mute.component.html',
    styleUrls: ['./mute.component.css']
})
export class MuteComponent implements OnInit, OnDestroy {
    action: any;
    subscription: Subscription;
    resources: any = [];
    conversations: any = [];
    selectedResource = '';
    selectedConversation = '';
    selectedCallType: string;
    callMuteType: string[] = ['Mute', 'UnMute'];
    actionToEdit: any = {};
    resourcesBk: any;
    conversationsWithResources: any = [];
    continueOnFailure :boolean = false;

    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.selectedCallType = this.callMuteType[0];
        this.conversations = this.aeService.getConversations();
        this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
        // Only Polycom & Yealink variables are applicable
        // tslint:disable-next-line:max-line-length
        this.resourcesBk = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) =>e.vendor.toLowerCase() === Constants.Polycom.toLowerCase() || e.vendor.toLowerCase() === Constants.Yealink.toLowerCase() || (e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() &&  e.model.toUpperCase() === Constants.MPP.toUpperCase())||e.vendor.toUpperCase() === Constants.MS.toUpperCase() && e.model.toUpperCase() === Constants.MS_TEAMS.toUpperCase());
        this.subscription = this.aeService.generateAction.subscribe((res: any) => {
            this.insertAction();
        });
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            this.selectedResource = this.actionToEdit.phone;
            // tslint:disable-next-line:triple-equals
            this.selectedCallType = this.actionToEdit.action == 'mute' ? 'Mute' : 'UnMute';
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
        let query = '';
        const item = {
            action: String(this.selectedCallType).toLowerCase(),
            phone: this.selectedResource,
            conversationName: this.selectedConversation,
            continueonfailure: this.continueOnFailure 
        };
        // tslint:disable-next-line:max-line-length
        query = this.selectedConversation + '.' + this.selectedResource + '.' + this.selectedCallType.toLowerCase() + '(';
        if (this.continueOnFailure != null) {
            query += `"${this.continueOnFailure}"`;
          }
         query += `)`;
        this.action = { action: item, query: query };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
