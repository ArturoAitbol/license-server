import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'counter-widget',
  templateUrl: './counter-widget.component.html',
  styleUrls: ['./counter-widget.component.css']
})
export class CounterWidgetComponent implements OnInit, OnDestroy {

  @Input() type: string;
  @Input() assignedColor: string;
  counter: number = 0;
  title: string = "";
  subscription: Subscription;
  currentPop: any;
  constructor(private dashboardService: DashboardService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.subscription = this.dashboardService.getDashboardDetails().subscribe((response: any) => {
      if (!response.success)
        this.toastr.error("Error trying to load reports: " + response.response.message, "Error");
      else
        this.assignValue(response.response);
    });
  }

  assignValue(response: any) {
    switch (this.type) {
      case "caseCount":
        this.counter = response.testCaseCount;
        this.title = "Test Case Count";
        break;
      case "planCount":
        this.counter = response.testPlanCount;
        this.title = "Test Plan Count";
        break;
      case "runCount":
        this.counter = response.runCount;
        this.title = "Project Run Count";
        break;
    }
  }

  closeOldPop(popover: any) {
    if (this.currentPop && this.currentPop !== popover)
      this.currentPop.hide();
    this.currentPop = popover;
  }

  changedType() {
    this.loadData();
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe;
  }
}