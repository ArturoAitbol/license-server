import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TestCaseService } from '../../services/test-case.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TestPlansService } from 'src/app/services/test-plans.service';
import { NewTestComponent } from './new-test/new-test.component';
import { CdkDragDrop, copyArrayItem } from '@angular/cdk/drag-drop';
import { TestsViewService } from 'src/app/services/tests-view.service';
import { Subscription, interval } from 'rxjs';
import { TestPlan } from 'src/app/model/test-plan';
import { ToastrService } from 'ngx-toastr';
import { EditTestComponent } from './edit-test/edit-test.component';
import { EditPlanComponent } from './edit-plan/edit-plan.component';
import { ShowTestComponent } from './show-test/show-test.component';
import { Utility } from '../../helpers/Utility';
import { FilterService } from '../../services/filter.service';
import { Role } from '../../helpers/role';
import { UtilService } from '../../services/util.service';
import { TestCase } from 'src/app/model/test-case';

@Component({
    selector: 'test-cases',
    templateUrl: './test-cases.component.html',
    styleUrls: ['./test-cases.component.css'],
    changeDetection: ChangeDetectionStrategy.Default,
})

export class TestCasesComponent implements OnInit, AfterViewChecked, OnDestroy {
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
    private testCasePopover: any;
    private testPlanPopover: any;
    testsQuery: string = '';
    plansQuery: string = '';
    testCases: any = [];
    testCasesBk: any = [];
    testPlans: any = [];
    selectedTestsQty: number = 0;
    filteredTestsQty: number = 0;
    selectedPlansQty: number = 0;
    filteredPlansQty: number = 0;
    allTestsChecked: any;
    allPlansChecked: any;
    plansFilter: string = 'All';
    modalRef: BsModalRef;
    deleteModal: BsModalRef;
    deleteOption: string;
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-lg', ignoreBackdropClick: true };
    subscription: Subscription;
    currentTestPlan: TestPlan;
    markedTests = false;
    markedPlans = false;
    allDropLists = ['list1', 'list2', 'list3'];
    planSubscription: Subscription;
    selectedPlan: string = '---Select---';
    selectedPlanObject: any;
    originallySelected: any = [];
    auxiliarTests: any = [];
    selectedForNewPlan: any = [];
    planToCopy: any;
    newPlan: boolean = false;
    testsFilter: boolean = undefined;
    selectedTestsBar: boolean = false;
    selectedPlansBar: boolean = false;
    showPlan: boolean = false;
    planUpdater: boolean = false;
    allTestCasesExistInTestPlan: boolean = false;
    loadingTests: boolean = true;
    loadingPlans: boolean = true;
    selectedFilter: string = 'all';
    filterCount = -1;
    _isSideBarOpened: boolean;
    newTestcase: any = [];
    canDisableDragAndDrop: boolean = false;
    filteredSearchData = [];
    downloadFileName: string;
    selectedForExport: string[];
    filesToUpload: any = [];
    overwriteTestList: any = [];
    messages: string[] = [];
    importFileName: string;
    importTestCasesObj: any = {};
    fileData = null;
    intervalSubscription: Subscription;
    anyTestCaseExecuting: boolean = false;
    disabledExportButton: boolean = false;
    disabledExportTestButton: boolean = false;
    constructor(private modalService: BsModalService,
        private testCaseService: TestCaseService,
        private router: Router,
        private testPlansService: TestPlansService,
        private testViewService: TestsViewService,
        private toastr: ToastrService,
        private filterService: FilterService,
        private route: ActivatedRoute,
        private cdRef: ChangeDetectorRef,
        private utilService: UtilService) {
    }

    loadTestCases() {
        this.loadingTests = true;
        this.testCaseService.getTestCases().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error(response.response.message, 'Error');
            } else {
                this.testCases = response.response.testCases;
                this.testCases.forEach(test => {
                    test.selected = false;
                });
                this.testCasesBk = this.testCases = Utility.sortByLastModifiedDateInDescOrder(this.testCases);
                this.loadingTests = false;
                this.anyTestCaseExecuting = this.testCases.some((e: any) => e.executing == true);
            }
            // this.loadingTests = false;
        }, () => { this.loadingTests = false; });
    }
    fetchExecutingTestCases(): void {
        this.testCaseService.getTestCases().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error(response.response.message, 'Error');
            } else {
                const data = response.response.testCases;
                const executingList: any = data.filter((e: any) => e.executing == true).map(e => e.id);
                // this.anyTestCaseExecuting = this.testCases.some((e: any) => e.executing == true);
                this.anyTestCaseExecuting = executingList.length > 0;
                executingList.forEach((testCaseId: string) => {
                    const index = this.testCases.findIndex((test: any) => test.id == testCaseId);
                    if (index != -1) {
                        this.testCases[index]['executing'] = true;
                    }
                });
                // check if any test case has executing true
                const checkIfAnyStatusExist = this.testCases.filter(e => e.executing == true).map(e => e.id);
                // set executing status as false to exisiting items, in case if there no script executing 
                if (checkIfAnyStatusExist.length > 0 && !this.anyTestCaseExecuting) {

                }
            }
        });

    }
    loadTestPlans() {
        this.loadingPlans = true;
        this.testPlansService.getTestPlans().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error(response.response.message, 'Error');
            } else {
                this.testPlans = response.response.testPlans;
                this.testPlans.forEach(plan => {
                    plan.selected = false;
                });
                this.testPlans = Utility.sortByLastModifiedDateInDescOrder(this.testPlans);
                this.testPlans.forEach(plan => {
                    plan.selected = false;
                });
                this.loadingPlans = false;
            }

        }, () => { this.loadingPlans = false; });
    }

    getPlanPlacement(item: any) {
        if (this.filterCount !== -1 && this.testPlans.indexOf(item) >= this.filterCount) {
            return 'top';
        }
        // tslint:disable-next-line: triple-equals
        if (this.testPlans.indexOf(item) == (this.testPlans.length - 1)) {
            return 'top';
        }
        return 'bottom';
    }

    getTestPlacement(item: any) {
        if (this.filterCount !== -1 && this.testCases.indexOf(item) >= this.filterCount) {
            return 'top';
        }
        // tslint:disable-next-line: triple-equals
        if (this.testCases.indexOf(item) == (this.testCases.length - 1)) {
            return 'top';
        }
        return 'bottom';
    }

    ngAfterViewChecked() {
        this.checkIfAllTestsSelected();
        this.cdRef.detectChanges();
    }

    ngOnInit() {
        this.downloadFileName = '';
        this.importFileName = '';
        this._isSideBarOpened = JSON.parse(localStorage.getItem('user-toggle-preference'));
        this.loadTestPlans();
        this.loadTestCases();

        this.subscription = this.testViewService.notifier.subscribe((response: any) => {
            this.filterAction(response);
        });

        this.testViewService.refresh.subscribe((response: any) => {
            if (response === 'removed') {
                this.allTestsChecked = this.markedTests = false;
            }
            this.loadTestCases();
        });


        this.filterService.setFilterValue.subscribe((response: any) => {
            this.filterCount = response.count;
            this.filteredSearchData = response.data;
        });

        this.testPlansService.refresh.subscribe((response: any) => {
            this.loadTestPlans();
        });

        this.testCaseService.closeModal.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
            if (response !== undefined) {
                this.loadTestCases();
            }
        });

        this.testPlansService.closeModal.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
            if (response !== undefined) {
                this.loadTestPlans();
            }
        });

        this.testPlansService.createNewPlan.subscribe((response: any) => {
            if (response) {
                this.createNewPlan(response);
            } else {
                this.createNewPlan();
            }
        });

        this.testViewService.hideModal.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
        });

        this.route.paramMap.subscribe((paramMap: any) => {
            if (paramMap.params.testCase) {
                this.createNewTest();
            }

            if (paramMap.params.testPlan) {
                this.createNewPlan();
            }

        });

        this.testViewService.showPlan.subscribe((response: any) => {
            this.currentTestPlan = response;
            this.cleanChecks();
            this.markTests();
        });

        // listen for sidebar
        this.utilService.changedBarState.subscribe((response: any) => {
            this._isSideBarOpened = response;
        });

        this.intervalSubscription = interval(5000).subscribe(() => {
            if (this.anyTestCaseExecuting) {
                this.loadTestCases();
                // this.fetchExecutingTestCases();
            }
        });
    }

    cleanChecks() {
        this.testCases.forEach((test: any) => {
            test.selected = false;
        });
    }

    markTests() {
        this.testCases.forEach((test: any) => {
            this.currentTestPlan.testsList.forEach((planTest: any) => {
                // tslint:disable-next-line: triple-equals
                if (planTest.id == test.id) {
                    test.selected = true;
                }
            });
        });
        const totalTestCasesCount = this.testCases.length;
        const totalCuurentPlanTestCasesCount = this.currentTestPlan.testsList.length;
        // tslint:disable-next-line: max-line-length
        this.allTestCasesExistInTestPlan = (totalTestCasesCount > 0 && totalCuurentPlanTestCasesCount > 0) ? totalTestCasesCount === totalCuurentPlanTestCasesCount : false;
        this.markedTests = this.allTestCasesExistInTestPlan;
        if (this.allTestCasesExistInTestPlan) {
            this.allTestsChecked = this.markedTests = true;
        }
    }

    createNewTest() {
        if (Utility.userEnabled(Role[2])) {
            this.modalRef = this.modalService.show(NewTestComponent, this.modalConfig);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    createNewPlan(selectedTests?: any) {
        if (Utility.userEnabled(Role[2])) {
            this.changeTestsFilter('published');
            this.selectedFilter = 'published';
            if (selectedTests) {
                this.selectedForNewPlan = selectedTests;
            }
            this.newPlan = !this.newPlan;
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * navigate to test case
     */
    goToTest(test: any) {
        this.router.navigate(['/testCase/' + test.id]);
        localStorage.setItem('goToEditor', 'true');
    }

    /**
     * navigate to test plan
     */
    goToPlan(plan: any) {
        if (Utility.userEnabled(Role[2])) {
            this.changeTestsFilter('published');
            this.selectedFilter = 'published';
            this.currentTestPlan = plan;
            this.showPlan = true;
            this.testPlansService.setTestPlan(plan);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    filterAction(executor: any) {
        switch (executor.message) {
            case 'cancel':
                this.newPlan = !this.newPlan;
                break;
            case 'create':
                this.newPlan = !this.newPlan;
                this.loadTestPlans();
                break;
            case 'close':
                this.currentTestPlan = null;
                this.showPlan = false;
                this.allTestsChecked = this.markedTests = false;
                this.changeTestsFilter('all');
                this.selectedFilter = 'all';
                this.loadTestPlans();
                this.loadTestCases();
                break;
        }
    }

    deleteElement(item: any, template: TemplateRef<any>, type: string) {
        // tslint:disable-next-line: triple-equals
        if ((type == 'tests' && Utility.userEnabled(Role[2])) || (type == 'plans' && Utility.userEnabled(Role[2]))) {
            item.selected = true;
            this.openDeleteModal(template, type);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    openDeleteModal(template: TemplateRef<any>, type: string) {
        // tslint:disable-next-line: triple-equals
        if ((type == 'tests' && Utility.userEnabled(Role[2])) || (type == 'plans' && Utility.userEnabled(Role[2]))) {
            this.deleteOption = type;
            this.deleteModal = this.modalService.show(template, {
                backdrop: true,
                class: 'modal-dialog-centered',
                ignoreBackdropClick: true
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    checkTestsDisabled() {
        let response: boolean = true;
        if (this.selectedTestsBar && !this.showPlan) {
            response = false;
        }
        return response;
    }

    checkPlansDisabled() {
        let response: boolean = true;
        if (this.selectedPlansBar) {
            response = false;
        }
        return response;
    }

    closeDeleteModal(type?: string) {
        this.deleteModal.hide();
        switch (type) {
            case 'tests':
                this.deleteSelectedTests();
                break;
            case 'plans':
                this.deleteSelectedPlans();
                break;
            case 'closetests':
                this.selectedTestsBar = false;
                this.markedTests = false;
                this.allTestsChecked = false;
                this.loadTestCases();
                break;
            case 'closeplans':
                this.selectedPlansBar = false;
                this.markedPlans = false;
                this.allPlansChecked = false;
                this.loadTestPlans();
                break;
        }
    }

    /**
     * service call to delete selected test cases
     */
    deleteSelectedTests(): void {
        // tslint:disable-next-line: triple-equals
        if (this.testsFilter == undefined) {
            this.testCases = this.testCases.filter((test: any) => (test.selected)).map((test: any) => test);
            // tslint:disable-next-line: triple-equals
        } else if (this.testsFilter == true) {
            this.testCases = this.testCases
                // tslint:disable-next-line: triple-equals
                .filter((test: any) => (test.selected == true && test.published == true))
                .map((test: any) => test);
        } else {
            this.testCases = this.testCases
                // tslint:disable-next-line: triple-equals
                .filter((test: any) => (test.selected == true && test.published == false))
                .map((test: any) => test);
        }

        const toDelete = this.testCases
            // tslint:disable-next-line: triple-equals
            .filter((test: any) => (this.testsQuery == '') ? (test.selected == true) : test.selected == true && test.filtered == true)
            .map((test: any) => test.id);
        if (toDelete.length > 1) {
            this.testCaseService.deleteMultipleTests(toDelete).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error trying to delete tests: ' + response.response.message, 'Error');
                    this.testCases = this.testCasesBk;
                } else {
                    response.response.deleteResult.forEach((result: any) => {
                        if (result.success) {
                            this.toastr.success(result.message, 'Success');
                        } else {
                            this.toastr.warning(result.message, 'Warning');
                        }
                    });
                    this.testsQuery = '';
                }
                this.loadTestCases();
                this.loadTestPlans();
            });
        } else {
            this.testCaseService.deleteTestCase(toDelete[0]).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error(response.response.message, 'Error');
                    this.testCases = this.testCasesBk;
                } else {
                    this.toastr.success('Successfully deleted test case', 'Success');
                    this.loadTestCases();
                    this.loadTestPlans();
                    this.testsQuery = '';
                }
            });
        }
        this.markedTests = false;
        this.selectedTestsBar = false;
        this.allTestsChecked = false;
    }

    /**
     * service call to delete selected test plans
     */
    deleteSelectedPlans(): void {
        // tslint:disable-next-line: max-line-length triple-equals
        const toDelete = this.testPlans.filter((plan: any) => (this.plansQuery == '') ? (plan.selected == true) : plan.selected == true && plan.filtered == true).map((plan: any) => plan.id);
        if (toDelete.length > 1) {
            this.testPlansService.deleteMultiplePlans(toDelete).subscribe((response: any) => {
                // tslint:disable-next-line: triple-equals
                if (response.success == 'false') {
                    this.toastr.error(response.response.message, 'Error');
                }
                // tslint:disable-next-line: triple-equals
                if (response.success == 'partial') {
                    response.response.deletedTestPlans.forEach((deleted: any) => {
                        this.toastr.success('Successfully deleted: ' + deleted, 'Success');
                    });
                    response.response.message.forEach((message: any) => {
                        this.toastr.error(message, 'Error');
                    });
                    this.resetPlansView();
                }
                // tslint:disable-next-line: triple-equals
                if (response.success == 'true') {
                    response.response.deletedTestPlans.forEach((deleted: any) => {
                        this.toastr.success('Successfully deleted: ' + deleted, 'Success');
                        this.loadTestCases();
                        this.loadTestPlans();
                        this.resetPlansView();
                    });
                    this.plansQuery = '';
                }
            });
        } else {
            this.testPlansService.deleteTestPlan(toDelete[0]).subscribe((response: any) => {
                if (!response.success) {
                    const message = response.response.message;
                    if (message.toString().toLowerCase().includes('user doesn\'t have permissions')) {
                        this.toastr.warning(message, 'Warning');
                    } else {
                        this.toastr.error(response.response.message, 'Error');
                    }
                } else {
                    this.plansQuery = '';
                    this.toastr.success('Successfully deleted test plan', 'Success');
                }
                this.loadTestCases();
                this.loadTestPlans();
                this.resetPlansView();
            });
        }
    }

    resetPlansView() {
        this.markedPlans = false;
        this.selectedPlansBar = false;
        this.allPlansChecked = false;
    }

    checkIfAllPlansSelected() {
        this.updateSelectedPlansCounter();
        this.updateFilteredPlansCounter();
        if (this.selectedPlansQty === this.filteredPlansQty && this.selectedPlansQty > 0) {
            this.allPlansChecked = true;
        } else {
            this.allPlansChecked = false;
        }
        // tslint:disable-next-line: triple-equals
        this.allPlansChecked = this.testPlans.every((item: any) => item.selected == true);
        if (this.selectedPlansQty > 0) {
            this.selectedPlansBar = true;
        } else {
            this.selectedPlansBar = false;
        }
    }

    updateSelectedPlansCounter(): void {
        // tslint:disable-next-line: triple-equals
        this.selectedPlansQty = this.testPlans.filter((item: any) => item.selected == true).length;
    }

    updateFilteredPlansCounter(): void {
        // tslint:disable-next-line: triple-equals
        this.filteredPlansQty = this.testPlans.filter((item: any) => item.filtered == true).length;
    }

    selectAllPlans() {
        this.selectedPlansBar = this.allPlansChecked;
        for (var i = 0; i < this.testPlans.length; i++) {
            this.testPlans[i].selected = this.allPlansChecked;
            if (this.allPlansChecked) {
                this.selectedPlansQty++;
            } else {
                this.selectedPlansQty--;
            }
        }
    }

    selectAllTests() {

        if (!this.addToExistingPlan) {
            this.selectedTestsBar = this.allTestsChecked;
        }

        this.testCases.forEach((test: any) => {
            test.selected = this.allTestsChecked;
            if (test.filtered) {
                test.selected = this.allTestsChecked;
            }
        });

        if (this.showPlan) {

            const newTestsSelected: any = [];
            const selectedTestCases: any = this.testCases.filter((element: any) => (this.testsQuery == '') ? (element.selected && element.published) : (element.selected && element.published && element.filtered))

            selectedTestCases.forEach((element: any) => {
                // check point for selected & published test cases
                if (element.selected && element.published) {
                    if (!this.isTestCaseExistInCurrentTestPlan(element)) {
                        newTestsSelected.push(element);
                    }
                }
            });
            this.testPlansService.addTestsToPlan(this.currentTestPlan.id, newTestsSelected).subscribe((response: any) => {
                if (!response.success) {
                    const message = response.response.message;
                    if (message.toString().toLowerCase().includes('user doesn\'t have permissions')) {
                        this.toastr.warning(message, 'Warning');
                    } else {
                        this.toastr.error('Error trying to update Plan: ' + response.response.message, 'Error');
                    }
                } else {
                    this.toastr.success('TestPlan updated successfully', 'Success');
                }
                this.testPlansService.setTestPlan(this.currentTestPlan);
                this.testViewService.modifiedPlan.emit();
            });

            // this.testCases.forEach(element => {
            //     if (element.selected) {
            //         if (!this.isTestCaseExistInCurrentTestPlan(element)) {
            //             this.addTest(element);
            //         }
            //     }
            // });


        }
        this.updateFilteredTestsCounter();
        this.updateSelectedTestsCounter();
    }

    isTestCaseExistInCurrentTestPlan(element: any): boolean {
        const testCaseDetails = this.currentTestPlan.testsList.find(e => {
            // tslint:disable-next-line: triple-equals
            return e.id == element.id;
        });
        return testCaseDetails ? true : false;
    }

    checkIfAllTestsSelected() {
        this.updateSelectedTestsCounter();
        this.updateFilteredTestsCounter();
        if (this.selectedTestsQty === this.filteredTestsQty && this.selectedTestsQty > 0) {
            this.allTestsChecked = true;
        } else {
            this.allTestsChecked = false;
        }
        // tslint:disable-next-line: triple-equals
        this.allTestsChecked = this.testCases.every((item: any) => item.selected == true);

        if (this.selectedTestsQty > 0) {
            this.selectedTestsBar = true;
        } else {
            this.selectedTestsBar = false;
        }
    }

    updateSelectedTestsCounter() {
        this.selectedTestsQty = 0;
        this.testCases.forEach((test: any) => {
            if (test.selected) {
                this.selectedTestsQty++;
            }
        });
    }

    updateFilteredTestsCounter() {
        this.filteredTestsQty = 0;
        this.testCases.forEach((test: any) => {
            if (test.filtered) {
                this.filteredTestsQty++;
            }
        });
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
        } else {
            copyArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
        this.loadTestCases();
    }

    changeTestsFilter(filter: any) {
        switch (filter) {
            case 'published':
                this.testsFilter = true;
                break;
            case 'local':
                this.testsFilter = false;
                break;
            default:
                this.testsFilter = undefined;
                break;
        }
    }

    changePlansFilter(filter: string) {
        this.plansFilter = filter;
    }

    toggleVisibility(value: string) {
        switch (value) {
            case 'test': {
                this.markedTests = true;
                for (let test of this.testCases) {
                    if (!test.selected) {
                        this.markedTests = false;
                        break;
                    }
                }
                break;
            }
            case 'plan': {
                this.markedPlans = true;
                for (let plan of this.testPlans) {
                    if (!plan.selected) {
                        this.markedPlans = false;
                        break;
                    }
                }
                break;
            }
        }
    }

    testPlanReference(item: any, event: any) {
        if (event.target.checked && item.selected) {
            this.addTest(item);
        } else {
            this.removeTest(item);
        }
    }

    addTest(test: any) {
        if (Utility.userEnabled(Role[2])) {
            this.testPlansService.addTestToPlan(this.currentTestPlan.id, test).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error(response.response.message, 'Error');
                } else {
                    this.toastr.success('Test case added successfully', 'Success');
                }
                this.testViewService.modifiedPlan.emit();
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    removeTest(test: any) {
        this.testPlansService.removeTestFromPlan(this.currentTestPlan.id, test.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to remove test case from test plan: ' + response.response.message, 'Error');
            } else {
                this.toastr.success('Test case deleted successfully', 'Success');
            }
            this.testViewService.modifiedPlan.emit();
        });
        this.loadTestCases();
    }

    configureBeforeAdding() {
        this.selectedPlan = '---Select---';
        this.auxiliarTests = JSON.parse(JSON.stringify(this.testCases));
        this.originallySelected = JSON.parse(JSON.stringify(this.auxiliarTests.filter(testCase => testCase.selected === true)));
    }

    addToExistingPlan(template: TemplateRef<any>) {

        this.configureBeforeAdding();
        this.modalRef = this.modalService.show(template, this.modalConfig);
    }

    changedPlan(planId: any) {
        // tslint:disable-next-line: triple-equals
        if (planId != 'newPlan') {
            // tslint:disable-next-line: triple-equals
            if (planId != '---Select---') {
                this.planSubscription = this.testPlansService.getTestPlanById(planId).subscribe((response: any) => {
                    if (!response.success) {
                        this.toastr.error('Couldn\'t retrieve information for selected plan: ' + response.response.message, 'Error');
                    } else {
                        this.selectedPlanObject = response.response.testPlan;
                        this.selectMatchedTests();
                    }
                });
            } else {
                this.toastr.warning('Please select a valid Plan', 'Warning');
            }
        } else {
            this.enablePlanCreation();
        }
    }

    selectMatchedTests() {
        this.checkTestsByValue(false);
        this.selectOriginalCases();
        this.selectCurrentPlanCases();
        this.planUpdater = true;
    }

    selectOriginalCases() {
        this.originallySelected.forEach((selectedTest: any) => {
            this.auxiliarTests.forEach((existingTest: any) => {
                if (existingTest.id === selectedTest.id) {
                    existingTest.selected = true;
                }
            });
        });
    }

    selectCurrentPlanCases() {
        this.selectedPlanObject.testsList.forEach((selectedTest: any) => {
            this.auxiliarTests.forEach((existingTest: any) => {
                if (existingTest.id === selectedTest.id) {
                    existingTest.selected = true;
                }
            });
        });
    }
    /**
     * reset view
     * @param actionItem: string (optional) 
     */
    resetView(actionItem?: string) {
        this.selectedPlan = '---Select---';
        this.selectedPlanObject = {};
        if (this.modalRef) {
            this.modalRef.hide();
        }
        if (actionItem !== 'export') {
            this.loadTestCases();
            this.loadTestPlans();
        }
        this.selectedTestsBar = false;
        this.selectedPlansBar = false;
        this.markedTests = false;
        this.markedPlans = false;
        this.newTestcase = [];
        this.filteredSearchData = [];
        this.downloadFileName = '';
        this.importFileName = '';
        this.fileData = '';
    }

    updateTestPlan() {
        // tslint:disable-next-line: max-line-length triple-equals
        if (this.testsFilter == undefined) {
            this.testCases = this.testCases.filter((test: any) => (test.selected)).map((test: any) => test);
            // tslint:disable-next-line: max-line-length triple-equals
        } else if (this.testsFilter == true) {
            this.testCases = this.testCases
                // tslint:disable-next-line: triple-equals
                .filter((test: any) => (test.selected == true && test.published == true))
                .map((test: any) => test);
        } else {
            this.testCases = this.testCases
                // tslint:disable-next-line: triple-equals
                .filter((test: any) => (test.selected == true && test.published == false))
                .map((test: any) => test);
        }
        if (this.markedTests) {
            // tslint:disable-next-line: triple-equals
            if (this.testsQuery != '') {
                this.newTestcase = this.filteredSearchData.filter((e: any) => e.selected == true).concat(this.newTestcase);
            } else {
                this.newTestcase = this.testCases
                    // tslint:disable-next-line: max-line-length triple-equals
                    .filter((test: any) => (this.testsQuery == '') ? (test.selected == true) : test.selected == true && test.filtered == true);
            }
        }
        const auxiliarTestsSelected: any = [];
        this.newTestcase.forEach((element: any, index: number) => {
            // if (auxTest.selected) {
            //     auxiliarTestsSelected.push(auxTest);
            // }
            element.listIndex = index;
            auxiliarTestsSelected.push(element);
        });
        this.selectedPlanObject.testsList = auxiliarTestsSelected;
        this.testPlansService.addTestsToPlan(this.selectedPlan, auxiliarTestsSelected).subscribe((response: any) => {
            if (!response.success) {
                const message = response.response.message;
                if (message.toString().toLowerCase().includes('user doesn\'t have permissions')) {
                    this.toastr.warning(message, 'Warning');
                } else {
                    this.toastr.error('Error trying to update Plan: ' + response.response.message, 'Error');
                }
            } else {
                this.toastr.success('TestPlan updated successfully', 'Success');
            }
            this.testPlansService.refresh.emit();
            this.resetView();
        });
    }

    // enablePlanCreation() {

    //     if (this.modalRef) {
    //         this.modalRef.hide();
    //     }
    //     let selectedTests = this.auxiliarTests.filter(test => test.selected === true);
    //     this.testCases = this.auxiliarTests;
    // this.testCases = selectedTests;
    // this.testPlansService.createNewPlan.emit(selectedTests);
    //     this.createNewPlan(selectedTests);
    // }
    enablePlanCreation() {
        if (this.modalRef) {
            this.modalRef.hide();
        }
        if (this.testsFilter == undefined) {
            this.testCases = this.testCases.filter((test: any) => (test.selected)).map((test: any) => test);
        } else if (this.testsFilter == true) {
            this.testCases = this.testCases
                // tslint:disable-next-line: triple-equals
                .filter((test: any) => (test.selected == true && test.published == true))
                .map((test: any) => test);
        } else {
            this.testCases = this.testCases
                // tslint:disable-next-line: triple-equals
                .filter((test: any) => (test.selected == true && test.published == false))
                .map((test: any) => test);
        }
        const selectedTests = [];
        if (this.markedTests) {
            if (this.testsQuery != '') {
                this.newTestcase = this.filteredSearchData.filter((e: any) => e.selected == true).concat(this.newTestcase);
            } else {
                this.newTestcase = this.testCases
                    // tslint:disable-next-line: max-line-length triple-equals
                    .filter((test: any) => (this.testsQuery == '') ? (test.selected == true) : test.selected == true && test.filtered == true);
            }
        } else {
            // sort the selected test cases by listIndex
            this.newTestcase = Utility.sortListInAscendingOrder(this.newTestcase, 'listIndex', true);
        }
        this.newTestcase.forEach((element: any, index: number) => {
            element.listIndex = index;
            selectedTests.push(element);
        });
        this.testCases = this.auxiliarTests;
        this.newTestcase = [];
        // this.testPlansService.createNewPlan.emit(selectedTests);
        this.createNewPlan(selectedTests);
    }
    checkTestsByValue(value: boolean) {
        this.auxiliarTests.forEach((test: any) => {
            test.selected = value;
        });
    }

    editTestCase(test: any) {
        if (Utility.userEnabled(Role[2])) {
            this.testCaseService.setTestCase({ ...test });
            let object: any;
            object = EditTestComponent;
            this.modalRef = this.modalService.show(object, this.modalConfig);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    showTestCase(test: any) {
        this.testCaseService.setTestCase(test);
        let object: any;
        object = ShowTestComponent;
        this.modalRef = this.modalService.show(object, this.modalConfig);
    }

    editTestPlan(testPlan: any) {
        if (Utility.userEnabled(Role[2])) {
            this.testPlansService.setTestPlan({ ...testPlan });
            this.modalRef = this.modalService.show(EditPlanComponent, this.modalConfig);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    isDropListDisable() {
        if ((this.newPlan || this.showPlan) && Utility.userEnabled(Role[2])) {
            return false;
        }
        return true;
    }

    userEnabled(role: string) {
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        if (currentPermissions.includes(role) || currentPermissions.includes(Role[1])) {
            return true;
        }
        return false;
    }

    closeOldPop(popover: any, key: string) {
        if (key.toLowerCase() === 'testcase') {
            if (this.testCasePopover && this.testCasePopover !== popover) {
                this.testCasePopover.hide();
            }
            this.testCasePopover = popover;
        }
        if (key.toLowerCase() === 'testplan') {
            if (this.testPlanPopover && this.testPlanPopover !== popover) {
                this.testPlanPopover.hide();
            }
            this.testPlanPopover = popover;

        }
    }

    openCopyModal(testPlan: any, template: TemplateRef<any>) {
        this.testPlansService.getTestPlanById(testPlan.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to acquire test plan: ' + response.response.message, 'Error');
            } else {
                this.planToCopy = response.response.testPlan;
                this.planToCopy.testsList = response.response.testPlan.testsList;
                this.planToCopy.name = '';
                this.planToCopy.description = '';
                this.planToCopy.id = '';
                this.modalRef = this.modalService.show(template, this.modalConfig);
            }
        });
    }
    /**
     * process the selected files to import
     * @param files:any
     * @param template?: TemplateRef<any>
     */
    processFile(files: any, template?: TemplateRef<any>) {
        this.testCaseService.importTestCases(files).subscribe((response: any) => {
            if (response.response.testCasesCreated != null) {
                this.importTestCasesObj.created = response.response.testCasesCreated;
            }
            // check for overWriteTests list and open popup
            // tslint:disable-next-line: triple-equals
            if (response.response.overWriteTests && response.response.overWriteTests.length > 0) {
                this.overwriteTestList = response.response.overWriteTests;
                this.overwriteTestList.forEach((element: any) => {
                    element.selected = true;
                });
                this.openOverrideImportModal(template);
            }
            // check for message array
            if (response.response.message && response.response.message.length > 0) {
                // tslint:disable-next-line: triple-equals
                this.messages = response.response.message.filter(E => E != 'needToOverwrite');
            }
            if (!response.success && !response.response.overWriteTests) {
                const messages = response.response.message;
                if (messages.length > 0) {
                    messages.forEach((msg: string) => {
                        this.toastr.error('Error trying to import file: ' + msg, 'Error');
                    });
                }
            } else if ((response.success && !response.response.overWriteTests)) {
                const created = (this.importTestCasesObj.created) ? 'Created : ' + this.importTestCasesObj.created : '';
                this.toastr.success('File is valid, importing tests.\n ' + created, 'Success');
            }
            this.resetView();
            this.deleteFile();
        });
    }
    /**
     * import popup model
     * @param files 
     * @param template 
     */
    importModelPopUP(template: TemplateRef<any>) {
        this.importFileName = '';
        this.modalRef = this.modalService.show(template, this.modalConfig);
    }

    /**
     * process the selected files to import
     * @param files:any
     * @param template?: TemplateRef<any>
     */
    processTestPlanFile(files: any, template?: TemplateRef<any>) {
        this.testPlansService.importTestPlans(files, this.importFileName).subscribe((response: any) => {
            this.modalRef.hide();
            if (response.response.testCasesCreated != null) {
                this.importTestCasesObj.created = response.response.testCasesCreated;
            }
            if (response.response.testPlansCreated != null) {
                this.importTestCasesObj.testPlanCreated = response.response.testPlansCreated;
            }
            // check for overWriteTests list and open popup
            // tslint:disable-next-line: triple-equals
            if (response.response.overWriteTests && response.response.overWriteTests.length > 0) {
                this.overwriteTestList = response.response.overWriteTests;
                this.overwriteTestList.forEach((element: any) => {
                    element.selected = true;
                });
                this.openOverrideImportModal(template);
            }
            // check for message array
            if (response.response.message && response.response.message.length > 0) {
                // tslint:disable-next-line: triple-equals
                this.messages = response.response.message.filter(E => E != 'needToOverwrite');
            }
            if (!response.success && !response.response.overWriteTests) {
                const messages = response.response.message;
                if (messages.length > 0) {
                    messages.forEach((msg: string) => {
                        this.toastr.error('Error trying to import file: ' + msg, 'Error');
                    });
                }
            } else if ((response.success && !response.response.overWriteTests)) {
                const created = (this.importTestCasesObj.created) ? 'Created Test Case(s): ' + this.importTestCasesObj.created : '';
                const createdPlans = (this.importTestCasesObj.testPlanCreated) ? 'Created Test Plan(s): ' + this.importTestCasesObj.testPlanCreated : '';
                this.toastr.success('File is valid, importing tests.\n ' + created + '\n ' + createdPlans, 'Success');
            }
            this.deleteFile();
            this.resetView();

        });
    }
    /**
     * open override acknowledgement modal
     * @param template : TemplateRef<any>
     */
    openOverrideImportModal(template): void {
        this.modalRef = this.modalService.show(template, this.modalConfig);
    }

    deleteFile() {
        this.fileInput.nativeElement.value = '';
        this.fileData = '';
    }

    openFileBrowser(event?: any) {
        const element: HTMLElement = document.getElementById('fileInput');
        element.click();
    }

    openFileBrowserTestplan(event?: any) {
        // const element: HTMLElement = document.getElementById('fileInputTestPlan');
        // element.click();
        this.fileData = event.target.files;
    }
    /**
     * sleep for msec
     * @param msec: number 
     */
    async sleep(msec): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, msec));
    }
    /**
     * export test plans
     */
    async exportPlans() {
        this.disabledExportButton = true;
        let currentDateString: string = this.generateFileName();
        const toExport: TestPlan[] = this.testPlans.filter((plan: any) => (this.plansQuery == '') ? (plan.selected == true) : plan.selected == true && plan.filtered == true).map((plan: any) => plan);
        // reset test plan check boxes
        this.allPlansChecked = false;
        this.markedPlans = false;
        this.testPlans.forEach(e => e.selected = false);
        this.resetView('export');
        for (let entry of toExport) {
            await this.sleep(500).then(() => {
                let fileName: string = '';
                fileName = entry.name + currentDateString + ".zip";
                this.testPlansService.exportTestPlans(entry.id, fileName).subscribe((response: any) => {
                    const type = { type: 'application/octet-stream' };
                    this.downloadPlanFile(response, fileName, type);
                    this.disabledExportButton = false;
                }, () => { this.disabledExportButton = false; });
            });
        }
    }

    exportTests(template: TemplateRef<any>) {
        this.disabledExportTestButton = true;
        let fileName: string = '';
        this.selectedForExport = this.testCases
            // tslint:disable-next-line: triple-equals
            .filter((test: any) => (this.testsQuery == '') ? (test.selected == true) : test.selected == true && test.filtered == true)
            .map((test: any) => test.id);
        if (this.selectedForExport.length === 1) {
            const testCaseId: string = this.selectedForExport[0];
            const testCaseName: string = this.testCases.filter((e: any) => e.id === testCaseId)[0].name;
            fileName = (testCaseName) ? testCaseName : 'TAP';
            fileName += this.generateFileName() + '.tcs';
            this.testCaseService.exportTestCases(this.selectedForExport, fileName).subscribe((response: any) => {
                this.downloadTest(response, fileName, { type: 'application/octet-stream' });
                this.resetView('export');
                this.testCases.forEach(e => e.selected = false);
                this.disabledExportTestButton = false;
            }, () => { this.disabledExportTestButton = false; });
        } else if (this.selectedForExport.length > 1) {
            this.openExportModal(template);
            this.disabledExportTestButton = false;
        }
    }
    /**
     * open Download File name modal
     * @param template: TemplateRef<any>
     */
    openExportModal(template: TemplateRef<any>) {
        this.downloadFileName = 'TAP' + this.generateFileName();
        this.modalRef = this.modalService.show(template, this.modalConfig);
    }
    /**
     * download export testcases in zip format
     */
    downloadExportTestCases(): void {
        this.disabledExportButton = true;
        this.testCaseService.exportTestCases(this.selectedForExport, this.downloadFileName).subscribe((response: any) => {
            const fileName: string = this.downloadFileName + '.zip';
            this.downloadTest(response, fileName, { type: 'application/octet-stream' });
            this.resetView();
            this.disabledExportButton = false;
        }, () => { this.disabledExportButton = false; });
    }
    /**
     * generate download file name
     */
    generateFileName(): string {
        const month = (new Date().getMonth() + 1) <= 9 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1);
        const date = new Date().getDate() <= 9 ? '0' + new Date().getDate() : new Date().getDate();
        return '-' + month.toString() + date.toString() + new Date().getFullYear().toString();
    }

    private downloadTest(data: any, filename: string, type: any) {
        var blob = new Blob([data], type);
        var url = window.URL.createObjectURL(blob);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            let a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
    }
    /**
     * export for testPlans
     */
    /**
 * set the date object details
 */

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

    saveCopiedPlan() {
        this.testPlansService.createTestPlan(this.planToCopy).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to copy Test Plan', 'Error');
            } else {
                this.toastr.success('Test Plan successfully copied', 'Success');
                if (this.modalRef) {
                    this.modalRef.hide();
                }
                this.loadTestPlans();
            }
        });
    }

    /**
     * sort test cases based on the condition
     * @param field: string
     */
    sortTestCases(field: string) {
        switch (field) {
            case 'newest':
                this.testCases.sort((e1: TestCase, e2: TestCase) => {
                    return e1.lastModifiedDate < e2.lastModifiedDate ? 1 : (e1.lastModifiedDate > e2.lastModifiedDate ? -1 : 0);
                });
                this.testCases = [...this.testCases];
                break;
            case 'oldest':
                this.testCases.sort((e1: TestCase, e2: TestCase) => {
                    return e1.lastModifiedDate > e2.lastModifiedDate ? 1 : (e1.lastModifiedDate < e2.lastModifiedDate ? -1 : 0);
                });
                this.testCases = [...this.testCases];
                break;
            case 'a-z':
                this.testCases.sort((e1: TestCase, e2: TestCase) => {
                    return e1.name.toLowerCase().trim() > e2.name.toLowerCase().trim() ? 1 :
                        (e1.name.toLowerCase().trim() < e2.name.toLowerCase().trim() ? -1 : 0);
                });
                this.testCases = [...this.testCases];
                break;
            case 'z-a':
                this.testCases.sort((e1: TestCase, e2: TestCase) => {
                    return e1.name.toLowerCase().trim() < e2.name.toLowerCase().trim() ? 1 :
                        (e1.name.toLowerCase().trim() > e2.name.toLowerCase().trim() ? -1 : 0);
                });
                this.testCases = [...this.testCases];
                break;
            default:
                break;
        }
    }

    /**
     * sort test plans based on the condition
     * @param field: string
     */
    sortTestPlans(field: string) {
        switch (field) {
            case 'newest':
                this.testPlans.sort((e1: TestPlan, e2: TestPlan) => {
                    return e1.lastModifiedDate < e2.lastModifiedDate ? 1 : (e1.lastModifiedDate > e2.lastModifiedDate ? -1 : 0);
                });
                this.testPlans = [...this.testPlans];
                break;
            case 'oldest':
                this.testPlans.sort((e1: TestPlan, e2: TestPlan) => {
                    return e1.lastModifiedDate > e2.lastModifiedDate ? 1 : (e1.lastModifiedDate < e2.lastModifiedDate ? -1 : 0);
                });
                this.testPlans = [...this.testPlans];
                break;
            case 'a-z':
                this.testPlans.sort((e1: TestPlan, e2: TestPlan) => {
                    return e1.name.toLowerCase().trim() > e2.name.toLowerCase().trim() ? 1 :
                        (e1.name.toLowerCase().trim() < e2.name.toLowerCase().trim() ? -1 : 0);
                });
                this.testPlans = [...this.testPlans];
                break;
            case 'z-a':
                this.testPlans.sort((e1: TestPlan, e2: TestPlan) => {
                    return e1.name.toLowerCase().trim() < e2.name.toLowerCase().trim() ? 1 :
                        (e1.name.toLowerCase().trim() > e2.name.toLowerCase().trim() ? -1 : 0);
                });
                this.testPlans = [...this.testPlans];
                break;
            default:
                break;
        }
    }

    checkIfTestSelected(event: any, index: number): void {
        // tslint:disable-next-line: triple-equals
        if (this.testsFilter == true) {
            // tslint:disable-next-line: triple-equals
            this.testCases = this.testCases.filter((test: any) => (test.published == true));
            // tslint:disable-next-line: triple-equals
        } else if (this.testsFilter == false) {
            // tslint:disable-next-line: triple-equals
            this.testCases = this.testCases.filter((test: any) => (test.published == false));
        }
        let item = '';
        let filteredTestCases = [];
        // tslint:disable-next-line: triple-equals
        if (this.testsQuery == '') {
            item = this.testCases[index].name;
            // tslint:disable-next-line: triple-equals
        } else if (this.testsQuery != '') {
            filteredTestCases = this.filteredSearchData;
            item = filteredTestCases[index].name;
        }
        if (event.target.checked) {
            const testCaseNames = this.newTestcase.map(e => e.name);
            if (!testCaseNames.includes(item)) {
                // tslint:disable-next-line: triple-equals
                if (this.testsQuery == '') {
                    this.newTestcase.push(this.testCases[index]);
                    // tslint:disable-next-line: triple-equals
                } else if (this.testsQuery != '') {
                    // tslint:disable-next-line: triple-equals
                    const testCaseIndex = filteredTestCases.findIndex(e => e.name == item);
                    // tslint:disable-next-line: triple-equals
                    if (testCaseIndex != -1) {
                        this.newTestcase.push(filteredTestCases[testCaseIndex]);
                    }
                }
            }
        } else {
            // tslint:disable-next-line: triple-equals
            const indexValue = this.newTestcase.findIndex(e => e.name == item);
            // tslint:disable-next-line: triple-equals
            if (indexValue != -1) {
                this.newTestcase.splice(indexValue, 1);
            }
        }
    }

    /**
     * add the test cases to existing test plan
     */
    addTestCasesToExistingTestPlan(event: any, index: number): void {
        const item = this.testCases[index].name;
        if (event.target.checked) {
            const testCaseNames = this.newTestcase.map((e: any) => e.name);
            if (!testCaseNames.includes(item)) {
                this.newTestcase.push(this.testCases[index]);
            }
        } else {
            const indexValue = this.newTestcase.findIndex((e: any) => e.name == item);
            if (indexValue != -1) {
                this.newTestcase.splice(indexValue, 1);
            }
        }
    }
    /**
     * overwrite import changes service call
     */
    overwriteImportChanges(input: string): void {
        if (input == 'denied') {
            this.messages.forEach((message: string) => {
                this.toastr.error('Error trying to import file: ' + message, 'Error');
            });
            const created = (this.importTestCasesObj.created) ? 'Created Test Case(s): ' + this.importTestCasesObj.created : '';
            const createdPlans = (this.importTestCasesObj.testPlanCreated) ? 'Created Test Plan(s): ' + this.importTestCasesObj.testPlanCreated : '';
            this.toastr.success('File is valid, importing tests.\n ' + created + '\n ' + createdPlans, 'Success');
            this.resetView();
            this.deleteFile();
        } else if (input === 'accepted') {
            // tslint:disable-next-line: triple-equals
            const selectedItems = this.overwriteTestList.filter(e => e.selected == true);
            this.testCaseService.overwriteTestCases(selectedItems).subscribe((response: any) => {
                if (response.response.testCasesOverwritten != null) {
                    this.importTestCasesObj.overwritten = response.response.testCasesOverwritten;
                }
                if (!response.success && response.response.message && response.response.message.length > 0) {
                    // tslint:disable-next-line: triple-equals
                    this.messages = this.messages.concat(response.response.message);
                } else {
                    const created = (this.importTestCasesObj.created) ? 'Created Test Case(s) : ' + this.importTestCasesObj.created : '';
                    const overwritten = (this.importTestCasesObj.overwritten) ? 'Overwritten Test Case(s) : ' + this.importTestCasesObj.overwritten : '';
                    const createdPlans = (this.importTestCasesObj.testPlanCreated) ? 'Created Test Plan(s): ' + this.importTestCasesObj.testPlanCreated : '';
                    this.toastr.success('File is valid, importing tests.\n ' + created + '\n ' + overwritten + '\n ' + createdPlans, 'Success');
                }
                this.messages.forEach((message: string) => {
                    this.toastr.error('Error trying to import file: ' + message, 'Error');
                });
                this.resetView();
                this.deleteFile();
            });
        }
    }
    /**
     * on scroll table
     */
    onScroll(key: string): void {
        if (key.toLowerCase() === 'testcase') {
            if (this.testCasePopover) {
                this.testCasePopover.hide();
            }
        }
        if (key.toLowerCase() === 'testplan') {
            if (this.testPlanPopover) {
                this.testPlanPopover.hide();
            }

        }
    }


    ngOnDestroy() {
        this.selectedForExport = [];
        this.overwriteTestList = [];
        this.messages = [];
        this.importTestCasesObj = {};
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.intervalSubscription) {
            this.intervalSubscription.unsubscribe()
        }
    }
}
