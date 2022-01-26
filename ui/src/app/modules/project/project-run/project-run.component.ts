import { Component, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { ToastrService } from 'ngx-toastr';
import { Project } from 'src/app/model/project';
import { Utility, PageNames } from 'src/app/helpers/Utility';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-project-run',
  templateUrl: './project-run.component.html',
  styleUrls: ['./project-run.component.css']
})
export class ProjectRunComponent implements OnInit, AfterViewChecked {
  project: Project = new Project();
  runInstances: any = [];
  disabledDownloadButton: boolean = false;
  disabledReportButton: boolean = false;
  projectId: any;
  searchQuery: string;
  logsCounter:number = 0;
  private totalPortions: number;
  @ViewChild('projectsRunGrid', { static: true }) projectsRunGrid: DataTableComponent;
  public runColumns: any[];
  selectAllRunInstances: boolean;
  markedRunInstances: boolean;
  // counter
  selectedRunQty = 0;
  isRequestCompleted: boolean;
  tableHeight: string;
  inProgressReportToastId:any;
  inProgressselectedToastId:any;
  inProgressLogsToastId:any;
  inProgressSelectedLogToastId:any;
  reportsCounter:number = 0;
  selectedReport:any=[];
  selectedLogs:any= [];
  constructor(private route: ActivatedRoute,
    private projectService: ProjectViewService,
    private router: Router, private toastr: ToastrService) {
    this.project.name = '';
    this.isRequestCompleted = false;
  }

  loadRunInstances(id: string) {
    this.isRequestCompleted = false;
    this.projectService.getRunInstances(id).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Couldn\'t load details for project run history: ' + response.response.message, 'Error');
        this.isRequestCompleted = true;
      } else {
        this.runInstances = response.response.runInstances;
        this.runInstances.forEach((instance: any) => {
          instance.details = false;
        });
        this.isRequestCompleted = true;
      }
    }, () => {
      this.isRequestCompleted = true;
    });
  }

  loadProject(id: string) {
    this.projectService.getProjectById(id).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Couldn\'t load project: ' + response.response.message, 'Error');
      } else {
        this.project = response.response.project;
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: any) => {
      this.projectId = paramMap.params.id;
      this.initGridProperties();
      this.loadProject(paramMap.params.id);
      this.loadRunInstances(paramMap.params.id);
    });
    this.getWidthPortions();
  }

  toggleVisibility(e?: any) {
    this.markedRunInstances = true;
    for (let i = 0; i < this.runInstances.length; i++) {
      if (!this.runInstances[i].selected) {
        this.markedRunInstances = false;
        break;
      }
    }
  }

  selectAllProjects() {
    for (let i = 0; i < this.runInstances.length; i++) {
      this.runInstances[i].selected = this.selectAllRunInstances;
      if (this.selectAllRunInstances) {
        this.selectedRunQty++;
      } else {
        this.selectedRunQty--;
      }
    }
  }

  checkIfAllProjectsSelected(event: any) {
    if (event.target.checked) {
      this.selectedRunQty++;
    } else {
      this.selectedRunQty--;
    }
    this.selectAllRunInstances = this.runInstances.every(function (item: any) {
      // tslint:disable-next-line:triple-equals
      return item.selected == true;
    });
  }

  /**
   * download the selected project logs
   * downloaded file type is zip
   */
  downloadSelectedLogs(): void {
    this.disabledDownloadButton = true;
    this.logsCounter = 0;
    this.inProgressSelectedLogToastId = this.toastr.info( "Downloading logs is in progress ...",'Info', {timeOut : Constants.TOAST_TIMEOUT});
    const instanceIds: string[] = this.runInstances
      // tslint:disable-next-line: triple-equals
      .filter(e => (this.searchQuery == '') ? (e.selected == true) : e.selected == true && e.filtered == true)
      .map(e => e.id);
      this.selectedLogs = instanceIds;
    // sending multiple request to the backend
    instanceIds.forEach((id: string) => {
      this.projectService.downloadLogs(id).subscribe(async (response: any) => {
        this.runInstances.forEach(e => e.selected = false);
        this.selectAllRunInstances = this.markedRunInstances = false;
        this.selectedRunQty = 0;
        const type = { type: 'application/octet-stream' };
        this.logsCounter++;
        // tslint:disable-next-line:max-line-length
        await this.downloadFile(response, Utility.getDownloadFileName(this.project.name, 'Logs', '.zip'), type);
        this.disabledDownloadButton = false;
      }, () =>{
        this.disabledDownloadButton = false;
        this.toastr.remove(this.inProgressSelectedLogToastId);
      });
    });
  }

  /**
   * download the selected project reports
   * downloaded file type is excel
   */
  downloadSelectedReports(): void {
    this.disabledReportButton= true;
    this.reportsCounter = 0 ;
    this.inProgressselectedToastId =this.toastr.info( "Downloading Reports is in progress ...",'Info', {timeOut : Constants.TOAST_TIMEOUT});
    const instanceIds: string[] = this.runInstances
      // tslint:disable-next-line: triple-equals
      .filter(e => (this.searchQuery == '') ? (e.selected == true) : e.selected == true && e.filtered == true)
      .map(e => e.id);
      this.selectedReport = instanceIds ;
    instanceIds.forEach((id: string) => {
      this.projectService.downloadReports(id).subscribe(async (response: any) => {
        this.runInstances.forEach(e => e.selected = false);
        this.selectAllRunInstances = this.markedRunInstances = false;
        this.selectedRunQty = 0;
        const type = { type: 'application/vnd.ms-excel' };
        this.reportsCounter++;
        // tslint:disable-next-line:max-line-length
        await this.downloadFile(response, Utility.getDownloadFileName(this.project.name, 'Reports', '.xlsx'), type);
        this.disabledReportButton= false;
      },()=>{this.disabledReportButton= false;
            this.toastr.remove(this.inProgressselectedToastId);
      });
    });
  }
  ngAfterViewChecked() {
    const selectedExecution = JSON.parse(localStorage.getItem('selectedExecution'));
    if (selectedExecution) {
      this.scrollToRun(selectedExecution);
    }
  }

  scrollToRun(selectedExecution: any) {
    const elmnt = document.getElementById('runNo-' + selectedExecution.run.toString());
    if (elmnt != null) {
      elmnt.scrollIntoView({ behavior: 'smooth', block: 'center' });
      localStorage.removeItem('selectedExecution');
      setTimeout(() => {
        this.openRunDetails(selectedExecution);
      }, 0);
    }
  }

  openRunDetails(selectedExecution: any) {
    this.runInstances.forEach((instance: any) => {
      if (instance.runNo == selectedExecution.run) {
        instance.details = true;
      }
    });
    if (selectedExecution.single &&
      (selectedExecution.name.toLowerCase() === 'passed' || selectedExecution.name.toLowerCase() === 'failed')) {
      localStorage.setItem('openSingle', JSON.stringify({ single: 'true', type: selectedExecution.name }));
    }
  }

  getColumnWidth(column: any) {
    return (column.width * 100 / this.totalPortions) + '%';
  }

  getWidthPortions() {
    this.totalPortions = 0;
    this.runColumns.forEach((column: any) => {
      if (!column.hidden) {
        this.totalPortions += column.width;
      }
    });
  }

  getRunDetails(item: any) {
    item.details = !item.details;
  }

  downloadLog(item: any) {
    if (item.logsAvailable) {
      this.disabledDownloadButton = true;
      this.inProgressLogsToastId = this.toastr.info( "Downloading logs is in progress ...",'Info', { disableTimeOut: true }).toastId;
      this.projectService.downloadLogs(item.id).subscribe((response: any) => {
        const type = { type: 'application/octet-stream' };
        this.downloadFile(response, item.downloadLogName, type);
        this.disabledDownloadButton = false;
      }, () =>{
        this.disabledDownloadButton = false;
      });
    } else {
      this.toastr.error("Logs are no longer available", "Error");
      this.disabledDownloadButton = false;
    }
  }

  downloadFile(data: any, filename: string, type: any) {
    const blob = new Blob([data], type);
    const url = window.URL.createObjectURL(blob);
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    window.URL.revokeObjectURL(url);
    if(this.logsCounter == this.selectedLogs.length){
      this.toastr.remove(this.inProgressSelectedLogToastId);
    }
    if(this.reportsCounter === this.selectedReport.length){
      this.toastr.remove(this.inProgressselectedToastId);
    }
    if(this.inProgressLogsToastId){
      this.toastr.remove(this.inProgressLogsToastId);
    }
  }

  backToProject() {
    this.router.navigateByUrl('/projects');
  }

  downloadReport(item: any) {
    this.disabledReportButton= true;
    this.inProgressReportToastId = this.toastr.info( "Downloading Report is in progress ...",'Info', { disableTimeOut: true }).toastId;
    this.projectService.downloadReports(item.id).subscribe((response: any) => {
      const type = { type: 'application/vnd.ms-excel' };
      this.downloadFile(response, item.reportName, type);
      this.toastr.remove(this.inProgressReportToastId);
      this.disabledReportButton= false;
    },()=>{this.disabledReportButton= false;
      this.toastr.remove(this.inProgressReportToastId);
    });
  }

  initGridProperties() {
    this.runColumns = [
      { field: '_', header: '', width: 5, suppressHide: true, suppressSort: true },
      { field: 'runNo', header: 'Run#', width: 5, suppressHide: true },
      { field: 'status', header: 'Status', width: 7, suppressHide: true },
      { field: 'totalCount', header: 'Totals', width: 50, suppressHide: true },
      { field: 'startDate', header: 'Start Time', width: 12, suppressHide: true },
      { field: 'endDate', header: 'End Time', width: 12, suppressHide: true },
      { field: 'download', header: '', width: 8, suppressHide: true },
      { field: 'report', header: '', width: 8, suppressHide: true }
    ];
  }
}
