import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { ConversationName } from 'src/app/helpers/conversation-name';
import { Constants } from 'src/app/model/constant';
import { Phone } from 'src/app/model/phone';

@Component({
    selector: 'app-validate-states',
    templateUrl: './validate-states.component.html',
    styleUrls: ['./validate-states.component.css']
})
export class ValidateStatesComponent implements OnInit, OnDestroy {
    action: any;
    subscription: Subscription;
    resources: any = [];
    lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
    selecteResource: any = '';
    selecteResourceObj: any = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
    selectedLine: any = 'Line1';
    callType = 'none';
    callState = 'none';
    lineState = 'none';
    actionToEdit: any = {};
    conversations: any = [];
    selectedConversation: string = '';
    resourcesBk: any;
    conversationsWithResources: any = [];
    continueOnFailure: boolean = false;

    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        // this.resources = this.aeService.getFilteredResources(['Phone']);
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        this.conversations = this.aeService.getConversations();
        this.conversationsWithResources = this.aeService.fetchConversationsWithUsers;
        this.resources = this.resourcesBk = this.aeService.getFilteredResources([Constants.PHONE_RESOURCE,Constants.GROUP_RESOURCE]);
        if (this.actionToEdit) {
            if (this.actionToEdit.conversationName && !this.actionToEdit.line) {
                // tslint:disable-next-line: max-line-length
                this.selectedConversation = this.actionToEdit.conversationName ? this.actionToEdit.conversationName : this.aeService.DEFAULT_CONVERSATION_NAME;
                this.getDeviceDetailsByConversationId();
            } else if (!this.actionToEdit.conversationName && this.actionToEdit.line) {
                this.selectedConversation = '';
            }
            this.selecteResource = (this.actionToEdit.phone) ? this.actionToEdit.phone : this.actionToEdit.resourceGroup;
            this.selectedLine = (this.actionToEdit.line) ? 'Line' + this.actionToEdit.line : '';
            this.callState = this.actionToEdit.callstate;
            this.lineState = this.actionToEdit.linestate;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
            this.resources.some((resource: Phone) => {
                if (this.selecteResource == resource.name) {
                    this.selecteResourceObj = resource;
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

        } if (RESULT && RESULT['resources'] && RESULT['resources'].length > 0) {
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
            this.selecteResource = this.resources.filter(e => e.name == this.selecteResource).length > 0 ? this.selecteResource : '';

        }
    }


    createAction() {
        const lines = this.selectedLine.toString().toLowerCase().replace('line', '');
        const item = {
            action: 'validate',
            phone: ((this.selecteResourceObj.type === Constants.PHONE_RESOURCE)) ? this.selecteResource : null,
            resourceGroup: (this.selecteResourceObj.type === Constants.GROUP_RESOURCE) ? this.selecteResource : null,
            line: (this.selectedConversation == '') ? lines : null,
            linestate: this.lineState,
            callstate: this.callState,
            conversationName: (this.selectedConversation != '') ? this.selectedConversation : ConversationName.NO_CONVERSATION,
            calltype: this.callType,
            continueonfailure: this.continueOnFailure
        };
        let query = '';
        if (this.selecteResourceObj.model === 'WEBEX-TEAMS') {
            query = (this.selectedConversation == '') ? this.selecteResource : this.selectedConversation + '.' + this.selecteResource;
        } else if (this.selectedConversation != '') {
            query = this.selectedConversation + '.' + this.selecteResource;
        } else {
            query += this.selecteResource + '.' + this.selectedLine.toLowerCase();
        }
        // tslint:disable-next-line: max-line-length
        query += '.validate(linestate==\'' + this.lineState + '\' && callstate==\'' + this.callState + '\' && calltype== \'' + this.callType + '\'';

        if (this.continueOnFailure != null) {
            query += `,"${this.continueOnFailure}"`;
        }
        query += ')';
        this.action = { action: item, query: query };
    }

    /**
     * on select resource
     * @param value:string
     */
    onSelectResource(value: string) {
        if (value == undefined || value == '') {
            this.selecteResourceObj = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
        } else if (value) {
            this.selecteResourceObj = this.resources.filter(e => e.name === value)[0];
        }
    }
    /**
     * on change line dropdown
     * @param value: any 
     */
    onSelectLine(value: any) {
    }
    /**
     * return true if the vendor is polycom
     * @returns :boolean
     */
    enablePolyCallState(): boolean { return this.selecteResourceObj.vendor.toString().toLowerCase() === Constants.Polycom.toLowerCase(); }
    /**
     * return true if the vendor is cisco and model is webex-teams
     * @returns: boolean 
     */
    enableWebexCallState(): boolean { return this.selecteResourceObj.vendor.toString().toLowerCase() === Constants.Cisco.toLowerCase() && this.selecteResourceObj.model.toString().toLowerCase() === Constants.Webex.toLowerCase(); }
    /**
     * return true if the vendor is grandstream
     * @returns: boolean 
     */
    enableGrandstreamCallState(): boolean { return this.selecteResourceObj.vendor.toString().toLowerCase() === Constants.GS.toLowerCase(); }
    /**
     * return true if the vendor is yealink
     * @returns: boolean 
     */
    enableYealinkCallState(): boolean { return this.selecteResourceObj.vendor.toString().toLowerCase() === Constants.Yealink.toLowerCase(); }
    /**
     * return true if the vendor is microsoft and model is ms-teams
     * @returns: boolean 
     */
    enableMSTeamsCallState(): boolean { return this.selecteResourceObj.vendor.toString().toLowerCase() === Constants.MS.toLowerCase() && this.selecteResourceObj.model.toString().toLowerCase() === Constants.MS_TEAMS.toLowerCase(); }
    /**
     *return true if the type is group
     * @returns: boolean 
     */
    enableGroupCallState(): boolean { return this.selecteResourceObj.type.toString().toLowerCase() === Constants.GROUP_RESOURCE.toLowerCase(); }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
