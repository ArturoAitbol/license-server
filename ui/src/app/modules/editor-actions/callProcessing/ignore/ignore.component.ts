import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
    selector: 'app-ignore',
    templateUrl: './ignore.component.html',
    styleUrls: ['./ignore.component.css']
})
export class IgnoreComponent implements OnInit, OnDestroy {
    action: any;
    subscription: Subscription;
    resources: any;
    selectedPhone: any = '';
    selectedLine: any = 'Line1';
    lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
    public title: string = '';
    actionToEdit: any = {};
    conversations: any = [];
    selectedConversation: string = '';
    resourcesBk: any;
    conversationsWithResources: any = [];
    continueOnFailure :boolean = false;
    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
        this.resourcesBk = this.aeService.getFilteredResources(['Phone'])
            .filter(e => e.vendor === 'Cisco' || e.vendor === 'Yealink' || e.vendor === 'Polycom' || e.vendor === 'Microsoft');
        this.conversations = this.aeService.getConversations();

        if (this.actionToEdit) {
            this.selectedPhone = this.actionToEdit.phone;
            this.selectedLine = 'Line' + this.actionToEdit.line;
            // tslint:disable-next-line: max-line-length
            this.selectedConversation = (this.actionToEdit.conversationName) ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
            this.getDeviceDetailsByConversationId();
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
        if (RESULT) {        // tslint:disable-next-line: triple-equals
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
            this.selectedPhone = this.resources.filter(e => e.name == this.selectedPhone).length > 0 ? this.selectedPhone : '';
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
            action: 'decline',
            conversationName: this.selectedConversation,
            phone: this.selectedPhone,
            continueonfailure: this.continueOnFailure 
            // line: this.selectedLine.toString().toLowerCase().replace('line', '')
        };
        // tslint:disable-next-line: max-line-length
        let query = this.selectedConversation + '.' + this.selectedPhone + '.decline(';
        if(this.continueOnFailure !=null){
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
