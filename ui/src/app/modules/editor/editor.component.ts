import { Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { ToastrService } from 'ngx-toastr';
import { TdCodeEditorComponent } from '@covalent/code-editor';
import { ActionsService } from 'src/app/services/actions.service';
import { Subscription, interval } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TestCaseService } from 'src/app/services/test-case.service';
import { TestCase } from 'src/app/model/test-case';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PhoneOptionsService } from 'src/app/services/phone-options.service';
import { Role } from '../../helpers/role';
import { ConversationName } from 'src/app/helpers/conversation-name';
import { Utility } from 'src/app/helpers/Utility';
import { AddCommentComponent } from '../editor-actions/comment/add-comment/add-comment.component';
import { PhoneService } from 'src/app/services/phone.service';
import { ProvisioningService } from 'src/app/services/provisioning.service';
import { TestCaseExecutionService } from 'src/app/services/test-case-execution.service';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { MSTeamsUserService } from 'src/app/services/ms-teams-user.service';
import { Constants } from 'src/app/model/constant';
import { Action } from 'src/app/model/action';
class PhoneDetails {
    phoneTag = '';
    ipAddress = '';
    macAddress = '';
    primaryExtn = '';
    primaryUser = '';
}
@Component({
    selector: 'editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})

export class EditorComponent implements OnInit, OnDestroy {
    @ViewChild('mainEditor', { static: true }) mainEditor: TdCodeEditorComponent;
    @ViewChild('secondaryEditor', { static: true }) secondaryEditor: TdCodeEditorComponent;
    @ViewChild('deleteTemplate', { static: true }) deleteTemplateRef: TemplateRef<any>;
    editorInstance: any;
    secondaryEditorInstance: any;
    cursorPosition: any = {};
    modalRef: BsModalRef;
    auxModal: BsModalRef;
    resultsModalRef: BsModalRef;
    commentModal: BsModalRef;
    deleteConfirmationModal: BsModalRef;
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-lg', ignoreBackdropClick: true };
    actionsMenu: any[] = [];
    sideBar: boolean = false;
    twoPanels: boolean = false;
    buttonStatus: any = { clear: true, publish: true, save: true };
    testCase: TestCase = new TestCase();
    testCases: any = [];
    instructionSet: string = '';
    secondaryInstructionSet: string = '';
    actions: any = [];
    secondaryActions: any = [];
    actionsCounter: number = 0;
    inventory: any = [];
    conversations: string[] = [];
    intermediateConversations: any = [];
    secondaryInventory: any = [];
    inventoryCounter: number = 0;
    initedEditorSubscription: Subscription;
    loadTestSubscription: Subscription;
    allTestsSubscription: Subscription;
    cancelActionSubscription: Subscription;
    insertActionSubscription: Subscription;
    insertMultipleSubscription: Subscription;
    editActionSubscription: Subscription;
    query: string = '';
    sideBarQuery: string = '';
    operation: string = '';
    inserted: boolean = false;
    _showCallStatsDetails:boolean = false;
    auxTest: any;
    licensedVendores: any = [];
    conversationWithUserDetails: any = [];
    public backPress: boolean = false;
    mainTestInfo: any = {};
    auxTestInfo: any = {};
    actionToEdit: any = null;
    lastSavedTime: string;
    lastCursorPosition: any = {};
    firstTimeView = 0;
    traceCaptureEnabledToVendors: any = [];
    enableTCSideBar: boolean = false;
    enableRunSideBar: boolean = false;
    isScriptRunning: boolean = false;
    inventoryListForRun: any = [];
    phonesListObject: any = {};
    testCaseId: string;
    nonExecutionStatus: any = ['completed', 'aborted', 'interrupted', 'fail to start'];
    statusIntervalSubscription: Subscription;
    scriptStatus: string = '';
    executionResult: boolean = false;
    executionResultStatus: string = '';
    executionResultsModalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-xl', ignoreBackdropClick: true };
    // test details component variables
    subResultId: string;
    currentDetail: any;
    mosScoreDetailsList: any = [];
    currentTest: any;
    totalPortions: number = 0;
    detailColumns: any = [{}];
    stepColumns: any = [];
    stepPortions: number = 0;
    logAsText: string = 'Logs are not available';
    executionStatus: any = ['initializing', 'running', 'canceling', 'aborting', 'interrupting', 'queued'];
    phoneDetails: PhoneDetails[] = [];
    items: any = [];
    MAX_VALUE = 5;
    _showCallStats: boolean;
    mosScoreValues: any = [];
    readonly mosScoresArray: string[] = [
        'PESQ',
        'PESQ-LQ',
        'PESQ-LQO',
        'MOS-LQ',
        'MOS-CQ',
        'PacketsSent',
        'PacketsReceived',
        'TxMOSLQ',
        'TxPayloadSize',
        'Category',
        'OctetsReceived',
        'MaxJitter',
        'TxCodec',
        'TxMOSCQ',
        'Jitter',
        'RxPayloadSize',
        'PacketsLost',
        'Latency',
        'OctetsSent',
        'Ref',
        'RxMOSLQ',
        'RxCodec',
        'PacketsExpected',
        'RxMOSCQ',
        'codec',
        'average_jitter',
        'delay',
        'package_total_loss',
        'framerate',
        'max_jitter',
        'loss_rate',
        'width',
        'bitrate',
        'height',
        'Decode_Latency',
        'Packets_Lost',
        'Decoder',
        'Gap_Duration',
        'Remote_Hold',
        'Call_Appearance',
        'Peer_Phone',
        'Encoder',
        'Packets_Sent',
        'Call_State',
        'Burst_Duration',
        'Round_Trip_Delay',
        'Bytes_Sent',
        'Duration',
        'Bytes_Received',
        'Mapped_RTP_Port',
        'Packet_Discarded',
        'Discard_Rate',
        'Type',
        'Callback',
        'Packets_Received',
        'Tone',
        'R_Factor',
        'Peer_Name'
    ];
    actionMenuToolTipContext: string = '';
    isRunButtonClicked: boolean = false;
    isStopButtonClicked: boolean = false;
    globalEd: any;
    readonly TIME_OUT: number = 500;
    @HostListener('window:popstate', ['$event'])
    goingBack($event: any) {
        this.closeActionModal();
        this.selectedOption('close');
    }

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (this.hasUnsavedData()) {
            $event.returnValue = true;
        }
    }

    pressedBack(template: any) {
        if (this.hasUnsavedData()) {
            this.auxModal = this.modalService.show(template, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
        } else {
            this.goBack();
        }
    }

    goBack() {
        this.backPress = true;
        if (this.auxModal) {
            this.auxModal.hide();
        }
        // clear the unsaved script from local storage
        if (localStorage.getItem('unsavedScript')) {
            localStorage.removeItem('unsavedScript');
        }
        this.router.navigate(['/testCases']);
    }

    public hasUnsavedData() {
        if (!this.buttonStatus.save) {
            return false;
        }
        return false;
    }

    constructor(private aeService: AutomationEditorService,
        private toastr: ToastrService,
        private actionsService: ActionsService,
        private route: ActivatedRoute,
        private testCaseService: TestCaseService,
        private modalService: BsModalService,
        private phoneOptionsService: PhoneOptionsService,
        private provisioningService: ProvisioningService,
        private phoneService: PhoneService,
        private testCaseExecutionService: TestCaseExecutionService,
        private teamsUserService: MSTeamsUserService,
        private router: Router) {
    }

    checkIfRowEmpty(lineIndex: number) {
        let response: boolean = true;
        this.actions.forEach((action: any) => {
            if (action.lineIndex == lineIndex) {
                response = false;
            }
        });
        return response;
    }

    replaceExisting(newAction: any) {
        this.actions.forEach((action: any) => {
            if (action.lineIndex == newAction.lineIndex) {
                this.actions.splice(this.actions.indexOf(action), 1);
            }
        });
        this.actions.push(newAction);
    }

    insertInNextLine(textToInsert: any, cursorPosition: any) {
        this.editorInstance.setPosition(cursorPosition);
        let allInstructions: any = this.instructionSet.split('\n');
        allInstructions.splice(cursorPosition.lineNumber, 0, textToInsert);
        allInstructions = allInstructions.join('\n');
        this.instructionSet = allInstructions;
        this.cursorPosition.line++;
        this.updateActionIndexAfterPosition();
        this.actionsCounter++;
    }

    ngOnInit() {
        localStorage.removeItem('current-action');
        this.resetArrays();
        // this.actions = [];
        // this.conversations = [];
        // this.aeService.setConversations([]);
        // this.intermediateConversations = [];
        // this.aeService.setIntermedidateConversations = [];
        // this.aeService.setConversationsWithUsers = [];
        // Inited Editor
        this.initedEditorSubscription = this.aeService.initedEditor.subscribe((response: any) => {
            this.loadTest();
        });

        this.aeService.initedSecondaryEditor.subscribe((response: any) => {
            this.secondaryEditorLoad();
        });
        this.items.length = this.MAX_VALUE;
        this._showCallStats = false;
        this.initGridProperties();
        // this.route.paramMap.subscribe((paramMap: any) => {
        //     this.projectId = paramMap.params.id;
        // });
        this.getStepPortions();
        this.getWidthPortions();

        // This subscription listens to the new Action event
        this.insertActionSubscription = this.aeService.insertAction.subscribe((action: any) => {
            this.buttonStatus.save = false;
            if (this.cursorPosition.line <= this.inventory.length && this.actions.length > 0) {
                this.cursorPosition.line = this.actions[this.actions.length - 1].lineIndex + 1;
            } else if (this.actions.length == 0) {
                this.cursorPosition.line = this.inventory.length + 1;
            }
            action.action.lineIndex = this.cursorPosition.line;
            this.actionToEdit = localStorage.getItem('current-action');
            if (this.actionToEdit != null) {
                // tslint:disable-next-line: no-shadowed-variable
                this.actions.forEach((action, index) => {
                    if (action.lineIndex === this.cursorPosition.line) {
                        this.actions.splice(index, 1);
                        this.actionsCounter--;
                    }
                });
                this.insertActionInPosition(action.query, { column: this.cursorPosition.column, lineNumber: this.cursorPosition.line });
                localStorage.removeItem('current-action');
                this.actionToEdit = null;
            }
            if (this.checkIfRowEmpty(action.action.lineIndex)) {
                this.insertActionInPosition(action.query, { column: this.cursorPosition.column, lineNumber: this.cursorPosition.line });
            } else {
                this.insertInNextLine(action.query, { column: this.cursorPosition.column, lineNumber: this.cursorPosition.line });
                action.action.lineIndex++;
            }
            this.actions.push(action.action);
            this.closeActionModal();
            this.lastCursorPosition.line = action.action.lineIndex;
            this.inserted = true;
            // send request to saved the test case
            this.save();
        });
        this.insertMultipleSubscription = this.aeService.insertMultipleActions.subscribe((actionsArray: any) => {
            this.buttonStatus.save = false;
            this.actionToEdit = localStorage.getItem('current-action');
            if (this.actionToEdit != null) {
                actionsArray.forEach((action: any, indexValue: number) => {
                    action.action.lineIndex = this.cursorPosition.line;
                    // tslint:disable-next-line: no-shadowed-variable
                    this.actions.forEach((action, index) => {
                        // tslint:disable-next-line: triple-equals
                        if (action.lineIndex == this.cursorPosition.line) {
                            this.actions.splice(index, 1);
                            this.actionsCounter--;
                        }
                    });
                    this.insertActionInPosition(action.query, { column: this.cursorPosition.column, lineNumber: this.cursorPosition.line });
                    // this.actions.push(action.action);
                    let indexPos = -1;
                    if (indexValue === 0) {
                        // tslint:disable-next-line: triple-equals
                        indexPos = this.actions.findIndex(e => e.lineIndex == this.cursorPosition.line + 1);
                    } else {
                        // tslint:disable-next-line: triple-equals
                        indexPos = this.actions.findIndex(e => e.lineIndex == this.cursorPosition.line);
                    }
                    this.actions.splice(indexPos, 0, action.action);
                    this.cursorPosition.line++;
                });
                localStorage.removeItem('current-action');
                this.actionToEdit = null;
            } else {
                actionsArray.forEach((action: any, index: number) => {
                    if (this.cursorPosition.line <= this.inventory.length && this.actions.length > 0) {
                        this.cursorPosition.line = this.actions[this.actions.length - 1].lineIndex + 1;
                    } else if (this.actions.length == 0) {
                        this.cursorPosition.line = this.inventory.length + 1;
                    }
                    action.action.lineIndex = this.cursorPosition.line;
                    // this.insertActionInPosition(action.query, { column: this.cursorPosition.column, lineNumber: this.cursorPosition.line });
                    if (this.checkIfRowEmpty(action.action.lineIndex)) {
                        this.insertActionInPosition(action.query, { column: this.cursorPosition.column, lineNumber: this.cursorPosition.line });
                    } else {
                        this.insertInNextLine(action.query, { column: this.cursorPosition.column, lineNumber: this.cursorPosition.line });
                        action.action.lineIndex++;
                    }
                    let indexPos = -1;
                    if (index === 0) {
                        // tslint:disable-next-line: triple-equals
                        indexPos = this.actions.findIndex(e => e.lineIndex == this.cursorPosition.line + 1);
                    } else {
                        // tslint:disable-next-line: triple-equals
                        indexPos = this.actions.findIndex(e => e.lineIndex == this.cursorPosition.line);
                    }
                    this.actions.splice(indexPos, 0, action.action);
                    this.cursorPosition.line++;
                    this.lastCursorPosition.line = action.action.lineIndex;
                });
            }
            this.closeActionModal();
            this.inserted = true;
            // REINDEX
            if (this.containsDuplicateIndex()) {
                this.reIndexActions();
            }
            this.conversations = [];
            this.intermediateConversations = [];
            this.aeService.setConversations([]);
            this.conversations = this.aeService.getConversations();
            this.aeService.setIntermedidateConversations = [];
            this.intermediateConversations = this.aeService.fetchIntermediateConversations;
            this.aeService.setConversationsWithUsers = [];
            this.conversationWithUserDetails = this.aeService.fetchConversationsWithUsers;
            this.actions = Utility.sortListInAscendingOrder(this.actions, 'lineIndex', true);
            this.parseActionsArrayToEditor(this.actions);
            // send request to saved the test case
            this.save();
        });

        // This subscription listens to the new Resource event
        this.aeService.addedResource.subscribe(async (resources: any) => {
            this.buttonStatus.save = false;
            resources.forEach(resource => {
                const latestResourcePosition = { column: 1, lineNumber: this.inventoryCounter };
                const lastActionObject = this.actions[this.actions.length - 1];
                if (lastActionObject && lastActionObject.lineIndex) {
                    this.lastCursorPosition.line = lastActionObject.lineIndex + 1;
                } else {
                    this.lastCursorPosition.line = latestResourcePosition.lineNumber + 1;
                }
                this.insertResourceInPosition(resource.query, latestResourcePosition);
                this.inventory.push(resource.source);
                this.aeService.setResources(this.inventory);
                this.updateActionsIndex('increase');
            });
            this.closeActionModal();
            this.inserted = true;
            // send request to saved the test case
            this.save();
            // fetch phones by vendor
            await this.fetchPhonesByVendor().then(() => {
                setTimeout(async () => {
                    // fetch test case execution details
                    await this.fetchTestCaseExecutionDetails();
                }, this.TIME_OUT);
            }).catch((err: any) => console.log('error ', err));

        });

        this.cancelActionSubscription = this.aeService.cancelAction.subscribe((response: any) => {
            localStorage.removeItem('current-action');
            this.closeActionModal();
        });

        // Load items for menu
        // this.actionsMenu = this.actionsService.getAvailableActions();

        // Load Test cases for sideBar
        this.loadTestCases();

        // added conversation
        this.aeService.addedConversation.subscribe((response: any) => {
            this.conversations.push(response);
            this.aeService.setConversations(this.conversations);
            if (this.actions.length > 0) {
                // tslint:disable-next-line:triple-equals
                const conversationDetails = this.actions.filter(e => (e.action == 'call' && e.conversationName) == response)[0];
                if (conversationDetails && conversationDetails.from && conversationDetails.to) {
                    const $requiredData = {
                        conversationName: response,
                        from: conversationDetails.from,
                        to: conversationDetails.to
                    };
                    this.aeService.addConversationsWithUsers($requiredData);
                } else if (conversationDetails && conversationDetails.from) { // true when via is digits
                    const $requiredData = {
                        conversationName: response,
                        from: conversationDetails.from
                    };
                    this.aeService.addConversationsWithUsers($requiredData);
                }
            }
        });

        // add intermediate conversation
        this.aeService.addIntermediateConv$.subscribe((response: any) => {
            this.intermediateConversations.push(response);
            this.aeService.setIntermedidateConversations = this.intermediateConversations;
            this.conversations.push(response);
            this.aeService.setConversations(this.conversations);
            if (this.actions.length > 0) {
                const details = this.actions
                    // tslint:disable-next-line: triple-equals
                    .filter((e: any) => ((e.action == 'conf_start' || e.action == 'xfer_start') && e.intermediateConvName) == response)[0];
                if (details && details.from && details.to) {
                    const $requiredData = {
                        conversationName: response,
                        from: details.from,
                        to: details.to
                    };
                    this.aeService.addConversationsWithUsers($requiredData);
                } else if (details && details.from) { // true when via is digits
                    const $requiredData = {
                        conversationName: response,
                        from: details.from
                    };
                    this.aeService.addConversationsWithUsers($requiredData);
                }
            }
        });

        this.editActionSubscription = this.aeService.editAction.subscribe((action: any) => {
            this.buttonStatus.save = false;
            action.action.lineIndex = this.cursorPosition.line;
            const updatedAction: any = action.action;
            this.actionToEdit = localStorage.getItem('current-action');
            // tslint:disable-next-line: no-shadowed-variable
            this.actions.forEach((action, index) => {
                if (action.lineIndex === this.cursorPosition.line) {
                    this.actions.splice(index, 1, updatedAction);
                    this.actionsCounter--;
                }
            });
            const previousResponse = JSON.parse(this.actionToEdit);
            if (updatedAction.action == 'ui_xml' && updatedAction.resultIn != previousResponse.resultIn) {
                this.actions.forEach((element: any, index: number) => {
                    if (element.action == 'validate_ui_xml' && element.resultIn == previousResponse.resultIn) {
                        element.resultIn = updatedAction.resultIn;
                    }
                });
            }
            this.testCase.actions = this.actions;
            this.actions = [];
            this.instructionSet = '';
            this.inventoryCounter = 0;
            this.resetArrays();
            this.parseAfterLoad();
            localStorage.removeItem('current-action');
            this.actionToEdit = null;
            this.closeActionModal();
            this.inserted = true;
            // send request to saved the test case
            this.save();
        });
    }

    /**
     * to load the items for menu
     */
    loadActionMenu() {
        const data = this.actionsService.getAvailableActions().filter(e => e.enabled == true);
        // if licensed vendor does not contains polycom
        // remove the Validate Audio from Validate category
        if (!this.licensedVendores.includes('Polycom')) {
            for (let index = 0; index < data.length; index++) {
                if (data[index]['category'] === 'Validate/Verify') {
                    // remove the validate audio from the array
                    data[index]['actionItems'].splice(1, 1);
                }
            }
        }
        this.actionsMenu = data;
    }

    loadTest() {
        this.route.paramMap.subscribe((paramMap: any) => {
            this.testCaseId = paramMap.params.id;
            this.loadTestSubscription = this.testCaseService.getTestCaseById(paramMap.params.id).subscribe(async (response: any) => {
                if (!response.success) {
                    this.toastr.error(`Can't acquire test details: ${response.response.message}`, 'Error');
                } else {
                    this.testCase = response.response.test;
                    this.traceCaptureEnabledToVendors = response.traceCaptureEnabledToVendors;
                    this.licensedVendores = response.licensedVendors;
                    this.phoneOptionsService.setLicenseVendoresOptions(this.licensedVendores);
                    // check for unsaved script
                    const unsavedScript = JSON.parse(localStorage.getItem('unsavedScript'));
                    if (unsavedScript && this.testCase.id == unsavedScript['id']) {
                        this.testCase['inventory'] = unsavedScript['inventory'];
                        this.testCase['actions'] = unsavedScript['actions'];
                        this.buttonStatus.save = false;
                    }
                    this.afterLoad();
                    this.parseAfterLoad();
                    this.loadActionMenu();
                    this.testCaseService.setTraceCaptureEnabledToVendors(this.traceCaptureEnabledToVendors);
                    // fetch phones by vendor
                    await this.fetchPhonesByVendor().then(() => {
                        setTimeout(async () => {
                            // fetch test case execution details
                            await this.fetchTestCaseExecutionDetails();
                        }, this.TIME_OUT);

                    }).catch((err: any) => console.log('error ', err));
                }
            });
        });
    }

    afterLoad() {
        if (!this.testCase.published) {
            this.buttonStatus.publish = false;
        }
        // tslint:disable-next-line: max-line-length
        this.mainTestInfo = {
            title: this.testCase.name,
            created: this.testCase.creationDate,
            edited: this.testCase.lastModified,
            ownerName: this.testCase.ownerName
        };
        // assigning last modified to last saved initially
        if (this.testCase.lastModified) {
            this.lastSavedTime = this.testCase.lastModified;
        }
        // tslint:disable-next-line: max-line-length
        // this.aeService.titleEmitter.emit({ title: this.testCase.name, created: this.testCase.creationDate, edited: this.testCase.lastModified });
        // this.aeService.enabledTitle.emit(true);
        this.buttonStatus.clear = false;
    }

    async parseAfterLoad() {
        let sum = 0;
        if (this.testCase.inventory && this.testCase.inventory.length > 0) {
            sum += this.testCase.inventory.length;
        }
        if (this.testCase.actions && this.testCase.actions.length > 0) {
            sum += this.testCase.actions[this.testCase.actions.length - 1].lineIndex;
            if (sum > this.testCase.actions[this.testCase.actions.length - 1].lineIndex + 1) {
                sum = this.testCase.actions[this.testCase.actions.length - 1].lineIndex + 1;
            }
        }
        for (let i = 0; i < sum; i++) {
            this.instructionSet += '\n';
        }
        if (this.testCase.actions && this.testCase.actions.length > 0) {
            this.actions = [];
            this.actions = this.testCase.actions;
            this.actions.forEach(e => {
                if (e.intermediateConvName == null) {
                    switch (e.action) {
                        case 'conf_start':
                            e.intermediateConvName = ConversationName.INTERMEDIATE;
                            break;
                        case 'conf_complete':
                            e.intermediateConvName = ConversationName.INTERMEDIATE;
                            break;
                        case 'xfer_start':
                            e.intermediateConvName = ConversationName.INTERMEDIATE;
                            break;
                        case 'xfer_complete':
                            e.intermediateConvName = ConversationName.INTERMEDIATE;
                            break;
                    }
                }
            });
            this.aeService.setActionsList(this.actions);
            // REINDEX
            if (this.containsDuplicateIndex()) {
                // if (confirm("This test has some errors and needs to be re-indexed, shall we proceed? (data will be overwritten)")) {
                this.reIndexActions();
                this.buttonStatus.save = false;
                // }
            }
            this.parseActionsArrayToEditor(this.actions);
        }
        if (this.testCase.inventory && this.testCase.inventory.length > 0) {
            this.inventory = this.testCase.inventory;
            this.aeService.setResources(this.inventory);
            this.parseResourcesArrayToEditor(this.inventory);
            // await this.buildInventoryMapping();
        }
    }

    reIndexActions() {
        let i = this.actions[0].lineIndex;
        this.actions.forEach((action: any) => {
            action.lineIndex = i;
            i++;
        });
    }

    loadTestCases() {
        this.allTestsSubscription = this.testCaseService.getTestCases().subscribe((response: any) => {
            this.testCases = response.response.testCases;
        });
    }

    parseResourcesArrayToEditor(resourcesArray: any) {
        let parsed: string = '';
        resourcesArray.forEach((resource: any) => {
            parsed += 'Declare ' + resource.name + ' as ';
            if (resource.dut) {
                parsed += 'DUT.';
            }
            parsed += resource.type;
            if (resource.vendor) {
                parsed += '.';
                if (resource.vendor == 'Polycom') {
                    parsed += 'Poly';
                } else {
                    parsed += resource.vendor;
                }
            }
            if (resource.model) {
                const model = resource.model;
                parsed += '.' + model;
            }
            if (resource.submodel) {
                parsed += '.' + resource.submodel;
            }
            this.parseResourceToPosition(parsed);
            parsed = '';
        });
    }

    parseResourceToPosition(textToInsert: string) {
        let allInstructions: any = this.instructionSet.split('\n');
        allInstructions.splice(this.inventoryCounter + 1, 0, textToInsert);
        allInstructions.splice(this.inventoryCounter, 1);
        allInstructions = allInstructions.join('\n');
        this.instructionSet = allInstructions;
        this.inventoryCounter++;
    }

    insertResourceInPosition(textToInsert: string, cursorPosition: any) {
        this.editorInstance.setPosition(cursorPosition);
        let allInstructions: any = this.instructionSet.split('\n');
        allInstructions.splice(this.inventoryCounter, 0, textToInsert);
        allInstructions = allInstructions.join('\n');
        this.instructionSet = allInstructions;
        this.inventoryCounter++;
    }

    parseActionsArrayToEditor(actionsArray: any) {
        actionsArray.forEach((action: any) => {
            this.parseActionToPosition(this.aeService.queryGenerator(action, true), { column: 1, lineNumber: action.lineIndex });
        });
        this.conversations = this.aeService.getConversations();
        this.intermediateConversations = this.aeService.fetchIntermediateConversations;
        this.conversationWithUserDetails = this.aeService.fetchConversationsWithUsers;
        this.saveBlindTransferResources();
    }

    private saveBlindTransferResources(): void {

        this.actions.forEach(action => {
            // tslint:disable-next-line:max-line-length triple-equals
            if (action.action == 'xfer_blind' || action.action == 'unattended_xfer_start' || action.action == 'xfer_start' || action.action == 'conf_start') {
                // tslint:disable-next-line: triple-equals
                const resourcesList = this.testCase.inventory.filter(e => e.type == 'Phone');
                // tslint:disable-next-line: triple-equals
                const index = this.conversationWithUserDetails.findIndex(e => e['conversationName'] == action.conversationName);
                // tslint:disable-next-line: triple-equals
                const toResource = resourcesList.filter(item => item.name == action.to)[0];
                this.conversationWithUserDetails.forEach((item: any, indexValue: number) => {
                    if (indexValue == index) {
                        if (item['resources'] && !this.checkWhetherResourceAleadyExist(item, action.to)) {
                            // null/undefined check point
                            if (toResource) {
                                item['resources'].push(toResource);
                            }
                        } else if (!item['resources'] && !this.checkWhetherResourceAleadyExist(item, action.to)) {
                            // null/undefined check point
                            if (toResource) {
                                item['resources'] = [toResource];
                            }
                        }
                    }
                });
                this.aeService.setConversationsWithUsers = this.conversationWithUserDetails;
            }
        });
    }

    /**
     * check whether the resource already exist in the conversation resources or not
     */
    public checkWhetherResourceAleadyExist(list: any, toResource: string): boolean {
        // tslint:disable-next-line: triple-equals
        return (list['resources'] && list['resources'].filter(e => e.name == toResource).length > 0) ? true : false;
    }

    parseActionToPosition(textToInsert: string, cursorPosition: any, type?: string) {
        if (type === 'comment') {
            this.editorInstance.setPosition(cursorPosition);
        }
        let allInstructions: any = this.instructionSet.split('\n');
        allInstructions.splice(cursorPosition.lineNumber - 1, 0, textToInsert);
        allInstructions.splice(cursorPosition.lineNumber, 1);
        allInstructions = allInstructions.join('\n');
        this.instructionSet = allInstructions;
        this.actionsCounter++;
    }

    insertActionInPosition(textToInsert: string, cursorPosition: any) {
        this.editorInstance.setPosition(cursorPosition);
        let allInstructions: any = this.instructionSet.split('\n');
        if (allInstructions.length === cursorPosition.lineNumber) {
            allInstructions.splice(cursorPosition.lineNumber - 1, 0, textToInsert + '\n');
        } else {
            allInstructions.splice(cursorPosition.lineNumber - 1, 0, textToInsert);
        }
        allInstructions.splice(cursorPosition.lineNumber, 1);
        allInstructions = allInstructions.join('\n');
        this.instructionSet = allInstructions;
        this.actionsCounter++;
    }

    openAction(object: any, category: any) {
        if (this.userDisabled(Role[2])) {
            this.toastr.info('User doesn\'t have permissions to edit test case', 'Info');
        } else {
            localStorage.setItem('selectedCategory', JSON.stringify(category));
            this.modalRef = this.modalService.show(object.action, this.modalConfig);
        }
    }

    closeActionModal() {
        if (this.modalRef) {
            this.modalRef.hide();
        }
        if (this.auxModal) {
            this.auxModal.hide();
        }
        this.closeCommentModal();
    }

    changeTwoPanels(test: any) {
        this.secondaryInstructionSet = '';
        this.twoPanels = true;
        this.sideBar = !this.sideBar;
        this.auxTest = test;
    }

    secondaryEditorLoad() {
        this.testCaseService.getTestCaseById(this.auxTest.id).subscribe((response: any) => {
            let sum = 1;
            let auxTest = response.response.test;
            if (auxTest.inventory) {
                this.secondaryInventory = auxTest.inventory;
                this.parseSecondaryInventory();
            }

            if (auxTest.actions && auxTest.actions.length > 0) {
                sum += auxTest.actions[auxTest.actions.length - 1].lineIndex;
                sum -= auxTest.inventory.length;
                for (let i = 0; i < sum; i++) {
                    this.secondaryInstructionSet += '\n';
                }
                this.secondaryActions = auxTest.actions;
                this.parseSecondaryActions();
            }
            this.auxTestInfo = { subtitle: auxTest.name, created: auxTest.creationDate, edited: auxTest.lastModified };
            // this.aeService.enabledSubtitle.emit(true);
            // this.aeService.subtitleEmitter.emit({ subtitle: auxTest.name, created: auxTest.creationDate, edited: auxTest.lastModified });
        });
    }

    parseSecondaryInventory() {
        let parsed: string = '';
        this.secondaryInventory.forEach((resource: any) => {
            parsed += 'Declare ' + resource.name + ' as ';
            if (resource.dut) {
                parsed += 'DUT.';
            }
            parsed += resource.type;
            if (resource.vendor) {
                parsed += '.';
                if (resource.vendor == 'Polycom') {
                    parsed += 'Poly';
                } else {
                    parsed += resource.vendor;
                }
            }
            if (resource.model) {
                const model = resource.model;
                parsed += '.' + model;
            }
            if (resource.submodel) {
                parsed += '.' + resource.submodel;
            }
            this.secondaryInstructionSet += parsed + '\n';
            parsed = '';
        });
    }

    parseSecondaryActions() {
        this.secondaryActions.forEach((action: any) => {
            this.parseActionToSecondaryEditor(this.aeService.queryGenerator(action, false), { column: 1, lineNumber: action.lineIndex });
        });
    }

    parseActionToSecondaryEditor(textToInsert: string, cursorPosition: any) {
        this.secondaryEditorInstance.setPosition(cursorPosition);
        let allInstructions: any = this.secondaryInstructionSet.split('\n');
        allInstructions.splice(cursorPosition.lineNumber - 1, 0, textToInsert);
        allInstructions.splice(cursorPosition.lineNumber, 1);
        allInstructions = allInstructions.join('\n');
        this.secondaryInstructionSet = allInstructions;
    }

    resourceIsInUse(resource: string, check?: boolean, conversationName?: string): boolean {
        let response: boolean = false;
        this.actions.forEach((action) => {
            for (let key of Object.keys(action)) {
                if (!check) {
                    if (key === 'phone' || key === 'from' || key === 'to') {
                        if (action[key] === resource) {
                            response = true;
                        }
                    }
                } else {
                    if ((key === 'phone' || key === 'from' || key === 'to') && action.action != 'add_phone_to_conversation') {
                        if (action[key] === resource && action['conversationName'] === conversationName) {
                            response = true;
                        }
                    }
                }
            }
        });
        return response;
    }
    /**
     * check whether resultKey is in use or not
     * @param resultKey: string 
     * @returns: boolean
     */
    resultKeyIsInUse(resultKey: string): boolean {
        let response: boolean = false;
        this.actions.forEach((action: any) => {
            if ((action.action == 'validate_ui_xml' || action.action === 'validate_blf') && action.action != 'ui_xml') {
                if (action['resultIn'] === resultKey) {
                    response = true;
                }
            }
        });
        return response;
    }

    updateActionsOnDelete() {
        this.buttonStatus.save = false;
        this.actions.forEach((action) => {
            if (action.lineIndex >= this.cursorPosition.line) {
                action.lineIndex--;
            }
        });
    }

    updateActionsIndex(type: string) {
        this.actions.forEach((action: any) => {
            if (type === 'increase') {
                action.lineIndex++;
            } else {
                action.lineIndex--;
            }
        });
    }

    updateActionIndexAfterPosition() {
        this.actions.forEach((action: any) => {
            if (action.lineIndex >= this.cursorPosition.line) {
                action.lineIndex++;
            }
        });
    }

    openModal(template: TemplateRef<any>) {
        this.auxModal = this.modalService.show(template, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
    }

    selectedOption(option: string) {
        if (option === 'accepted' && this.operation === 'copy') {
            this.copyData();
        }
        if (option === 'accepted' && this.operation === 'clear') {
            this.clear();
        }
        if (this.auxModal) {
            this.auxModal.hide();
        }
    }

    async copyData() {
        this.conversations = [];
        this.intermediateConversations = [];
        this.clear();
        this.testCase.inventory = this.secondaryInventory;
        this.aeService.setResources(this.testCase.inventory);
        this.testCase.actions = this.secondaryActions;
        this.parseAfterLoad();
        this.buttonStatus.save = false;
        if (this.buttonStatus.publish && this.buttonStatus.save) {
            this.buttonStatus.publish = this.testCase.published;
        }
        // send request to saved the test case
        this.save();

        // fetch phones by vendor
        await this.fetchPhonesByVendor().then(async () => {
            setTimeout(async () => {
                // fetch test case execution details
                await this.fetchTestCaseExecutionDetails();
            }, this.TIME_OUT);

        }).catch((err: any) => console.log('error ', err));

    }

    copyTest(template: TemplateRef<any>) {
        if (this.userDisabled(Role[2])) {
            this.toastr.info('User doesn\'t have permissions to edit test case', 'Info');
        } else {
            if (this.instructionSet.length) {
                this.operation = 'copy';
                this.openModal(template);
            } else {
                this.copyData();
            }
        }
    }

    clearValidation(template: TemplateRef<any>) {
        if (this.userDisabled(Role[2])) {
            this.toastr.info('User doesn\'t have permissions to edit test case', 'Info');
        } else {
            this.operation = 'clear';
            this.openModal(template);
        }
    }

    commentOrUncommentScript(start: number, end: number) {
        const multiLineComment = (start != end);
        this.buttonStatus.save = false;
        // get selected actions list
        const selectedActionsList = this.actions.filter((action: any) => action.lineIndex >= start && action.lineIndex <= end)
        // check if any commented action is available in the selected actions list
        const hasCommentedAction = selectedActionsList.some((action: any) => action.comment == true);
        // check if all actions are commented in the selected actions list
        const isEveryActionCommented = selectedActionsList.every((action: any) => action.comment == true);
        this.actions.forEach((action: any, index: number) => {
            if (multiLineComment && action.lineIndex >= start && action.lineIndex <= end) {
                // comment all the selected actions, if there is one uncommented action 
                if (hasCommentedAction && !isEveryActionCommented) {
                    action.comment = true;
                } else {
                    // comment/uncomment if selected actions are commented/uncommented
                    action.comment = !action.comment;
                }
                this.parseActionToPosition(this.aeService.queryGenerator(action, true), { column: 1, lineNumber: action.lineIndex }, 'comment');
            } else if (action.lineIndex === this.cursorPosition.line) {
                action.comment = !action.comment;
                this.parseActionToPosition(this.aeService.queryGenerator(action, true), { column: 1, lineNumber: action.lineIndex }, 'comment');
            }
        });
    }

    deleteCommand(action: string) {
        let response: boolean = false;
        if (action.includes('Declare')) {
            const resourceName = action.split(' ')[1];
            if (this.resourceIsInUse(resourceName)) {
                this.toastr.error('Resource is in use and can\'t be deleted', 'Error', { timeOut: 8000 });
            } else {
                this.aeService.deleteResource(resourceName);
                this.inventoryCounter--;
                this.updateActionsIndex('decrease');
                this.buttonStatus.save = false;
                response = true;
            }
        } else {
            // check whether to delete line space or not
            const isSpaceToDelete = this.actions.some((action: any) => action.lineIndex == this.cursorPosition.line);
            if (!isSpaceToDelete) {
                this.updateActionsOnDelete();
                response = true;
            } else {
                // tslint:disable-next-line:no-shadowed-variable
                this.actions.forEach((action: any, index: number) => {
                    if (action.lineIndex === this.cursorPosition.line) {
                        if (action.action.toLowerCase() === 'call' || action.action.toLowerCase() === 'dial_digits') {
                            this.aeService.deleteConversation(action.conversationName);
                            this.conversations = this.aeService.getConversations();
                            this.actions.splice(index, 1);
                            this.actionsCounter--;
                            this.updateActionsOnDelete();
                            response = true;
                        } else if (action.action.toLowerCase() == 'conf_start' || action.action.toLowerCase() == 'xfer_start') {
                            this.aeService.deleteIntermediateConversation(action.intermediateConvName);
                            this.intermediateConversations = this.aeService.fetchIntermediateConversations;
                            this.actions.splice(index, 1);
                            this.actionsCounter--;
                            this.updateActionsOnDelete();
                            response = true;
                        } else if (action.action.toLowerCase() == 'ui_xml') {
                            if (this.resultKeyIsInUse(action.resultIn)) {
                                this.toastr.error(`Result key ${action.resultIn} is in use and can\'t be deleted`, 'Error', { timeOut: 8000 });
                            } else {
                                this.aeService.deleteUiXmlResource(action.resultIn);
                                this.actions.splice(index, 1);
                                this.actionsCounter--;
                                this.updateActionsOnDelete();
                                response = true;
                            }
                        } else if (action.action.toLowerCase() == 'add_phone_to_conversation') {
                            const conversationName = action.conversationName;
                            if (this.resourceIsInUse(action.phone, true, conversationName)) {
                                // this.toastr.error(`Resource ${action.phone} is in use and can\'t be deleted`, 'Error', { timeOut: 8000 });
                                const deleteConfirmationTemplate = this.deleteTemplateRef;
                                this.deleteConfirmationModal = this.modalService.show(deleteConfirmationTemplate, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
                            } else {
                                const obj = { resourceName: action.phone, conversationName: action.conversationName };
                                this.aeService.deleteResourceInConversationsWithUsers(obj);
                                this.actions.splice(index, 1);
                                this.actionsCounter--;
                                this.updateActionsOnDelete();
                                response = true;
                            }
                        }
                        else {
                            this.actions.splice(index, 1);
                            this.actionsCounter--;
                            this.updateActionsOnDelete();
                            response = true;
                        }
                    }
                });
            }
        }
        return response;
    }

    changeVisibility(index) {
        // if (this.scriptStatus && this.nonExecutionStatus.includes(this.scriptStatus))
        this.actionsMenu[index].status = !this.actionsMenu[index].status;
    }
    /**
     * open side bar
     * @param type: string 
     */
    openSidebar(type: string) {
        if (type === 'testcases') {
            this.enableTCSideBar = !this.enableTCSideBar;
            this.sideBar = this.enableTCSideBar;
        } else if (type === 'run') {
            this.enableRunSideBar = !this.enableRunSideBar;
            if (this.enableRunSideBar) {
                // this.fetchPhonesByVendor();
            }
            if (this.enableRunSideBar && this.inventory.length == 0) {
                this.executionResult = false;
                this.executionResultStatus = '';
                this.scriptStatus = '';
                this.actionMenuToolTipContext = '';
            }
            this.sideBar = this.enableRunSideBar;
        }
        // this.sideBar = !this.sideBar;
        this.twoPanels = false;
        this.aeService.enabledSubtitle.emit(false);
    }

    async clear() {
        this.resetArrays();
        // // clear the conversations
        // this.conversations = [];
        // this.intermediateConversations = [];
        // this.aeService.setConversations([]);
        // this.conversations = this.aeService.getConversations();
        // this.aeService.setIntermedidateConversations = [];
        // this.intermediateConversations = this.aeService.fetchIntermediateConversations;
        // this.aeService.setResources([]);
        // this.aeService.setConversationsWithUsers = [];
        // this.conversationWithUserDetails = this.aeService.fetchConversationsWithUsers;
        this.buttonStatus.clear = true;
        this.buttonStatus.publish = true;
        this.buttonStatus.save = false;
        this.instructionSet = '';
        // this.actions = [];
        // this.inventory = [];
        this.inventoryCounter = 0;
        this.actionsCounter = 0;
        this.cursorPosition.column = 1;
        this.cursorPosition.line = 1;
        this.buttonStatus.clear = false;
        // send request to saved the test case
        this.save();

        this.fetchPhonesByVendor();
        // await this.buildInventoryMapping();
    }

    publish() {
        this.buttonStatus.publish = true;
        this.testCaseService.publish(this.testCase.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to publish test case: ' + response.response.message, 'Error');
            } else {
                this.testCase.published = true;
                this.toastr.success('Test Case published', 'Success');
            }
        });
    }

    /**
     * send request to save test case for any change in the test case like Add,Clear,Copy,Comment,Delete,Edit test case
     */
    save() {
        let check: boolean;
        switch (this.scriptStatus) {
            case '':
            case 'completed':
            case 'aborted':
            case 'interrupted':
            case 'fail to start':
                check = true;
                break;
            default: check = false;
                break;
        }
        this.buttonStatus.save = true;
        if (this.buttonStatus.save && this.testCase && !this.testCase.published) {
            this.buttonStatus.publish = false;
        }
        this.actions.sort((a, b) => parseInt(a.lineIndex) - parseInt(b.lineIndex));
        if (check) {
            // tslint:disable-next-line: triple-equals
            if (this.testCase) {
                this.testCase.inventory = this.inventory;
                this.testCase.actions = this.actions;
                this.testCaseService.updateTestCase(this.testCase).subscribe((response: any) => {
                    localStorage.removeItem('unsavedScript');
                    if (!response.success) {
                        this.resetArrays();
                        this.toastr.error('Error trying to save changes in test case: ' + response.response.message, 'Error');
                        // Reload the existing test case if there is any error while saving it.
                        this.loadTest();
                    } else {
                        if (response.response.lastSavedTs) {
                            this.lastSavedTime = response.response.lastSavedTs;
                        }
                        this.toastr.success('Test case successfully saved', 'Success');
                    }
                }, (err: any) => {
                    if (err == 'Error -> Unauthorized') {
                        localStorage.setItem('unsavedScript', JSON.stringify(this.testCase));
                    }
                });
            }
        } else {
            this.toastr.error('Could not save test case. While test case is executing.', 'Error');
        }
    }

    containsDuplicateIndex() {
        const values = this.actions.map(item => {
            return item.lineIndex;
        });
        const isDuplicate = values.some((value, index) => {
            return values.indexOf(value) != index;
        });
        return isDuplicate;
    }

    async initedSecondaryEditor(editor: any): Promise<void> {
        const context = this;
        this.secondaryEditorInstance = editor;
        context.aeService.initedSecondaryEditor.emit();
    }

    async initedEditor(editor: any): Promise<void> {
        const context = this;
        this.editorInstance = editor;
        context.aeService.initedEditor.emit();
        editor.onDidChangeCursorPosition((e) => {
            this.cursorPosition.column = e.position.column;
            this.cursorPosition.line = e.position.lineNumber;
            const maxLine = this.instructionSet.split('\n').length;
            if (this.inserted) {
                // editor.setPosition({ column: 1, lineNumber: maxLine });
                if (maxLine == this.lastCursorPosition.line) {
                    editor.setPosition({ column: 1, lineNumber: maxLine });
                } else {
                    editor.setPosition({ column: 1, lineNumber: this.lastCursorPosition.line + 1 });
                }
                this.inserted = false;
            }
            if (this.firstTimeView < 2) {
                editor.setPosition({ column: 1, lineNumber: maxLine });
                this.firstTimeView++;
            }
        });

        editor.onContextMenu((e) => {
            let y = document.querySelectorAll('#editorInnerContainer0 > div > div.context-view')[0];
        });

        editor.addAction({
            id: 'InsertBefore',
            label: 'Insert line before',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 2.4,
            run: function (ed) {
                if ((context.isScriptExecuting())) {
                    var position = ed.getPosition();
                    var text = ed.getValue(position);
                    var splitedText = text.split('\n');
                    var lineContent = splitedText[position.lineNumber - 2];
                    var textToInsert = '\n';
                    position.column = lineContent.length;
                    splitedText[position.lineNumber - 2] = [lineContent.slice(0, position.column), textToInsert].join('');
                    ed.setValue(splitedText.join('\n'));
                    position.column = 1;
                    position.lineNumber = position.lineNumber;
                    ed.setPosition(position);
                    context.updateActionIndexAfterPosition();
                } else {
                    context.toastr.info('Cannot Insert line before the action while test script is executing', 'Info');
                }
                return null;
            }
        });

        /*
                editor.addAction({
                    id: 'InsertAfter',
                    label: 'Insert line after',
                    contextMenuGroupId: 'navigation',
                    contextMenuOrder: 2.5,
                    run: function (ed) {
                        var position = ed.getPosition();
                        var text = ed.getValue(position);
                        var splitedText = text.split('\n');
                        var lineContent = splitedText[position.lineNumber - 2];
                        var textToInsert = '\n';
                        position.column = lineContent.length;
                        splitedText[position.lineNumber - 2] = [lineContent.slice(0, position.column), textToInsert].join('');
                        ed.setValue(splitedText.join('\n'));
                        position.column = 1;
                        position.lineNumber = position.lineNumber + 2;
                        ed.setPosition(position);
                        context.updateActionIndexAfterPosition();
                        return null;
                    }
                });
        */

        editor.addAction({
            id: 'InsertAfter',
            label: 'Insert line after',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 2.5,
            run: function (ed) {
                if ((context.isScriptExecuting())) {
                    var position = ed.getPosition();
                    var text = ed.getValue(position);
                    var splitedText = text.split('\n');
                    var lineContent = splitedText[position.lineNumber - 1];
                    var textToInsert = '\n';
                    position.column = lineContent.length;
                    splitedText[position.lineNumber - 1] = [lineContent.slice(0, position.column), textToInsert].join('');
                    ed.setValue(splitedText.join('\n'));
                    position.column = 1;
                    position.lineNumber = position.lineNumber + 1;
                    ed.setPosition(position);
                    context.updateActionIndexAfterPosition();
                } else {
                    context.toastr.info('Cannot Insert line after the action while test script is executing', 'Info');
                }
                return null;
            }
        });
        editor.addAction({
            id: 'Edit',
            label: 'Edit',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 2.6,
            run: function (ed) {
                if ((context.isScriptExecuting())) {
                    context.actionsMenu = context.actionsService.getAvailableActions();
                    const position = ed.getPosition();
                    context.actions.some(action => {
                        // check for action line number and also for comment: false
                        // tslint:disable-next-line: triple-equals
                        if (action.lineIndex == position.lineNumber && !action.comment) {
                            return context.actionsMenu.some(category => {
                                return category.actionItems.some(actionItem => {
                                    // tslint:disable-next-line: triple-equals
                                    if (actionItem.tag == action.action && (action.action != 'login' && action.action != 'logout') ||
                                        // tslint:disable-next-line: triple-equals
                                        (actionItem.tag == 'mute' && action.action == 'unmute') ||
                                        // tslint:disable-next-line: triple-equals max-line-length
                                        (actionItem.tag == 'reboot_device' && (action.action == 'restart_device' || action.action == 'reset_device'))) {
                                        localStorage.setItem('current-action', JSON.stringify(action));
                                        context.openAction(actionItem, category);
                                        return true;
                                    } else if (actionItem.tag == action.action && action.value != null && category.category == 'Webex Actions') {
                                        localStorage.setItem('current-action', JSON.stringify(action));
                                        context.openAction(actionItem, category);
                                        return true;
                                    } else if (actionItem.tag == action.action && action.value == null && category.category == 'MSFT Teams Actions') {
                                        localStorage.setItem('current-action', JSON.stringify(action));
                                        context.openAction(actionItem, category);
                                        return true;
                                    }
                                });
                            });
                        }
                    });
                } else {
                    context.toastr.info('Cannot Edit the action while test script is executing', 'Info');
                }

                return null;
            }
        });
        editor.addAction({
            id: 'comment',
            label: 'Comment/UnComment',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 2.7,
            run: function (ed) {
                if ((context.isScriptExecuting())) {
                    const startLine = ed.getSelection().startLineNumber;
                    const endLine = ed.getSelection().endLineNumber;
                    const position = ed.getPosition();
                    const text = ed.getValue(position);
                    const splittedText = text.split('\n');
                    const lineContent = splittedText[position.lineNumber - 1];
                    if (!lineContent.includes('Declare')) {
                        context.commentOrUncommentScript(startLine, endLine);
                        // send request to saved the test case
                        context.save();
                    }
                } else {
                    context.toastr.info('Cannot Comment/Uncomment the action while test script is executing', 'Info');
                }
                return null;
            }
        });
        editor.addAction({
            id: 'delete',
            label: 'Delete Command',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 2.8,
            run: async function (ed) {
                context.globalEd = ed;
                if ((context.isScriptExecuting())) {
                    const position = ed.getPosition();
                    const text = ed.getValue(position);
                    const splitedText = text.split('\n');
                    const lineContent = splitedText[position.lineNumber - 1];
                    if (context.deleteCommand(lineContent)) {
                        splitedText.splice(position.lineNumber - 1, 1);
                        ed.setValue(splitedText.join('\n'));
                        ed.setPosition(position);
                        // send request to saved the test case
                        context.save();
                        // fetch phones by vendor
                        await context.fetchPhonesByVendor().then(() => {
                            // fetch test case execution details
                            context.fetchTestCaseExecutionDetails();
                        }).catch((err: any) => console.log('error ', err));

                    } else {
                        // context.toastr.error('Content not deleted, try again', 'Error');
                    }
                } else {
                    context.toastr.info('Cannot Delete the action while test script is executing', 'Info');
                }
                return null;
            }
        });
        // add a comment
        editor.addAction({
            id: 'addacomment',
            label: 'Add a comment',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 2.9,
            run: function (ed) {
                if ((context.isScriptExecuting())) {
                    context.commentModal = context.modalService.show(AddCommentComponent, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
                    const position = ed.getPosition();
                    const text = ed.getValue(position);
                    const splittedText = text.split('\n');
                } else {
                    context.toastr.info('Cannot Add a comment while test script is executing', 'Info');
                }
                return null;
            }
        });
    }

    closeCommentModal(): void {
        if (this.commentModal) { this.commentModal.hide(); }
    }

    // userEnabled(role: string) {
    //   let currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
    //   if (!currentPermissions.includes(role) || currentPermissions.includes('ROLE_ADMIN'))
    //     return false;
    //   return true;
    // }

    // userDisabled(role: string): boolean {
    //     const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
    //     if (currentPermissions.includes(role) && !currentPermissions.includes('ROLE_TESTCASE_CREATE')) {
    //         return true;
    //     }
    //     return false;
    // }

    userDisabled(role: string): boolean {
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        if (currentPermissions.includes(role)) {
            if (currentPermissions.includes(Role[2])) {
                return false;
            }
            return true;
        }
        return false;
    }

    /**
     * reset all arrays data to empty
     */
    resetArrays(): void {
        this.conversations = [];
        this.intermediateConversations = [];
        this.aeService.setConversations([]);
        this.conversations = this.aeService.getConversations();
        this.aeService.setIntermedidateConversations = [];
        this.intermediateConversations = this.aeService.fetchIntermediateConversations;
        this.aeService.setResources([]);
        this.aeService.setConversationsWithUsers = [];
        this.aeService.setUiXMLResourceKeys([]);
        this.conversationWithUserDetails = this.aeService.fetchConversationsWithUsers;
        this.actions = [];
        this.inventory = [];
        this.aeService.clearGroupResources();
        this.aeService.clearInventoryMappedList();
        this.aeService.clearActionsList();
    }
    /**
     * check whether script has execution results or not
     * @param res: any 
     */
    haveExecutionResult(res: any): boolean {
        const result = (res.response.result && String(res.response.result).toLowerCase());
        this.executionResultStatus = result;
        switch (result) {
            case 'passed':
            case 'failed':
            case 'interrupted':
                return true;
            default:
                return false;
        }
    }
    /**
     *  fetch test case execution details
     */
    fetchTestCaseExecutionDetails(): void {
        this.testCaseExecutionService.fetchTestCaseExecutionDetails(this.testCaseId).subscribe(async (res: any) => {
            // check for status
            if (res.response.status && this.nonExecutionStatus.includes(res.response.status.toString().toLowerCase())) {
                this.isScriptRunning = false;
            } else {
                // fetch script status for every 10 seconds
                this.fetchScriptStatus();
                this.isScriptRunning = true;
            }
            this.executionResult = this.haveExecutionResult(res);
            this.scriptStatus = (res.response.status) ? res.response.status.toString().toLowerCase() : '';
            const executionResourcesList: any = await res.response.testCaseExecutionResources;
            if (executionResourcesList.length > 0) {
                loop1: for (let index = 0; index < this.inventoryListForRun.length; index++) {
                    const element = await this.inventoryListForRun[index];
                    let item = undefined;
                    loop2: for (let i = 0; i < executionResourcesList.length; i++) {
                        const e1 = await executionResourcesList[i];
                        if (String(e1.type).toLowerCase() === 'phone' && element.phones) {
                            item = element.phones.find((e2: any) => e2.id == e1.phone.id);
                        }
                        else if (String(e1.type).toLowerCase() === 'server' && element.phones) {
                            item = element.phones.find((e2: any) => e2.id == e1.callServer.id);
                        }
                        else if (String(e1.type).toLowerCase() === 'user' && element.users) {
                            item = element.users.find((e2: any) => e2.id == e1.deviceUser.id);
                        }

                        if (item) {
                            if (e1.type) {
                                this.inventoryListForRun[index].selectedPhone = (item.id) ? item.id : '';
                                executionResourcesList[i] = {};
                                break loop2;
                            }
                        }
                    }
                }
            }
        }, (error: any) => {
            console.error('Error at fetchTestCaseExecutionDetails ', error);
        });
    }
    /**
     * clear all selected phones for execution
     */
    clearAllSelectedPhones(): void {
        this.inventoryListForRun.forEach(element => {
            // if (element.selectedPhone) {
            element.selectedPhone = '';
            // }
        });
    }
    /**
     * run the script
     */
    runTheScript(): void {
        this.isRunButtonClicked = true;
        const testCaseExecutionResourcesList: any = [];
        const object: any = [...this.inventoryListForRun];
        object.forEach((element: any) => {
            let selectedPhone;
            let selectedUser;
            if (element.type === 'User') {
                selectedUser = element.users.find((e: any) => e.id == element.selectedPhone);
            } else {
                selectedPhone = element.phones.find((e: any) => e.id == element.selectedPhone);
            }
            const resultObject: any = {
                name: element.name.toString().toUpperCase(),
                model: (element.model) ? element.model : '',
                subModel: (element.submodel) ? element.submodel : '',
                type: element.type.toString().toUpperCase(),
                vendor: element.vendor,
                phone: null,
                callServer: null,
                deviceUser: null
            };
            if (selectedPhone) {
                if (resultObject.type.toString().toLowerCase() === 'phone') {
                    resultObject.phone = selectedPhone;
                } else {
                    resultObject.callServer = selectedPhone;
                }
            } else if (selectedUser) {
                resultObject.deviceUser = selectedUser;
            }
            testCaseExecutionResourcesList.push(resultObject);
        });
        this.testCaseExecutionService.testCaseExecution(this.testCaseId, testCaseExecutionResourcesList).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error while executing test script: ' + response.response.message, 'Error');
                this.isRunButtonClicked = false;
            } else {
                this.isScriptRunning = true;
                this.isStopButtonClicked = false;
                this.executionResult = this.haveExecutionResult(response);
                this.scriptStatus = (response.response.status) ? response.response.status.toString().toLowerCase() : '';
                this.toastr.success('Initiating test script successfully', 'Success');
                this.fetchScriptStatus();
            }
        }, (error: any) => { this.isRunButtonClicked = false; });
    }
    /**
     * stop the script
     */
    stopTheScript(): void {
        this.isStopButtonClicked = true;
        this.testCaseExecutionService.stopTestCaseExecution(this.testCaseId).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error while stopping the executing test script: ' + response.response.message, 'Error');
            } else {
                this.isScriptRunning = false;
                this.executionResult = this.haveExecutionResult(response);
                this.scriptStatus = (response.response.status) ? response.response.status.toString().toLowerCase() : '';
                this.toastr.success('Stopped executing test script successfully', 'Success');
                this.fetchScriptStatus();
            }
        });
    }
    /**
     * fetch phones by vendor
     */
    fetchPhonesByVendor(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            // get inventory resources either phone/server type
            this.inventoryListForRun = await this.aeService.getResources().filter((e: any) => e.type.toString().toLowerCase() !== Constants.TRACE_RESOURCE.toLowerCase() && e.type.toString().toLowerCase() !== Constants.GROUP_RESOURCE.toLowerCase());
            this.inventoryListForRun.forEach((item: any) => { item.selectedPhone = '' });
            const vendorsWithPhonesList = await [... new Set(this.inventory.map(({ vendor, model, type, name }) => ({ vendor, model, type, name })))];
            vendorsWithPhonesList.forEach(async (item: any) => {
                if (item.type.toString().toLowerCase() === 'phone') {
                    await this.phoneService.fetchPhonesByVendor(item.vendor, item.model).toPromise().then((response: any) => {
                        item[item.vendor] = response.response.phones;
                        this.phonesListObject[item.vendor] = response.response.phones;
                        this.inventoryListForRun.forEach(resource => {
                            // check if vendors are same
                            if (resource.vendor == item.vendor) {
                                // check if models are same
                                if (resource.model && item.model && resource.model == item.model) {
                                    resource.phones = this.phonesListObject[item.vendor];
                                } else if (!resource.model && !item.model) { // check if models is null
                                    resource.phones = this.phonesListObject[item.vendor];
                                }
                            }
                        });
                        resolve(response);
                    }, (err: any) => {
                        this.phonesListObject[item.vendor] = [];
                        item[item.vendor] = [];
                        item.errorMessage = 'No phones';
                        console.log('err res ', err);
                        reject(err);
                    });
                } else if (item.type.toString().toLowerCase() === 'server') {
                    await this.provisioningService.fetchServerByVendor(item.vendor, item.model).toPromise().then((response: any) => {
                        item[item.vendor] = response.response.callServers;
                        this.phonesListObject[item.vendor] = response.response.callServers;
                        this.inventoryListForRun.forEach(resource => {
                            if (resource.vendor == item.vendor) {
                                resource.phones = this.phonesListObject[item.vendor];
                            }
                            resolve(response);
                        });
                    }, (err: any) => {
                        this.phonesListObject[item.vendor] = [];
                        item[item.vendor] = [];
                        item.errorMessage = 'No phones';
                        console.log('err res ', err);
                        reject(err);
                    });
                } else if (item.type.toString().toLowerCase() === 'user') {
                    await this.teamsUserService.getAllUsers().toPromise().then((response: any) => {
                        item[item.vendor] = response.response.users;
                        this.phonesListObject[item.vendor] = response.response.users;
                        this.inventoryListForRun.forEach(resource => {
                            // check if vendors are same
                            if (resource.vendor == item.vendor) {
                                if (resource.type && item.type && resource.type == item.type) {
                                    resource.users = this.phonesListObject[item.vendor];
                                }
                            }
                        });
                        resolve(response);
                    }, (err: any) => {
                        this.phonesListObject[item.vendor] = [];
                        item[item.vendor] = [];
                        item.errorMessage = 'No Users';
                        console.log('err res ', err);
                        reject(err);
                    });
                }
            });
        });
    }
    /**
     * 
     */
    onChangePhones(item: any): void {
        this.isRunButtonClicked = false;
        // console.log('item ', item);
    }
    /**
     * disable clear all button
     */
    disableClearAllButton(): boolean {
        return this.inventoryListForRun.some(e => e.selectedPhone != '') && this.inventoryListForRun.length > 0;

    }
    /**
     * disable run button if any of the variable phone is not selected
     */
    disableRunButton(): boolean {
        let check: boolean;
        switch (this.scriptStatus) {
            case '':
            case 'completed':
            case 'aborted':
            case 'interrupted':
            case 'fail to start':
                check = true;
                break;
            default: check = false;
                break;
        }
        return this.inventoryListForRun.every(e => e.selectedPhone != '') && this.inventoryListForRun.length > 0 && check;
    }
    /**
     * disable select phone dropdown if the check is false
     */
    disableSelectPhoneOptions(): boolean {
        let check: boolean;
        switch (this.scriptStatus) {
            case '':
            case 'completed':
            case 'aborted':
            case 'interrupted':
            case 'fail to start':
                check = true;
                break;
            default: check = false;
                break;
        }
        return check;
    }
    /**
     * fetch script status for 10 seconds if the status is not included in nonExecutionStatus array
     */
    fetchScriptStatus(): void {
        this.statusIntervalSubscription = interval(10000).subscribe(val => {
            this.testCaseExecutionService.getStatusTestCaseExecution(this.testCaseId).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error while executing test script: ' + response.message, 'Error');
                } else {
                    this.executionResult = this.haveExecutionResult(response);
                    let check: boolean;
                    switch (this.scriptStatus) {
                        case '':
                        case 'completed':
                        case 'aborted':
                        case 'interrupted':
                        case 'fail to start':
                            check = true;
                            break;
                        default: check = false;
                            break;
                    }
                    this.isScriptRunning = !check;
                    this.scriptStatus = (response.response.status) ? response.response.status.toString().toLowerCase() : '';
                    // stop the interval
                    if (this.scriptStatus != '' && check) {
                        this.isRunButtonClicked = false;
                        this.statusIntervalSubscription.unsubscribe();
                    }
                }
            }, (error: any) => { console.error('Error while fetching script status ', error); });
        });
    }
    /**
     * enable stop button
     */
    enableStopButton(): boolean {
        return this.enableRunSideBar && this.isScriptRunning && !this.twoPanels && this.scriptStatus === 'running';
    }
    /**
     * enable run button
     */
    enableRunButton(): boolean {
        let check: boolean;
        switch (this.scriptStatus) {
            case '':
            case 'completed':
            case 'aborted':
            case 'interrupted':
            case 'fail to start':
                check = true;
                break;
            default: check = false;
                break;
        }
        // && !this.isScriptRunning
        return this.enableRunSideBar && !this.twoPanels && check;
    }
    /**
     * enable script status button
     */
    enableScriptStatusButton(): boolean {
        let check: boolean;
        switch (this.scriptStatus) {
            case 'completed':
            case 'aborted':
            case 'interrupted':
            case 'fail to start':
                check = false;
                break;
            default: check = true;
                break;
        }
        // this.scriptStatus && !this.nonExecutionStatus.includes(this.scriptStatus)
        // this.isScriptRunning &&
        return this.enableRunSideBar && !this.twoPanels && check && this.scriptStatus != 'running';
    }
    /**
     * show execution results
     * @param template: TemplateRef<any> 
     */
    showResults(template: TemplateRef<any>): void {
        this.testCaseExecutionService.getTestCaseExecutionResult(this.testCaseId).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Couldn\'t load test details: ' + response.response.message, 'Error');
                this.currentDetail = null;
            } else {
                if (response.response.subResult.resources == null || response.response.subResult.resources.length == 0) {
                    this.phoneDetails = [];
                    response.response.subResult.testResultResourceDtos.forEach(e => {
                        this.phoneDetails.push(e);
                    });
                } else {
                    this.phoneDetails = response.response.subResult.resources;
                }
                // this.currentTest = test;
                this.currentDetail = response.response.subResult;
                this.mosScoreDetailsList = this.currentDetail.mosScores;
                if (this.mosScoreDetailsList && this.mosScoreDetailsList.length > 0) {
                    this.mosScoreValues = [];
                    // set all keys to lowercase in the array
                    const mosScoreItems: string[] = this.mosScoresArray.map(e => e.toLowerCase());
                    this.mosScoreDetailsList.forEach((e: any) => {
                        const obj: [] = e.mosScoreKeyalueArray
                            .filter((e2: { label: string }) => mosScoreItems.includes(e2.label.toLowerCase()));
                        this.mosScoreValues = this.mosScoreValues.concat(obj);
                    });
                    // get the highest value in tha array
                    const highValueObj = this.mosScoreValues.sort((a: any, b: any) => a.value - b.value).reverse()[0];
                    // set maxmium value 
                    if (highValueObj.label != 'PESQ-LQ' && highValueObj.label != 'PESQ-LQO' && highValueObj.label != 'PESQ') {
                        // set the max value for the progress bar
                        this.MAX_VALUE = Math.ceil(highValueObj.value / 100) * 100;
                    }
                }
                if (this.currentDetail.logs && this.currentDetail.logs.length > 0) {
                    this.logAsText = this.currentDetail.logs.join('\n');
                }
                if (this.currentDetail.interruptedReason && this.currentDetail.interruptedReason != '' && this.currentDetail.status.toString().toLowerCase() === 'failed') {
                    this.toastr.error(this.currentDetail.interruptedReason, 'Error')
                } else {
                    // check whether logs are available or not
                    if (this.currentDetail.logAvailable) {
                        // null check point
                        if (this.currentDetail.actionReportDtos != null && this.currentDetail.calledNumber != null && this.currentDetail.callingNumber != null && this.currentDetail.conferenceParties != null && this.currentDetail.logs != null) {
                            this.resultsModalRef = this.modalService.show(template, this.executionResultsModalConfig);
                        } else {
                            this.toastr.error('Logs not available.', 'Error')
                        }
                    } else {
                        this.toastr.error('Results are not available yet. Please try again after sometime', 'Error')
                    }
                }
            }
        });
    }
    /**
     * hide results modal
     */
    hideModal() {
        if (this.resultsModalRef) {
            this.resultsModalRef.hide();
            this._showCallStats = false;
        }
    }
    /**
     * hide delete modal
     */
    hideDeleteModal(): void {
        if (this.deleteConfirmationModal) this.deleteConfirmationModal.hide();
    }
    /**
     * delete add to conversation action from the actions list
     */
    deleteAddToConversation() {
        const ed = this.globalEd;
        const context = this;
        const position = ed.getPosition();
        const text = ed.getValue(position);
        const splitedText = text.split('\n');
        this.actions.forEach(async (action: any, index: number) => {
            if (action.lineIndex === this.cursorPosition.line) {
                const obj = { resourceName: action.phone, conversationName: action.conversationName };
                this.aeService.deleteResourceInConversationsWithUsers(obj);
                this.actions.splice(index, 1);
                this.actionsCounter--;
                this.updateActionsOnDelete();
                splitedText.splice(position.lineNumber - 1, 1);
                ed.setValue(splitedText.join('\n'));
                ed.setPosition(position);
                context.hideDeleteModal();
                // send request to saved the test case
                context.save();
                // fetch phones by vendor
                await context.fetchPhonesByVendor().then(() => {
                    // fetch test case execution details
                    context.fetchTestCaseExecutionDetails();
                }).catch((err: any) => console.log('error ', err));
            }
        });
    }
    /**
     * get color
     * @param result: string 
     */
    getColor(result: string) {
        if (result) {
            switch (result.toLowerCase()) {
                case 'completed':
                    return 'darkgreen';
                case 'pass':
                case 'passed':
                    return '#0E8B18';
                case 'aborted':
                case 'interrupted':
                case 'fail':
                case 'failed':
                case 'fail to start':
                    return '#CB3333';
                default:
                    return '#000000';
            }
        }
    }
    /**
     * download log
     */
    downloadLog() {
        this.testCaseExecutionService.downloadLogs(this.testCaseId).subscribe((response: any) => {
            this.downloadFile(response, this.currentDetail.index + '.zip');
        }, (err) => console.log('err ', err));
    }

    private downloadFile(data: any, filename: string) {
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            let a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    getWidthPortions() {
        this.totalPortions = 0;
        this.detailColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    getStepPortions() {
        this.stepPortions = 0;
        this.stepColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.stepPortions += column.width;
            }
        });
    }

    getStepsWidth(column: any) {
        return (column.width * 100 / this.stepPortions) + '%';
    }

    initGridProperties() {
        this.detailColumns = [
            { field: 'id', header: 'ID', width: 15, suppressHide: true },
            { field: 'status', header: 'Status', width: 15, suppressHide: true },
            { field: 'startDate', header: 'Start Date', width: 15, suppressHide: true },
            { field: 'endDate', header: 'End Date', width: 15, suppressHide: true },
            { field: '', header: '', width: 10, suppressHide: true }
        ];

        this.stepColumns = [
            { field: 'resource', header: 'Variable', width: 20, suppressHide: true, suppressSort: true },
            { field: 'mac', header: 'MAC', width: 20, suppressHide: true, suppressSort: true },
            { field: 'ipAddress', header: 'IP Address', width: 15, suppressHide: true, suppressSort: true },
            { field: 'primaryUser', header: 'Primary User', width: 30, suppressHide: true, suppressSort: true },
            { field: 'primaryExtension', header: 'Primary Extension', width: 15, suppressHide: true, suppressSort: true },
            { field: 'email', header: 'Email', width: 30, suppressHide: true, suppressSort: true }
        ];
    }
    /**
     * check if the test script is executing or not by status
     * @returns: boolean
     */
    isScriptExecuting(): boolean {
        let check: boolean;
        switch (this.scriptStatus) {
            case '':
            case 'completed':
            case 'aborted':
            case 'interrupted':
            case 'fail to start': { check = true; break; }
            default: { check = false; break; }
        }
        //  if check is false, then we assign show tool tip content for Actions Menu
        if (!check) {
            this.actionMenuToolTipContext = 'Cannot insert the actions, while test script is executing';
        } else {
            this.actionMenuToolTipContext = '';
        }
        return check;
    }

    // closeOldPop(popover: any) {
    //     if (this.currentPop && this.currentPop !== popover) {
    //         this.currentPop.hide();
    //     }
    //     this.currentPop = popover;
    // }
    /**
     * build relationship by inventory resources
     * @returns :[{resourceName: string, actions:[]}]
     */
    async buildInventoryMapping(): Promise<any> {
        // const relationObject = [];
        const inventory: any[] = this.inventory;
        inventory.forEach((resource: any) => {
            const object = { resourceName: '', actions: [] };
            object.resourceName = resource.name;
            switch (resource.type) {
                case Constants.PHONE_RESOURCE:
                    object.actions = this.actions.filter((action: Action) => (action.from === resource.name || action.to === resource.name || action.phone === resource.name));
                    break;
                case Constants.SERVER_RESOURCE:
                    object.actions = this.actions.filter((action: Action) => (action.from === resource.name || action.to === resource.name || action.server === resource.name));
                    break;
                case Constants.USER_RESOURCE:
                    object.actions = this.actions.filter((action: Action) => (action.from === resource.name || action.to === resource.name || action.user === resource.name));
                    break;
                case Constants.GROUP_RESOURCE:
                    object.actions = this.actions.filter((action: Action) => (action.resourceGroup === resource.name));
                    break;
                case Constants.TRACE_RESOURCE:
                    object.actions = this.actions.filter((action: Action) => (action.inTrace === resource.name || action.outTrace === resource.name));
                    break;
            }
            this.aeService.setInventoryMappedList(object);
        });
        return this.aeService.getInventoryMappedList();
    }
    viewOrCloseMediaStats(){
        this._showCallStatsDetails = !this._showCallStatsDetails;
    }
    ngOnDestroy() {
        this.isStopButtonClicked = false;
        this.isRunButtonClicked = false;
        this.executionResult = false;
        this.executionResultStatus = '';
        this.scriptStatus = '';
        this.actionMenuToolTipContext = '';
        this.testCase = null;
        this.aeService.enabledTitle.emit(false);
        this.aeService.enabledSubtitle.emit(false);
        this.resetArrays();

        if (this.insertActionSubscription) {
            this.insertActionSubscription.unsubscribe();
        }
        if (this.insertMultipleSubscription) {
            this.insertMultipleSubscription.unsubscribe();
        }
        if (this.initedEditorSubscription) {
            this.initedEditorSubscription.unsubscribe();
        }
        if (this.loadTestSubscription) {
            this.loadTestSubscription.unsubscribe();
        }
        if (this.cancelActionSubscription) {
            this.cancelActionSubscription.unsubscribe();
        }
        if (this.editActionSubscription) {
            this.editActionSubscription.unsubscribe();
        }
        if (this.statusIntervalSubscription) {
            this.statusIntervalSubscription.unsubscribe();
        }
    }
}
