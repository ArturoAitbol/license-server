import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-ctaas-projects',
  templateUrl: './ctaas-projects.component.html',
  styleUrls: ['./ctaas-projects.component.css']
})
export class CtaasProjectsComponent implements OnInit, OnDestroy {
  tableMaxHeight: number;
  displayedColumns: any[] = [];
  data = [];
  projectList: any = [];
  filteredProjectList: any = [];
  isLoadingResults = true;
  isRequestCompleted = false;
  readonly EXECUTE_ON_DEMAND: string = 'Execute OnDemand';
  readonly EDIT_PROJECT: string = 'Edit';

  actionMenuOptions: any = [];
  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(public dialog: MatDialog,) { }

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
    this.initColumns();
    this.fetchDataToDisplay();
  }

  initColumns(): void {
    this.displayedColumns = [
      { name: 'Project Name', dataKey: 'name', position: 'left', isSortable: true },
      { name: 'Service Under Test', dataKey: 'subaccountName', position: 'left', isSortable: true },
      { name: 'Total Executions', dataKey: 'customerType', position: 'left', isSortable: true },
      { name: 'Next Execution', dataKey: 'status', position: 'left', isSortable: true },
      { name: 'Frequency', dataKey: 'status', position: 'left', isSortable: true }
    ];
  }

  private fetchDataToDisplay(): void {
    this.isRequestCompleted = false;
    this.isLoadingResults = true;
  }

  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc')
      this.projectList = this.projectList.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
    else if (sortParameters.direction === 'desc')
      this.projectList = this.projectList.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
    else
      return this.projectList = this.projectList;
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
      case this.EDIT_PROJECT:
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
      case this.EDIT_PROJECT:
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
