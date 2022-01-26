import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Phone } from 'src/app/model/phone';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-getvalue',
  templateUrl: './getvalue.component.html',
  styleUrls: ['./getvalue.component.css']
})
export class GetvalueComponent implements OnInit {
  action: any;
  actionToEdit: any = {};
  selectedPhone: any = '';
  inTrace: string = '';
  packetNumber: string ='0';
  headerNumber: string;
  sequenceNumber: string = '0';
  packetNumberType:string = 'specific';
  result: string;
  subscription: Subscription;
  resources: any;
  variables: any;
  public title: string = "";
  traceCaptureEnabledToVendors: any = [];
  continueOnFailure: boolean = false;
  sequenceNumberType: string = 'specific';
  parentHeaderNumber: string = '';
  searchOrder:string;
  allPacketNum= ['Top to Bottom', 'Bottom to Top'];
  constructor(private aeService: AutomationEditorService, ) { }

  ngOnInit() {
    this.searchOrder='Top to Bottom';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.inTrace = this.actionToEdit.inTrace;
      this.packetNumber = this.actionToEdit.expression.toString();
      this.headerNumber = this.actionToEdit.value;
      this.sequenceNumber = this.actionToEdit.command.toString();
      this.searchOrder = (this.actionToEdit.searchOrder )?this.actionToEdit.searchOrder : 'Top to Bottom';
      if(this.packetNumber === '0'){
        this.packetNumberType ='all';
      }
      if (this.sequenceNumber === '0') {
        this.sequenceNumberType = 'all';
      }
      this.result = this.actionToEdit.resultIn;
      this.selectedPhone = this.actionToEdit.phone;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.parentHeaderNumber = (this.actionToEdit.parentHeader != null) ? this.actionToEdit.parentHeader : '';
    }
    //getting InTrace values for intrace by ae service
    this.variables = this.aeService.getFilteredResources(['Trace']);

    this.resources = this.aeService.getFilteredResources(['Phone']);

    if (this.traceCaptureEnabledToVendors && this.traceCaptureEnabledToVendors.includes("Yealink")) {
      this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => (e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() && e.model && e.model.toUpperCase() !== Constants.Webex) ||
        e.vendor === 'Polycom' || e.vendor === 'Yealink');
    } else {
      this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => (e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() && e.model && e.model.toUpperCase() !== Constants.Webex) || e.vendor === 'Polycom');
    }
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }
  insertAction() {
    if (this.actionToEdit) {
      const keyNamesList: string[] = this.aeService.getCompareVariableKeys();
      const index: number = keyNamesList.indexOf(this.actionToEdit.resultIn);
      if ((index != undefined || index != null) && index != -1) {
        // keyNamesList.splice(index, 1, this.keyName);
        // this.aeService.setUiXMLResourceKeys(keyNamesList);
        this.aeService.deleteCompareVariableKeys(this.actionToEdit.resultIn);
        this.aeService.addCompareVariableKeys(this.result);
        this.createAction();
        this.aeService.editAction.emit(this.action);
      }
    } else {
      this.aeService.addCompareVariableKeys(this.result);
      this.createAction();
      this.aeService.insertAction.emit(this.action);
    }
  }
  createAction() {
    let item = {
      action: 'get_header_value',
      expression:(this.packetNumberType ==='all') ? 0 : this.packetNumber,
      searchOrder:(this.packetNumberType ==='all')? this.searchOrder:null,
      phone: this.selectedPhone,
      inTrace: this.inTrace,
      value: this.headerNumber,
      command: (this.sequenceNumberType === 'all') ? 0 : this.sequenceNumber,
      resultIn: this.result,
      continueonfailure: this.continueOnFailure,
      parentHeader: (this.parentHeaderNumber != '') ? this.parentHeaderNumber : '',

    };
    const sequenceType = (this.sequenceNumberType === 'all' ? 'All' : this.sequenceNumber);
    const packetType = (this.packetNumberType ==='all'? 'All': this.packetNumber);
    let parentHeaderVariable = '';
    let serchOrderVariable='';
   if(this.parentHeaderNumber!=''){
      parentHeaderVariable = `${this.parentHeaderNumber}`;
   }
    if (this.searchOrder!="" ){
      serchOrderVariable =`,${ this.searchOrder}`;
    }
         let query =  `${this.result}=${this.inTrace}.packet_Number('${packetType} ${serchOrderVariable}').get_header_value("${parentHeaderVariable}","${this.headerNumber}","${sequenceType}"`;
    
    query += `,"${this.continueOnFailure}")`;
    this.action = { action: item, query: query };
  }
  cancel() {
    this.aeService.cancelAction.emit();
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
