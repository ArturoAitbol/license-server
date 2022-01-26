import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';
import { DashboardService } from 'src/app/services/dashboard.service';
import { Phone } from 'src/app/model/phone';
import { Constants } from 'src/app/model/constant';
@Component({
  selector: 'app-broadworks-provisioning',
  templateUrl: './broadworks-provisioning.component.html',
  styleUrls: ['./broadworks-provisioning.component.css']
})
export class BroadworksProvisioningComponent implements OnInit, OnDestroy {
  phones: any = [];
  servers: any = [];
  action: any;
  phone: string = "";
  server: string = "";
  user: string;
  apiName: string = "";
  lines: any = ["Line1", "Line2", "Line3", "Line4", "Line5", "Line6", "Line7", "Line8", "Line9", "Line10"];
  line: string = "Line1";
  subscription: Subscription;
  parameters: any = [{}];
  parametersCount: number = 0;
  newParameter: any = {};
  continueOnFailure: boolean = false;
  public title: string = "";
  actionToEdit: any = {};
  forceAction: boolean;
  data: any = [];
  readonly keyword = 'api';
  selectedAutoCompleteInput: any;
  constructor(
    private aeService: AutomationEditorService,
    private dashboardService: DashboardService) {
  }
  ngOnInit() {
    this.forceAction = false;
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.server = this.actionToEdit.server;
      // not used since auto complete is implemented
      // this.apiName = this.actionToEdit.apiName;
      this.selectedAutoCompleteInput = this.actionToEdit.apiName;
      this.phone = this.actionToEdit.phone;
      this.forceAction = this.actionToEdit.forceAction;
      if (this.actionToEdit.line != null)
        this.line = this.actionToEdit.line;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.parameters = this.actionToEdit.parameters;
    }
    this.phones = this.aeService.getFilteredResources(["Phone"]).filter((e: Phone) => e.vendor.toLowerCase() !== Constants.MS.toLowerCase());
    this.servers = this.aeService.getFilteredResources(["Server"]);
    // fetch BW API's
    this.fetchBWApis();
  }
  /**
   *  
   * @param item: { api: string, parameters: string[] } 
   */
  selectEvent(item: { api: string, parameters: string[] }): void {
    // do something with selected item
    console.log('item ', item);
    this.parameters = [];
    item.parameters.forEach((parameter: string) => {
      this.parameters.push({ parameter: parameter, value: '' });
    })
  }

  onChangeSearch(val: string): void {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocused(e): void {
    // do something when input is focused
  }

  cancel(): void {
    this.aeService.cancelAction.emit();
  }

  addParameter(): void {
    this.parametersCount++;
    this.parameters.push(this.newParameter);
    this.newParameter = {};
  }

  deleteParameter(index): void {
    this.parametersCount--;
    this.parameters.splice(index, 1);
  }

  insertAction(): void {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  fetchBWApis(): void {
    this.dashboardService.fetchBWApiList().subscribe((response: any) => {
      if (!response.success) {

      } else {
        this.data = response.response.apiInfo;
      }
      console.log('res ', this.data);
    })
  }
  createAction(): void {
    let item: any = {
      action: "broadworks_provisioning",
      server: this.server,
      apiName: this.selectedAutoCompleteInput.api ? (this.selectedAutoCompleteInput.api) : this.selectedAutoCompleteInput,
      phone: this.phone,
      parameters: this.parameters,
      continueonfailure: this.continueOnFailure,
      forceAction: this.forceAction
    };
    let query: any;
    let paramsAsString: string = "";
    this.parameters.forEach((parameter: any) => {
      if (parameter.parameter) {
        parameter.value = (parameter.value) ? parameter.value : '';
        if (parameter.value == '')
          paramsAsString += `{${parameter.parameter}},`;
        else
          paramsAsString += `{${parameter.parameter},${parameter.value}},`;
      }
    });
    paramsAsString = paramsAsString.slice(0, -1);
    if (this.phone != "none") {
      item.line = this.line;
      query = `${item.server}.${item.action}(${item.apiName}, ${item.phone}.${item.line}, [${paramsAsString}],"${item.continueonfailure}")`;
    } else
      query = `${item.server}.${item.action}(${item.apiName}, ${item.phone}, [${paramsAsString}],"${item.continueonfailure}")`;

    let forceAction = (this.forceAction) ? " Force Action" : "";
    query += forceAction;
    this.action = { action: item, query: query };
  }

  ngOnDestroy(): void {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}
