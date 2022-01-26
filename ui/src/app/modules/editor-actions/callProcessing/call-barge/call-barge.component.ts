import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-call-barge',
  templateUrl: './call-barge.component.html',
  styleUrls: ['./call-barge.component.css']
})
export class CallBargeComponent implements OnInit {

  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = "";
  selectedLine: any = "Line1";
  lines: any = ["Line1", "Line2", "Line3", "Line4", "Line5", "Line6", "Line7", "Line8", "Line9", "Line10"];
  public title: string = "";

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.resources = this.aeService.getFilteredResources(["Phone"]);
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    })
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    let item = { action: 'call_barge', phone: this.selectedPhone, line: this.selectedLine.toString().toLowerCase().replace("line", "") };
    let query = this.selectedPhone + "." + this.selectedLine.toString().toLowerCase() + ".callBarge()";
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

}
