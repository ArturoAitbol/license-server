import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';

@Component({
  selector: 'app-export-config',
  templateUrl: './export-config.component.html',
  styleUrls: ['./export-config.component.css'],
})
export class ExportConfigComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = '';
  actionToEdit: any = {};
  url: string;
  configType: string;
  private polyConfigList: string[] = [
    'all',
    'local config',
    'web',
    'device',
    'Config Files',
  ];
  private yealinkConfigList: string[] = [
    'all',
    'local',
    'static',
    'non-static',
  ];
  configTypeList: string[] = [];
  selectedResourceType: string;
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.configType = '';
    this.configTypeList = this.polyConfigList;
    this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.vendor.toLowerCase() === 'yealink');
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.url = this.actionToEdit.url;
      this.configType = this.actionToEdit.configType;
      const vendor: string = this.resources.filter((e: Phone) => e.name === this.selectedPhone)[0]['vendor'];
      this.selectedResourceType = vendor.toLowerCase();
      if (vendor.toLowerCase() === 'yealink') {
        this.configTypeList = this.yealinkConfigList;
      } else if (vendor.toLowerCase() === 'polycom') {
        this.configTypeList = this.polyConfigList;
      }
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
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
    this.selectedResourceType = vendor.toLowerCase();
    if (vendor.toLowerCase() === 'yealink') {
      this.configTypeList = this.yealinkConfigList;
      this.configType = '';
    } else if (vendor.toLowerCase() === 'polycom') {
      this.configTypeList = this.polyConfigList;
      this.configType = '';
    }
  }

  createAction() {
    let query = '';
    const item = {
      action: 'export_config',
      phone: this.selectedPhone,
      url: (this.selectedResourceType === 'polycom') ? this.url : null,
      configType: this.configType,
      continueonfailure: this.continueOnFailure, 
    };
    if (this.selectedResourceType === 'polycom') {
      // tslint:disable-next-line: max-line-length
      query = this.selectedPhone + '.exportConfig(configType=\'' + this.configType + '\'' + ',url=\'' + this.url + '\'' ;
    } else if (this.selectedResourceType === 'yealink') {
      query = this.selectedPhone + '.exportConfig(configType=\'' + this.configType + '\'' ;
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
