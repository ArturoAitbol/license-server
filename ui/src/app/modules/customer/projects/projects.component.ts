import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Project } from 'src/app/model/project.model';
import { TableColumn } from 'src/app/model/table-column.model';
import { CustomerService } from 'src/app/services/customer.service';
import { ProjectService } from 'src/app/services/project.service';
import { AddProjectComponent } from './add-project/add-project.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit, OnDestroy {
  readonly displayedColumns: TableColumn[] = [
    { name: 'Project Number', dataKey: 'number', position: 'left', isSortable: true },
    { name: 'Project Name', dataKey: 'name', position: 'left', isSortable: true },
    { name: 'Status', dataKey: 'status', position: 'left', isSortable: true },
    { name: 'Open Date', dataKey: 'openDate', position: 'left', isSortable: true },
    { name: 'Close Date', dataKey: 'closeDate', position: 'left', isSortable: true }
  ];
  tableMaxHeight: number;
  currentCustomer: any;
  projects: Project[] = [];
  projectsBk: Project[] = [];
  // flag
  isLoadingResults: boolean = true;
  isRequestCompleted: boolean = false;

  constructor(
    private customerSerivce: CustomerService,
    private projectService: ProjectService,
    private router: Router,
    public dialog: MatDialog
  ) { }
  
  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
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
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();
    this.projectService.setSelectedSubAccount(this.currentCustomer.subaccountId);
    this.fetchProjects();
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
        if (keyName === 'number') {
          return +a[keyName] > +b[keyName] ? 1 : (+a[keyName] < +b[keyName] ? -1 : 0);
        }
        return a[keyName].localeCompare(b[keyName]);
      });
    } else if (sortParameters.direction === 'desc') {
      this.projects = this.projects.sort((a: any, b: any) => {
        if (keyName === 'number') {
          return +a[keyName] < +b[keyName] ? 1 : (+a[keyName] > +b[keyName] ? -1 : 0);

        }
        return b[keyName].localeCompare(a[keyName])
      });
    } else {
      return this.projects = this.projectsBk;
    }
  }

  ngOnDestroy(): void {
  }
}
