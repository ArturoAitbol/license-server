
import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { TestPlan } from 'src/app/model/test-plan';
import { TestPlansService } from 'src/app/services/test-plans.service';
import { Subscription } from 'rxjs';
import { TestsViewService } from 'src/app/services/tests-view.service';
import { CdkDragDrop, copyArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Utility } from 'src/app/helpers/Utility';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
    selector: 'test-plan',
    templateUrl: './test-plan.component.html',
    styleUrls: ['./test-plan.component.css']
})
export class TestPlanComponent implements OnInit, OnDestroy {

    // @Input() testPlanId: string;
    @Input() allDropLists: any;
    plansQuery = '';
    testPlan: TestPlan = new TestPlan();
    testCases: any = [];
    subscription: Subscription;
    markedTests: boolean;
    allTestsChecked: boolean;
    selectedPlansQty: number = 0;
    testsQuery = '';
    canDisabledRemoveButton: boolean;
    doesHaveTestCases: boolean;
    testPlanId: string;
    phonePoolsColumn: any = [];
    requiredPhonePools: any = [];
    totalPortions: number;
    _openResourcesDetails: boolean;
    canSaveChanges: boolean;
    saveModal: BsModalRef;
    selectedToSave: any;
    constructor(private testPlanService: TestPlansService,
        private modalService: BsModalService,
        private testsViewService: TestsViewService,
        private router: Router,
        private toastr: ToastrService) {
    }

    getTestPlan() {
        this.testPlanId = this.testPlanService.getTestPlan()['id'];
        this.markedTests = this.allTestsChecked = false;
        this.testPlanService.getTestPlanById(this.testPlanId).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to acquire test plan: ' + response.response.message, 'Error');
            } else {
                this.testPlan = response.response.testPlan;
                this.requiredPhonePools = this.testPlan.requiredPools;
                this.testPlan.testsList = response.response.testPlan.testsList;
                this.testCases = response.response.testPlan.testsList;
                this.doesHaveTestCases = (this.testCases.length === 0) ? false : true;
                this.testCases.forEach((test: any) => {
                    test.selected = false;
                    if (test.inventory) {
                        const script = test.inventory.map(e => e.name);
                        test.resources = script.join(', ').toString();
                    }
                });
                this.selectedPlansQty = 0;
                this.testsViewService.showPlan.emit(this.testPlan);
                this.testCases = Utility.sortListInAscendingOrder(this.testCases, 'listIndex', true);
            }
        });
    }

    ngOnInit() {

        this.phonePoolsColumn = [
            { field: 'name', header: 'Name', width: 20, suppressHide: true },
            { field: 'type', header: 'Type', width: 15, suppressHide: true },
            { field: 'vendor', header: 'Vendor', width: 20, suppressHide: true },
            { field: 'dut', header: 'DUT', width: 15, suppressHide: true },
        ];
        this.getWidthPortions();
        this._openResourcesDetails = this.doesHaveTestCases = false;
        this.getTestPlan();
        this.testsViewService.modifiedPlan.subscribe((response: any) => {
            this.testCases = [];
            this.getTestPlan();
        });
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    getWidthPortions() {
        this.totalPortions = 0;
        this.phonePoolsColumn.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    // drop(event: CdkDragDrop<string[]>) {
    //     if (event.previousContainer === event.container) {
    //     } else {
    //         copyArrayItem(event.previousContainer.data,
    //             event.container.data,
    //             event.previousIndex,
    //             event.currentIndex);
    //         this.addTest(event.item.data);
    //     }
    // }


    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            const itemsList: any = event.container.data;
            this.testCases = itemsList;
            this.testCases.forEach((element: any, index: number) => {
                element.listIndex = index;
            });
            this.canSaveChanges = true;
        } else {
            const item = event.item.data;
            if (this.checkIfTestCaseExistInTestsList(item) == -1) {
                copyArrayItem(event.previousContainer.data,
                    event.container.data,
                    event.previousContainer.data.indexOf(event.item.data),
                    event.currentIndex);
                this.addTest(event.item.data);
            } else {
                this.toastr.error('Test case is already added to the test plan', 'Error');
            }
        }
        this.testCases = Object.values(event.container.data);
    }
    /**
     * send request to update the test cases list w.r.t changes
     */
    swapTestCases(): void {
        // change the flag value to false
        this.canSaveChanges = false;
        this.testPlanService.swapTestCase(this.testPlan.id, this.testCases).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error(response.response.message, 'Error');
            } else {
                this.toastr.success('Test case swaped successfully!', 'Success');
            }
            // enable drag and drop functionality after successfull transaction
            this.testsViewService.holdTestCasesDragAndDrop.emit(false);
        });
    }
    testPlanReference(item: any, event: any) {
        if (event.target.checked && item.selected) {
            const length = this.testCases.filter(e => e.id == item.id);
            // this.canDisabledRemoveButton = false;
            if (length == 0) {
                this.addTest(item);
            }
        }
    }

    removeFromTestPlan(): void {
        // tslint:disable-next-line: max-line-length triple-equals
        const toDelete = this.testCases.filter((test: any) => (this.testsQuery == '') ? (test.selected == true) : test.selected == true && test.filtered == true);
        this.removeTest(toDelete);
    }

    addTest(testCase: any) {
        this.testPlanService.addTestToPlan(this.testPlan.id, testCase).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error(response.response.message, 'Error');
                this.testCases = [];
                this.getTestPlan();
                this.testCases = Utility.sortListInAscendingOrder(this.testCases, 'listIndex', true);
            } else {
                this.toastr.success('Test case added successfully', 'Success');
                this.testCases = [];
                this.getTestPlan();
                this.testCases = Utility.sortListInAscendingOrder(this.testCases, 'listIndex', true);
                // this.testsViewService.refresh.emit();
            }
        });
    }

    /**
     * remove the test cases from test plan by passing testCase IDs
     * @param testCase: any[]
     */
    removeTest(testCase: any) {
        // tslint:disable-next-line: triple-equals
        const selectedTestIdsList = testCase.map((test: any) => test.id);
        this.testPlanService.removeTestsFromPlan(this.testPlan.id, selectedTestIdsList).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to remove test case from test plan: ' + response.response.message, 'Error');
            } else {
                // tslint:disable-next-line: max-line-length
                const successMessage = response.response.deleteResult.length > 1 ? 'Test cases remove successfully' : 'Test case remove successfully';
                this.toastr.success(successMessage, 'Success');
                this.getTestPlan();
                // this.testsViewService.refresh.emit('removed');
            }
        });
        this.resetPlansView();
    }

    // close() {
    //     this.testsViewService.notifier.emit({ message: 'close' });

    // }
    /**
     * emit event when test plan is closed
     */
    close(template: TemplateRef<any>) {
        if (this.canSaveChanges) {
            this.saveModal = this.modalService.show(template, { backdrop: true, class: 'modal-dialog-centered' });
        } else {
            this.testsViewService.notifier.emit({ message: 'close' });
        }
    }
    closeModal() {
        if (this.saveModal) {
            this.saveModal.hide();
        }
    }
    closeSaveModal() {
        this.saveModal.hide();
        this.testsViewService.notifier.emit({ message: 'close' });
    }
    saveTestCasesOrPlans(type?: string): void {
        this.saveModal.hide();
        // this.saveChanges()
    }

    resetPlansView() {
        this.markedTests = false;
        // this.selectedTestsBar = false;
        this.allTestsChecked = false;
    }

    checkIfAllPlansSelected(event: any): void {
        if (event.target.checked) {
            this.selectedPlansQty++;
        } else {
            this.selectedPlansQty--;
        }
        this.allTestsChecked = this.testCases.every(function (item: any) {
            return item.selected == true;
        });
        this.markedTests = this.allTestsChecked;
    }


    selectAllTests() {
        for (let i = 0; i < this.testCases.length; i++) {
            this.testCases[i].selected = this.allTestsChecked;
            if (this.allTestsChecked) {
                this.selectedPlansQty++;
            } else {
                this.selectedPlansQty--;
            }
        }
    }

    toggleVisibility(e?: any) {
        this.markedTests = true;
        for (const test of this.testCases) {
            if (!test.selected) {
                this.markedTests = false;
                break;
            }
        }
    }

    goToTest(test: any) {
        this.router.navigate(['/testCase/' + test.id]);
    }

    dragDropped(event: any) {
        // if (!event.isPointerOverContainer || event.container.id == 'list1') {
        //     this.removeTest([event.item.data]);
        // }
    }
    /**
     * save the changes in the test plan
     */
    saveChanges(): void {
        // send false to disable drag and drop functionality for test cases
        this.testsViewService.holdTestCasesDragAndDrop.emit(true);
        this.swapTestCases();
    }
    /**
       * check whether test case exist in the TestsList list
       */
    checkIfTestCaseExistInTestsList(item: any): number {
        return this.testPlan.testsList.findIndex(e => e.id == item.id);
    }

    /**
     * show/hide the variables
     */
    showResourcesDetails(): void {
        this._openResourcesDetails = !this._openResourcesDetails;
    }

    exportTestPlan(): void{
        let fileName: string = '';
        fileName = this.testPlan.name+this.generateFileName()+".zip";
        this.testPlanService.exportTestPlans(this.testPlan.id, fileName).subscribe((response: any) => {
            const type = { type: 'application/octet-stream' };
            this.downloadPlanFile(response, fileName, type);
        });
    }

    generateFileName(): string {
        const month = (new Date().getMonth() + 1) <= 9 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1);
        const date = new Date().getDate() <= 9 ? '0' + new Date().getDate() : new Date().getDate();
        return '-' + month.toString() + date.toString() + new Date().getFullYear().toString();
    }

    private downloadPlanFile(data: any, filename: string, type: any) {
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
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
