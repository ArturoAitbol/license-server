import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';
import { Phone } from 'src/app/model/phone';

@Component({
  selector: 'app-simulate-text-input',
  templateUrl: './simulate-text-input.component.html',
  styleUrls: ['./simulate-text-input.component.css']
})
export class SimulateTextInputComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = '';
  public title: string = '';
  actionToEdit: any = {};
  selectedType: any = '';
  value: string;
  replaceText: string = '';

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.value = this.actionToEdit.value;
      this.replaceText = this.actionToEdit.replaceText;
    }
    // tslint:disable-next-line: triple-equals
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.vendor == 'Polycom' || e.vendor === 'Yealink');
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  /**
   * on change resoure
   */
  onChangeResource(): void {
    const vendor: string = this.resources.filter((e: Phone) => e.name === this.selectedPhone)[0]['vendor'];
    if (vendor.toLowerCase() === 'yealink') {
      this.replaceText = 'false';
    }
  }

  createAction() {
    const item = {
      action: 'simulate_text',
      phone: this.selectedPhone,
      value: this.value,
      replaceText: this.replaceText
    };
    // tslint:disable-next-line: max-line-length
    const query = this.selectedPhone + '.simulateTextInput(value=\'' + this.value + '\'' + ',replaceText=\'' + this.replaceText + '\'' + ')';
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


}
