import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import { permissions } from 'src/app/helpers/role-permissions';
import { DialogService } from 'src/app/services/dialog.service';
import { AddStakeHolderComponent } from './add-stake-holder/add-stake-holder.component';
import { UpdateStakeHolderComponent } from './update-stake-holder/update-stake-holder.component';
import { StakeHolderService } from 'src/app/services/stake-holder.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { map } from 'rxjs/operators';
import { IStakeholder } from 'src/app/model/stakeholder.model';
import { Report } from 'src/app/helpers/report';
import { Utility } from 'src/app/helpers/utils';
import { Constants } from 'src/app/helpers/constants';
@Component({
  selector: 'app-ctaas-stakeholder',
  templateUrl: './ctaas-stakeholder.component.html',
  styleUrls: ['./ctaas-stakeholder.component.css']
})
export class CtaasStakeholderComponent implements OnInit {
  tableMaxHeight: number;
  displayedColumns: any[] = [];
  stakeholdersData: any = [];
  stakeholdersDataBk: any = [];
  actionMenuOptions: any = [];
  isLoadingResults = false;
  isRequestCompleted = false;
  private readonly ADD_STAKEHOLDER = 'Add Stakeholder';
  private readonly MODIFY_STAKEHOLDER = 'Update Stakeholder Details';
  private readonly DELETE_STAKEHOLDER = 'Delete Stakeholder Account';

  readonly options = {
    MODIFY_STAKEHOLDER: this.MODIFY_STAKEHOLDER,
    DELETE_STAKEHOLDER: this.DELETE_STAKEHOLDER
  }
  constructor(
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
      { name: 'Type', dataKey: 'type', position: 'left', isSortable: true },
      { name: 'Notifications', dataKey: 'notifications', position: 'left', isSortable: false }
    ];
  }
  /**
   * get action menu options
   */
  private getActionMenuOptions() {
    const roles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "stakeholderOptions")
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
          try {
            stakeHolders.forEach((x: IStakeholder) => {
              if (x.notifications) {
                const reports = this.getReports();
                if (x.notifications.includes(',')) {
                  const splittingData = x.notifications.split(',');
                  if (splittingData[0].includes('TYPE:')) {
                    x.type = splittingData[0].replace('TYPE:', '');
                    splittingData.splice(0, 1);
                  }
                  const mappedNotificationsList = splittingData.map(e => reports.find(z => z.value === e)['label']);
                  if (mappedNotificationsList.length > 0)
                    x.notifications = mappedNotificationsList.join(',');
                } else {
                  const result = x.notifications;
                  x.notifications = '';
                  x.type = result.replace('TYPE:', '');
                }
              }
            });
            return e;
          }
          catch (exception) {
            console.error('some error |', exception);
          }
        })
      )
      .subscribe((response: any) => {
        this.isRequestCompleted = true;
        this.isLoadingResults = false;
        const { stakeHolders } = response;
        if (stakeHolders) {
          this.stakeholdersDataBk = this.stakeholdersData = stakeHolders;
          this.onChangeToggle(false);
        }
      }, (error) => {
        this.snackBarService.openSnackBar(error, 'Error while loading stake holders');
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
      // case this.DELETE_STAKEHOLDER:
      //   break;
    }
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res) {
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
      { label: "Daily Reports", value: Report.DAILY_REPORTS },
      { label: "Weekly Reports", value: Report.WEEKLY_REPORTS },
      { label: "Monthly Summaries", value: Report.MONTHLY_REPORTS }
    ];
  }
  /**
   * get when slide toggle state is changed
   * @param e: boolean 
   */
  onChangeToggle(flag: boolean): void {
    if (flag) {
      this.stakeholdersData = this.stakeholdersDataBk.filter(x => x.role === Constants.SUBACCOUNT_ADMIN);
    } else {
      this.stakeholdersData = this.stakeholdersDataBk.filter(x => x.role === Constants.SUBACCOUNT_STAKEHOLDER);

    }
  }
}
