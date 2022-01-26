import { Component, OnInit } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-p-hold',
  templateUrl: './p-hold.component.html',
  styleUrls: ['./p-hold.component.css']
})
export class PHoldComponent implements OnInit {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = "";
  selectedLine: any = "Line1";
  lines: any = ["Line1", "Line2", "Line3", "Line4", "Line5", "Line6", "Line7", "Line8", "Line9", "Line10"];
  continueOnFailure:boolean =false;
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
    let item = { action: 'phold', phone: this.selectedPhone, line: this.selectedLine.toString().toLowerCase().replace("line", ""), continueonfailure: this.continueOnFailure };
    let query = this.selectedPhone + "." + this.selectedLine.toString().toLowerCase() + ".phold(";
    if(this.continueOnFailure !=null){
      query += `"${this.continueOnFailure}"`;
    }
    query += ')';
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}
