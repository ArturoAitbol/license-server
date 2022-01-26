import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnswerCallComponent } from './callProcessing/answer-call/answer-call.component';
import { BlindTransferComponent } from './callProcessing/blind-transfer/blind-transfer.component';
import { BroadworksProvisioningComponent } from './apiActions/broadworks-provisioning/broadworks-provisioning.component';
import { CallBargeComponent } from './callProcessing/call-barge/call-barge.component';
import { CallParkComponent } from './callProcessing/call-park/call-park.component';
import { CallRestAPIComponent } from './apiActions/call-rest-api/call-rest-api.component';
import { CallRetrieveComponent } from './callProcessing/call-retrieve/call-retrieve.component';
import { ConferenceCompleteComponent } from './callProcessing/conference-complete/conference-complete.component';
import { ConferenceStartComponent } from './callProcessing/conference-start/conference-start.component';
import { DialDigitComponent } from './keyPress/dial-digit/dial-digit.component';
import { DtmfComponent } from './keyPress/dtmf/dtmf.component';
import { EndCallComponent } from './callProcessing/end-call/end-call.component';
import { ExecuteCommandComponent } from './apiActions/execute-command/execute-command.component';
import { FilterTraceComponent } from './trace-functions/filter-trace/filter-trace.component';
import { GetConfigComponent } from './configActions/get-config/get-config.component';
import { GetTraceComponent } from './trace-functions/get-trace/get-trace.component';
import { HoldComponent } from './callProcessing/hold/hold.component';
import { IdleComponent } from './idle/idle.component';
import { IgnoreComponent } from './callProcessing/ignore/ignore.component';
import { KeyPressComponent } from './keyPress/key-press/key-press.component';
import { KeyReleaseComponent } from './keyPress/key-release/key-release.component';
import { PHoldComponent } from './callProcessing/p-hold/p-hold.component';
import { PauseComponent } from './pause/pause/pause.component';
import { RebootDeviceComponent } from './device/reboot-device/reboot-device.component';
import { ResumeComponent } from './callProcessing/resume/resume.component';
import { SetConfigComponent } from './configActions/set-config/set-config.component';
import { SilentBargeComponent } from './callProcessing/silent-barge/silent-barge.component';
import { SoftKeysComponent } from './keyPress/soft-keys/soft-keys.component';
import { StartCallComponent } from './callProcessing/start-call/start-call.component';
import { StartTraceComponent } from './trace-functions/start-trace/start-trace.component';
import { StopTraceComponent } from './trace-functions/stop-trace/stop-trace.component';
import { TransferCompleteComponent } from './callProcessing/transfer-complete/transfer-complete.component';
import { TransferStartComponent } from './callProcessing/transfer-start/transfer-start.component';
import { UnattendedTransferComponent } from './callProcessing/unattended-transfer/unattended-transfer.component';
import { ValidateAudioComponent } from './validate/validate-audio/validate-audio.component';
import { ValidateExpressionComponent } from './apiActions/validate-expression/validate-expression.component';
import { ValidateStatesComponent } from './validate/validate-states/validate-states.component';
import { VariablesDefinitionComponent } from './variables-definition/variables-definition.component';
import { SharedModule } from '../shared/shared.module';
import { HotelingguestCheckinComponent } from './hotelingGuest/hotelingguest-checkin/hotelingguest-checkin.component';
import { HotelingguestCheckoutComponent } from './hotelingGuest/hotelingguest-checkout/hotelingguest-checkout.component';
import { SyncComponent } from './device/sync/sync.component';
import { CallQualityStatsComponent } from './device/call-quality-stats/call-quality-stats.component';
import { MuteComponent } from './callProcessing/mute/mute.component';
import { GetMwiStatusComponent } from './callProcessing/get-mwi-status/get-mwi-status.component';
import { IgnoreCallComponent } from './callProcessing/ignore-call/ignore-call.component';
import { GetTransferTypeComponent } from './device/get-transfer-type/get-transfer-type.component';
import { ConfigResetComponent } from './configActions/config-reset/config-reset.component';
import { SetTransferTypeComponent } from './device/set-transfer-type/set-transfer-type.component';
import { ValidateMwiStatusComponent } from './validate/validate-mwi-status/validate-mwi-status.component';
import { ValidateLedStatusComponent } from './validate/validate-led-status/validate-led-status.component';
import { SimulateHookStateComponent } from './userInteraction/simulate-hook-state/simulate-hook-state.component';
import { SimulateTextInputComponent } from './userInteraction/simulate-text-input/simulate-text-input.component';
import { SimulateTouchComponent } from './userInteraction/simulate-touch/simulate-touch.component';
import { ExportConfigComponent } from './configActions/export-config/export-config.component';
import { ValidateCallerIdComponent } from './validate/validate-caller-id/validate-caller-id.component';
import { SimulateKeyEventComponent } from './userInteraction/simulate-key-event/simulate-key-event.component';
import { ConferenceMuteComponent } from './conferenceActions/conference-mute/conference-mute.component';
import { ConferenceHoldComponent } from './conferenceActions/conference-hold/conference-hold.component';
import { ConferenceRemoveParticipantComponent } from './conferenceActions/conference-remove-participant/conference-remove-participant.component';
import { ValidatePlayAudioComponent } from './validate/validate-play-audio/validate-play-audio.component';
import { WebexLoginComponent } from './webexActions/webex-login/webex-login.component';
import { WebexLogoutComponent } from './webexActions/webex-logout/webex-logout.component';
import { ValidateLoginComponent } from './webexActions/validate-login/validate-login.component';
import { WebexCallForwardComponent } from './webexActions/webex-call-forward/webex-call-forward.component';
import { CallforwardVoicemailComponent } from './webexActions/callforward-voicemail/callforward-voicemail.component';
import { WebexCallPullComponent } from './webexActions/webex-call-pull/webex-call-pull.component';
import { WebexValidatePhoneComponent } from './webexActions/webex-validate-phone/webex-validate-phone.component';
import { AddParticpantToConversationComponent } from './callProcessing/add-particpant-to-conversation/add-particpant-to-conversation.component';
import { MergeCallComponent } from './webexActions/merge-call/merge-call.component';
import { HoldAndAnswerComponent } from './webexActions/hold-and-answer/hold-and-answer.component';
import { UixmlComponent } from './device/uixml/uixml.component';
import { ValidateUixmlComponent } from './validate/validate-uixml/validate-uixml.component';
import { ValidateMicComponent } from './validate/validate-mic/validate-mic.component';
import { ValidateBlfComponent } from './validate/validate-blf/validate-blf.component';
import { VideoQualityStatsComponent } from './device/video-quality-stats/video-quality-stats.component';
import { SystemLogLevelComponent } from './device/system-log-level/system-log-level.component';
import { ValidateMediaStatsComponent } from './validate/validate-media-start/validate-media-stats/validate-media-stats.component';
import { ValidatePresenceComponent } from './validate/validate-presence/validate-presence.component';
import { SettingsComponent } from './webexActions/settings/settings.component';
import { WebexCallPickupComponent } from './webexActions/webex-call-pickup/webex-call-pickup.component';
import { GetKeyComponent } from './keyPress/get-key/get-key.component';
import { CallEscalationComponent } from './webexActions/call-escalation/call-escalation.component';
import { AddCommentComponent } from './comment/add-comment/add-comment.component';
import { GetvalueComponent } from './trace-functions/getvalue/getvalue.component';
import { EndAndAnswerComponent } from './webexActions/end-and-answer/end-and-answer.component';
import { CompareVariablesComponent } from './apiActions/compare-variables/compare-variables.component';
import { MSTeamsLoginComponent } from './teamsActions/ms-teams-login/ms-teams-login.component';
import { MsTeamsLogoutComponent } from './teamsActions/ms-teams-logout/ms-teams-logout.component';
import { MsTeamsSettingsComponent } from './teamsActions/ms-teams-settings/ms-teams-settings.component';
import { AddResourceToGroupComponent } from './callProcessing/add-resource-to-group/add-resource-to-group.component';
import { MsTeamsMuteUnmuteComponent } from './teamsActions/ms-teams-mute-unmute/ms-teams-mute-unmute.component';
import { MsTeamsCallEscalationComponent } from './teamsActions/ms-teams-call-escalation/ms-teams-call-escalation.component';


@NgModule({
  declarations: [
    AnswerCallComponent,
    BlindTransferComponent,
    BroadworksProvisioningComponent,
    CallBargeComponent,
    CallParkComponent,
    CallRestAPIComponent,
    CallRetrieveComponent,
    ConferenceCompleteComponent,
    ConferenceStartComponent,
    DialDigitComponent,
    DtmfComponent,
    EndCallComponent,
    ExecuteCommandComponent,
    FilterTraceComponent,
    GetConfigComponent,
    GetTraceComponent,
    HoldComponent,
    IdleComponent,
    IgnoreComponent,
    KeyPressComponent,
    KeyReleaseComponent,
    PHoldComponent,
    PauseComponent,
    RebootDeviceComponent,
    ResumeComponent,
    SetConfigComponent,
    SilentBargeComponent,
    SoftKeysComponent,
    StartCallComponent,
    StartTraceComponent,
    StopTraceComponent,
    TransferCompleteComponent,
    TransferStartComponent,
    UnattendedTransferComponent,
    ValidateAudioComponent,
    ValidateExpressionComponent,
    ValidateStatesComponent,
    VariablesDefinitionComponent,
    HotelingguestCheckinComponent,
    HotelingguestCheckoutComponent,
    SyncComponent,
    CallQualityStatsComponent,
    MuteComponent,
    GetMwiStatusComponent,
    IgnoreCallComponent,
    GetTransferTypeComponent,
    ConfigResetComponent,
    SetTransferTypeComponent,
    ValidateMwiStatusComponent,
    ValidateLedStatusComponent,
    SimulateHookStateComponent,
    SimulateTextInputComponent,
    SimulateTouchComponent,
    ExportConfigComponent,
    ValidateCallerIdComponent,
    SimulateKeyEventComponent,
    ConferenceMuteComponent,
    ConferenceHoldComponent,
    ConferenceRemoveParticipantComponent,
    ValidatePlayAudioComponent,
    WebexLoginComponent,
    WebexLogoutComponent,
    ValidateLoginComponent,
    WebexCallForwardComponent,
    CallforwardVoicemailComponent,
    WebexCallPullComponent,
    WebexValidatePhoneComponent,
    AddParticpantToConversationComponent,
    MergeCallComponent,
    HoldAndAnswerComponent,
    UixmlComponent,
    ValidateUixmlComponent,
    ValidateMicComponent,
    ValidateBlfComponent,
    VideoQualityStatsComponent,
    SystemLogLevelComponent,
    ValidateMediaStatsComponent,
    ValidatePresenceComponent,
    SettingsComponent,
    WebexCallPickupComponent,
    GetKeyComponent,
    CallEscalationComponent,
    AddCommentComponent,
    GetvalueComponent,
    EndAndAnswerComponent,
    CompareVariablesComponent,
    MSTeamsLoginComponent,
    MsTeamsLogoutComponent,
    MsTeamsSettingsComponent,
    AddResourceToGroupComponent,
    MsTeamsCallEscalationComponent,
    MsTeamsMuteUnmuteComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    AnswerCallComponent,
    BlindTransferComponent,
    BroadworksProvisioningComponent,
    CallBargeComponent,
    CallParkComponent,
    CallRestAPIComponent,
    CallRetrieveComponent,
    ConferenceCompleteComponent,
    ConferenceStartComponent,
    DialDigitComponent,
    DtmfComponent,
    EndCallComponent,
    ExecuteCommandComponent,
    FilterTraceComponent,
    GetConfigComponent,
    GetTraceComponent,
    HoldComponent,
    IdleComponent,
    IgnoreComponent,
    KeyPressComponent,
    KeyReleaseComponent,
    PHoldComponent,
    PauseComponent,
    RebootDeviceComponent,
    ResumeComponent,
    SetConfigComponent,
    SilentBargeComponent,
    SoftKeysComponent,
    StartCallComponent,
    StartTraceComponent,
    StopTraceComponent,
    TransferCompleteComponent,
    TransferStartComponent,
    UnattendedTransferComponent,
    ValidateAudioComponent,
    ValidateExpressionComponent,
    ValidateStatesComponent,
    VariablesDefinitionComponent,
    HotelingguestCheckinComponent,
    HotelingguestCheckoutComponent,
    SyncComponent,
    CallQualityStatsComponent,
    MuteComponent,
    GetMwiStatusComponent,
    IgnoreCallComponent,
    GetTransferTypeComponent,
    ConfigResetComponent,
    SetTransferTypeComponent,
    ValidateMwiStatusComponent,
    ValidateLedStatusComponent,
    SimulateHookStateComponent,
    SimulateTextInputComponent,
    SimulateTouchComponent,
    ExportConfigComponent,
    ValidateCallerIdComponent,
    SimulateKeyEventComponent,
    ConferenceMuteComponent,
    ConferenceHoldComponent,
    ConferenceRemoveParticipantComponent,
    ValidatePlayAudioComponent,
    WebexLoginComponent,
    WebexLogoutComponent,
    ValidateLoginComponent,
    WebexCallForwardComponent,
    CallforwardVoicemailComponent,
    WebexCallPullComponent,
    WebexValidatePhoneComponent,
    AddParticpantToConversationComponent,
    MergeCallComponent,
    HoldAndAnswerComponent,
    UixmlComponent,
    ValidateUixmlComponent,
    ValidateMicComponent,
    ValidateBlfComponent,
    VideoQualityStatsComponent,
    SystemLogLevelComponent,
    ValidatePresenceComponent,
    SettingsComponent,
    WebexCallPickupComponent,
    GetKeyComponent,
    CallEscalationComponent,
    AddCommentComponent,
    GetvalueComponent,
    EndAndAnswerComponent,
    CompareVariablesComponent,
    MSTeamsLoginComponent,
    MsTeamsLogoutComponent,
    MsTeamsSettingsComponent,
    AddResourceToGroupComponent,
    MsTeamsCallEscalationComponent,
    MsTeamsMuteUnmuteComponent
  ],
  entryComponents: [
    AnswerCallComponent,
    BlindTransferComponent,
    BroadworksProvisioningComponent,
    CallBargeComponent,
    CallParkComponent,
    CallRestAPIComponent,
    CallRetrieveComponent,
    ConferenceCompleteComponent,
    ConferenceStartComponent,
    DialDigitComponent,
    DtmfComponent,
    EndCallComponent,
    ExecuteCommandComponent,
    FilterTraceComponent,
    GetConfigComponent,
    GetTraceComponent,
    HoldComponent,
    IdleComponent,
    IgnoreComponent,
    KeyPressComponent,
    KeyReleaseComponent,
    PHoldComponent,
    PauseComponent,
    RebootDeviceComponent,
    ResumeComponent,
    SetConfigComponent,
    SilentBargeComponent,
    SoftKeysComponent,
    StartCallComponent,
    StartTraceComponent,
    StopTraceComponent,
    TransferCompleteComponent,
    TransferStartComponent,
    UnattendedTransferComponent,
    ValidateAudioComponent,
    ValidateExpressionComponent,
    ValidateStatesComponent,
    VariablesDefinitionComponent,
    HotelingguestCheckinComponent,
    HotelingguestCheckoutComponent,
    SyncComponent,
    CallQualityStatsComponent,
    MuteComponent,
    GetMwiStatusComponent,
    IgnoreCallComponent,
    GetTransferTypeComponent,
    ConfigResetComponent,
    SetTransferTypeComponent,
    ValidateMwiStatusComponent,
    ValidateLedStatusComponent,
    SimulateHookStateComponent,
    SimulateTextInputComponent,
    SimulateTouchComponent,
    ExportConfigComponent,
    ValidateCallerIdComponent,
    SimulateKeyEventComponent,
    ConferenceMuteComponent,
    ConferenceHoldComponent,
    ConferenceRemoveParticipantComponent,
    ValidatePlayAudioComponent,
    WebexLoginComponent,
    WebexLogoutComponent,
    ValidateLoginComponent,
    WebexCallForwardComponent,
    CallforwardVoicemailComponent,
    WebexCallPullComponent,
    WebexValidatePhoneComponent,
    AddParticpantToConversationComponent,
    MergeCallComponent,
    HoldAndAnswerComponent,
    UixmlComponent,
    ValidateUixmlComponent,
    ValidateMicComponent,
    ValidateBlfComponent,
    VideoQualityStatsComponent,
    SystemLogLevelComponent,
    ValidateMediaStatsComponent,
    ValidatePresenceComponent,
    SettingsComponent,
    WebexCallPickupComponent,
    GetKeyComponent,
    CallEscalationComponent,
    AddCommentComponent,
    GetvalueComponent,
    EndAndAnswerComponent,
    CompareVariablesComponent,
    MSTeamsLoginComponent,
    MsTeamsLogoutComponent,
    MsTeamsSettingsComponent,
    AddResourceToGroupComponent,
    MsTeamsCallEscalationComponent,
    MsTeamsMuteUnmuteComponent
  ]
})
export class EditorActionsModule { }
