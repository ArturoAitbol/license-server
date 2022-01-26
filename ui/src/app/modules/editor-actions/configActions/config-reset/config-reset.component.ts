import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';
import { Phone } from 'src/app/model/phone';

@Component({
  selector: 'app-config-reset',
  templateUrl: './config-reset.component.html',
  styleUrls: ['./config-reset.component.css']
})
export class ConfigResetComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedDevice: any = '';
  selectedConfigType: string = '';
  public title: string = '';
  configList: any;
  actionToEdit: any = {};
  selectedResetType: string = '';
  selectedResourceType: string;
  private polyConfigList: string[] = ['all', 'device', 'local', 'web'];
  private yealinkConfigList: string[] = ['local', 'static ', 'non-static'];
  continueOnFailure: boolean = false; 
  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.configList = this.polyConfigList;
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.vendor === 'Yealink' || e.vendor === 'Polycom');
    if (this.actionToEdit) {
      this.selectedDevice = this.actionToEdit.phone;
      this.selectedConfigType = this.actionToEdit.value;
      this.selectedResetType = this.actionToEdit.resetType;
      const vendor: string = this.resources.filter((e: Phone) => e.name === this.selectedDevice)[0]['vendor'];
      this.selectedResourceType = vendor.toLowerCase();
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      if (vendor.toLowerCase() === 'yealink') {
        this.configList = this.yealinkConfigList;
      } else if (vendor.toLowerCase() === 'polycom') {
        this.configList = this.polyConfigList;
      }
    }
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  /**
   * on change resoure
   */
  onChangeResource(): void {
    const vendor: string = this.resources.filter((e: Phone) => e.name === this.selectedDevice)[0]['vendor'];
    this.selectedResourceType = vendor.toLowerCase();
    if (vendor.toLowerCase() === 'yealink') {
      this.configList = this.yealinkConfigList;
      this.selectedResetType = 'false';
    } else if (vendor.toLowerCase() === 'polycom') {
      this.configList = this.polyConfigList;
    }
  }


  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    let query = '';
    const item = {
      action: 'reset_config',
      phone: this.selectedDevice,
      value: this.selectedConfigType,
      resetType: (this.selectedResourceType === 'yealink') ? this.selectedResetType : null,
      continueonfailure: this.continueOnFailure,
    };
    if (this.selectedResourceType === 'polycom') {
      query = `${this.selectedDevice}.configReset(${this.selectedConfigType}`;
    } else {
      query = `${this.selectedDevice}.configReset(${this.selectedConfigType},${this.selectedResetType}`;
    }
    if(this.continueOnFailure !=null){
      query += `,"${this.continueOnFailure}"`;
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
