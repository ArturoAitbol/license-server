import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import { permissions } from 'src/app/helpers/role-permissions';
import { HeaderService } from 'src/app/services/header.service';
import { DialogService } from 'src/app/services/dialog.service';
import { AddStakeHolderComponent } from './add-stake-holder/add-stake-holder.component';
import { UpdateStakeHolderComponent } from './update-stake-holder/update-stake-holder.component';
import { StakeHolderService } from 'src/app/services/stake-holder.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { map } from 'rxjs/operators';
import { IStakeholder } from 'src/app/model/stakeholder.model';
import { Report } from 'src/app/helpers/report';
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
  private readonly ADD_STAKEHOLDER = 'Add Stakeholder';
  private readonly MODIFY_STAKEHOLDER = 'Update Stakeholder Details';
  private readonly DELETE_STAKEHOLDER = 'Delete Stakeholder Account';
  constructor(
    private headerService: HeaderService,
    private msalService: MsalService,
    public dialog: MatDialog,
    private snackBarService: SnackBarService,
    private dialogService: DialogService,
    private stakeholderService: StakeHolderService
  ) { }
  /**
   * calculate table height based on the window height
   */
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
      { name: 'User', dataKey: 'name', position: 'left', isSortable: true },
      { name: 'Company Name', dataKey: 'companyName', position: 'left', isSortable: true },
      { name: 'Job Title', dataKey: 'jobTitle', position: 'left', isSortable: true },
      { name: 'Email', dataKey: 'email', position: 'left', isSortable: true },
      { name: 'Phone Number', dataKey: 'phoneNumber', position: 'left', isSortable: true },
      { name: 'Notifications', dataKey: 'notifications', position: 'left', isSortable: false }
    ];
  }
  /**
   * get action menu options
   */
  private getActionMenuOptions() {
    const accountRoles = this.msalService.instance.getActiveAccount().idTokenClaims['roles'];
    accountRoles.forEach(accountRole => {
      permissions[accountRole].tables.stakeholderOptions?.forEach(item => this.actionMenuOptions.push(this[item]));
    });
  }
  /**
   * fetch stakeholder data
   */
  private fetchStakeholderList(): void {
    this.isRequestCompleted = false;
    this.isLoadingResults = true;
    this.stakeholderService.getStakeholderList()
      .pipe(
        map((e: { stakeHolders: IStakeholder[] }) => {
          const { stakeHolders } = e;
          stakeHolders.forEach((x: IStakeholder) => {
            if (x.notifications) {
              const reports = this.getReports();
              if (x.notifications.includes(',')) {
                const mappedNotificationsList = x.notifications.split(',').map(e => reports.find(z => z.value === e)['label']);
                if (mappedNotificationsList.length > 0)
                  x.notifications = mappedNotificationsList.join(',');
              } else {
                const result = reports.find(z => z.value === x.notifications)['label'];
                x.notifications = result;
              }
            }
          });
          return e;
        })
      )
      .subscribe((response: any) => {
        this.isRequestCompleted = true;
        this.isLoadingResults = false;
        const { stakeHolders } = response;
        if (stakeHolders) {
          this.stakeholdersData = stakeHolders;
        } else {
          this.snackBarService.openSnackBar(response.error, 'Error while loading stake holders');
        }
      });
  }

  ngOnInit(): void {
    this.calculateTableHeight();
    this.getActionMenuOptions();
    this.initColumns();
    this.fetchStakeholderList();
    // this.headerService.onChangeService({ hideToolbar: false, tabName: Constants.CTAAS_TOOL_BAR, transparentToolbar: false });
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
  /**
   * open add stake holder component in dialog
   */
  addStakeholder(): void {
    this.openDialog(this.ADD_STAKEHOLDER);
  }
  /**
   * open dialog
   * @param type: any 
   * @param data: any 
   */
  openDialog(type: string, data?: any): void {
    let dialogRef;
    switch (type) {
      case this.ADD_STAKEHOLDER:
        dialogRef = this.dialog.open(AddStakeHolderComponent, {
          width: '400px',
          disableClose: true
        });
        break;
      case this.MODIFY_STAKEHOLDER:
        dialogRef = this.dialog.open(UpdateStakeHolderComponent, {
          width: '400px',
          data: data,
          disableClose: true
        });
        break;
      case this.DELETE_STAKEHOLDER:
        break;
    }
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res === 'closed') {
        this.stakeholdersData = [];
        this.fetchStakeholderList();
      }
    });
  }
  /**
   * action row click event
   * @param object: { selectedRow: any, selectedOption: string, selectedIndex: string }
   */
  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    const { selectedRow, selectedOption, selectedIndex } = object;
    switch (selectedOption) {
      case this.MODIFY_STAKEHOLDER:
        this.openDialog(selectedOption, selectedRow);
        break;
      case this.DELETE_STAKEHOLDER:
        this.onDeleteStakeholderAccount(selectedRow);
        break;
    }
  }
  /**
   * on click delete stakeholder account
   * @param selectedRow: any
   */
  onDeleteStakeholderAccount(selectedRow: any): void {
    this.dialogService.confirmDialog({
      title: 'Confirm Action',
      message: 'Do you want to confirm this action?',
      confirmCaption: 'Confirm',
      cancelCaption: 'Cancel',
    }).subscribe((confirmed) => {
      if (confirmed) {
        const { email } = selectedRow;
        this.deleteStakeholder(email);
      }
    });
  }
  /**
   * delete selected stakeholder details by id
   * @param email: string 
   */
  deleteStakeholder(email: string): void {
    this.stakeholderService.deleteStakeholder(email).subscribe((response: any) => {
      if (response) {
        const { error } = response;
        if (error) {
          this.snackBarService.openSnackBar(response.error, 'Error while deleting Stakeholder');
        } else {
          this.stakeholdersData = [];
          this.fetchStakeholderList();
        }
      } else {
        this.snackBarService.openSnackBar('Deleted Stakeholder successfully', '');
        this.stakeholdersData = [];
        this.fetchStakeholderList();
      }
    });
  }
  /**
   * get reports
   * @returns: any[]
   */
  getReports(): any[] {
    return [
      { label: "Daily reports", value: Report.DAILY_REPORTS },
      { label: "Weekly reports", value: Report.WEEKLY_REPORTS },
      { label: "Monthly Summaries", value: Report.MONTHLY_REPORTS }
    ];
  }

}