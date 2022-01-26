import { Injectable } from '@angular/core';
import { StartCallComponent } from '../modules/editor-actions/callProcessing/start-call/start-call.component';
import { AnswerCallComponent } from '../modules/editor-actions/callProcessing/answer-call/answer-call.component';
import { EndCallComponent } from '../modules/editor-actions/callProcessing/end-call/end-call.component';
import { VariablesDefinitionComponent } from '../modules/editor-actions/variables-definition/variables-definition.component';
import { StartCall } from '../modules/editor-actions/callProcessing/start-call/start-call';
import { AnswerCall } from '../modules/editor-actions/callProcessing/answer-call/answer-call';
import { EndCall } from '../modules/editor-actions/callProcessing/end-call/end-call';
import { HoldComponent } from '../modules/editor-actions/callProcessing/hold/hold.component';
import { Hold } from '../modules/editor-actions/callProcessing/hold/hold';
import { IgnoreComponent } from '../modules/editor-actions/callProcessing/ignore/ignore.component';
import { Ignore } from '../modules/editor-actions/callProcessing/ignore/ignore';
import { DtmfComponent } from '../modules/editor-actions/keyPress/dtmf/dtmf.component';
import { Dtmf } from '../modules/editor-actions/keyPress/dtmf/dtmf';
import { DialDigit } from '../modules/editor-actions/keyPress/dial-digit/dial-digit';
import { DialDigitComponent } from '../modules/editor-actions/keyPress/dial-digit/dial-digit.component';
import { BlindTransferComponent } from '../modules/editor-actions/callProcessing/blind-transfer/blind-transfer.component';
import { BlindTransfer } from '../modules/editor-actions/callProcessing/blind-transfer/blind-transfer';
import { PauseComponent } from '../modules/editor-actions/pause/pause/pause.component';
import { Pause } from '../modules/editor-actions/pause/pause/pause';
import { ResumeComponent } from '../modules/editor-actions/callProcessing/resume/resume.component';
import { Resume } from '../modules/editor-actions/callProcessing/resume/resume';
import { ValidateStatesComponent } from '../modules/editor-actions/validate/validate-states/validate-states.component';
import { ValidateStates } from '../modules/editor-actions/validate/validate-states/validate-states';
import { ConferenceStartComponent } from '../modules/editor-actions/callProcessing/conference-start/conference-start.component';
import { ConferenceStart } from '../modules/editor-actions/callProcessing/conference-start/conference-start';
import { ConferenceCompleteComponent } from '../modules/editor-actions/callProcessing/conference-complete/conference-complete.component';
import { ConferenceComplete } from '../modules/editor-actions/callProcessing/conference-complete/conference-complete';
import { TransferStartComponent } from '../modules/editor-actions/callProcessing/transfer-start/transfer-start.component';
import { TransferStart } from '../modules/editor-actions/callProcessing/transfer-start/transfer-start';
import { TransferCompleteComponent } from '../modules/editor-actions/callProcessing/transfer-complete/transfer-complete.component';
import { TransferComplete } from '../modules/editor-actions/callProcessing/transfer-complete/transfer-complete';
import { StartTraceComponent } from '../modules/editor-actions/trace-functions/start-trace/start-trace.component';
import { StartTrace } from '../modules/editor-actions/trace-functions/start-trace/start-trace';
import { StopTraceComponent } from '../modules/editor-actions/trace-functions/stop-trace/stop-trace.component';
import { StopTrace } from '../modules/editor-actions/trace-functions/stop-trace/stop-trace';
import { GetTraceComponent } from '../modules/editor-actions/trace-functions/get-trace/get-trace.component';
import { GetTrace } from '../modules/editor-actions/trace-functions/get-trace/get-trace';
import { FilterTrace } from '../modules/editor-actions/trace-functions/filter-trace/filter-trace';
import { FilterTraceComponent } from '../modules/editor-actions/trace-functions/filter-trace/filter-trace.component';
import { CallRestAPIComponent } from '../modules/editor-actions/apiActions/call-rest-api/call-rest-api.component';
import { CallRestAPI } from '../modules/editor-actions/apiActions/call-rest-api/call-rest-api';
import { ExecuteCommandComponent } from '../modules/editor-actions/apiActions/execute-command/execute-command.component';
import { ExecuteCommand } from '../modules/editor-actions/apiActions/execute-command/execute-command';
import { ValidateExpressionComponent } from '../modules/editor-actions/apiActions/validate-expression/validate-expression.component';
import { ValidateExpression } from '../modules/editor-actions/apiActions/validate-expression/validate-expression';
// tslint:disable-next-line:max-line-length
import { BroadworksProvisioningComponent } from '../modules/editor-actions/apiActions/broadworks-provisioning/broadworks-provisioning.component';
import { BroadworksProvisioning } from '../modules/editor-actions/apiActions/broadworks-provisioning/broadworks-provisioning';
import { KeyPressComponent } from '../modules/editor-actions/keyPress/key-press/key-press.component';
import { KeyPress } from '../modules/editor-actions/keyPress/key-press/key-press';
import { UnattendedTransferComponent } from '../modules/editor-actions/callProcessing/unattended-transfer/unattended-transfer.component';
import { UnattendedTransfer } from '../modules/editor-actions/callProcessing/unattended-transfer/unattended-transfer';
import { ValidateAudio } from '../modules/editor-actions/validate/validate-audio/validate-audio';
import { ValidateAudioComponent } from '../modules/editor-actions/validate/validate-audio/validate-audio.component';
import { GetConfigComponent } from '../modules/editor-actions/configActions/get-config/get-config.component';
import { GetConfig } from '../modules/editor-actions/configActions/get-config/get-config';
import { SetConfigComponent } from '../modules/editor-actions/configActions/set-config/set-config.component';
import { SetConfig } from '../modules/editor-actions/configActions/set-config/set-config';
import { RebootDeviceComponent } from '../modules/editor-actions/device/reboot-device/reboot-device.component';
import { RebootDevice } from '../modules/editor-actions/device/reboot-device/reboot-device';
import { HotelingguestCheckinComponent } from '../modules/editor-actions/hotelingGuest/hotelingguest-checkin/hotelingguest-checkin.component';
// tslint:disable-next-line:max-line-length
import { HotelingguestCheckoutComponent } from '../modules/editor-actions/hotelingGuest/hotelingguest-checkout/hotelingguest-checkout.component';
import { HotelingguestCheckin } from '../modules/editor-actions/hotelingGuest/hotelingguest-checkin/hotelingguest-checkin';
import { HotelingguestCheckout } from '../modules/editor-actions/hotelingGuest/hotelingguest-checkout/hotelingguest-checkout';
import { SyncComponent } from '../modules/editor-actions/device/sync/sync.component';
import { SyncDevice } from '../modules/editor-actions/device/sync/sync-device';
import { CallQualityStatsComponent } from '../modules/editor-actions/device/call-quality-stats/call-quality-stats.component';
import { CallQualityStats } from '../modules/editor-actions/device/call-quality-stats/call-quality-stats';
import { Mute } from '../modules/editor-actions/callProcessing/mute/mute';
import { MuteComponent } from '../modules/editor-actions/callProcessing/mute/mute.component';
import { GetMwiStatusComponent } from '../modules/editor-actions/callProcessing/get-mwi-status/get-mwi-status.component';
import { GetMwiStatus } from '../modules/editor-actions/callProcessing/get-mwi-status/get-mwi-status';
import { IgnoreCallComponent } from '../modules/editor-actions/callProcessing/ignore-call/ignore-call.component';
import { IgnoreCall } from '../modules/editor-actions/callProcessing/ignore-call/ignore-call';
import { GetTransferTypeComponent } from '../modules/editor-actions/device/get-transfer-type/get-transfer-type.component';
import { GetTransferType } from '../modules/editor-actions/device/get-transfer-type/get-transfer-type';
import { ConfigResetComponent } from '../modules/editor-actions/configActions/config-reset/config-reset.component';
import { ConfigReset } from '../modules/editor-actions/configActions/config-reset/config-reset';
import { SetTransferTypeComponent } from '../modules/editor-actions/device/set-transfer-type/set-transfer-type.component';
import { SetTrasferType } from '../modules/editor-actions/device/set-transfer-type/set-transfer-type';
import { ValidateMwiStatusComponent } from '../modules/editor-actions/validate/validate-mwi-status/validate-mwi-status.component';
import { ValidateMwiStatus } from '../modules/editor-actions/validate/validate-mwi-status/validate-mwi-status';
import { ValidateLedStatusComponent } from '../modules/editor-actions/validate/validate-led-status/validate-led-status.component';
import { ValidateLedStatus } from '../modules/editor-actions/validate/validate-led-status/validate-led-status';
import { SimulateHookStateComponent } from '../modules/editor-actions/userInteraction/simulate-hook-state/simulate-hook-state.component';
import { SimulateHookState } from '../modules/editor-actions/userInteraction/simulate-hook-state/simulate-hook-state';
import { SimulateTextInputComponent } from '../modules/editor-actions/userInteraction/simulate-text-input/simulate-text-input.component';
import { SimulateTextInput } from '../modules/editor-actions/userInteraction/simulate-text-input/simulate-text-input';
import { SimulateTouch } from '../modules/editor-actions/userInteraction/simulate-touch/simulate-touch';
import { SimulateTouchComponent } from '../modules/editor-actions/userInteraction/simulate-touch/simulate-touch.component';
import { ExportConfigComponent } from '../modules/editor-actions/configActions/export-config/export-config.component';
import { ExportConfig } from '../modules/editor-actions/configActions/export-config/export-config';
import { ValidateCallerIdComponent } from '../modules/editor-actions/validate/validate-caller-id/validate-caller-id.component';
import { ValidateCallerId } from '../modules/editor-actions/validate/validate-caller-id/validate-caller-id';
import { SimulateKeyEventComponent } from '../modules/editor-actions/userInteraction/simulate-key-event/simulate-key-event.component';
import { SimulateKeyEvent } from '../modules/editor-actions/userInteraction/simulate-key-event/simulate-key-event';
import { ConferenceHoldComponent } from '../modules/editor-actions/conferenceActions/conference-hold/conference-hold.component';
import { ConferenceHold } from '../modules/editor-actions/conferenceActions/conference-hold/conference-hold';
import { ConferenceMuteComponent } from '../modules/editor-actions/conferenceActions/conference-mute/conference-mute.component';
import { ConferenceMute } from '../modules/editor-actions/conferenceActions/conference-mute/conference-mute';
import { ConferenceRemoveParticipantComponent } from '../modules/editor-actions/conferenceActions/conference-remove-participant/conference-remove-participant.component';
import { ConferenceRemoveParticipant } from '../modules/editor-actions/conferenceActions/conference-remove-participant/conference-remove-participant';
import { ValidatePlayAudio } from '../modules/editor-actions/validate/validate-play-audio/validate-play-audio';
import { ValidatePlayAudioComponent } from '../modules/editor-actions/validate/validate-play-audio/validate-play-audio.component';
import { WebexLoginComponent } from '../modules/editor-actions/webexActions/webex-login/webex-login.component';
import { WebexLogin } from '../modules/editor-actions/webexActions/webex-login/webex-login';
import { WebexLogout } from '../modules/editor-actions/webexActions/webex-logout/webex-logout';
import { WebexLogoutComponent } from '../modules/editor-actions/webexActions/webex-logout/webex-logout.component';
import { ValidateLoginComponent } from '../modules/editor-actions/webexActions/validate-login/validate-login.component';
import { WebexCallForwardComponent } from '../modules/editor-actions/webexActions/webex-call-forward/webex-call-forward.component';
import { WebexCallForward } from '../modules/editor-actions/webexActions/webex-call-forward/webex-call-forward';
import { CallforwardVoicemailComponent } from '../modules/editor-actions/webexActions/callforward-voicemail/callforward-voicemail.component';
import { WebexVoiceMail } from '../modules/editor-actions/webexActions/callforward-voicemail/callforward-voicemail';
import { WebexCallPull } from '../modules/editor-actions/webexActions/webex-call-pull/webex-call-pull';
import { WebexCallPullComponent } from '../modules/editor-actions/webexActions/webex-call-pull/webex-call-pull.component';
import { WebexValidatePhoneComponent } from '../modules/editor-actions/webexActions/webex-validate-phone/webex-validate-phone.component';
import { WebexValidatePhone } from '../modules/editor-actions/webexActions/webex-validate-phone/webex-validate-phone';
import { AddParticpantToConversationComponent } from '../modules/editor-actions/callProcessing/add-particpant-to-conversation/add-particpant-to-conversation.component';
import { AddParticipantToConversation } from '../modules/editor-actions/callProcessing/add-particpant-to-conversation/add_participant_to_conversation';
import { MergeCallComponent } from '../modules/editor-actions/webexActions/merge-call/merge-call.component';
import { MergeCall } from '../modules/editor-actions/webexActions/merge-call/merge-call';
import { HoldAndAnswerComponent } from '../modules/editor-actions/webexActions/hold-and-answer/hold-and-answer.component';
import { HoldAndAnswer } from '../modules/editor-actions/webexActions/hold-and-answer/hold-and-answer';
import { ValidateUixmlComponent } from '../modules/editor-actions/validate/validate-uixml/validate-uixml.component';
import { ValidateUiXml } from '../modules/editor-actions/validate/validate-uixml/validate-uixml';
import { UixmlComponent } from '../modules/editor-actions/device/uixml/uixml.component';
import { Uixml } from '../modules/editor-actions/device/uixml/uixml';
import { ValidateMicComponent } from '../modules/editor-actions/validate/validate-mic/validate-mic.component';
import { ValidateMic } from '../modules/editor-actions/validate/validate-mic/validate-mic';
import { ValidateBlfComponent } from '../modules/editor-actions/validate/validate-blf/validate-blf.component';
import { ValidateBlf } from '../modules/editor-actions/validate/validate-blf/validate-blf';
import { VideoQualityStatsComponent } from '../modules/editor-actions/device/video-quality-stats/video-quality-stats.component';
import { VideoQualityStats } from '../modules/editor-actions/device/video-quality-stats/video-quality-stats';
import { SystemLogLevel } from '../modules/editor-actions/device/system-log-level/system-log-level';
import { SystemLogLevelComponent } from '../modules/editor-actions/device/system-log-level/system-log-level.component';
import { ValidateMediaStatsComponent } from '../modules/editor-actions/validate/validate-media-start/validate-media-stats/validate-media-stats.component';
import { ValidateMediaStats } from '../modules/editor-actions/validate/validate-media-start/validate-media-stats';
import { ValidatePresenceComponent } from '../modules/editor-actions/validate/validate-presence/validate-presence.component';
import { ValidatePresence } from '../modules/editor-actions/validate/validate-presence/validate-presence';
import { SettingsComponent } from '../modules/editor-actions/webexActions/settings/settings.component';
import { WebexSettings } from '../modules/editor-actions/webexActions/settings/settings';
import { WebexCallPickupComponent } from '../modules/editor-actions/webexActions/webex-call-pickup/webex-call-pickup.component';
import { WebexCallPickup } from '../modules/editor-actions/webexActions/webex-call-pickup/webex-call-pickup';
import { GetKeyComponent } from '../modules/editor-actions/keyPress/get-key/get-key.component';
import { GetKey } from '../modules/editor-actions/keyPress/get-key/get-key';
import { CallEscalationComponent } from '../modules/editor-actions/webexActions/call-escalation/call-escalation.component';
import { CallEscalation } from '../modules/editor-actions/webexActions/call-escalation/call-escalation';
import { AddCommentComponent } from '../modules/editor-actions/comment/add-comment/add-comment.component';
import { AddComment } from '../modules/editor-actions/comment/add-comment/add-comment';
import { GetValue } from '../modules/editor-actions/trace-functions/getvalue/getvalue';
import { GetvalueComponent } from '../modules/editor-actions/trace-functions/getvalue/getvalue.component';
import { EndAndAnswerComponent } from '../modules/editor-actions/webexActions/end-and-answer/end-and-answer.component';
import { EndAndAnswer } from '../modules/editor-actions/webexActions/end-and-answer/end-and-answer';
import { CompareVariables } from '../modules/editor-actions/apiActions/compare-variables/compare-variables';
import { CompareVariablesComponent } from '../modules/editor-actions/apiActions/compare-variables/compare-variables.component';
import { MSTeamsLoginComponent } from '../modules/editor-actions/teamsActions/ms-teams-login/ms-teams-login.component';
import { MSTeamsLogin } from '../modules/editor-actions/teamsActions/ms-teams-login/ms-teams-login';
import { MsTeamsLogoutComponent } from '../modules/editor-actions/teamsActions/ms-teams-logout/ms-teams-logout.component';
import { MSTeamsLogout } from '../modules/editor-actions/teamsActions/ms-teams-logout/ms-teams-logout';
import { MsTeamsSettings } from '../modules/editor-actions/teamsActions/ms-teams-settings/ms-teams-settings';
import { MsTeamsSettingsComponent } from '../modules/editor-actions/teamsActions/ms-teams-settings/ms-teams-settings.component';
import { AddResourceToGroup } from '../modules/editor-actions/callProcessing/add-resource-to-group/add-resource-to-group';
import { AddResourceToGroupComponent } from '../modules/editor-actions/callProcessing/add-resource-to-group/add-resource-to-group.component';
import { Constants } from '../model/constant';
import { MsTeamsMuteUnmuteComponent } from '../modules/editor-actions/teamsActions/ms-teams-mute-unmute/ms-teams-mute-unmute.component';
import { MsTeamsMuteUnmute } from '../modules/editor-actions/teamsActions/ms-teams-mute-unmute/ms-teams-mute-unmute';
import { MsTeamsCallEscalationComponent } from '../modules/editor-actions/teamsActions/ms-teams-call-escalation/ms-teams-call-escalation.component';
import { MsTeamsCallEscalation } from '../modules/editor-actions/teamsActions/ms-teams-call-escalation/ms-teams-call-escalation';

@Injectable({
    providedIn: 'root'
})
export class ActionsService {

    getAvailableActions() {
        return [
            {
                category: Constants.DECLARE_VARIABLE_CATEGORY,
                status: false, enabled: true,
                actionItems: [
                    {
                        name: 'Declare', action: VariablesDefinitionComponent,
                        title: 'Declare a variable of type phone, server or trace to use  in a test case'
                    }
                ]
            },
            // {
            //   category: 'Idle', status: false, enabled: true, actionItems: [
            //     { name: 'Idle', action: IdleComponent, model: "idle" }
            //   ]
            // },
            {
                category: Constants.CALL_PROCESSING_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Start Call', action: StartCallComponent,
                        model: StartCall, tag: 'call'
                    },
                    {
                        name: 'Answer Call', action: AnswerCallComponent,
                        model: AnswerCall, tag: 'answer'
                    },
                    {
                        name: 'End Call', action: EndCallComponent,
                        model: EndCall, tag: 'end'
                    },
                    {
                        name: 'Hold', action: HoldComponent,
                        model: Hold, tag: 'hold'
                    },
                    {
                        name: 'Resume', action: ResumeComponent,
                        model: Resume, tag: 'unhold'
                    },
                    // { name: 'P-Hold', action: PHoldComponent, model: PHold },
                    {
                        name: 'Decline', action: IgnoreComponent,
                        model: Ignore, tag: 'decline'
                    },
                    {
                        name: 'Add Resource To Conversation',
                        action: AddParticpantToConversationComponent,
                        model: AddParticipantToConversation, tag: 'add_phone_to_conversation'
                    },
                    {
                        name: 'Add Resources To Group',
                        action: AddResourceToGroupComponent,
                        model: AddResourceToGroup, tag: 'add_resource_to_group'
                    },
                    {
                        name: 'Blind Transfer', action: BlindTransferComponent,
                        model: BlindTransfer, tag: 'xfer_blind'
                    },
                    // { name: 'Call Barge', action: CallBargeComponent, model: CallBarge },
                    // { name: 'Silent Barge', action: SilentBargeComponent, model: SilentBarge },
                    {
                        name: 'Conference Start', action: ConferenceStartComponent,
                        model: ConferenceStart, tag: 'conf_start'
                    },
                    {
                        name: 'Complete Conference', action: ConferenceCompleteComponent,
                        model: ConferenceComplete, tag: 'conf_complete'
                    },
                    {
                        name: 'Transfer Start', action: TransferStartComponent,
                        model: TransferStart, tag: 'xfer_start'
                    },
                    {
                        name: 'Transfer Complete', action: TransferCompleteComponent,
                        model: TransferComplete, tag: 'xfer_complete'
                    },
                    {
                        name: 'Unattended Transfer',
                        action: UnattendedTransferComponent,
                        model: UnattendedTransfer,
                        tag: 'unattended_xfer_start'
                    },
                    {
                        name: 'Mute / UnMute', action: MuteComponent,
                        model: Mute, tag: 'mute'
                    },
                    {
                        name: 'Ignore', action: IgnoreCallComponent,
                        model: IgnoreCall, tag: 'ignore'
                    },
                    {
                        name: 'Play Audio', action: ValidatePlayAudioComponent,
                        model: ValidatePlayAudio, tag: 'play_audio'
                    },
                    // { name: 'Call Park', action: CallParkComponent, model: CallPark },
                    // { name: 'Call Retrieve', action: CallRetrieveComponent, model: CallRetrieve }
                ]
            },
            {
                category: Constants.CONFERENCE_ACTIONS_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Conference Hold', action: ConferenceHoldComponent,
                        model: ConferenceHold, tag: 'conf_hold'
                    },
                    {
                        name: 'Conference Mute', action: ConferenceMuteComponent,
                        model: ConferenceMute, tag: 'conf_mute'
                    },
                    {
                        name: 'Conference Remove Participant', action: ConferenceRemoveParticipantComponent,
                        model: ConferenceRemoveParticipant, tag: 'conf_remove'
                    },

                ]
            },
            {
                category: Constants.CONFIG_FILE_ACTIONS_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Get Configuration', action: GetConfigComponent,
                        model: GetConfig,
                        title: 'Get a configuration parameter from the phone configuration and save it into a variable', tag: 'get_config'
                    },
                    {
                        name: 'Set Configuration', action: SetConfigComponent,
                        model: SetConfig,
                        title: 'Change a configuration parameter on a phone. Note: This may cause the phone to reboot',
                        tag: 'set_config'
                    },
                    {
                        name: 'Reset Configuration', action: ConfigResetComponent,
                        model: ConfigReset,
                        title: 'Change a configuration parameter on a phone. Note: This may cause the phone to reboot',
                        tag: 'reset_config'
                    },
                    {
                        name: 'Export Configuration', action: ExportConfigComponent,
                        model: ExportConfig, tag: 'export_config'
                    }
                ]
            },
            {
                category: Constants.API_ACTIONS_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Broadworks Provisioning', action: BroadworksProvisioningComponent,
                        model: BroadworksProvisioning,
                        title: 'Modify user configuration on Broadworks using the OCI-P API',
                        tag: 'broadworks_provisioning'
                    },
                    {
                        name: 'Call Rest API', action: CallRestAPIComponent,
                        model: CallRestAPI,
                        title: 'Send POST/GET request to web services', tag: 'callrestapi'
                    },
                    {
                        name: 'Execute Command', action: ExecuteCommandComponent,
                        model: ExecuteCommand,
                        // tslint:disable-next-line:max-line-length
                        title: 'Trigger an action from an external script. Note: The script is uploaded to the onPOINT server (path:/home/automation/bin/)',
                        tag: 'executecommand'
                    }
                ]
            },
            {
                category: Constants.KEY_PRESS_CATEGORY, status: false, enabled: true, actionItems: [
                    { name: 'DTMF', action: DtmfComponent, model: Dtmf, title: 'Send DTMF digits on an active call', tag: 'dtmf' },
                    {
                        name: 'Dial Digits', action: DialDigitComponent,
                        model: DialDigit,
                        // tslint:disable-next-line:max-line-length
                        title: 'Dial out digits [0-9], *, # from a phone. This action is preceded by the phone going off-hook ( Press Key > Line)',
                        tag: 'dial'
                    },
                    // { name: 'Soft Keys', action: SoftKeysComponent, model: SoftKeys },
                    {
                        name: 'Press Key', action: KeyPressComponent,
                        model: KeyPress, title: 'Simulate a key press on the physical phone',
                        tag: 'key_press'
                    },
                    {
                        name: 'Find Key', action: GetKeyComponent,
                        model: GetKey, tag: 'get_key'
                    }
                    // { name: 'Release Key', action: KeyReleaseComponent, model: KeyRelease }
                ]
            },
            {
                category: Constants.TRACE_CAPTURE_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Start',
                        action: StartTraceComponent,
                        model: StartTrace,
                        title: 'Start packet capture on the phone',
                        tag: 'start_trace'
                    },
                    {
                        name: 'Stop',
                        action: StopTraceComponent,
                        model: StopTrace,
                        title: 'Stop packet capture on the phone',
                        tag: 'stop_trace'
                    },
                    {
                        name: 'Get Trace', action: GetTraceComponent,
                        model: GetTrace,
                        title: 'Retrieve packet capture from the phone',
                        tag: 'get_trace'
                    },
                    {
                        name: 'Filter Trace', action: FilterTraceComponent,
                        model: FilterTrace,
                        // tslint:disable-next-line:max-line-length
                        title: 'Apply a wireshark display filter to a packet capture.  The result is another packet capture. Number of packets can be stored in a variable',
                        tag: 'filter_trace'
                    },
                    {
                        name: 'Get Value', action: GetvalueComponent,
                        model: GetValue,
                        title: 'get Value of Trace',
                        tag: 'get_header_value'
                    }
                ]
            },
            {
                category: Constants.PAUSE_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Pause',
                        action: PauseComponent,
                        model: Pause,
                        title: 'onPOINT pauses for the defined number of seconds before executing the subsequent action',
                        tag: 'pause'
                    }
                ]
            },
            {
                category: Constants.VALIDATE_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Validate State', action: ValidateStatesComponent,
                        model: ValidateStates, tag: 'validate'
                    },
                    {
                        name: 'Validate Expression',
                        action: ValidateExpressionComponent,
                        model: ValidateExpression,
                        title: 'Validate a variable against a value using logical operators',
                        tag: 'validateexpression'
                    },
                    {
                        name: 'Compare Variables',
                        action: CompareVariablesComponent,
                        model: CompareVariables,
                        // title: 'Comparing a variable against a value using logical operators',
                        tag: 'compare_variables'
                    },
                    { name: 'Validate Audio', action: ValidateAudioComponent, model: ValidateAudio, tag: 'check_audio' },
                    {
                        name: 'Validate Mwi Status',
                        action: ValidateMwiStatusComponent,
                        model: ValidateMwiStatus, tag: 'validate_mwi_status'
                    },
                    {
                        name: 'Validate Led Status',
                        action: ValidateLedStatusComponent,
                        model: ValidateLedStatus, tag: 'validate_led_status'
                    },
                    {
                        name: 'Validate Caller Id', action: ValidateCallerIdComponent,
                        model: ValidateCallerId, tag: 'validate_caller_id'
                    },
                    {
                        name: 'Validate UI', action: ValidateUixmlComponent,
                        model: ValidateUiXml, tag: 'validate_ui_xml'
                    },
                    // {
                    //     name: 'Validate BLF', action: ValidateBlfComponent,
                    //     model: ValidateBlf, title: 'For Poly BLF actions please use Validate->ValidateUI.', tag: 'validate_blf'
                    // },
                    {
                        name: 'Validate Mic', action: ValidateMicComponent,
                        model: ValidateMic, tag: 'validate_mic'
                    },
                    {
                        name: 'Validate Media Stats', action: ValidateMediaStatsComponent,
                        model: ValidateMediaStats, tag: 'validate_media_stats'
                    },
                    {
                        name: 'Validate Presence', action: ValidatePresenceComponent,
                        model: ValidatePresence, tag: 'validate_presence'
                    }
                ]
            },
            {
                category: Constants.DEVICE_MANAGEMENT_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Reboot Device', action: RebootDeviceComponent,
                        model: RebootDevice, tag: 'reboot_device'
                    },
                    {
                        name: 'Sync', action: SyncComponent,
                        model: SyncDevice, tag: 'phone_sync'
                    },
                    {
                        name: 'Call Quality Stats', action: CallQualityStatsComponent,
                        model: CallQualityStats, tag: 'call_quality_stats'
                    },
                    {
                        name: 'Video Quality Stats', action: VideoQualityStatsComponent,
                        model: VideoQualityStats, tag: 'video_quality_stats'
                    },
                    {
                        name: 'Set Transfer Type', action: SetTransferTypeComponent,
                        model: SetTrasferType, tag: 'set_transfer_type'
                    },
                    {
                        name: 'Get Transfer Type', action: GetTransferTypeComponent,
                        model: GetTransferType, tag: 'get_transfer_type'
                    },
                    {
                        name: 'UI XML', action: UixmlComponent,
                        model: Uixml, tag: 'ui_xml'
                    },
                    {
                        name: 'System Log Level', action: SystemLogLevelComponent,
                        model: SystemLogLevel, tag: 'system_log_level'
                    },
                ]
            },
            {
                category: Constants.HOTELING_GUEST_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Hoteling Guest CheckIn', action: HotelingguestCheckinComponent,
                        model: HotelingguestCheckin, tag: 'hoteling_guest_checkin'
                    },
                    {
                        name: 'Hoteling Guest CheckOut', action: HotelingguestCheckoutComponent,
                        model: HotelingguestCheckout, tag: 'hoteling_guest_checkout'
                    },
                ]
            },
            {
                category: Constants.USER_INTERACTION_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Simulate Hook State', action: SimulateHookStateComponent,
                        model: SimulateHookState, tag: 'simulate_hook_state'
                    },
                    {
                        name: 'Simulate Touch', action: SimulateTouchComponent,
                        model: SimulateTouch, tag: 'simulate_touch'
                    },
                    {
                        name: 'Simulate Text Input', action: SimulateTextInputComponent,
                        model: SimulateTextInput, tag: 'simulate_text'
                    },
                    {
                        name: 'Simulate Key Event', action: SimulateKeyEventComponent,
                        model: SimulateKeyEvent, tag: 'simulate_key_event'
                    }
                ]
            },
            {
                category: Constants.WEBEX_ACTIONS_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Login', action: WebexLoginComponent,
                        model: WebexLogin, tag: 'login'
                    },
                    {
                        name: 'Logout', action: WebexLogoutComponent,
                        model: WebexLogout, tag: 'logout'
                    },
                    {
                        name: 'Validate Login', action: ValidateLoginComponent,
                        model: WebexLogin, tag: 'validate_login'
                    },
                    {
                        name: 'Call Forward', action: WebexCallForwardComponent,
                        model: WebexCallForward, tag: 'callForwarding'
                    },
                    // {
                    //     name: 'Voice Mail', action: CallforwardVoicemailComponent,
                    //     model: WebexVoiceMail, tag: 'voicemail'
                    // },
                    {
                        name: 'Call Pull', action: WebexCallPullComponent,
                        model: WebexCallPull, tag: 'callPull'
                    },
                    {
                        name: 'Validate Calling Service', action: WebexValidatePhoneComponent,
                        model: WebexValidatePhone, tag: 'validate_phone'
                    },
                    {
                        name: 'Merge Call', action: MergeCallComponent,
                        model: MergeCall, tag: 'merge_call'
                    },
                    {
                        name: 'Hold And Answer', action: HoldAndAnswerComponent,
                        model: HoldAndAnswer, tag: 'hold_and_answer'
                    },
                    {
                        name: 'Settings', action: SettingsComponent,
                        model: WebexSettings, tag: 'webex_setConfig'
                    },
                    {
                        name: 'Call Pickup', action: WebexCallPickupComponent,
                        model: WebexCallPickup, tag: 'callPickup'
                    },
                    {
                        name: 'Call Escalation', action: CallEscalationComponent,
                        model: CallEscalation, tag: 'call_escalation'
                    },
                    {
                        name: 'End And Answer', action: EndAndAnswerComponent,
                        model: EndAndAnswer, tag: 'end_and_answer'
                    }
                ]
            },
            {
                category: Constants.MSFT_TEAMS_ACTIONS_CATEGORY, status: false, enabled: true, actionItems: [
                    {
                        name: 'Login', action: MSTeamsLoginComponent,
                        model: MSTeamsLogin, tag: 'login'
                    },
                    {
                        name: 'Logout', action: MsTeamsLogoutComponent,
                        model: MSTeamsLogout, tag: 'logout'
                    },
                    {
                        name: 'Settings', action: MsTeamsSettingsComponent,
                        model: MsTeamsSettings, tag: 'msft_settings'

                    },
                    {
                        name: 'Merge Call', action: MergeCallComponent,
                        model: MergeCall, tag: 'msft_merge_call'
                    },
                    {
                        name: 'Call Escalation', action: MsTeamsCallEscalationComponent,
                        model: MsTeamsCallEscalation, tag: 'msft_call_escalation'
                    },
                    {
                        name: 'Mute All', action: MsTeamsMuteUnmuteComponent,
                        model: MsTeamsMuteUnmute, tag: 'mute_participants'
                    }
                ]
            },
            {
                category: Constants.UTILITY_CATEGORY, status: false, enabled: false, actionItems: [
                    {
                        name: 'Comment', action: AddCommentComponent,
                        model: AddComment, tag: 'comment'
                    }
                ]
            }
        ];
    }
}
