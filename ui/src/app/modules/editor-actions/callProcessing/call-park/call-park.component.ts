import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-call-park',
  templateUrl: './call-park.component.html',
  styleUrls: ['./call-park.component.css']
})
export class CallParkComponent implements OnInit {

  action: any;
  resources: any;
  subscription: Subscription;
  selectedDevice: any = "";
  selectedDeviceLine: any = "Line1";
  parkCode: any = "";
  lines: any = ["Line1", "Line2", "Line3", "Line4", "Line5", "Line6", "Line7", "Line8", "Line9", "Line10"];
  parkcodes: any = ["ParkCode1", "ParkCode2", "ParkCode3", "ParkCode4", "ParkCode5", "ParkCode6"];
  public title: string = "";

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.resources = this.aeService.getFilteredResources(["Phone"]);
    this.subscription = this.aeService.generateAction.subscribe(res => {
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
    let item = { action: "callpark", phone: this.selectedDevice, line: this.selectedDeviceLine.toString().toLowerCase().replace("line", ""), parkCode: this.parkCode };
    let query = this.selectedDevice + "." + this.selectedDeviceLine.toString().toLowerCase() + ".callpark(\"" + this.parkCode + "\")";
    this.action = { action: item, query: query };
  }

  onSelectDevice(value: any) {
  }

  onSelectDeviceLine(value: any) {
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

}
