import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-key-release',
  templateUrl: './key-release.component.html',
  styleUrls: ['./key-release.component.css']
})
export class KeyReleaseComponent implements OnInit {

  action: any;
  subscription: Subscription;
  resources: any;
  lines: any = ["Line1", "Line2", "Line3", "Line4", "Line5", "Line6", "Line7", "Line8", "Line9", "Line10", "Line11", "Line12", "Line13", "Line14", "Line15", "Line16"];
  dialpads: any = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  selectedPhone: any = ""
  selectedLine: any = "";
  selectedDialpad: any = "";
  others: string = "voiceMail";
  dialKey: string = "none";
  lineKey: string = "none";
  public title: string = "";

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.resources = this.aeService.getFilteredResources(["Phone"]);
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }


  createAction() {
    let content = "";
    if (this.lineKey == "lineKey")
      content = this.selectedLine.toString().toLowerCase();
    if (this.lineKey == "dialKey")
      content = this.selectedDialpad.toString().toLowerCase();
    if (this.lineKey != "lineKey" && this.lineKey != "dialKey")
      content = this.lineKey;
    let item = { action: "key_release", phone: this.selectedPhone, value: content };


    let query = this.selectedPhone + ".keyrelease(\"" + content + "\")";
    this.action = { action: item, query: query };
  }

  onSelectPhone(value: any) {
  }
  onSelectLine(value: any) {
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }
  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

}
