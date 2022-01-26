import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Phone } from 'src/app/model/phone';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { TestCaseService } from 'src/app/services/test-case.service';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-get-trace',
  templateUrl: './get-trace.component.html',
  styleUrls: ['./get-trace.component.css']
})
export class GetTraceComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  variables: any;
  resources: any;
  outTrace: string = '';
  resource: string = '';
  public title: string = "";
  actionToEdit: any = {};
  traceCaptureEnabledToVendors: any= [];
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService,
    private testCaseService: TestCaseService) {
  }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.traceCaptureEnabledToVendors = this.testCaseService.getTraceCaptureEnabledToVendors();

    if (this.actionToEdit) {
      this.outTrace = this.actionToEdit.outTrace;
      this.resource = this.actionToEdit.phone;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
      // Only Cisco,Polycom & Yealink variables are applicable
    // this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.vendor === 'Cisco' || e.vendor === 'Polycom' || e.vendor === 'Yealink');
    // this.resources = this.aeService.getFilteredResources(['Phone']);

    if (this.traceCaptureEnabledToVendors && this.traceCaptureEnabledToVendors.includes("Yealink")) {
      this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => (e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() && e.model && e.model.toUpperCase() !== Constants.Webex) ||
        e.vendor === 'Polycom' || e.vendor === 'Yealink');
    } else {
      this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => (e.vendor.toLowerCase() === Constants.Cisco.toLowerCase() && e.model && e.model.toUpperCase() !== Constants.Webex) || e.vendor === 'Polycom');
    }
  
    this.variables = this.aeService.getFilteredResources(['Trace']);
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
    let item = { action: 'get_trace', outTrace: this.outTrace, phone: this.resource , continueonfailure: this.continueOnFailure  };
    let query = this.outTrace + '=' + this.resource + '.getTrace(';
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
