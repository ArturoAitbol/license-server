import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from '../../../../services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { ConversationName } from 'src/app/helpers/conversation-name';

@Component({
    selector: 'app-validate-caller-id',
    templateUrl: './validate-caller-id.component.html',
    styleUrls: ['./validate-caller-id.component.css']
})
export class ValidateCallerIdComponent implements OnInit, OnDestroy {

    action: any;
    actions: any = [];
    subscription: Subscription;
    resources: any;
    validationType: string[] = ['Caller Name', 'Caller Number'];
    operators: string[] = ['==', '!='];
    selectedValidationType: any = [];
    selectedOperator: string;
    selectedPhone: string;
    actionToEdit: any = {};
    callerName: string;
    callerNumber: string;
    objType: any = { type: '', value: '', operator: '' };
    selectedValidationTypeBk: any = [];
    lineCount: number = 0;
    conversations: any = [];
    selectedConversation: string = '';
    resourcesBk: any;
    conversationsWithResources: any = [];
    continueOnFailure: boolean = false;
    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit(): void {
        this.conversations = this.aeService.getConversations();
        this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
        this.selectedValidationType = [this.objType];
        this.selectedPhone = '';
        // this.selectedValidationType = [{ type: '', value: '' }];
        this.resources = this.resourcesBk = this.aeService.getFilteredResources(['Phone'])
            .filter((e: Phone) => e.vendor == 'Polycom' || e.vendor == 'Yealink');
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            if (this.actionToEdit.conversationName && !this.actionToEdit.line) {
                // tslint:disable-next-line: max-line-length
                this.selectedConversation = this.actionToEdit.conversationName ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
                this.getDeviceDetailsByConversationId();
            }
            this.selectedOperator = this.actionToEdit.operator;
            this.selectedPhone = this.actionToEdit.phone;
            this.callerNumber = (this.actionToEdit.callerNumber) ? this.actionToEdit.callerNumber : null;
            this.callerName = (this.actionToEdit.callerName) ? this.actionToEdit.callerName : null;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
            const type = this.actionToEdit.value.split(',');
            this.selectedValidationType.length = type.length;
            for (let index = 0; index < type.length; index++) {
                if (type[index] == 'Caller Name') {
                    this.callerName = this.actionToEdit.callerName;
                    this.selectedValidationType[index] = {
                        type: 'Caller Name',
                        value: this.actionToEdit.callerName,
                        operator: this.selectedOperator
                    };
                } else if (type[index] == 'Caller Number') {
                    this.callerNumber = this.actionToEdit.callerNumber;
                    this.selectedValidationType[index] = {
                        type: 'Caller Number',
                        value: this.actionToEdit.callerNumber,
                        operator: this.selectedOperator
                    };
                }
            }
        }
        this.subscription = this.aeService.generateAction.subscribe(() => {
            this.insertAction();
        });
    }

    /**
     * add new parameter
     */
    addParameter(): void {
        this.selectedValidationTypeBk = JSON.parse(JSON.stringify(this.selectedValidationType));
        this.lineCount++;
        this.selectedValidationType = JSON.parse(JSON.stringify(this.selectedValidationTypeBk));
        this.selectedValidationType.push({ type: '', value: '', operator: '' });
        this.selectedValidationTypeBk = JSON.parse(JSON.stringify(this.selectedValidationType));
    }

    /**
     * delete particular parameter with index value
     */
    deleteParameter(index: number): void {
        if (this.selectedValidationType.length > 1) {
            this.lineCount--;
            this.selectedValidationType.splice(index, 1);
            this.selectedValidationTypeBk = JSON.parse(JSON.stringify(this.selectedValidationType));
        }
    }

    /**
     * send event when modal is closed
     */
    cancel(): void {
        this.aeService.cancelAction.emit();
    }

    /**
     * insert action
     */
    insertAction(): void {
        this.createAction();
        // only edit that particular action
        if (this.actionToEdit) {
            this.aeService.insertAction.emit(this.actions[0]);
        } else {
            this.aeService.insertMultipleActions.emit(this.actions);
        }
    }

    /**
     * create query & action
     */
    createAction() {
        const type = this.selectedValidationType.map(e => e.type).toString();
        this.selectedValidationType.forEach(element => {
            const item = {
                action: 'validate_caller_id',
                phone: this.selectedPhone,
                callerName: (element.type === 'Caller Name') ? element.value : null,
                callerNumber: (element.type === 'Caller Number') ? element.value : null,
                value: element.type,
                operator: element.operator,
                conversationName: (this.selectedConversation != '') ? this.selectedConversation : ConversationName.NO_CONVERSATION,
                continueonfailure: this.continueOnFailure
            };
            // tslint:disable-next-line: max-line-length
            let query = item.conversationName + '.' + this.selectedPhone + '.validateCallerId(type=\'' + element.type + '\',operator=\'' + element.operator + '\'';
            if (element.type === 'Caller Name') {
                query += ',callerName=\'' + element.value + '\'';
            }
            if (element.type === 'Caller Number') {
                query += ',callerNumber=\'' + element.value + '\'';
            }
            if (this.continueOnFailure != null) {
                query += `,"${this.continueOnFailure}"`;
            }
            query += ')';
            this.actions.push({ action: item, query: query });
        });
    }


    /**
     * get resources based on selected conversation ID
     * @returns void
     */
    getDeviceDetailsByConversationId(): void {
        // tslint:disable-next-line: triple-equals
        const RESULT = this.conversationsWithResources.filter(e => e.conversationName == this.selectedConversation)[0];
        //if (RESULT) {
        // tslint:disable-next-line: triple-equals
        //this.resources = this.resourcesBk.filter(e => e.name == RESULT.from || e.name == RESULT.to);
        //}
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
        } else {
            this.resources = this.resourcesBk;
        }
        // check if the existing resource found in the that conversation resource or not
        if (this.actionToEdit) {
            // tslint:disable-next-line: triple-equals
            this.selectedPhone = this.resources.filter(e => e.name == this.selectedPhone).length > 0 ? this.selectedPhone : '';
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
