import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
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
import { SubAccountService } from 'src/app/services/sub-account.service';
import { ViewProfileComponent } from 'src/app/generics/view-profile/view-profile.component';
import { CallbackService } from 'src/app/services/callback.service';
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
  stakeholdersCount = 0;
  toggleStatus = false;
  isDataLoading = false;
  private readonly ADD_STAKEHOLDER = 'Add Stakeholder';
  private readonly MODIFY_STAKEHOLDER = 'Update Details';
  private readonly CALLBACK = 'Request Call to this Account';
  private readonly DELETE_STAKEHOLDER = 'Delete Account';

  readonly options = {
    MODIFY_STAKEHOLDER: this.MODIFY_STAKEHOLDER,
    CALLBACK: this.CALLBACK,
    DELETE_STAKEHOLDER: this.DELETE_STAKEHOLDER,
  };

  constructor(
    private msalService: MsalService,
    public dialog: MatDialog,
    private snackBarService: SnackBarService,
    private dialogService: DialogService,
    private callbackService: CallbackService,
    private stakeholderService: StakeHolderService,
    private subaccountService: SubAccountService
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
      { name: 'Role', dataKey: 'role', position:'left', isSortable:true}
    ];
  }
  /**
   * get action menu options
   */
  private getActionMenuOptions() {
    const roles: string[] = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "stakeholderOptions")
  }
  /**
   * fetch stakeholder data
   */
  private fetchStakeholderList(): void {
    this.isRequestCompleted = false;
    this.isLoadingResults = true;
    let subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.stakeholderService.getStakeholderList(subaccountDetails.id).pipe(
        map((e: { stakeHolders: IStakeholder[] }) => {
          const { stakeHolders } = e;
          try {
            this.stakeholdersCount = this.countStakeholders(e.stakeHolders);
            stakeHolders.forEach((x: IStakeholder) => {
              if (x.notifications) {
                const reports = this.getReports();
                const splittingData = x.notifications.split(',');
                const role = x.role.split('.')[1];
                x.role = role;
                if (x.notifications.includes(',')) {
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
    if(this.stakeholdersCount < Constants.STAKEHOLDERS_LIMIT_PER_SUBACCOUNT)
      this.openDialog(this.ADD_STAKEHOLDER);
    else
      this.snackBarService.openSnackBar('The maximum amount of users per customer (' + Constants.STAKEHOLDERS_LIMIT_PER_SUBACCOUNT + ') has been reached', '');
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
      case this.CALLBACK: 
        if(data.name && data.companyName && data.phoneNumber && data.jobTitle) {
          this.makeCallback(data);
        } else {
          this.openDialogForSpecificRole(dialogRef, data);
        }
        break;
      // case this.DELETE_STAKEHOLDER:
      //   break;
    }
    if(dialogRef) {
      dialogRef.afterClosed().subscribe((res: any) => {
        if (res) {
          this.stakeholdersDataBk = this.stakeholdersData = [];
          this.fetchStakeholderList();
        }
      });
    }
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
      case this.CALLBACK:
          this.openDialog(selectedOption,selectedRow);
        break;
    }
  }

  openDialogForSpecificRole(dialogRef: any, data: any) {
    const userRoles = this.getAccountRoles();
    if(userRoles.includes(Constants.SUBACCOUNT_ADMIN)) {
      dialogRef = this.dialog.open(ViewProfileComponent, {
        width: '450px',
        disableClose: true,
        data: {...data, missing:true}
      });
    } else {
      this.dialogService.acceptDialog({
        title: 'Incomplete personal information',
        message: 'Please contact your Subaccount Administrator or tekVizion to fill this user’s info.',
        confirmCaption: 'Ok',
      });
    }
  }

  makeCallback(data:any) {
    this.dialogService.confirmDialog({
      title: 'Confirm Call',
      message: 'A support engineer will be requested to call this user if you continue performing this action, do you want to continue?',
      confirmCaption: 'Confirm',
      cancelCaption: 'Cancel',
    }).subscribe((confirmed) => {
        if(confirmed){
            this.callbackService.createCallback(data).subscribe((res:any) => {
                if(!res.error){
                    this.snackBarService.openSnackBar('Callback has been made!', '');
                    this.dialogService.acceptDialog({
                      title: 'Done!',
                      message: 'A support engineer will contact you as soon as possible, thank you for your patience.',
                      confirmCaption: 'Ok',
                    });
                } else {
                  this.snackBarService.openSnackBar('Error making callback!', '');
                }
            });
        }
    });
  }

  private getAccountRoles(): any {
    return this.msalService.instance.getActiveAccount().idTokenClaims.roles;
  }
  /**
   * on click delete stakeholder account
   * @param selectedRow: any
   */
  onDeleteStakeholderAccount(selectedRow: any): void {
    if (this.toggleStatus && this.msalService.instance.getActiveAccount()?.idTokenClaims?.roles.includes(Constants.SUBACCOUNT_ADMIN)) {
      if (this.stakeholdersDataBk.filter(x => x.role === Constants.SUBACCOUNT_ADMIN).length <= 1) {
        this.snackBarService.openSnackBar("Error deleting administrator email, at least one administrator must remain");
        return;
      }
    }
    this.dialogService.confirmDialog({
      title: 'Confirm Action',
      message: 'Do you want to confirm this action?',
      confirmCaption: 'Confirm',
      cancelCaption: 'Cancel',
    }).subscribe((confirmed) => {
      if (confirmed) {
        const { email } = selectedRow;
        this.deleteStakeholder(email);
        this.stakeholdersCount = this.stakeholdersCount - 1
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
          this.stakeholdersDataBk = this.stakeholdersData = [];
          this.fetchStakeholderList();
        }
      } else {
        this.snackBarService.openSnackBar('Deleted Stakeholder successfully', '');
        this.stakeholdersDataBk = this.stakeholdersData = [];
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

  private countStakeholders(stakholdersList: IStakeholder[]): number {
    return stakholdersList.filter(x => x.role === Constants.SUBACCOUNT_STAKEHOLDER).length;
  }
}
