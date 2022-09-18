import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import { Constants } from 'src/app/helpers/constants';
import { permissions } from 'src/app/helpers/role-permissions';
import { HeaderService } from 'src/app/services/header.service';

@Component({
  selector: 'app-ctaas-stakeholder',
  templateUrl: './ctaas-stakeholder.component.html',
  styleUrls: ['./ctaas-stakeholder.component.css']
})
export class CtaasStakeholderComponent implements OnInit {
  tableMaxHeight: number;
  displayedColumns: any[] = [];
  stakeholdersData: any = [];
  actionMenuOptions: any = [];
  isLoadingResults: boolean = false;
  isRequestCompleted: boolean = false;
  private readonly MODIFY_ACCOUNT = 'Update Stakeholder Details';
  private readonly DELETE_ACCOUNT = 'Delete Stakeholder Account';
  constructor(
    private headerService: HeaderService,
    private msalService: MsalService
  ) { }

  private calculateTableHeight() {
    this.tableMaxHeight = window.innerHeight // doc height
      - (window.outerHeight * 0.01 * 2) // - main-container margin
      - 60 // - route-content margin
      - 20 // - dashboard-content padding
      - 30 // - table padding
      - 32 // - title height
      - (window.outerHeight * 0.05 * 2); // - table-section margin
  }
  /**
   * initialize the columns settings
   */
  initColumns(): void {
    this.displayedColumns = [
      { name: 'User', dataKey: 'userName', position: 'left', isSortable: true },
      { name: 'Role', dataKey: 'role', position: 'left', isSortable: true },
      { name: 'Email', dataKey: 'email', position: 'left', isSortable: true },
      { name: 'Phone Number', dataKey: 'phoneNumber', position: 'left', isSortable: true },
      { name: 'Notifications', dataKey: 'notifications', position: 'left', isSortable: true }
    ];
  }
  private getActionMenuOptions() {
    const accountRoles = this.msalService.instance.getActiveAccount().idTokenClaims['roles'];
    console.debug('account roles | ', accountRoles);
    accountRoles.forEach(accountRole => {
      permissions[accountRole].tables.stakeholderOptions?.forEach(item => this.actionMenuOptions.push(this[item]));
    });
  }
  private fetchDataToDisplay(): void {
    this.isRequestCompleted = true;
    this.stakeholdersData = [
      {
        userName: 'Kaushik',
        role: 'Admin',
        email: 'knalla@tekvizion.com',
        phoneNumber: '+91-9012345678',
        notifications: 'All reports'
      },
      {
        userName: 'Jonathan Sieg',
        role: 'Engineer',
        email: 'jonathan@tekvizion.com',
        phoneNumber: '+1 214-522-1690',
        notifications: 'Per project report'
      },
      {
        userName: 'Sai',
        role: 'Engineer',
        email: 'snare@tekvizion.com',
        phoneNumber: '+1 469-626-0207',
        notifications: 'Weekly reports'
      }
    ];
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    this.calculateTableHeight();
    this.getActionMenuOptions();
    this.initColumns();
    this.fetchDataToDisplay();
    this.headerService.onChangeService({ hideToolbar: false, tabName: Constants.CTAAS_TOOL_BAR, transparentToolbar: false });
  }

  /**
   * sort table
   * @param sortParameters: Sort
   * @returns stakeholdersData
   */
  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc') {
      this.stakeholdersData = this.stakeholdersData.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
    } else if (sortParameters.direction === 'desc') {
      this.stakeholdersData = this.stakeholdersData.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
    } else {
      return this.stakeholdersData = this.stakeholdersData;
    }
  }



}
