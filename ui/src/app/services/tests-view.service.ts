import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestsViewService {
  createNewTest: EventEmitter<any>;
  testCaseCreated: EventEmitter<any>;
  showPlan: EventEmitter<any>;
  modifiedPlan: EventEmitter<any>;
  notifier: EventEmitter<any>;
  refresh: EventEmitter<any>;
  closedBar: EventEmitter<any>;
  hideModal: EventEmitter<any>;
  cancelEdit: EventEmitter<any>;
  holdTestCasesDragAndDrop: EventEmitter<any>;
  constructor() {
    this.createNewTest = new EventEmitter<any>();
    this.notifier = new EventEmitter<any>();
    this.showPlan = new EventEmitter<any>();
    this.modifiedPlan = new EventEmitter<any>();
    this.refresh = new EventEmitter<any>();
    this.closedBar = new EventEmitter<any>();
    this.hideModal = new EventEmitter<any>();
    this.testCaseCreated = new EventEmitter<any>();
    this.cancelEdit = new EventEmitter<any>();
    this.holdTestCasesDragAndDrop = new EventEmitter<any>();

  }
}