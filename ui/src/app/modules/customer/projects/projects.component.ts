import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Constants } from 'src/app/helpers/constants';
import { permissions } from 'src/app/helpers/role-permissions';
import { Project } from 'src/app/model/project.model';
import { TableColumn } from 'src/app/model/table-column.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AddProjectComponent } from './add-project/add-project.component';
import { ModifyProjectComponent } from "./modify-project/modify-project.component";

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  readonly displayedColumns: TableColumn[] = [
    { name: 'Project Code', dataKey: 'code', position: 'left', isSortable: true },
    { name: 'Project Name', dataKey: 'name', position: 'left', isSortable: true },
    { name: 'Status', dataKey: 'status', position: 'left', isSortable: true, canHighlighted: true },
    { name: 'Start Date', dataKey: 'openDate', position: 'left', isSortable: true },
    { name: 'Close Date', dataKey: 'closeDate', position: 'left', isSortable: true }
  ];

  readonly MODIFY_PROJECT: string = 'Edit';
  readonly CLOSE_PROJECT: string = 'Close';
  readonly DELETE_PROJECT: string = 'Delete';
  readonly VIEW_CONSUMPTION: string = 'View tekToken Consumption';

  actionMenuOptions: any = [];


  tableMaxHeight: number;
  currentCustomer: any;
  projects: Project[] = [];
  projectsBk: Project[] = [];
  // flag
  isLoadingResults = true;
  isRequestCompleted = false;

  constructor(
    private customerService: CustomerService,
    private projectService: ProjectService,
    private dialogService: DialogService,
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
    const accountRoles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    accountRoles.forEach(accountRole => {
      permissions[accountRole].tables.projectOptions?.forEach(item => this.actionMenuOptions.push(this[item]));
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
    this.currentCustomer = this.customerService.getSelectedCustomer();
    this.projectService.setSelectedSubAccount(this.currentCustomer.subaccountId);
    this.fetchProjects();
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

  fetchProjects(): void {
    this.projectService.getProjectDetailsBySubAccount(this.currentCustomer.subaccountId).subscribe(res => {
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
      this.projectsBk = this.projects = res['projects'];
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
        return b[keyName].localeCompare(a[keyName])
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

  confirmCloseDialog(index: string) {
    const currentProjectData = this.projects[index];
    const projectToClose = currentProjectData.code + '-' + currentProjectData.name;
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
          closeDate: new Date().toLocaleString(),
          status: "Closed"
        };

        if (confirmed) {
          console.debug('The user confirmed the action: ', this.projects[index]);
          this.projectService.closeProject(projectToUpdate).subscribe(res => {
            if (res.body === null) {
              this.snackBarService.openSnackBar('Project updated successfully!');
              this.fetchProjects();
            } else {
              console.debug(res.body.error);
              this.snackBarService.openSnackBar(res.body.error, 'Error closing project!');
            }
          });
        }
      });
  }

  confirmDeleteDialog(index: string) {
    const { id, name, code } = this.projects[index];
    const projectToDelete = code + '-' + name;

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
              this.fetchProjects();
            }
          });
        }
      });
  }

  openConsumptionView(row: any): void {
    localStorage.setItem(Constants.PROJECT, JSON.stringify(row));
    this.router.navigate(['/customer/consumption']);
  }
}
