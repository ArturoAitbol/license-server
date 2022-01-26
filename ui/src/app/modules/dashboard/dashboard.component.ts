import { Component, OnInit } from '@angular/core';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/model/user';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { DashboardService } from 'src/app/services/dashboard.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  reports: any = [];
  subscription: Subscription;
  columnWidth: any;
  currentUser: User;
  licenseExpired: any;
  licenseExpiryDaysCount: any;
  graceperiod: any;
  getExpairyRefresh: any;
  // view: any = [720, 300];

  constructor(private projectsService: ProjectViewService,
    private toastr: ToastrService, private router: Router,
    private utilService: UtilService,
    private dashboardService: DashboardService) {
  }

  colorScheme = {
    domain: ['#17b164', '#f51b38', '#4BA9FA', '#AAAAAA']
  };
  showXAxis = true;
  showYAxis = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Run Instance';
  showYAxisLabel = true;
  yAxisLabel = 'Test Cases';
  legendPosition = 'below';
  legendTitle = false;

  ngOnInit() {
    this.dashboardService.getExpiryRefresh$.emit();
    this.loadReports();
    this.utilService.changedBarState.subscribe((response: any) => {
      setTimeout(() => {
        let aux = JSON.parse(JSON.stringify(this.reports));
        this.reports = [];
        this.reports = aux;
      },
        100);
    })
  }

  loadReports() {
    this.subscription = this.projectsService.getProjectReports().subscribe((response: any) => {
      if (!response.success)
        this.toastr.error("Error trying to load reports: " + response.response.message, "Error");
      else {
        this.prepareRenderData(response.response.projects);
        this.columnWidth = this.calculateWidth(response.response.projects.length);
      }
    });
  }

  prepareRenderData(data: any) {
    data.forEach((registry: any) => {
      if (registry.runInstances.length) {
        var report: any = {};
        report.name = registry.name;
        report.results = [];
        report.qty = 'all';
        report.id = registry.id;
        registry.runInstances.forEach((instance: any) => {
          report.results.push({
            name: instance.runNo, series: [
              { name: "Passed", value: instance.passCount },
              { name: "Failed", value: instance.failCount },
              { name: "Aborted", value: instance.abortedCount }]
          });
          report.fullResults = report.results;
        });
        this.reports.push(report);
      }
    });
    this.reports.reverse().splice(2);
  }

  axisFormat(val: any) {
    if (val % 1 === 0) {
      return val.toLocaleString();
    } else {
      return '';
    }
  }

  onFilterSelected(event: any, incomingReport: any) {
    this.reports.forEach((report: any) => {
      if (report.id === incomingReport.id) {
        if (event === "all")
          report.results = report.fullResults;
        else
          report.results = report.fullResults.slice(0, event);
      }
    })
  }

  calculateWidth(items: number) {
    let localWidthWidget = 2;
    let posiblesWidth = ["col-md-12", "col-md-6", "col-md-4", "col-md-3"];
    if (items >= localWidthWidget) {
      return posiblesWidth[localWidthWidget - 1];
    }
    return posiblesWidth[items - 1];
  }

  heightCalculation() {
    let colsQty = 3
    var value = 450;
    switch (colsQty) {
      case 3:
        value = 400;
        break;
      case 4:
        value = 350;
        break;
      default:
        break;
    }
    return value;
  }

  selectedRun(event: any, report: any) {
    if (event.value == 1)
      localStorage.setItem("selectedExecution", JSON.stringify({ run: event.series, name: event.name, single: true }));
    else
      localStorage.setItem("selectedExecution", JSON.stringify({ run: event.series, name: event.name, single: false }));
    this.router.navigate(['/projects/history/' + report.id]);
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}
