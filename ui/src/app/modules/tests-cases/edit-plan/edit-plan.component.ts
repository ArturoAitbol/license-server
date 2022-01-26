import { Component, OnInit, OnDestroy } from '@angular/core';
import { TestPlan } from 'src/app/model/test-plan';
import { Subscription } from 'rxjs';
import { TestPlansService } from 'src/app/services/test-plans.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'edit-plans',
  templateUrl: './edit-plan.component.html',
  styleUrls: ['./edit-plan.component.css']
})
export class EditPlanComponent implements OnInit, OnDestroy {
  testPlan: TestPlan = new TestPlan();
  subscription: Subscription;


  constructor(private testPlanService: TestPlansService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.testPlan = this.testPlanService.getTestPlan();
  }

  editTestPlan() {
    this.subscription = this.testPlanService.updateTestPlan(this.testPlan).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Error trying to update test: ' + response.response.message, 'Error');
      } else {
        this.toastr.success('Test plan updated successfully', 'Success');
        this.testPlanService.closeModal.emit('edited');
      }
    });
  }
  closeModal() {
    this.testPlanService.closeModal.emit();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
