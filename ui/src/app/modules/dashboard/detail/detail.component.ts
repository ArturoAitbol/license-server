import { DashboardService } from '../../../services/dashboard.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';


@Component({
  selector: 'detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  widgetSubscription: Subscription;
  textHover: any = { test: false, plan: false, project: false };
  projectList: any = [];
  phoneTypes: any = [];
  links: any = [];
  countersData: any = ['caseCount', 'planCount', 'runCount'];
  private totalPortions: any = {};

  constructor(private dashboardService: DashboardService,
    private toastr: ToastrService, private router: Router) { }

  colorScheme = {
    domain: ['#5FE3A1', '#FF7285', '#4BA9FA', '#AAAAAA']
  };
  showXAxis = false;
  showYAxis = false;
  showLegend = false;
  showXAxisLabel = false;
  showYAxisLabel = false;
  inventoryColumns: any = [];
  serverColumns: any = [];
  isRequestCompleted: boolean;
  ngOnInit() {
    this.loadDetails();
    this.initColumns();
  }

  loadDetails() {
    this.isRequestCompleted = false;
    this.subscription = this.dashboardService.getDashboardDetails().subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Error trying to load reports: ' + response.response.message, 'Error');
        this.isRequestCompleted = true;
      } else {
        this.phoneTypes = response.response.phoneTypes;
        this.links = response.response.linkList;
        // replace onPOINT name for link
        this.links.forEach((element: any) => {
          if (element.name.toString().toLowerCase().includes('onpoint')) {
            element.name = element.name.toString().replace('onPOINT', '').trim();
          }
        });
        this.projectList = response.response.projectList;
        this.isRequestCompleted = true;
        console.log();

      }
    }, () => {
      this.isRequestCompleted = true;
    });
  }

  goToAction(option: string) {
    switch (option) {
      case 'test':
        this.router.navigate(['/testCases', { testCase: true }]);
        break;
      case 'plan':
        this.router.navigate(['/testCases', { testPlan: true }]);
        break;
      case 'project':
        this.router.navigate(['/projects', { project: true }]);
        break;
    }
  }

  initColumns() {
    this.inventoryColumns = [
      { field: 'name', header: 'Vendor', width: 25, suppressHide: true },
      { field: 'model', header: 'Model', width: 25, suppressHide: true },
      { field: 'count', header: 'Count', width: 25, suppressHide: true }
    ];
    this.serverColumns = [
      { field: 'name', header: 'Server', width: 25, suppressHide: true },
      { field: 'ip', header: 'IP', width: 25, suppressHide: true },
      { field: 'version', header: 'Version', width: 25, suppressHide: true },
      { field: 'connectionStatus', header: 'Status', width: 25, suppressHide: true }
    ];
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
