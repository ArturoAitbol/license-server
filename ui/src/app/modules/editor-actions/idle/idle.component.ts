import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { CdkDragDrop, moveItemInArray, copyArrayItem } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';

@Component({
  selector: 'idle',
  templateUrl: './idle.component.html',
  styleUrls: ['./idle.component.css']
})
export class IdleComponent implements OnInit, OnDestroy {
  action: any = { action: 'idle' };
  actions: any = [];
  subscription: Subscription;
  resources: any;
  resourcesToIdle: any = [];
  currentResource: any;
  selectedLine: any = "";
  lines: any = ["Line1", "Line2", "Line3", "Line4", "Line5", "Line6", "Line7", "Line8", "Line9", "Line10"];
  showLines: boolean = false;
  allSelected: boolean = false;
  public title: string = "";

  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.resources = this.aeService.getFilteredResources(["Phone"]);

    this.resources.forEach((resource: any) => {
      resource.selectedLine = false;
      resource.line = "All"
    });

    this.subscription = this.aeService.generateAction.subscribe(res => {
      this.insertAction();
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    this.currentResource = null;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.currentResource = JSON.parse(JSON.stringify(event.item.data));
      this.resourcesToIdle.push(this.currentResource);
      // copyArrayItem(event.previousContainer.data,
      //   event.container.data,
      //   event.previousIndex,
      //   event.currentIndex);
    }
  }

  onSelectLine() {
    this.currentResource.selectedLine = true;
  }

  insertAction() {
    this.createActions();
  }

  cleanUp() {
    this.actions = [];
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  createActions(): any {
    let item: any;
    let action: any;
    let query: any

    if (this.resourcesToIdle.length == 1) {
      action = { action: "idle", phone: this.resourcesToIdle[0].name, line: this.resourcesToIdle[0].line.toString().toLowerCase().replace("line", "") };
      query = this.resourcesToIdle[0].name + "." + this.resourcesToIdle[0].line + ".idle()";
      item = { action: action, query: query };
      this.aeService.insertAction.emit(item);
    } else {
      this.resourcesToIdle.forEach((resource: any) => {
        action = { action: "idle", phone: resource.name, line: resource.line.toString().toLowerCase().replace("line", "") };
        query = resource.name + "." + resource.line + ".idle()";
        item = { action: action, query: query };
        this.actions.push(item);
      });
      this.aeService.insertMultipleActions.emit(this.actions);
    }
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}
