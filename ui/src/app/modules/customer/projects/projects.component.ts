import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Project } from 'src/app/model/project.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ProjectService } from 'src/app/services/project.service';
import { AddProjectComponent } from './add-project/add-project.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  readonly displayedColumns: string[] = [
    'number',
    'name',
    'status',
    'openDate',
    'closeDate'
  ];
  currentCustomer: any;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any = [];
  projects: Project[] = [];
  // flag
  isLoadingResults: boolean = true;
  isRequestCompleted: boolean = false;

  constructor(
    private customerSerivce: CustomerService,
    private projectService: ProjectService,
    private dialogService: DialogService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();
    this.projectService.setSelectedSubAccount(this.currentCustomer.subaccountId);
    this.fetchProjects();
    this.dataSource = new MatTableDataSource(this.projects);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  openDialog(component: any, data?: any): void {
    const dialogRef = this.dialog.open(component, {
      width: 'auto',
      data: data
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
    this.projectService.getProjectList().subscribe(res => {
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
      this.projects = res['projects'];
      this.dataSource = new MatTableDataSource(this.projects);
    }, () => {
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
    });
  }
}
