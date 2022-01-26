import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { LicenseService } from 'src/app/services/license-service.service';
@Component({
  selector: 'app-device-license-info',
  templateUrl: './device-license-info.component.html',
  styleUrls: ['./device-license-info.component.css']
})
export class DeviceLicenseInfoComponent implements OnInit, OnChanges {
  @Input() vendor: string;
  @Input() instances: any = [];
  @Input() multiple: boolean;
  licenceColumns: any = [];
  private totalPortions: number;
  runDetails: any;
  scheduleCounter: any;
  projects: any;
  markedProjects: boolean;
  allProjectsChecked: boolean;
  loadingProjects: boolean;
  projectDetailInfo: any = [];
  _item: any;

  @Input() getData: any;
  constructor(private modalService: BsModalService,
    private projectService: ProjectViewService,
    private toastr: ToastrService,
    private licenseService: LicenseService) { }

  ngOnChanges() {
    //  console.log(this.getData,'getData');
  }

  ngOnInit() {
    this.initGridProperties();
    this.getWidthPortions();
    this.getData;
    // console.log(this.getData)
    // this.licenseService.getProjectDetails(item.vendor,item.model).subscribe((response: any) => {
    //   this.projectDetailInfo = response.response.projectInfo;
    // console.log(this.projectDetailInfo);

    // });
  }

  /**
   * display respective device project details
   */
  showProjectDetails(data?: any) {
    this.runDetails = !this.runDetails;
    if (data) {
      this.instances.some((element, index) => {
        if (element.id == data.id) {
          element.show = !data.show;
        }
        return element.id == data.id;
      });
    }
  }

  /**
   * calculate the total width of the device license columns
   */
  private getWidthPortions() {
    this.totalPortions = 0;
    this.licenceColumns.forEach((column: any) => {
      if (!column.hidden) {
        this.totalPortions += column.width;
      }
    });
  }

  /**
     * calculate the particular column width and returns that value
     * @param column:any
     * @returns string 
     */
  getColumnWidth(column: any) {
    return (column.width * 100 / this.totalPortions) + '%';
  }

  /**
   * initialize the device license columns
   */
  private initGridProperties() {
    this.licenceColumns = [
      { field: 'projectName', header: 'Projects', width: 10, suppressHide: true },
      { field: 'lastExecutionDate', header: '', width: 15, suppressHide: true },
      { field: '', header: 'dummy1', width: 25, suppressHide: true },
      { field: '', header: 'dummy2', width: 25, suppressHide: true },

    ];
  };

  hideDeviceIndo(item: any) {
    if (item.lastRun == null) {
      this.viewDeviceIndo(item);
    } else {
      item.showLast = !item.showLast;
    }
  }

  viewDeviceIndo(item) {

  }
}
