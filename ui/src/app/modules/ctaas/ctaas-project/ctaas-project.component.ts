import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Constants } from 'src/app/helpers/constants';
import { HeaderService } from 'src/app/services/header.service';

@Component({
  selector: 'app-ctaas-project',
  templateUrl: './ctaas-project.component.html',
  styleUrls: ['./ctaas-project.component.css']
})
export class CtaasProjectComponent implements OnInit {
  tableMaxHeight: number;
  displayedColumns: any[] = [];
  projectsData: any = [];
  actionMenuOptions: any = [];
  isLoadingResults: boolean = false;
  isRequestCompleted: boolean = false;
  constructor(private headerService: HeaderService) { }
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
      { name: 'Project Name', dataKey: 'name', position: 'left', isSortable: true },
      { name: 'Devices', dataKey: 'devices', position: 'left', isSortable: true },
      { name: 'Total Executions', dataKey: 'totalExecutions', position: 'left', isSortable: true },
      { name: 'Next Execution', dataKey: 'nextExecution', position: 'left', isSortable: true },
      { name: 'Frequency', dataKey: 'frequency', position: 'left', isSortable: true }
    ];
  }
  private fetchDataToDisplay(): void {
    this.isRequestCompleted = true;
    this.projectsData = [
      {
        name: 'MS-CTaaS_BasicFeatures',
        devices: 'Teams',
        totalExecutions: 10,
        nextExecution: 'Sep 15 2022',
        frequency: 'Daily; 4 times'
      }
    ];
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    this.calculateTableHeight();
    this.initColumns();
    this.fetchDataToDisplay();
    this.headerService.onChangeService({ hideToolbar: false, tabName: Constants.CTAAS_TOOL_BAR, transparentToolbar: false });
  }

  /**
   * sort table
   * @param sortParameters: Sort
   * @returns projectsData
   */
  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc') {
      this.projectsData = this.projectsData.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
    } else if (sortParameters.direction === 'desc') {
      this.projectsData = this.projectsData.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
    } else {
      return this.projectsData = this.projectsData;
    }
  }



}
