import { Component, OnInit, Input, TemplateRef, HostListener } from '@angular/core';
import { CdkDragDrop, copyArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { TestPlan } from 'src/app/model/test-plan';
import { TestPlansService } from 'src/app/services/test-plans.service';
import { TestsViewService } from 'src/app/services/tests-view.service';
import { ToastrService } from 'ngx-toastr';
import { Utility } from 'src/app/helpers/Utility';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'new-plan',
  templateUrl: './new-plan.component.html',
  styleUrls: ['./new-plan.component.css']
})
export class NewPlanComponent implements OnInit {
  @Input() allDropLists;
  @Input() selectedForNewPlan;
  testPlan: TestPlan = new TestPlan();
  created: boolean = false;
  saveModal: BsModalRef;
  canSaveChanges: boolean;
  unsaveModal: BsModalRef;

  /**
   * store testCases when click on refresh
   */
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.testPlan.testsList && this.testPlan.testsList.length > 0) {
      this.addTestCasesToPlan();
    }
  }
  constructor(private datePipe: DatePipe, private testPlanService: TestPlansService,
    private modalService: BsModalService,
    private testsViewService: TestsViewService, private toastr: ToastrService) { }

  ngOnInit() {
  }


  updatePlanInfo() {
    this.testPlanService.getTestPlanById(this.testPlan.id).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Error trying to acquire test plan: ' + response.response.message, 'Error');
      } else {
        this.testPlan = response.response.testPlan;
      }
    });
  }

  save() {
    this.testPlan.ownerName = '';
    this.testPlanService.createTestPlan(this.testPlan).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Error trying to create test plan: ' + response.response.message, 'Error');
      } else {
        this.created = true;
        this.testPlan.id = response.response.id;
        if (this.selectedForNewPlan && this.selectedForNewPlan.length > 0) {
          this.selectedForNewPlan = Utility.sortListInAscendingOrder(this.selectedForNewPlan, 'listIndex', true);
          // this.selectedForNewPlan.forEach((test: any) => {
          //   this.addToPlan(test);
          // });
          this.testPlan.testsList = this.selectedForNewPlan;
        }
      }
      this.testsViewService.refresh.emit();
    });
  }

  /**
    * when test case is dragged and drop on the container 
    */
  drop(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const itemsList: any = event.container.data;
      this.testPlan.testsList = itemsList;
      itemsList[event.currentIndex].listIndex = event.currentIndex;
    } else {
      const item: any = event.item.data;
      // check for duplicate in the list
      if (this.checkIfTestCaseExistInTestsList(item) == -1) {
        copyArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousContainer.data.indexOf(event.item.data),
          event.currentIndex);
        // get the index value of the item
        const itemIndex = this.checkIfTestCaseExistInTestsList(item);
        if (itemIndex != -1) {
          this.testPlan.testsList.splice(itemIndex, 1);
          this.testPlan.testsList.push(item);
        }
        // remove duplicates from the list
        this.testPlan.testsList = [... new Set(this.testPlan.testsList)];
        // Reassign the indexes for listIndex key 
        this.testPlan.testsList.forEach((element: any, index: number) => {
          element.listIndex = index;
        });
      } else {
        this.toastr.error('Test case is already added to the test plan', 'Error');
      }
    }
  }
  /**
   * save test cases to the test plan
   * @param test: any
   */
  addToPlan(test: any) {
    this.testPlanService.addTestToPlan(this.testPlan.id, test).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error(response.response.message, 'Error');
      }
    });
  }
  /**
   * cancel the modal
   * @param template:TemplateRef
   */
  cancel(template: TemplateRef<any>) {
    if (this.testPlan.testsList && this.testPlan.testsList.length > 0) {
      this.saveModal = this.modalService.show(template, { backdrop: true, class: 'modal-dialog-centered' });
    } else {
      const response = { message: 'cancel' };
      this.testsViewService.notifier.emit(response);
    }
  }

  /**
   * close save modal
   */
  closeSaveModal() {
    this.saveModal.hide();
    this.testsViewService.notifier.emit({ message: 'close' });
  }
  /**
   * save unsaved changes
   */
  discardChanges() {
    this.saveModal.hide();
    this.testsViewService.notifier.emit({ message: 'close' });
    const response = { message: 'cancel' };
    this.testsViewService.notifier.emit(response);
  }

  saveTestCasesOrPlans(type?: string): void {
    this.saveModal.hide();
  }

  storeTestPlan() {
    // this.testsViewService.notifier.emit({ message: 'create' })
    this.addTestCasesToPlan();
  }

  removeTest(testCase: any) {
    this.testPlanService.removeTestFromPlan(this.testPlan.id, testCase.id).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Error trying to remove test case from test plan: ' + response.response.message, 'Error');
      } else {
        this.toastr.success('Succeed removing test case!', 'Success');
        this.testPlan.testsList.forEach((test, index) => {
          if (test.id === testCase.id) {
            this.testPlan.testsList.splice(index, 1);
          }
        });
      }
    });
  }

  /**
   * drag the test cases in the test plan will remove it from plan
   */
  dragDropped(event: any) {
    if (!event.isPointerOverContainer || event.container.id == 'list1') {
      const testCaseId: string = event.item.data.id;
      if (testCaseId) {
        this.testPlan.testsList.forEach((test, index) => {
          if (test.id === testCaseId) {
            this.testPlan.testsList.splice(index, 1);
          }
        });
      }
    }
  }
  /**
  * add test cases list to created test plan
  */
  addTestCasesToPlan(): void {
    this.testPlan.testsList.forEach((e: any, index: number) => { e.listIndex = index; });
    this.testPlanService.addTestsToPlan(this.testPlan.id, this.testPlan.testsList).toPromise()
      .then((response: any) => {
        if (!response.success) {
          this.toastr.error(response.response.message, 'Error');
        } else {
          const message = (this.testPlan.testCaseCount == 1) ? 'Test Case' : 'Test Cases';
          this.toastr.success(message + ' added successfully!', 'Success');
          this.updatePlanInfo();
          this.testsViewService.notifier.emit({ message: 'create' });
        }
      });
  }

  /**
   * check whether test case exist in the TestsList list
   */
  checkIfTestCaseExistInTestsList(item: any): number {
    return this.testPlan.testsList.findIndex(e => e.id == item.id);
  }
}
