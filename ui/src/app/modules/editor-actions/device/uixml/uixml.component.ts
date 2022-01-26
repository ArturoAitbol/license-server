import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';

@Component({
  selector: 'app-uixml',
  templateUrl: './uixml.component.html',
  styleUrls: ['./uixml.component.css']
})
export class UixmlComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  phones: any;
  selectedPhone: string;
  keyName: string;
  isKeyNameExist: boolean;
  actionToEdit: any = {};
  continueOnFailure: boolean = false;

  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.isKeyNameExist = false;
    this.selectedPhone = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.keyName = this.actionToEdit.resultIn;
      // tslint:disable-next-line: triple-equals
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    // Only Polycom variables are applicable
    this.phones = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.vendor.toLowerCase() === 'polycom');
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  onChangeResultKey(value: string): void {
    const keyNamesList: string[] = this.aeService.getUiXMLResourceKeys();
    this.isKeyNameExist = keyNamesList.some((e: string) => e.toLowerCase() === value.toLowerCase());
  }

  insertAction() {
    // to replace the old value with new one
    if (this.actionToEdit) {
      const keyNamesList: string[] = this.aeService.getUiXMLResourceKeys();
      const index: number = keyNamesList.indexOf(this.actionToEdit.resultIn);
      if ((index != undefined || index != null) && index != -1) {
        // keyNamesList.splice(index, 1, this.keyName);
        // this.aeService.setUiXMLResourceKeys(keyNamesList);
        this.aeService.deleteUiXmlResource(this.actionToEdit.resultIn);
        this.aeService.addUiXMLResourceKeys(this.keyName);
        this.createAction();
        this.aeService.editAction.emit(this.action);
      }
    } else {
      this.aeService.addUiXMLResourceKeys(this.keyName);
      this.createAction();
      this.aeService.insertAction.emit(this.action);
    }
    // this.createAction();
  }

  createAction() {
    const action = {
      action: 'ui_xml',
      phone: this.selectedPhone,
      resultIn: this.keyName,
      continueonfailure: this.continueOnFailure
    };
    let query = `${this.selectedPhone}.uiXml(resultKey="${this.keyName}"`;
    query += `,"${this.continueOnFailure}")`;
    this.action = { action: action, query: query };
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
