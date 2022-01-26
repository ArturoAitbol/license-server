import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/model/constant';
import { Phone } from 'src/app/model/phone';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-set-config',
  templateUrl: './set-config.component.html',
  styleUrls: ['./set-config.component.css']
})
export class SetConfigComponent implements OnInit {
  action: any;
  subscription: Subscription;
  resources: any;
  variables: any;
  selectedDevice: any = '';
  configValue: string;
  configParam: string;
  config360Param: string;
  continueOnFailure: boolean = false;
  config360ParamPolycom: string[] = ['Username', 'Password', 'IPv4 Address', 'Line Number', 'DID'];
  config360ParamGrandstreamYealink: string[] = ['Username', 'Password', 'IPv4 Address', 'Line Number', 'DID'];
  config360ParamCisco: string[] = ['Name', 'Model', 'Ipv4Address', 'Ipv6Address', 'LineNumber', 'DID', 'Uri', 'Extension', 'E164'];
  paramArray: string[];
  public title: string = "";
  actionToEdit: any = {};
  forceAction: boolean;
  enableConfig: boolean;
  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.config360Param = '';
    this.forceAction = false;
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    // Only Cisco & Polycom variables are applicable
    this.resources = this.aeService.getFilteredResources(['Phone']).filter((e:Phone )=> e.vendor.toLowerCase() === Constants.Polycom.toLowerCase() ||
e.vendor.toLowerCase() === Constants.Yealink.toLowerCase() ||(e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() && e.model.toUpperCase() === Constants.MPP.toUpperCase()));
    if (this.actionToEdit) {
      this.forceAction = this.actionToEdit.forceAction;
      this.config360Param = this.actionToEdit.value;
      this.selectedDevice = this.actionToEdit.phone;
      this.configParam = this.actionToEdit.configurationParameter;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.configValue = this.actionToEdit.configurationValue;
      this.enableConfig = (this.config360Param) ? true : false;
      if (this.enableConfig) {
        this.onSelectDevice(this.selectedDevice);
      }
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
    if (typeof this.configValue === 'undefined') {
      this.configValue = '';
    }
    let item = {
      action: 'set_config',
      phone: this.selectedDevice,
      configurationValue: this.configValue,
      configurationParameter: this.configParam,
      continueonfailure: this.continueOnFailure,
      forceAction: this.forceAction,
      value: (this.enableConfig) ? this.config360Param : null
    };
    let forceAction = (this.forceAction) ? " Force Action" : "";
    let query = this.selectedDevice + '.setConfig("' + this.configParam + '","' + this.configValue + '","' + this.continueOnFailure + '")' + forceAction;
    this.action = { action: item, query: query };
  }
  /**
   * on change phone dropdown
   * @param variableName: any
   */
  onSelectDevice(variableName: any) {
    switch (this.getVendorNameByVariable(variableName)) {
      case "polycom":
        this.paramArray = this.config360ParamPolycom;
        break;
      case "grandstream":
      case "yealink":
        this.paramArray = this.config360ParamGrandstreamYealink;
        break;
      case "cisco":
        this.paramArray = this.config360ParamCisco;
        break;
    }
  }
  /**
   * get vendor name
   * @param variableName: string 
   */
  getVendorNameByVariable(variableName: string): string {
    return this.resources.filter(e => e.name == variableName)[0]['vendor'].toString().toLowerCase();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
