import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-soft-keys',
  templateUrl: './soft-keys.component.html',
  styleUrls: ['./soft-keys.component.css']
})
export class SoftKeysComponent implements OnInit {
  action: any;
  subscription: Subscription;
  resources: any;
  public title: string = "";

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    // let item = { action: "answer", phone: this.selectedDevice, line: this.selectedDeviceLine.toString().toLowerCase().replace("line", "") };
    // let query = this.selectedDevice + "." + this.selectedDeviceLine.toString().toLowerCase() + ".answer()";
    // this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

}
