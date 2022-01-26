import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Phone } from 'src/app/model/phone';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { TestCaseService } from 'src/app/services/test-case.service';
import {Constants} from 'src/app/model/constant'
@Component({
  selector: 'app-start-trace',
  templateUrl: './start-trace.component.html',
  styleUrls: ['./start-trace.component.css']
})
export class StartTraceComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = '';
  public title: string = "";
  actionToEdit: any = {};
  traceCaptureEnabledToVendors: any = [];
  continueOnFailure: boolean= false;
  constructor(private aeService: AutomationEditorService,
    private testCaseService: TestCaseService) {
  }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.traceCaptureEnabledToVendors = this.testCaseService.getTraceCaptureEnabledToVendors();
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    // Only Cisco(MPP),Polycom & Yealink variables are applicable
    this.resources = this.aeService.getFilteredResources(['Phone']);
    //   this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.vendor === 'Cisco' || e.vendor === 'Polycom'|| e.vendor === 'Yealink'); 

    if (this.traceCaptureEnabledToVendors && this.traceCaptureEnabledToVendors.includes("Yealink")) {
      this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => (e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() && e.model && e.model.toUpperCase() !== Constants.Webex) ||e.vendor.toLowerCase() === Constants.Polycom.toLowerCase() || e.vendor.toLowerCase() ===  Constants.Yealink.toLowerCase());
    } else {
      this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => (e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() && e.model.toUpperCase() !== Constants.Webex) || e.vendor.toLowerCase() === Constants.Polycom.toLowerCase() );
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
    let item = { action: 'start_trace', phone: this.selectedPhone, continueonfailure: this.continueOnFailure };
    let query = this.selectedPhone + '.startTrace(';
    if(this.continueOnFailure !=null){
      query += `"${this.continueOnFailure}"`;
    }
    query += ')';
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
