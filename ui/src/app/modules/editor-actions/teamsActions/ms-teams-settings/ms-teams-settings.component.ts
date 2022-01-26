import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AutomationEditorService } from "src/app/services/automation-editor.service";
import { Subscription } from "rxjs";
import { Phone } from "src/app/model/phone";
import { Constants } from "src/app/model/constant";

@Component({
  selector: "app-ms-teams-settings",
  templateUrl: "./ms-teams-settings.component.html",
  styleUrls: ["./ms-teams-settings.component.css"],
})
export class MsTeamsSettingsComponent implements OnInit {
  // Variable Constants
  readonly CALL_FORWARDING: string = 'Call Forwarding';
  readonly SIMULTANEOUS_RING_TYPE: string = 'Simultaneous Ring';
  readonly HIDE_CALLER_ID_TYPE: string = 'Hide Caller ID';
  readonly GROUP: string = 'Group';
  readonly TIMER: string = 'timer';
  readonly STATE: string = 'state';
  readonly CALL_FORWARDING_TYPE: string = 'callForwardingType';
  readonly FORWORD_TO_PHONE: string = 'forwardToPhone';
  readonly FORWORD_TO_NUMBER: string = 'forwardToNumber';
  readonly RING_TYPE: string = 'ringType';
  readonly ENABLE_STATE: string = 'Enable';
  readonly DISABLE_STATE: string = 'Disable';
  readonly ALWAYS_STATE: string = 'Always';

  @ViewChild('myActionForm', { static: false, read: ElementRef }) public actionForm: ElementRef<any>;
  action: any;
  subscription: Subscription;
  resources: any = [];
  resourcesBk: any = [];
  selectedPhone: string;
  selectedConfig: string;
  selectedState: string;
  actionToEdit: any = {};
  configList: any = [
    { label: this.CALL_FORWARDING },
    { label: this.SIMULTANEOUS_RING_TYPE },
    { label: this.HIDE_CALLER_ID_TYPE },
  ];
  bodyHeight: any = "200px";
  selectedDestinationType: string;
  selectedCallForwardType: string;
  continueOnFailure: boolean = false;
  selectedForwordingTo: boolean = false;
  selectedTime: string;
  forwardToPhone: string;
  forwardToNumber: any;
  forwardValue: any;
  parameters: any = [{}];
  readonly keyword = "name";
  groupInventoryList: any = [];
  groupResourcesList: any = [];
  groupResourcesListBk: any = [];
  selectedResourceGroup: string = '';
  ringTypes: string[] = [
    'All at the same time',
    'In the order above'
  ];
  selectedRingType: string = '';
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.selectedPhone = '';
    this.selectedConfig = '';
    this.selectedState = '';
    this.selectedDestinationType = '';
    this.selectedCallForwardType = '';
    this.forwardToPhone = '';
    this.selectedTime = "20";
    this.forwardValue = '';
    this.forwardToNumber = '';
    this.actionToEdit = JSON.parse(localStorage.getItem("current-action"));
    this.resources = this.aeService.getFilteredResources([Constants.PHONE_RESOURCE])
      .filter((e: Phone) => e.vendor.toUpperCase() === Constants.MS.toUpperCase() && e.model.toUpperCase() === Constants.MS_TEAMS.toUpperCase());
    this.resourcesBk = this.aeService.getFilteredResources([Constants.PHONE_RESOURCE]);
    this.groupInventoryList = this.aeService.getFilteredResources([Constants.GROUP_RESOURCE]);
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.selectedResourceGroup = this.actionToEdit.resourceGroup;
      this.selectedConfig = this.actionToEdit.configurationParameter;
      this.selectedDestinationType = this.actionToEdit.callVia;
      this.parameters = this.actionToEdit.parameters;
      this.parameters.forEach(
        (element: { parameter: string; value: string }) => {
          if (element.parameter === this.TIMER) {
            this.selectedTime = element.value;
          } else if (element.parameter === this.STATE) {
            this.selectedState = element.value;
          } else if (element.parameter === this.CALL_FORWARDING_TYPE) {
            this.selectedCallForwardType = element.value;
          } else if (
            (element.parameter === this.FORWORD_TO_PHONE) && element.value != ''
          ) {
            this.forwardValue = element.value;
            this.forwardToPhone = element.value;
          } else if (element.parameter === this.FORWORD_TO_NUMBER && element.value != '') {
            this.forwardValue = element.value;
            this.forwardToNumber = element.value;
          } else if (element.parameter === this.RING_TYPE) {
            this.selectedRingType = element.value;
          }
        }
      );
      this.continueOnFailure =
        this.actionToEdit.continueonfailure == true ||
        this.actionToEdit.continueonfailure == "true";
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

  createAction() {
    let query = "";
    const item = {
      action: "msft_settings",
      phone: this.selectedPhone,
      configurationParameter: this.selectedConfig,
      callVia: this.selectedDestinationType,
      parameters: [
        {
          parameter: this.TIMER,
          value: this.selectedTime
        },
        {
          parameter: this.STATE,
          value: this.selectedState
        },
        {
          parameter: this.CALL_FORWARDING_TYPE,
          value: this.selectedCallForwardType ? this.selectedCallForwardType : ""
        },
        {
          parameter: this.FORWORD_TO_PHONE,
          value: this.forwardToPhone ? this.forwardToPhone : ""
        },
        {
          parameter: this.FORWORD_TO_NUMBER,
          value: this.forwardToNumber ? this.forwardToNumber : ""
        },
        {
          parameter: this.RING_TYPE,
          value: this.selectedRingType ? this.selectedRingType : ""
        }
      ],
      continueonfailure: this.continueOnFailure,
      resourceGroup: (this.selectedDestinationType === this.GROUP) ? this.selectedResourceGroup : null
    };
    if (this.selectedConfig === this.SIMULTANEOUS_RING_TYPE) {
      if (this.selectedDestinationType === this.GROUP) {
        query = `${this.selectedPhone}.settings(config=="${this.selectedConfig}",destinationType=="${this.selectedDestinationType}",group=="${this.selectedResourceGroup}",ringType=="${this.selectedRingType}",state=="${this.selectedState}"`;
      } else {
        query = `${this.selectedPhone}.settings(config=="${this.selectedConfig}",state=="${this.selectedState}"`;
      }
    } else if (this.selectedConfig === this.HIDE_CALLER_ID_TYPE) {
      query = `${this.selectedPhone}.settings(config=="${this.selectedConfig}",state=="${this.selectedState}"`;
    } else {
      if (this.selectedDestinationType === this.GROUP) {
        query = `${this.selectedPhone}.settings(config=="${this.selectedConfig}",destinationType=="${this.selectedDestinationType}",group=="${this.selectedResourceGroup}",ringType=="${this.selectedRingType}",state=="${this.selectedState}"`;
      } else {
        query = `${this.selectedPhone}.settings(config=="${this.selectedConfig}",forwardingtype=="${this.selectedCallForwardType}",state=="${this.selectedState}"`;
      }
    }
    query += `,"${this.continueOnFailure}")`;
    this.action = { action: item, query: query };
  }
  /**
   * on change simultaneous state dropdown
   * @param value: string
   */
  onChangeSimultaneousState(value: string): void {
  }

  loadPhones(item: any) {
    this.selectedForwordingTo = true;
  }
  /**
   *
   * @param item: { api: string, parameters: string[] }
   */
  selectEvent(item: any): void {
    // do something with selected item
    if (item) {
      this.forwardToPhone = item.name;
      this.forwardToNumber = "";
    }
  }

  onChangeSearch(val: string): void {
    // fetch remote data from here
    this.forwardToNumber = val;
    this.forwardToPhone = "";
    if (this.forwardToNumber) {
      setTimeout(() => {
        this.actionForm.nativeElement.click();
      }, 100);
    }
  }


  // And reassign the 'data' which is binded to 'data' property.

  onFocused(e): void {
    // do something when input is focused
  }
  /**
   * to resize the ng-select modal
   */
  resizeBody(option: string): void {
    if (option === "open") {
      this.bodyHeight =
        (document.getElementById("modalBody").offsetHeight + 250).toString() +
        "px";
    } else {
      this.bodyHeight = "auto";
    }
  }

  /**
   * enable or disable the continue on failure fields
   * @returns boolean 
   */
  enableCallForwardingFields(): boolean {
    return this.selectedConfig === this.CALL_FORWARDING;
  }
  /**
   * enable or disable the simultaneous ring type fields
   * @returns boolean
   */
  enableSimultaneousRingFields(): boolean {
    return this.selectedConfig === this.SIMULTANEOUS_RING_TYPE || this.selectedConfig === this.HIDE_CALLER_ID_TYPE;
  }
  /**
   * enable or disable the call ID type fields
   * @returns boolean
   */
  enableCallerIDFields(): boolean {
    return this.selectedConfig === this.HIDE_CALLER_ID_TYPE;
  }
  /**
   * enable or disable the call forwarding type fields
   * @returns boolean
   */
  enableDestinationTypeFields(): boolean {
    return this.selectedState === this.ENABLE_STATE && this.selectedConfig === this.SIMULTANEOUS_RING_TYPE;
  }
  /**
   * enable or disable the call forwarding type fields
   * @returns boolean
   */
  enableSimultaneousForwardingToFields(): boolean {
    return this.selectedDestinationType !== '' && this.selectedDestinationType !== this.GROUP && this.selectedState === this.ENABLE_STATE && this.selectedConfig === this.SIMULTANEOUS_RING_TYPE;
  }
  /**
   * enable or disable resource group fields
   * @returns boolean
   */
  enableSimultaneousResourceGroupFields(): boolean {
    return this.selectedState === this.ENABLE_STATE && this.selectedConfig === this.SIMULTANEOUS_RING_TYPE && this.selectedDestinationType === this.GROUP;
  }
  /**
   * enable or disable the call forwarding type fields
   * @returns boolean 
   */
  enableCallForwardingResourceGroupFields(): boolean {
    return this.selectedState === this.ENABLE_STATE && this.selectedConfig === this.CALL_FORWARDING && this.selectedDestinationType !== '' && this.selectedDestinationType === this.GROUP;
  }
  /**
   * on change destination type dropdown
   */
  onChangeDestinationType(): void {
    switch (this.selectedDestinationType) {
      case this.GROUP:
        this.selectedResourceGroup = '';
        break;
    }
  }

  onChangeConfig(value: string): void {
    switch (value) {
      case this.CALL_FORWARDING:
      case this.SIMULTANEOUS_RING_TYPE:
      case this.HIDE_CALLER_ID_TYPE:
        this.selectedCallForwardType = '';
        this.selectedState = '';
        this.selectedDestinationType = '';
        this.selectedResourceGroup = '';
        this.forwardValue = '';
        this.selectedRingType = '';
        break;
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
