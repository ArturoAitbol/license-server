import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-ms-teams-logout',
  templateUrl: './ms-teams-logout.component.html',
  styleUrls: ['./ms-teams-logout.component.css']
})
export class MsTeamsLogoutComponent implements OnInit {
  action: any;
  actionToEdit: any;
  resources: any = [];
  resourcesBk: any = [];
  selectedResource: any;
  subscription: Subscription;
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.selectedResource = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.resourcesBk = this.aeService.getFilteredResources(['Phone']);
    this.resources = this.resourcesBk.filter((e: Phone) => e.vendor.toUpperCase() === Constants.MS.toUpperCase() && e.model.toUpperCase() === Constants.MS_TEAMS.toUpperCase());
    if (this.actionToEdit) {
      this.selectedResource = this.actionToEdit.phone;
      const vendor: string = this.getResourceVendor(this.selectedResource);
      this.resources = this.resourcesBk.filter((e: Phone) => e.vendor.toUpperCase() === vendor.toUpperCase());
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
  }
  /**
   * get the resource vendor
   * @param value: string
   * @return: string
   */
  getResourceVendor(value: string): string {
    const phone: Phone = this.resourcesBk.find((resource: any) => resource.name === value);
    return phone.vendor.toLowerCase();
  }


  /**
   * cancel action
   */
  cancel() {
    this.aeService.cancelAction.emit();
  }

  /**
   * insert action
   */
  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  /**
   * create action
   */
  createAction() {
    const query = `${this.selectedResource}.logout("${this.continueOnFailure}")`;
    const item = {
      action: 'logout',
      phone: this.selectedResource,
      continueonfailure: this.continueOnFailure
    }
    this.action = { action: item, query: query };
  }

}
