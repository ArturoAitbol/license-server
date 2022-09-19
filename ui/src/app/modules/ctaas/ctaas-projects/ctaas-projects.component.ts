import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import { Subject } from 'rxjs';
import { Constants } from 'src/app/helpers/constants';
import { permissions } from 'src/app/helpers/role-permissions';
import { CtaasProjectService } from 'src/app/services/ctaas-project.service';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-ctaas-projects',
  templateUrl: './ctaas-projects.component.html',
  styleUrls: ['./ctaas-projects.component.css']
})
export class CtaasProjectsComponent implements OnInit, OnDestroy {
  tableMaxHeight: number;
  currentCustomer: any;
  displayedColumns: any[] = [];
  projects: any = [];
  isLoadingResults = true;
  isRequestCompleted = false;
  readonly EXECUTE_ON_DEMAND: string = 'Execute OnDemand';
  readonly MODIFY_PROJECT: string = 'Edit';

  actionMenuOptions: any = [];
  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private customerService: CustomerService,
    public dialog: MatDialog,
    private msalService: MsalService,
    private ctaasProjectService: CtaasProjectService) { }

  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
  }

  private getActionMenuOptions() {
    const accountRoles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    accountRoles.forEach(accountRole => {
      permissions[accountRole].tables.ctaasProjectOptions?.forEach(item => this.actionMenuOptions.push(this[item]));
      if (this.currentCustomer.testCustomer === false) {
        const action = (action) => action === 'Delete';
        const index = this.actionMenuOptions.findIndex(action);
        this.actionMenuOptions.splice(index,);
      }
    })
  }

  private calculateTableHeight() {
    this.tableMaxHeight = window.innerHeight // doc height
      - (window.outerHeight * 0.01 * 2) // - main-container margin
      - 60 // - route-content margin
      - 20 // - dashboard-content padding
      - 30 // - table padding
      - 32 // - title height
      - (window.outerHeight * 0.05 * 2); // - table-section margin
  }

  ngOnInit(): void {
    this.calculateTableHeight();
    this.currentCustomer = JSON.parse(localStorage.getItem(Constants.CURRENT_SUBACCOUNT));
    this.initColumns();
    this.fetchDataToDisplay();
    this.getActionMenuOptions();
  }

  initColumns(): void {
    this.displayedColumns = [
      { name: 'Project Name', dataKey: 'name', position: 'left', isSortable: true },
      { name: 'Service Under Test', dataKey: 'deviceType', position: 'left', isSortable: true },
      { name: 'Total Executions', dataKey: 'totalExecutions', position: 'left', isSortable: true },
      { name: 'Next Execution', dataKey: 'nextExecution', position: 'left', isSortable: true },
      { name: 'Frequency', dataKey: 'frequency', position: 'left', isSortable: true }
    ];
  }

  private fetchDataToDisplay(): void {

    this.ctaasProjectService.getProjectDetailsBySubAccount(this.currentCustomer.id).subscribe((response: any) => {
      this.projects = response.ctaasProjects;
      this.isRequestCompleted = false;
      this.isLoadingResults = true;
    }, () => {
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
    });
  }

  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc')
      this.projects = this.projects.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
    else if (sortParameters.direction === 'desc')
      this.projects = this.projects.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
    else
      return this.projects = this.projects;
  }

  /**
    * open dialog
    * @param type: string
    * @param selectedItemData: any
    */
  openDialog(type: string, selectedItemData?: any): void {
    let dialogRef;
    switch (type) {
      case this.EXECUTE_ON_DEMAND:
        break;
      case this.MODIFY_PROJECT:
      // dialogRef = this.dialog.open(ModifyCustomerAccountComponent, {
      //   width: 'auto',
      //   data: selectedItemData,
      //   disableClose: true
      // });
      // break;
    }
    dialogRef.afterClosed().subscribe(res => {
      try {
        console.debug(`${type} dialog closed: ${res}`);
        if (res) {
          this.fetchDataToDisplay();
        }
      } catch (error) {
        console.log('error while in action ' + type, error);
      }
    });
  }

  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    switch (object.selectedOption) {
      case this.MODIFY_PROJECT:
        this.openDialog(object.selectedOption, object.selectedRow);
        break;
      case this.EXECUTE_ON_DEMAND:
        this.openDialog(object.selectedOption, object.selectedRow);
        break;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
