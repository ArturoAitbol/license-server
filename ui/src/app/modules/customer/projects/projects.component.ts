import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import moment from 'moment';
import { forkJoin } from 'rxjs';
import { Constants } from 'src/app/helpers/constants';
import { Utility } from 'src/app/helpers/utils';
import { License } from 'src/app/model/license.model';
import { Project } from 'src/app/model/project.model';
import { TableColumn } from 'src/app/model/table-column.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LicenseService } from 'src/app/services/license.service';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { AddProjectComponent } from './add-project/add-project.component';
import { ModifyProjectComponent } from "./modify-project/modify-project.component";

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  readonly displayedColumns: TableColumn[] = [
    // we are not displaying this column for now as this is intendedfor internal usage only
    // { name: 'Project Code', dataKey: 'projectNumber', position: 'left', isSortable: true },
    { name: 'Project Name', dataKey: 'projectName', position: 'left', isSortable: true, isClickable: true },
    { name: 'License Description', dataKey: 'licenseDescription', position: 'left', isSortable: true },
    { name: 'Status', dataKey: 'status', position: 'left', isSortable: true, canHighlighted: true, isClickable: true },
    { name: 'Start Date', dataKey: 'openDate', position: 'left', isSortable: true },
    { name: 'Close Date', dataKey: 'closeDate', position: 'left', isSortable: true }
  ];

  readonly MODIFY_PROJECT: string = 'Edit';
  readonly CLOSE_PROJECT: string = 'Close';
  readonly DELETE_PROJECT: string = 'Delete';
  readonly VIEW_CONSUMPTION: string = 'View tekToken Consumption';

  readonly options = {
    MODIFY_PROJECT : this.MODIFY_PROJECT,
    CLOSE_PROJECT : this.CLOSE_PROJECT,
    DELETE_PROJECT : this.DELETE_PROJECT,
    VIEW_CONSUMPTION : this.VIEW_CONSUMPTION,
  }

  actionMenuOptions: any = [];

  tableMaxHeight: number;
  currentCustomer: any;
  licensesList: [any];
  projects: Project[] = [];
  projectsBk: Project[] = [];
  customerSubaccountDetails: any;
  // flag
  isLoadingResults: boolean;
  isRequestCompleted: boolean;
  selectedLicense: any;
  licenseForm = this.formBuilder.group({
    selectedLicense: ['']
  });

  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private subaccountService: SubAccountService,
    private projectService: ProjectService,
    private dialogService: DialogService,
    private licenseService: LicenseService,
    private snackBarService: SnackBarService,
    private router: Router,
    public dialog: MatDialog,
    private msalService: MsalService
  ) { }

  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
  }

  private getActionMenuOptions() {
    const roles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    this.actionMenuOptions = Utility.getTableOptions(roles,this.options,"projectOptions");
    if (this.currentCustomer.testCustomer === false) {
      const action = (action) => action === 'Delete';
      const index = this.actionMenuOptions.findIndex(action);
      this.actionMenuOptions.splice(index,1);
    }
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
    this.currentCustomer = this.customerService.getSelectedCustomer();
    this.customerSubaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.projectService.setSelectedSubAccount(this.customerSubaccountDetails.id);
    this.fetchProjects(true);
    this.getActionMenuOptions();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  openDialog(component: any, data?: any): void {
    const dialogRef = this.dialog.open(component, {
      width: 'auto',
      data: data,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.fetchProjects();
      }
    });
  }

  onNewProject(): void {
    this.openDialog(AddProjectComponent);
  }

  fetchProjects(updateLicenses?: boolean): void {
    this.projects = [];
    this.isLoadingResults = true;
    this.isRequestCompleted = false;
    forkJoin([
      this.licenseService.getLicenseList(this.customerSubaccountDetails.id),
      this.projectService.getProjectDetailsBySubAccount(this.customerSubaccountDetails.id)]).subscribe((responses: any) => {
        const resDataObject: any = responses.reduce((current: any, next: any) => {
          return { ...current, ...next };
        }, {});
        this.licensesList = resDataObject['licenses'];
        this.licensesList.unshift({ id: 'all', description: 'All' })
        if (updateLicenses)
          this.setSelectedLicense(this.licensesList[0]);

        this.licenseForm.patchValue({ selectedLicense: this.selectedLicense.id });

        this.projects = resDataObject['projects'];
        this.projects.forEach((project: Project) => {
          project.licenseDescription = this.licensesList.find((license: License) => license.id === project.licenseId)['description'];
        });

        if (this.selectedLicense.id !== 'all')
          this.projects = this.projects.filter((project: Project) => project.licenseId === this.selectedLicense.id);
        this.isLoadingResults = false;
        this.isRequestCompleted = true;
        this.projectsBk = this.projects;

      }, () => {
        this.isLoadingResults = false;
        this.isRequestCompleted = true;
      });
  }
  /**
   * sort table
   * @param sortParameters: Sort
   * @returns
   */
  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc') {
      this.projects = this.projects.sort((a: any, b: any) => {
        return a[keyName].localeCompare(b[keyName]);
      });
    } else if (sortParameters.direction === 'desc') {
      this.projects = this.projects.sort((a: any, b: any) => {
        return b[keyName].localeCompare(a[keyName]);
      });
    } else {
      return this.projects = this.projectsBk;
    }
  }

  /**
 * action row click event
 * @param object: { selectedRow: any, selectedOption: string, selectedIndex: string }
 */
  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    switch (object.selectedOption) {
      case this.MODIFY_PROJECT:
        this.openDialog(ModifyProjectComponent, object.selectedRow);
        break;
      case this.CLOSE_PROJECT:
        this.confirmCloseDialog(object.selectedIndex);
        break;
      case this.DELETE_PROJECT:
        this.confirmDeleteDialog(object.selectedIndex);
        break;
      case this.VIEW_CONSUMPTION:
        this.openConsumptionView(object.selectedRow);
    }
  }

  /**
     * action row click event
     * @param object: { selectedRow: any, selectedIndex: string, tableColumn: string }
     */
  columnAction(object: { selectedRow: any, selectedIndex: string, columnName: string }) {
    switch (object.columnName) {
      case 'Status':
        this.openDialog(ModifyProjectComponent, object.selectedRow);
        break;
      case 'Project Name':
        this.openConsumptionView(object.selectedRow);
        break;

    }
  }

  confirmCloseDialog(index: string) {
    const currentProjectData = this.projects[index];
    const projectToClose = currentProjectData.projectNumber + '-' + currentProjectData.projectName;
    this.dialogService
      .confirmDialog({
        title: 'Confirm Action',
        message: 'Do you want to close this project? (' + projectToClose + ')',
        confirmCaption: 'Confirm',
        cancelCaption: 'Cancel',
      })
      .subscribe((confirmed) => {
        const projectToUpdate = {
          id: currentProjectData.id,
          closeDate: moment.utc().format("YYYY-MM-DD"),
          status: "Closed"
        };
        if (confirmed) {
          console.debug('The user confirmed the action: ', this.projects[index]);
          this.projectService.closeProject(projectToUpdate).subscribe(res => {
            if (res.body === null) {
              this.fetchProjects(true);
              this.snackBarService.openSnackBar('Project closed successfully!');
            } else {
              console.debug(res.body.error);
              this.snackBarService.openSnackBar(res.body.error, 'Error closing project!');
            }
          });
        }
      });
  }

  confirmDeleteDialog(index: string) {
    const { id, projectName, projectNumber } = this.projects[index];
    const projectToDelete = projectNumber + '-' + projectName;

    this.dialogService
      .confirmDialog({
        title: 'Confirm Action',
        message: 'Do you want to delete this project? (' + projectToDelete + ')',
        confirmCaption: 'Confirm',
        cancelCaption: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          console.debug('The user confirmed the action: ', this.projects[index]);
          this.projectService.deleteProject(id).subscribe(res => {
            if (res && res.status == 200) {
              this.snackBarService.openSnackBar('Project deleted successfully!');
              this.fetchProjects(true);
            }
          });
        }
      });
  }

  openConsumptionView(row: any): void {
    localStorage.setItem(Constants.PROJECT, JSON.stringify(row));
    this.router.navigate(['/customer/consumption'], {queryParams: {subaccountId: this.customerSubaccountDetails.Id}});
  }

  onChangeLicense(newLicenseId: string) {
    if (newLicenseId) {
      this.setSelectedLicense(this.licensesList.find(item => item.id === newLicenseId));
      this.fetchProjects();
    }
  }

  private setSelectedLicense(license: License) {
    this.selectedLicense = license;
  }
}
