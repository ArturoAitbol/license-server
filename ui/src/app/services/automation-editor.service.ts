import { CallBarge } from '../modules/editor-actions/callProcessing/call-barge/call-barge';
import { EventEmitter, Injectable } from '@angular/core';
import { StartCall } from '../modules/editor-actions/callProcessing/start-call/start-call';
import { EndCall } from '../modules/editor-actions/callProcessing/end-call/end-call';
import { AnswerCall } from '../modules/editor-actions/callProcessing/answer-call/answer-call';
import { Idle } from '../modules/editor-actions/idle/idle';
import { Hold } from '../modules/editor-actions/callProcessing/hold/hold';
import { PHold } from '../modules/editor-actions/callProcessing/p-hold/p-hold';
import { Ignore } from '../modules/editor-actions/callProcessing/ignore/ignore';
import { Dtmf } from '../modules/editor-actions/keyPress/dtmf/dtmf';
import { DialDigit } from '../modules/editor-actions/keyPress/dial-digit/dial-digit';
import { BlindTransfer } from '../modules/editor-actions/callProcessing/blind-transfer/blind-transfer';
import { Pause } from '../modules/editor-actions/pause/pause/pause';
import { Resume } from '../modules/editor-actions/callProcessing/resume/resume';
import { ValidateStates } from '../modules/editor-actions/validate/validate-states/validate-states';
import { SilentBarge } from '../modules/editor-actions/callProcessing/silent-barge/silent-barge';
import { ConferenceStart } from '../modules/editor-actions/callProcessing/conference-start/conference-start';
import { ConferenceComplete } from '../modules/editor-actions/callProcessing/conference-complete/conference-complete';
import { TransferStart } from '../modules/editor-actions/callProcessing/transfer-start/transfer-start';
import { TransferComplete } from '../modules/editor-actions/callProcessing/transfer-complete/transfer-complete';
import { StartTrace } from '../modules/editor-actions/trace-functions/start-trace/start-trace';
import { StopTrace } from '../modules/editor-actions/trace-functions/stop-trace/stop-trace';
import { FilterTrace } from '../modules/editor-actions/trace-functions/filter-trace/filter-trace';
import { GetTrace } from '../modules/editor-actions/trace-functions/get-trace/get-trace';
import { CallRestAPI } from '../modules/editor-actions/apiActions/call-rest-api/call-rest-api';
import { ExecuteCommand } from '../modules/editor-actions/apiActions/execute-command/execute-command';
import { ValidateExpression } from '../modules/editor-actions/apiActions/validate-expression/validate-expression';
import { BroadworksProvisioning } from '../modules/editor-actions/apiActions/broadworks-provisioning/broadworks-provisioning';
import { UnattendedTransfer } from '../modules/editor-actions/callProcessing/unattended-transfer/unattended-transfer';
import { KeyRelease } from '../modules/editor-actions/keyPress/key-release/key-release';
import { KeyPress } from '../modules/editor-actions/keyPress/key-press/key-press';
import { CallPark } from '../modules/editor-actions/callProcessing/call-park/call-park';
import { CallRetrieve } from '../modules/editor-actions/callProcessing/call-retrieve/call-retrieve';
import { ValidateAudio } from '../modules/editor-actions/validate/validate-audio/validate-audio';
import { GetConfig } from '../modules/editor-actions/configActions/get-config/get-config';
import { SetConfig } from '../modules/editor-actions/configActions/set-config/set-config';
import { RebootDevice } from '../modules/editor-actions/device/reboot-device/reboot-device';
import { HotelingguestCheckin } from '../modules/editor-actions/hotelingGuest/hotelingguest-checkin/hotelingguest-checkin';
import { HotelingguestCheckout } from '../modules/editor-actions/hotelingGuest/hotelingguest-checkout/hotelingguest-checkout';
import { SyncDevice } from '../modules/editor-actions/device/sync/sync-device';
import { CallQualityStats } from '../modules/editor-actions/device/call-quality-stats/call-quality-stats';
import { ConversationName } from '../helpers/conversation-name';
import { Mute } from '../modules/editor-actions/callProcessing/mute/mute';
import { GetMwiStatus } from '../modules/editor-actions/callProcessing/get-mwi-status/get-mwi-status';
import { IgnoreCall } from '../modules/editor-actions/callProcessing/ignore-call/ignore-call';
import { GetTransferType } from '../modules/editor-actions/device/get-transfer-type/get-transfer-type';
import { ConfigReset } from '../modules/editor-actions/configActions/config-reset/config-reset';
import { SetTrasferType } from '../modules/editor-actions/device/set-transfer-type/set-transfer-type';
import { ValidateMwiStatus } from '../modules/editor-actions/validate/validate-mwi-status/validate-mwi-status';
import { ValidateLedStatus } from '../modules/editor-actions/validate/validate-led-status/validate-led-status';
import { SimulateHookState } from '../modules/editor-actions/userInteraction/simulate-hook-state/simulate-hook-state';
import { SimulateTextInput } from '../modules/editor-actions/userInteraction/simulate-text-input/simulate-text-input';
import { SimulateTouch } from '../modules/editor-actions/userInteraction/simulate-touch/simulate-touch';
import { ExportConfig } from '../modules/editor-actions/configActions/export-config/export-config';
import { ValidateCallerId } from '../modules/editor-actions/validate/validate-caller-id/validate-caller-id';
import { SimulateKeyEvent } from '../modules/editor-actions/userInteraction/simulate-key-event/simulate-key-event';
import { ConferenceHold } from '../modules/editor-actions/conferenceActions/conference-hold/conference-hold';
import { ConferenceMute } from '../modules/editor-actions/conferenceActions/conference-mute/conference-mute';
import { ConferenceRemoveParticipant } from '../modules/editor-actions/conferenceActions/conference-remove-participant/conference-remove-participant';
import { ValidatePlayAudio } from '../modules/editor-actions/validate/validate-play-audio/validate-play-audio';
import { WebexLogin } from '../modules/editor-actions/webexActions/webex-login/webex-login';
import { WebexLogout } from '../modules/editor-actions/webexActions/webex-logout/webex-logout';
import { ValidateWebexLogin } from '../modules/editor-actions/webexActions/validate-login/validate-login';
import { WebexCallForward } from '../modules/editor-actions/webexActions/webex-call-forward/webex-call-forward';
import { WebexVoiceMail } from '../modules/editor-actions/webexActions/callforward-voicemail/callforward-voicemail';
import { WebexCallPull } from '../modules/editor-actions/webexActions/webex-call-pull/webex-call-pull';
import { WebexValidatePhone } from '../modules/editor-actions/webexActions/webex-validate-phone/webex-validate-phone';
import { AddParticipantToConversation } from '../modules/editor-actions/callProcessing/add-particpant-to-conversation/add_participant_to_conversation';
import { MergeCall } from '../modules/editor-actions/webexActions/merge-call/merge-call';
import { HoldAndAnswer } from '../modules/editor-actions/webexActions/hold-and-answer/hold-and-answer';
import { ValidateUiXml } from '../modules/editor-actions/validate/validate-uixml/validate-uixml';
import { Uixml } from '../modules/editor-actions/device/uixml/uixml';
import { Action } from '../model/action';
import { ValidateMic } from '../modules/editor-actions/validate/validate-mic/validate-mic';
import { ValidateBlf } from '../modules/editor-actions/validate/validate-blf/validate-blf';
import { VideoQualityStats } from '../modules/editor-actions/device/video-quality-stats/video-quality-stats';
import { SystemLogLevel } from '../modules/editor-actions/device/system-log-level/system-log-level';
import { ValidateMediaStats } from '../modules/editor-actions/validate/validate-media-start/validate-media-stats';
import { ValidatePresence } from '../modules/editor-actions/validate/validate-presence/validate-presence';
import { WebexSettings } from '../modules/editor-actions/webexActions/settings/settings';
import { WebexCallPickup } from '../modules/editor-actions/webexActions/webex-call-pickup/webex-call-pickup';
import { GetKey } from '../modules/editor-actions/keyPress/get-key/get-key';
import { CallEscalation } from '../modules/editor-actions/webexActions/call-escalation/call-escalation';
import { AddComment } from '../modules/editor-actions/comment/add-comment/add-comment';
import { GetValue } from '../modules/editor-actions/trace-functions/getvalue/getvalue';
import { EndAndAnswer } from '../modules/editor-actions/webexActions/end-and-answer/end-and-answer';
import { CompareVariables } from '../modules/editor-actions/apiActions/compare-variables/compare-variables';
import { MSTeamsLogin } from '../modules/editor-actions/teamsActions/ms-teams-login/ms-teams-login';
import { MsTeamsSettings } from '../modules/editor-actions/teamsActions/ms-teams-settings/ms-teams-settings';
import { AddResourceToGroup } from '../modules/editor-actions/callProcessing/add-resource-to-group/add-resource-to-group';
import { Constants } from '../model/constant';
import { Phone } from '../model/phone';
import { MsTeamsMuteUnmute } from '../modules/editor-actions/teamsActions/ms-teams-mute-unmute/ms-teams-mute-unmute';
import { MsTeamsCallEscalation } from '../modules/editor-actions/teamsActions/ms-teams-call-escalation/ms-teams-call-escalation';
@Injectable({
    providedIn: 'root'
})
export class AutomationEditorService {
    generateAction: EventEmitter<any>;
    initedEditor: EventEmitter<any>;
    initedSecondaryEditor: EventEmitter<any>;
    insertAction: EventEmitter<any>;
    insertMultipleActions: EventEmitter<any>;
    addedResource: EventEmitter<any>;
    addedConversation: EventEmitter<any>;
    titleEmitter: EventEmitter<any>;
    subtitleEmitter: EventEmitter<any>;
    enabledTitle: EventEmitter<any>;
    enabledSubtitle: EventEmitter<any>;
    cancelAction: EventEmitter<any>;
    addIntermediateConv$: EventEmitter<any>;
    editAction: EventEmitter<any>;
    private resources: any = [];
    private conversations: any = [];
    private conversationWithUserDetails: any = [];
    private intermediateConversation: any = [];
    private resourceAddedInConversationList: any = [];
    private resourceAddedInMergeCallList: any = [];
    private uiXMLResourceKeys: any = [];
    private callQltyResourceKeys: any = [];
    private compareVariableKeys: any = [];
    public readonly DEFAULT_CONVERSATION_NAME: string = ConversationName.DEFAULT;
    public readonly DEFAULT_INTERMEDIATE_CONVERSATION_NAME: string = ConversationName.INTERMEDIATE;
    private groupResources: any = [];
    private inventoryMappedList: [{ resourceName: '', actions: [] }] | any = [];
    private actionsList: any = [];
    constructor() {
        this.enabledTitle = new EventEmitter<any>();
        this.enabledSubtitle = new EventEmitter<any>();
        this.generateAction = new EventEmitter<any>();
        this.insertAction = new EventEmitter<any>();
        this.addedResource = new EventEmitter<any>();
        this.addedConversation = new EventEmitter<any>();
        this.titleEmitter = new EventEmitter<any>();
        this.subtitleEmitter = new EventEmitter<any>();
        this.initedEditor = new EventEmitter<any>();
        this.initedSecondaryEditor = new EventEmitter<any>();
        this.cancelAction = new EventEmitter<any>();
        this.insertMultipleActions = new EventEmitter<any>();
        this.addIntermediateConv$ = new EventEmitter<any>();
        this.editAction = new EventEmitter<any>();
        this.clearActionsList();
        this.clearInventoryMappedList();
        this.clearGroupResources();
    }

    public addConversation(conversation: any) {
        this.conversations.push(conversation);
    }

    public setConversations(conversations: string[]) {
        this.conversations = conversations;
    }

    public addConversationsWithUsers(data: any): void {
        this.conversationWithUserDetails.push(data);
    }

    public addIntermediateConversation(data: any): void {
        this.intermediateConversation.push(data);
    }

    public set setConversationsWithUsers(data: []) {
        this.conversationWithUserDetails = data;
    }

    public deleteResourceInConversationsWithUsers(data: any) {
        this.conversationWithUserDetails.forEach((e: any) => {
            if (e.conversationName === data.conversationName) {
                if (e.resources && e.resources.length > 0) {
                    const indexValue = e.resources.findIndex(element => element && element.name == data.resourceName);
                    e.resources.splice(indexValue, 1);
                }
            }
        });

    }

    public set setIntermedidateConversations(data: []) {
        this.intermediateConversation = data;
    }

    public get fetchConversationsWithUsers(): [] {
        return this.conversationWithUserDetails;
    }

    public get fetchIntermediateConversations(): [] {
        return this.intermediateConversation;
    }

    public getConversations() {
        return this.conversations;
    }

    public deleteConversation(conversation: any) {
        this.conversations.forEach((currentConversation, index) => {
            if (currentConversation === conversation) {
                this.conversations.splice(index, 1);
            }
        });

        // tslint:disable-next-line: triple-equals
        const indexValue = this.conversationWithUserDetails.findIndex(e => e.conversationName == conversation);
        this.conversationWithUserDetails.splice(indexValue, 1);
    }

    public deleteIntermediateConversation(conversationName: string): void {
        // tslint:disable-next-line: triple-equals
        const indexValue = this.intermediateConversation.findIndex(e => e.conversationName == conversationName);
        this.intermediateConversation.splice(indexValue, 1);
        // tslint:disable-next-line: triple-equals
        const index = this.conversations.findIndex(e => e.conversationName == conversationName);
        this.conversations.splice(index, 1);
    }

    addResource(resource: any) {
        this.resources.push(resource);
    }

    getResources() {
        return this.resources;
    }

    getFilteredResources(filters: any) {
        return this.resources.filter(x => filters.map(y => y).includes(x.type));
    }

    getGroupResourcesByGroupName(groupName: string) {
        return this.groupResources.find(x => x.groupName === groupName)['resources'].map(x => this.resources.find(y => y.name === x));
    }
    async setResources(resources: any) {
        this.resources = resources;
        await this.addResourcesToConversationList();
        if (this.resourceAddedInMergeCallList.length > 0) {
            this.resourceAddedInMergeCallList.forEach(data => {
                const RESULT = this.conversationWithUserDetails.filter(e => e.conversationName == data.conversationName)[0];
                const details = [];
                if (RESULT) {
                    const fromResource = this.resources.filter(e => e.name == RESULT['from'])[0];
                    details.push(fromResource);
                    const toResource = this.resources.filter(e => e.name == RESULT['to'])[0];
                    details.push(toResource);
                }
                if (details.length > 0) {
                    this.conversationWithUserDetails.forEach(e => {
                        if (e.conversationName == data.intermediateConvName) {
                            if (e['resources']) {
                                e['resources'] = [...new Set(e['resources'].concat(details))];
                            } else {
                                e['resources'] = details;
                            }
                        }
                    });
                    this.setConversationsWithUsers = this.conversationWithUserDetails;
                }
            });
        }
        await this.buildInventoryMapping();
    }
    /**
     * add resources to conversation list
     */
    private async addResourcesToConversationList() {
        if (this.resourceAddedInConversationList.length > 0) {
            this.resourceAddedInConversationList.forEach((element: any) => {
                if (element.hasOwnProperty('phoneName') && this.resources.length > 0) {
                    const details = this.resources.filter(e => e.name == element.phoneName);
                    this.conversationWithUserDetails.forEach(e => {
                        if (e.conversationName == element.conversationName) {
                            if (e['resources']) {
                                e['resources'] = [...new Set(e['resources'].concat(details))];
                            } else {
                                e['resources'] = details;
                            }
                        }
                    });
                } else if (element.hasOwnProperty('groupName') && this.resources.length > 0) {
                    const group = this.resources.filter((e: Phone) => e.name == element.groupName);
                    const groupDetails = this.groupResources.filter(e => e.groupName == element.groupName)[0];
                    if (groupDetails && groupDetails['resources']) {
                        const details = groupDetails['resources'].map(e => this.resources.filter(x => x.name == e)[0]).concat(group);
                        this.conversationWithUserDetails.forEach(e => {
                            if (e.conversationName == element.conversationName) {
                                if (e['resources'] && details) {
                                    e['resources'] = [...new Set(e['resources'].concat(details))];
                                } else {
                                    e['resources'] = details;
                                }
                            }
                        });
                    }
                }
            });
        }
    }
    /**
     * delete selected resource
     * @param resource: string
     */
    deleteResource(resource: string) {
        this.resources.forEach((existingResource: Phone, index: number) => {
            if (existingResource.name === resource) {
                this.resources.splice(index, 1);
            }
        });
    }

    /**
     * set Ui XML resource keys array
     * @param key: string
     */
    public setUiXMLResourceKeys(keys: string[]): void {
        this.uiXMLResourceKeys = keys;
    }
    /**
     * add Ui XML resource key to the array
     * @param key: string
     */
    public addUiXMLResourceKeys(key: string): void {
        this.uiXMLResourceKeys.push(key);
    }
    /**
     * get Ui XML resource keys
     */
    public getUiXMLResourceKeys(): any {
        return [... new Set(this.uiXMLResourceKeys)];
    }
    public setcallQltyResourceKeys(keysList?: string[]) {
        this.callQltyResourceKeys = keysList;
    }
    public addcallQltyResourceKeys(key: string): void {
        this.callQltyResourceKeys.push(key);
    }
    public getCallQltyResourceKeys(): any[] {
        return [... new Set(this.callQltyResourceKeys)];
    }
    public deleteCallQltyResourceKeys(key: string): void {
        if (key) {
            const index: number = this.callQltyResourceKeys.findIndex((e: string) => e.toLowerCase() === key.toLowerCase());
            if (index !== -1) {
                this.callQltyResourceKeys.splice(index, 1);
            }
        }
    }
    public setCompareVariableKeys(keysList?: string[]) {
        this.compareVariableKeys = keysList;
    }
    public addCompareVariableKeys(key: string): void {
        this.compareVariableKeys.push(key);
    }
    public getCompareVariableKeys(): any {
        return [... new Set(this.compareVariableKeys)];
    }
    public deleteCompareVariableKeys(key: string): void {
        const index: number = this.compareVariableKeys.findIndex((e: string) => e.toLowerCase() === key.toLowerCase());
        if (index !== -1) {
            this.compareVariableKeys.splice(index, 1);
        }
    }
    /**
     * delete Ui Xml resource from the existing array
     * @param key:string
     */
    public deleteUiXmlResource(key: string): void {
        const index: number = this.uiXMLResourceKeys.findIndex((e: string) => e.toLowerCase() === key.toLowerCase());
        if (index !== -1) {
            this.uiXMLResourceKeys.splice(index, 1);
        }
    }
    /**
     * set selected resources to group 
     * @param resources: [] 
     */
    public async setGroupResources(resource: { groupName: string, resources: string[] }) {
        const index: number = this.groupResources.findIndex((e: { groupName: string, resources: string[] }) => e.groupName === resource.groupName);
        if (index === -1 && resource.groupName) {
            this.groupResources.push(resource);
        } else {
            const actionToEdit = JSON.parse(localStorage.getItem('current-action'));
            if (actionToEdit && actionToEdit.action === 'add_resource_to_group') {
                this.groupResources[index]['resources'] = (resource.resources);
            } else {
                const obj = { ...this.groupResources[index] };
                this.groupResources[index]['resources'] = obj['resources'].concat(resource.resources);
                this.groupResources[index]['resources'] = [...new Set(this.groupResources[index]['resources'])];
            }
        }
        const groupInvolvedActions = this.inventoryMappedList.find((e: any) => e.resourceName === resource.groupName);
        if (groupInvolvedActions && groupInvolvedActions.actions.length > 0) {
            await this.addResourcesToConversationList();
        }
    }
    /**
      * get group resources array
      * @returns:[{groupName:string, resources:string[]}]
      */
    public getGroupResources() {
        return this.groupResources;
    }
    /**
     * delete particular group resource from group resources array
     * @param resource: {groupName:string, resources:string[]} 
     */
    public deleteGroupResources(resource: { groupName: string, resources: string[] }) {
        const index: number = this.groupResources.findIndex((e: { groupName: string, resources: string[] }) => e.groupName === resource.groupName);
        if (index !== -1) {
            this.groupResources.splice(index, 1);
        }
    }
    /**
     * clear all group resources
     */
    public clearGroupResources() {
        this.groupResources = [];
    }

    public setInventoryMappedList(item: any) {
        this.inventoryMappedList.push(item);
    }

    public getInventoryMappedList() {
        return this.inventoryMappedList;
    }

    public clearInventoryMappedList() { this.inventoryMappedList = []; }

    public setActionsList(list: any) {
        this.actionsList = list;
    }

    public getActionsList() {
        return this.actionsList;
    }

    /**
     * clear all actions list
     */
    public clearActionsList() { this.actionsList = []; }
    /**
     * get all the resources involved by the conversation ID
     * @param convId: string
     * @returns: string[]
     */
    public getResourcesInConversation(convId: string): string[] {
        let list: string[] = [];
        const selectedConverstaionDetails = this.conversationWithUserDetails.find((e: any) => e.conversationName === convId);
        if (selectedConverstaionDetails) {
            if (selectedConverstaionDetails.from) {
                list.push(selectedConverstaionDetails.from);
            }
            if (selectedConverstaionDetails.to) {
                list.push(selectedConverstaionDetails.to);
            }
            if (selectedConverstaionDetails.resources) {
                list = list.concat(selectedConverstaionDetails.resources.map((e: any) => e.name));
            }
        }
        return [...list];
    }
    /**
     * build relationship by inventory resources
     * @returns :[{resourceName: string, actions:[]}]
     */
    async buildInventoryMapping(): Promise<any> {
        // const relationObject = [];
        const inventory: any[] = this.resources;
        inventory.forEach((resource: any) => {
            const object = { resourceName: '', actions: [] };
            object.resourceName = resource.name;
            switch (resource.type) {
                case Constants.PHONE_RESOURCE:
                    object.actions = this.actionsList.filter((action: Action) => (action.from === resource.name || action.to === resource.name || action.phone === resource.name));
                    break;
                case Constants.SERVER_RESOURCE:
                    object.actions = this.actionsList.filter((action: Action) => (action.from === resource.name || action.to === resource.name || action.server === resource.name));
                    break;
                case Constants.USER_RESOURCE:
                    object.actions = this.actionsList.filter((action: Action) => (action.from === resource.name || action.to === resource.name || action.user === resource.name));
                    break;
                case Constants.GROUP_RESOURCE:
                    object.actions = this.actionsList.filter((action: Action) => (action.resourceGroup === resource.name));
                    break;
                case Constants.TRACE_RESOURCE:
                    object.actions = this.actionsList.filter((action: Action) => (action.inTrace === resource.name || action.outTrace === resource.name));
                    break;
            }
            this.setInventoryMappedList(object);
        });
        return this.getInventoryMappedList();
    }

    queryGenerator(data: Action, primaryEditor: boolean) {
        let response: string = '';
        const intermediateConversation: string = (data.intermediateConvName) ?
            data.intermediateConvName : this.DEFAULT_INTERMEDIATE_CONVERSATION_NAME;
        switch (data.action) {
            case 'idle':
                response = Idle.generateQuery(data);
                break;
            case 'call':
                if (primaryEditor) {
                    const conversation = (data.conversationName) ? data.conversationName : this.DEFAULT_CONVERSATION_NAME;
                    const $startCall = {
                        conversationName: conversation,
                        from: data.from,
                        to: data.to
                    };
                    // check point for duplicate conversation names
                    if (!this.conversations.includes(conversation)) {
                        this.addConversation(conversation);
                        this.addConversationsWithUsers($startCall);
                    }
                }
                response = StartCall.generateQuery(data);
                break;
            case 'answer':
                response = AnswerCall.generateQuery(data);
                break;
            case 'end':
                response = EndCall.generateQuery(data);
                break;
            case 'hold':
                response = Hold.generateQuery(data);
                break;
            case 'phold':
                response = PHold.generateQuery(data);
                break;
            case 'decline':
                response = Ignore.generateQuery(data);
                break;
            case 'dtmf':
                response = Dtmf.generateQuery(data);
                break;
            case 'dial':
                response = DialDigit.generateQuery(data);
                break;
            case 'xfer_blind':
                response = BlindTransfer.generateQuery(data);
                break;
            case 'pause':
                response = Pause.generateQuery(data);
                break;
            case 'unhold':
                response = Resume.generateQuery(data);
                break;
            case 'validate':
                response = ValidateStates.generateQuery(data);
                break;
            case 'call_barge':
                response = CallBarge.generateQuery(data);
                break;
            case 'silent_barge':
                response = SilentBarge.generateQuery(data);
                break;
            case 'conf_start':
                const $requiredData = {
                    conversationName: intermediateConversation,
                    from: data.from,
                    to: data.to
                };
                if (!this.intermediateConversation.includes(this.DEFAULT_INTERMEDIATE_CONVERSATION_NAME)) {
                    this.addIntermediateConversation(intermediateConversation);
                    this.addConversation(intermediateConversation);
                    this.addConversationsWithUsers($requiredData);
                }
                response = ConferenceStart.generateQuery(data);
                break;
            case 'conf_complete':
                response = ConferenceComplete.generateQuery(data);
                break;
            case 'xfer_start':
                const $data = {
                    conversationName: intermediateConversation,
                    from: data.from,
                    to: data.to
                };
                if (!this.intermediateConversation.includes(this.DEFAULT_INTERMEDIATE_CONVERSATION_NAME)) {
                    this.addIntermediateConversation(intermediateConversation);
                    this.addConversation(intermediateConversation);
                    this.addConversationsWithUsers($data);
                }
                response = TransferStart.generateQuery(data);
                break;
            case 'xfer_complete':
                response = TransferComplete.generateQuery(data);
                break;
            case 'start_trace':
                response = StartTrace.generateQuery(data);
                break;
            case 'stop_trace':
                response = StopTrace.generateQuery(data);
                break;
            case 'filter_trace':
                response = FilterTrace.generateQuery(data);
                break;
            case 'get_trace':
                response = GetTrace.generateQuery(data);
                break;
            case 'get_header_value':
                response = GetValue.generateQuery(data);
                this.addCompareVariableKeys(data.resultIn);
                break;
            case 'callrestapi':
                response = CallRestAPI.generateQuery(data);
                break;
            case 'executecommand':
                response = ExecuteCommand.generateQuery(data);
                break;
            case 'validateexpression':
                response = ValidateExpression.generateQuery(data);
                break;
            case 'validate_media_stats':
                response = ValidateMediaStats.generateQuery(data);
                break;
            case 'compare_variables':
                response = CompareVariables.generateQuery(data);
                break;
            case 'broadworks_provisioning':
                response = BroadworksProvisioning.generateQuery(data);
                break;
            case 'key_press':
                response = KeyPress.generateQuery(data);
                break;
            case 'key_release':
                response = KeyRelease.generateQuery(data);
                break;
            case 'unattended_xfer_start':
                response = UnattendedTransfer.generateQuery(data);
                break;
            case 'callpark':
                response = CallPark.generateQuery(data);
                break;
            case 'callretrieve':
                response = CallRetrieve.generateQuery(data);
                break;
            case 'check_audio':
                response = ValidateAudio.generateQuery(data);
                break;
            case 'get_config':
                response = GetConfig.generateQuery(data);
                break;
            case 'set_config':
                response = SetConfig.generateQuery(data);
                break;
            case 'reboot_device':
            case 'restart_device':
            case 'reset_device':
                response = RebootDevice.generateQuery(data);
                break;
            case 'hoteling_guest_checkin':
                response = HotelingguestCheckin.generateQuery(data);
                break;
            case 'hoteling_guest_checkout':
                response = HotelingguestCheckout.generateQuery(data);
                break;
            case 'phone_sync':
                response = SyncDevice.generateQuery(data);
                break;

            case 'call_quality_stats':
                response = CallQualityStats.generateQuery(data);
                this.addcallQltyResourceKeys(data.resultIn);
                break;
            case 'mute':
            case 'unmute':
                response = Mute.generateQuery(data);
                break;
            case 'check_mwi':
                response = GetMwiStatus.generateQuery(data);
                break;
            case 'ignore':
                response = IgnoreCall.generateQuery(data);
                break;
            case 'set_transfer_type':
                response = SetTrasferType.generateQuery(data);
                break;
            case 'get_transfer_type':
                response = GetTransferType.generateQuery(data);
                break;
            case 'reset_config':
                response = ConfigReset.generateQuery(data);
                break;
            case 'validate_mwi_status':
                response = ValidateMwiStatus.generateQuery(data);
                break;
            case 'validate_led_status':
                response = ValidateLedStatus.generateQuery(data);
                break;
            case 'simulate_hook_state':
                response = SimulateHookState.generateQuery(data);
                break;
            case 'simulate_touch':
                response = SimulateTouch.generateQuery(data);
                break;
            case 'simulate_text':
                response = SimulateTextInput.generateQuery(data);
                break;
            case 'export_config':
                response = ExportConfig.generateQuery(data);
                break;
            case 'validate_caller_id':
                response = ValidateCallerId.generateQuery(data);
                break;
            case 'simulate_key_event':
                response = SimulateKeyEvent.generateQuery(data);
                break;
            case 'conf_hold':
                response = ConferenceHold.generateQuery(data);
                break;
            case 'conf_mute':
                response = ConferenceMute.generateQuery(data);
                break;
            case 'conf_remove':
                response = ConferenceRemoveParticipant.generateQuery(data);
                break;
            case 'play_audio':
                response = ValidatePlayAudio.generateQuery(data);
                break;
            case 'login':
                // && !data.user
                if (data.value) {
                    response = WebexLogin.generateQuery(data);
                } else {
                    response = MSTeamsLogin.generateQuery(data);
                }
                break;
            case 'logout':
                response = WebexLogout.generateQuery(data);
                break;
            case 'validate_login':
                response = ValidateWebexLogin.generateQuery(data);
                break;
            case 'callForwarding':
                response = WebexCallForward.generateQuery(data);
                break;
            case 'voicemail':
                response = WebexVoiceMail.generateQuery(data);
                break;
            case 'callPull':
                response = WebexCallPull.generateQuery(data);
                break;
            case 'validate_phone':
                response = WebexValidatePhone.generateQuery(data);
                break;
            case 'add_phone_to_conversation':
                if (data.phone) {
                    this.resourceAddedInConversationList.push({ phoneName: data.phone, conversationName: data.conversationName });
                } else if (data.resourceGroup) {
                    this.resourceAddedInConversationList.push({ groupName: data.resourceGroup, conversationName: data.conversationName });
                    this.addResourcesToConversationList();
                }
                response = AddParticipantToConversation.generateQuery(data);
                break;
            case 'merge_call':
            case 'msft_merge_call':
                this.resourceAddedInMergeCallList.push(data);
                response = MergeCall.generateQuery(data);
                break;
            case 'hold_and_answer':
                response = HoldAndAnswer.generateQuery(data);
                break;
            case 'validate_ui_xml':
                response = ValidateUiXml.generateQuery(data);
                break;
            case 'ui_xml':
                response = Uixml.generateQuery(data);
                this.addUiXMLResourceKeys(data.resultIn);
                break;
            case 'validate_mic':
                response = ValidateMic.generateQuery(data);
                break;
            case 'validate_blf':
                response = ValidateBlf.generateQuery(data);
                break;
            case 'video_quality_stats':
                response = VideoQualityStats.generateQuery(data);
                break;
            case 'system_log_level':
                response = SystemLogLevel.generateQuery(data);
                break;
            case 'validate_presence':
                response = ValidatePresence.generateQuery(data);
                break;
            case 'webex_setConfig':
                response = WebexSettings.generateQuery(data);
                break;
            case 'callPickup':
                response = WebexCallPickup.generateQuery(data);
                break;
            case 'get_key':
                response = GetKey.generateQuery(data);
                break;
            case 'call_escalation':
                response = CallEscalation.generateQuery(data);
                break;
            case 'comment':
                response = AddComment.generateQuery(data);
                break;
            case 'end_and_answer':
                response = EndAndAnswer.generateQuery(data);
                break;
            case 'msft_settings':
                response = MsTeamsSettings.generateQuery(data);
                break;
            case 'add_resource_to_group':
                const groupResourcesObject: { groupName: string, resources: string[] } = { groupName: data.resourceGroup, resources: data.value.split(',') };
                this.setGroupResources(groupResourcesObject);
                response = AddResourceToGroup.generateQuery(data);
                break;
            case 'msft_call_escalation':
                response = MsTeamsCallEscalation.generateQuery(data);
                break;
            case 'mute_participants':
                response = MsTeamsMuteUnmute.generateQuery(data);
                break;
        }
        return response;
    }
}
