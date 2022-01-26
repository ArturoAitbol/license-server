import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NewProjectComponent } from './new-project/new-project.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { interval, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { AssociatedPhonesComponent } from './associated-phones/associated-phones.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { TestPlansService } from '../../services/test-plans.service';
import { Utility, PageNames } from '../../helpers/Utility';
import { Role } from '../../helpers/role';
import { Project } from '../../model/project';
import * as moment from 'moment';
import { DataTableService } from 'src/app/services/data-table.service';
import { Constants } from 'src/app/model/constant';
import { setMonth } from 'ngx-bootstrap/chronos/utils/date-setters';
@Component({
    selector: 'project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit, AfterViewChecked, OnDestroy {
    @ViewChild('projectsGrid', { static: true }) projectsGrid: DataTableComponent;
    private currentPop: any;
    disabledButton: boolean = false;
    projects: any = [];
    runType: string = 'once';
    runsQty: string = '1';
    modalRef: BsModalRef;
    selectedProject: any;
    searchQuery: string;
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-lg', ignoreBackdropClick: true };
    projectColumns: any = [];
    variableColumns: any = [];
    testCasesColumns: any = [];
    private totalPortions: number;
    allProjectsChecked: any;
    markedProjects: boolean = false;
    selectedProjectsBar: boolean = false;
    selectedProjectsQty: number = 0;
    nonExecutionStatus: any = ['idle', 'completed', 'aborted', 'interrupted'];
    subscription: Subscription;
    scheduleRefresher: Subscription;
    projectsInExecution: any = [];
    loadingProjects: boolean = true;
    hasDUTTestCase: boolean = true;
    scheduleCounter: number;
    filteredProjectsQty: number = 0;

    variablesList: any = [];
    testCasesList: any = [];

    fromDate: Date;
    toDate: Date;
    testRunInstances: any = [];
    bsConfig: any = { showWeekNumbers: false, dateInputFormat: 'MM/DD/YYYY', containerClass: 'theme-blue' };
    maxStartDate: Date;
    maxEndDate: Date;
    minEndDate: Date;
    lastestRunProject: any;
    tableHeight: string;
    scrollEventSubscription: Subscription;
    isRequestCompleted: boolean;
    disabledDownloadButton: boolean = false;
    disabledReportButton: boolean = false;
    inProgressToastId: any;
    inProgressReportToastId: any;
    counter: number = 0;
    logsCounter: number = 0;
    selectedProjects: any = [];
    selectedlogs: any = [];
    runRangeReport: number;
    reportByDate: string;
    projectRunRangeReports: number;
    fromDateReport: Date;
    toDateReport: Date;
    maxReportStartDate: Date;
    maxReportEndDate: Date;
    minReportStartDate:Date;
    minReportEndDate: Date;
    selectedReportProjects: any = [];
    isDisabledReportButton:boolean = false;
    constructor(private modalService: BsModalService,
        private projectService: ProjectViewService,
        private testPlanService: TestPlansService,
        private router: Router,
        private toastr: ToastrService,
        private cdRef: ChangeDetectorRef,
        private dataTableService: DataTableService,
        private route: ActivatedRoute) {
        this.tableHeight = Utility.getDataTableHeightByWidth(PageNames.Projects);
    }

    ngAfterViewChecked() {
        this.checkIfAllProjectsSelected();
        this.checkChanges();
    }

    checkChanges() {
        this.cdRef.detectChanges();
    }

    /**
     * load project
     */
    loadProjects(): any {
        this.scheduleCounter = 0;
        this.isRequestCompleted = false;
        // this.loadingProjects = true;
        this.projectService.getProjects().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to load projects: ' + response.response.message, 'Error');
            } else {
                this.projects = response.response.projects;
                this.projects = [...this.projects.sort((e1: any, e2: any) => {
                    // tslint:disable-next-line:max-line-length
                    return e2.status === 'RUNNING' ? 1 : (e1.status === 'RUNNING' ? -1 : (e1.lastModified < e2.lastModified ? 1 : (e1.lastModified > e2.lastModified ? -1 : 0)));
                })];
                this.allProjectsChecked = this.markedProjects = false;
                this.projects.forEach(project => {
                    project.selected = false;
                    project.testPlanName = project.testPlanDto.name;
                    project.totalPools = (project.totalPhoneList + project.totalCallServerList + project.totalDeviceUserList);
                    if (project.scheduled) {
                        this.scheduleCounter++;
                    }
                    // enable last run of the latest run project
                    if (this.lastestRunProject && this.lastestRunProject.id == project.id) {
                        this.viewLastRun(project);
                    } else {
                        project.lastRun = null;
                        project.showLast = false;
                    }
                    this.statusChecker(project);
                });
                // this.projects = Utility.sortListInDescendingOrder(this.projects, 'lastModified', true);
                // this.loadingProjects = false;
                this.isRequestCompleted = true;
            }
            // this.loadingProjects = false;
        }, () => {
            this.isRequestCompleted = true;
            // this.loadingProjects = false;
        });
    }

    /**
     * load projects by date range
     */
    loadProjectsByDateRange(): void {
        this.projectService.getProjectsByDate(this.setDateDetails()).subscribe((res: any) => {
            if (!res.success) {
                this.toastr.error('Error trying to load projects: ' + res.response.message, 'Error');
            } else {
                this.projects = res.response.projects;
                this.projects = [...this.projects.sort((e1: any, e2: any) => {
                    // tslint:disable-next-line:max-line-length
                    return e2.status === 'RUNNING' ? 1 : (e1.status === 'RUNNING' ? -1 : (e1.lastModified < e2.lastModified ? 1 : (e1.lastModified > e2.lastModified ? -1 : 0)));
                })];
                this.allProjectsChecked = this.markedProjects = false;
                this.projects.forEach(project => {
                    project.selected = false;
                    project.testPlanName = project.testPlanDto.name;
                    project.lastRun = null;
                    project.showLast = false;
                    project.totalPools = (project.totalPhoneList + project.totalCallServerList);
                    if (project.scheduled) {
                        this.scheduleCounter++;
                    }
                    this.statusChecker(project);
                });
            }
            this.loadingProjects = false;
            this.isRequestCompleted = true;
        });
    }

    statusChecker(project: any) {
        if (!this.nonExecutionStatus.includes(project.status.toLowerCase())) {
            this.projectsInExecution.push(project);
        }
    }

    scheduleProject(project: any) {
        this.projectService.setProject(project);
        this.modalRef = this.modalService.show(SchedulerComponent, {
            backdrop: true,
            class: 'modal-dialog-centered modal-md',
            ignoreBackdropClick: true
        });
    }

    /**
     * check for project status
     */
    checkStatus() {
        this.projectsInExecution.forEach((project: any) => {
            this.projectService.getProjectStatus(project.id).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error checking project ' + project.name + ' status', 'Error');
                } else {
                    project.lastRunDate = response.response.lastRunDate;
                    if (response.response.status && response.response.status.toLowerCase() !== project.status.toLowerCase()) {
                        project.status = response.response.status;
                        if (this.nonExecutionStatus.includes(project.status.toLowerCase())) {
                            this.lastestRunProject = project;
                        }
                        this.loadProjects();
                    }
                }
            });
            this.checkInstancesStatus(project);
        });
        this.projectsInExecution = this.projectsInExecution.filter((project: any) => {
            return !this.nonExecutionStatus.includes(project.status.toLowerCase());
        });
    }

    checkInstancesStatus(project: any) {
        this.projectService.getLastRun(project.id).subscribe((response: any) => {
            if (!response.success) {
                // this.toastr.info('No data available for last run: Project hasn\'t been executed yet', 'Info');
                // find the index of the project by projectId
                // tslint:disable-next-line: triple-equals
                const index = this.projectsInExecution.findIndex((element: any) => element.id == project.id);
                this.projectsInExecution.splice(index, 1);
            } else {
                project.lastRun = response.response.runInstance;
                this.projectService.updateTests.emit(project.lastRun);
                project.showLast = true;
                project.lastRun.runDetails = true;
                project.lastRunDateString = project.lastRun.startDateString;
            }
        });
    }

    refreshOnScheduled() {
        if (this.scheduleCounter > 0 && !this.modalRef && !this.checkRunDisplay()) {
            this.loadProjects();
        }
    }

    ngOnInit() {
        this.projectRunRangeReports=null;
        this.fromDate = this.toDate = undefined;
        this.maxStartDate = this.maxEndDate = new Date();
        this.maxEndDate.setHours(0, 0, 0, 0);
        this.maxStartDate.setHours(0, 0, 0, 0);
        this.fromDateReport = this.toDateReport = undefined;
        this.maxReportEndDate = this.maxReportStartDate = new Date();
        this.minReportStartDate = this.minReportEndDate = new Date();
        const convertedDate =  this.minReportStartDate.setMonth(this.minReportStartDate.getMonth()-6)
        // const settingDate =  this.minReportStartDate.toString();
        this.minReportStartDate = new Date(convertedDate);;
        this.maxReportEndDate.setHours(0, 0, 0, 0);
        this.maxReportStartDate.setHours(0, 0, 0, 0);
        this.route.paramMap.subscribe((paramMap: any) => {
            if (paramMap.params.project) {
                this.createProject();
            }
        });

        this.projectService.cancelEdit.subscribe((response: any) => {
            this.closeModal();
        });

        this.subscription = interval(5000).subscribe(val => this.checkStatus());
        this.scheduleRefresher = interval(15000).subscribe(() => {
            // check whether from date & to date is undefined
            if (this.fromDate === undefined && this.toDate === undefined) {
                this.refreshOnScheduled();
            }
        });

        this.initGridProperties();
        this.loadProjects();


        this.projectService.createdProject.subscribe((response: any) => {
            this.closeModal();
            this.loadProjects();
        });

        this.getWidthPortions();

        //listen for data table scroll event
        this.scrollEventSubscription = this.dataTableService.scrollEvent.subscribe(() => {
            if (this.currentPop) {
                this.currentPop.hide();
            }
        });
    }

    closeModal() {
        if (this.modalRef) {
            this.modalRef.hide();
        }
        this.modalRef = undefined;
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    createProject() {
        if (Utility.userEnabled(Role[2])) {
            this.modalRef = this.modalService.show(NewProjectComponent, this.modalConfig);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    getWidthPortions() {
        this.totalPortions = 0;
        this.projectColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    showProjectPhonesLists(item: any) {
        this.projectService.setProject(item);
        this.modalRef = this.modalService.show(AssociatedPhonesComponent, {
            backdrop: true,
            class: 'modal-dialog-centered modal-xl',
            ignoreBackdropClick: true
        });
    }

    /**
     * open modal
     * @param runTemplate: TemplateRef<any>
     * @param validateTemplate: TemplateRef<any>
     * @param project: Project
     * @returns: void
     */
    openRunModal(runTemplate: TemplateRef<any>, validateTemplate: TemplateRef<any>, project: Project): void {
        if (!Utility.userEnabled(Role[2])) {
            this.toastr.info('User doesn\'t have permission to run project', 'Info');
        } else {
            this.checkForValidateResources(project.id).then((res: any[]) => {
                // Show variables and their associate test cases
                // tslint:disable-next-line:triple-equals
                if (res.length > 0) {
                    project.disable = true;
                    this.modalRef = this.modalService.show(validateTemplate, {
                        ignoreBackdropClick: true,
                        class: 'modal-dialog-centered modal-lg'
                    });
                } else {
                    project.disable = false;
                    this.runType = 'once';
                    this.modalRef = this.modalService.show(runTemplate, { ignoreBackdropClick: true });
                }
            });
            // check whether the test plan has any DUT test case
            this.testPlanService.doesProjectHasDUT(project.testPlanDto.id).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error :' + response.response.message, 'Error');
                } else {
                    this.hasDUTTestCase = response.response.containsDUT;
                }
            });
            this.selectedProject = project;
        }
    }

    /**
     * validate the resources in test cases that are in the test plan
     * @param projectId: string
     */
    checkForValidateResources(projectId: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.projectService.validateResources(projectId).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error :' + response.response.message, 'Error');
                } else {
                    this.variablesList = response.response.testCaseList;
                    if (this.variablesList.length > 0) {
                        // initially shows the first item in the list
                        this.testCasesList = this.variablesList[0]['testCases'];
                        this.variablesList[0]['active'] = true;
                    }
                    resolve(response.response.testCaseList);
                }
            });
        });
    }

    /**
     * download the validate resources list
     */
    downloadValidateResourceList(): void {
        this.projectService.downloadValidateResources(this.selectedProject.id).subscribe((response: any) => {
            const filename = this.selectedProject.name + '-logs' + '.txt';
            Utility.downloadFile(response, filename);
        });
    }

    /**
     * open edit project modal
     * @param project: any
     */
    editProject(project: any): void {
        if (Utility.userEnabled(Role[2])) {
            this.projectService.setProject({ ...project });
            this.modalRef = this.modalService.show(EditProjectComponent, this.modalConfig);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
        if (this.currentPop) {
            this.currentPop.hide();
        }
    }

    /**
     * run the project service call based on selected type
     */
    runProject(): void {
        let url: string;
        url = '';
        switch (this.runType) {
            case 'once':
                url = this.selectedProject.id;
                break;
            case 'times':
                url = this.selectedProject.id + '/' + this.runsQty;
                break;
            case 'rerun':
                url = 'rerun/failed/' + this.selectedProject.id;
                break;
        }
        this.disabledButton = true;
        this.projectService.runProject(url, this.selectedProject.id).subscribe((response: any) => {
            if (!response.success) {
                if (response.response.message.includes('updateOldPhones')) {
                    // tslint:disable-next-line: max-line-length
                    let toastCustom = this.toastr.error('Error trying to run project: Phones require update .Please Click on the <strong><a routerLink="/phoneConfiguration">link</a></strong> for more details'
                        , 'Error', { enableHtml: true });
                    toastCustom.onTap.subscribe((response) => {
                        localStorage.setItem('needToUpdatePhones', 'true');
                        this.router.navigate(['/phoneConfiguration']);
                        if (this.modalRef) {
                            this.modalRef.hide();
                        }
                    })
                } else {
                    this.toastr.error(response.response.message, 'Error');
                    if (this.modalRef) {
                        this.modalRef.hide();
                    }
                }
            } else {
                this.toastr.success('Starting Project Execution', 'Success');
                if (this.modalRef) {
                    this.modalRef.hide();
                }
                this.loadProjects();
            }
            this.disabledButton = false;
        }, () => { this.disabledButton = false; });
    }

    pauseProject(project: any) {
        this.projectService.pauseProject(project.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to pause project: ' + response.response.message, 'Error');
            } else {
                this.loadProjects();
            }
        });
    }

    clearQty() {
        this.runsQty = '';
    }

    playProject(project: any) {
        this.projectService.playProject(project.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to play project: ' + response.response.message, 'Error');
            } else {
                this.loadProjects();
            }
        });
    }

    stopProject(project: any) {
        this.projectService.stopProject(project.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to stop project: ' + response.response.message, 'Error');
            } else {
                this.loadProjects();
            }
        });
    }

    hideLastRun(item: any) {
        if (item.lastRun == null) {
            this.viewLastRun(item);
        } else {
            item.showLast = !item.showLast;
        }
    }

    checkRunDisplay() {
        let count: number;
        count = 0;
        this.projects.forEach((project: any) => {
            if (project.showLast) {
                count++;
            }
        });
        if (count > 0) {
            return true;
        } else {
            return false;
        }
    }

    viewLastRun(project: any) {
        if (this.fromDate && this.toDate) {
            this.projectService.getRunInstancesByDate(this.setDateDetails(), project.id).subscribe((res: any) => {
                if (!res.success) {
                    this.toastr.info('No data available for last run: Project hasn\'t been executed yet', 'Info');
                } else {
                    project.lastRun = project.runInstances = res.response.instanceDtoList;
                    project.showLast = true;
                }
            });
        } else {
            this.projectService.getLastRun(project.id).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.info('No data available for last run: Project hasn\'t been executed yet', 'Info');
                } else {
                    project.lastRun = response.response.runInstance;
                    project.showLast = true;
                }
            });
        }
        if (this.currentPop) {
            this.currentPop.hide();
        }
    }

    initGridProperties() {
        this.projectColumns = [
            { field: '_', header: '', width: 5, suppressHide: true, suppressSort: true },
            { field: 'name', header: 'Name', width: 20, suppressHide: true },
            { field: 'testPlanName', header: 'Test Plan', width: 15, suppressHide: true },
            { field: 'totalPools', header: 'Resource Lists', width: 10, suppressHide: true, suppressSort: false },
            { field: 'lastRunDate', header: 'Last Run', width: 15, suppressHide: true },
            { field: 'scheduled', header: 'Scheduled', width: 15, suppressHide: true },
            { field: 'status', header: '', width: 11, suppressHide: true, suppressSort: true },
            { field: 'actions', header: '', width: 9, suppressHide: true, suppressSort: true }
        ];
        this.variableColumns = [
            { field: 'tagName', header: 'Variable Name', width: 50, suppressHide: true, suppressSort: true }
        ];
        this.testCasesColumns = [
            { field: 'name', header: 'Test Case Name', width: 50, suppressHide: true, suppressSort: true }
        ];

        this.setActiveStatus(false);
    }

    setCurrentList(list: any) {
        // set the active status as false
        this.setActiveStatus(false);
        this.testCasesList = list.testCases;
        // set current item active status as true
        list.active = true;
    }

    setActiveStatus(status: boolean) {
        if (this.variablesList.length) {
            this.variablesList.forEach((list: any) => {
                list.active = status;
            });
        }
    }

    viewRunHistory(projectId: any) {
        localStorage.setItem('latestHistory', JSON.stringify(projectId));
        if (this.currentPop) {
            this.currentPop.hide();
        }
        this.router.navigate(['/projects/history/' + projectId]);
    }

    getDeleteStatus() {
        let response: boolean;
        response = true;
        if (this.selectedProjectsBar) {
            response = false;
        }
        return response;
    }

    deleteProject(projectId: any) {
        this.projectService.deleteProject(projectId).subscribe((response: any) => {
            if (!response.success) {
                const message = response.response.message;
                if (message.toString().toLowerCase().includes('user doesn\'t have permissions')) {
                    this.toastr.warning(message, 'Warning');
                } else {
                    this.toastr.error('Error trying to delete project: ' + response.response.message, 'Error');
                }
            } else {
                this.toastr.success('Project deleted successfully', 'Success');
                this.loadProjects();
            }
        });
        if (this.currentPop) {
            this.currentPop.hide();
        }
    }

    /**
     * delete confirmation alert
     * @param template: any
     */
    deleteConfirmation(template: any) {
        this.modalRef = this.modalService.show(template, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
    }

    /**
     * service call to delete selected projects
     */
    deleteSelectedProjects() {
        if (Utility.userEnabled(Role[2])) {
            // tslint:disable-next-line: max-line-length triple-equals
            const toDelete = this.projects.filter((test: any) => (this.searchQuery == '') ? (test.selected == true) : test.selected == true && test.filtered == true).map((test: any) => test.id);
            if (toDelete.length > 1) {
                this.projectService.deleteMultipleProjects(toDelete).subscribe((response: any) => {
                    if (!response.success) {
                        // tslint:disable-next-line:max-line-length
                        this.toastr.error('Error trying to delete projects: \nMessage:' + response.response.message + '\nFailed to delete: ' + response.response.failedTestCases, 'Error');
                    } else {
                        this.resetParameters();
                        this.toastr.success('Projects successfully deleted', 'Success');
                        this.loadProjects();
                        this.closeModal();
                    }
                });
            } else {
                this.projectService.deleteProject(toDelete[0]).subscribe((response: any) => {
                    if (!response.success) {
                        this.toastr.error('Error trying to delete the project: ' + response.response.message, 'Error');
                    } else {
                        this.resetParameters();
                        this.toastr.success('Project successfully deleted', 'Success');
                        this.loadProjects();
                        this.closeModal();
                    }
                });
            }
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    toggleVisibility(e?: any) {
        this.markedProjects = true;
        for (let i = 0; i < this.projects.length; i++) {
            if (!this.projects[i].selected) {
                this.markedProjects = false;
                break;
            }
        }
    }

    resetParameters() {
        this.selectedProjectsBar = false;
        this.searchQuery = '';
        this.loadProjects();
    }

    resetView() {
        this.allProjectsChecked = this.markedProjects = false;
        this.projects.forEach(e => e.disable = e.selected = false);
    }

    selectAllProjects() {
        this.projects.forEach((project: any) => {
            project.selected = this.allProjectsChecked;
            if (project.filtered) {
                project.selected = this.allProjectsChecked;
            }
        });

        this.updateFilteredProjectsCounter();
        this.updateSelectedProjectsCounter();

    }

    updateFilteredProjectsCounter() {
        this.filteredProjectsQty = 0;
        this.projects.forEach((phoneList: any) => {
            if (phoneList.filtered) {
                this.filteredProjectsQty++;
            }
        });
    }

    updateSelectedProjectsCounter() {
        this.selectedProjectsQty = 0;
        this.projects.forEach((phoneList: any) => {
            if (phoneList.selected) {
                this.selectedProjectsQty++;
            }
        });
    }

    checkIfAllProjectsSelected() {

        this.updateSelectedProjectsCounter();
        this.updateFilteredProjectsCounter();

        // tslint:disable-next-line: triple-equals
        if (this.selectedProjectsQty == this.filteredProjectsQty && this.filteredProjectsQty > 0) {
            this.allProjectsChecked = true;
        } else {
            this.allProjectsChecked = false;
        }
        if (this.projects.length > 0) {
            // tslint:disable-next-line: triple-equals
            this.allProjectsChecked = this.projects.every((item: any) => item.selected == true);
        } else {
            this.allProjectsChecked = this.markedProjects = false;
        }

        if (this.selectedProjectsQty > 0) {
            this.selectedProjectsBar = true;
        } else {
            this.selectedProjectsBar = false;
        }
    }

    userEnabled(role: string) {
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        if (currentPermissions.includes(role) || currentPermissions.includes(Role[1])) {
            return true;
        }
        return false;
    }

    userDisabled(role: string) {
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        if (currentPermissions.includes(role)) {
            return true;
        }
        return false;
    }

    isLoading(status: any) {
        if (status !== 'running' && status !== 'completed' && status !== 'aborted'
            && status !== 'idle' && status !== 'paused' && status !== 'interrupted') {
            return true;
        } else {
            return false;
        }
    }

    isInExecution(state: string) {
        if (this.nonExecutionStatus.includes(state.toLowerCase())) {
            return false;
        }
        return true;
    }

    closeOldPop(popover: any) {
        if (this.currentPop && this.currentPop !== popover) {
            this.currentPop.hide();
        }
        this.currentPop = popover;
    }

    /**
     * on change date
     */
    onChangeDate(): void {

        this.fromDate.setHours(0, 0, 0, 0);
        if (this.toDate) {
            this.toDate.setHours(0, 0, 0, 0);
        }
        // set the minimum date for end date
        if (this.fromDate) {
            this.setMinimumEndDate();
        }
        // if from date is greater than to date, reset the to date
        if (moment(this.fromDate).isAfter(this.toDate)) {
            this.toDate = undefined;
            this.setMinimumEndDate();
        }
        // if from date and to date are selected, then projects by that date range are listed
        if (this.fromDate && this.toDate) {
            this.loadProjectsByDateRange();
        }
    }
    onChangeDateForReport(): void {
        this.fromDateReport.setHours(0, 0, 0, 0);
        if (this.toDateReport) {
            this.toDateReport.setHours(0, 0, 0, 0)
        }
        if (this.fromDateReport) {
            this.setMinimumEndDateForReport();
        }
        if (moment(this.fromDateReport).isAfter(this.toDateReport)) {
            this.toDateReport = undefined;
            this.setMinimumEndDateForReport();
        }
        this.projectRunRangeReports= null;
        this.onChangeDisableButton()
    }

    /**
     * set minimum end date
     */
    setMinimumEndDate(): void {
        this.minEndDate = new Date(
            this.fromDate.getFullYear(),
            this.fromDate.getMonth(),
            this.fromDate.getDate()
        );
        this.minEndDate.setHours(0, 0, 0, 0);

    }
    setMinimumEndDateForReport(): void {
        this.minReportEndDate = new Date(
            this.fromDateReport.getFullYear(),
            this.fromDateReport.getMonth(),
            this.fromDateReport.getDate()
        )
        this.minReportEndDate.setHours(0, 0, 0, 0)
    }
    /**
     * set the date object details
     */
    setDateDetails(): {} {
        return {
            fromDate: (this.fromDate) ? moment(this.fromDate).format('YYYY-MM-DD') : '',
            toDate: (this.toDate) ? moment(this.toDate).format('YYYY-MM-DD') : ''

        };
    }
    clearRunReport() {
        this.runRangeReport = null;
        this.projectRunRangeReports = null;
    }
    clearReportByDate() {
        this.reportByDate = "";
        this.fromDateReport = null;
        this.toDateReport = null;
    }
    onChangeDisableButton(){
        this.isDisabledReportButton = false;
    }
    /**
     * download the selected project logs
     * downloaded file type is zip
     */
    downloadLogs(): void {
        this.disabledDownloadButton = true;
        this.logsCounter = 0;
        this.inProgressToastId = this.toastr.info("Downloading logs is in progress ...", 'Info', { disableTimeOut: true }).toastId;
        const projects: Project[] = this.projects
            // tslint:disable-next-line: triple-equals
            .filter(e => (this.searchQuery == '') ? (e.selected == true) : e.selected == true && e.filtered == true);
        this.selectedlogs = projects;
        projects.forEach((project: Project) => {
            this.projectService.downloadProjectLogs(project.id).subscribe(async (response: any) => {
                this.projects.forEach(e => e.selected = false);
                this.selectedProjectsQty = 0;
                this.allProjectsChecked = this.markedProjects = false;
                const type = { type: 'application/octet-stream' };
                this.logsCounter++;
                await this.downloadFile(response, Utility.getDownloadFileName(project.name + project.lastRunDateString, 'Logs', '.zip'), type);
                this.disabledDownloadButton = false;
            }, () => {
                this.disabledDownloadButton = false;
                this.toastr.remove(this.inProgressToastId);
            });
        });
    }
    /**
  * set the date object details
  */
    setReportDetails(): {} {
        return {
            fromDate: (this.fromDateReport) ? moment(this.fromDateReport).format('YYYY-MM-DD') : null,
            toDate: (this.toDateReport) ? moment(this.toDateReport).format('YYYY-MM-DD') : null,
            numberOfRuns: (this.projectRunRangeReports) ? this.projectRunRangeReports : null
        };
    }

    /**
     * download the selected project reports
     * downloaded file type is excel
     */
    downloadReports() {
        this.disabledReportButton = true;
        this.isDisabledReportButton = true;
        this.counter = 0;
        const downloadReportInformation = this.setReportDetails()
        this.inProgressReportToastId = this.toastr.info("Downloading Report is in progress ...", 'Info', { disableTimeOut: true }).toastId;
        const projects: Project[] = this.projects
            // tslint:disable-next-line: triple-equals
            .filter(e => (this.searchQuery == '') ? (e.selected == true) : e.selected == true && e.filtered == true);
        this.selectedProjects = projects;
        projects.forEach((project: Project) => {
            this.projectService.downloadProjectReport(downloadReportInformation, project.id,).subscribe(async (response: any) => {
                this.projects.forEach(e => e.selected = false);
                this.selectedProjectsQty = 0;
                this.allProjectsChecked = this.markedProjects = false;
                const type = { type: 'application/vnd.ms-excel' };
                // tslint:disable-next-line: max-line-length
                this.counter++;
                await this.downloadFile(response, Utility.getDownloadReportFileName(project.name + project.lastRunDateString, 'Reports', '.xlsx'), type);
                this.disabledReportButton = false;
                this.onChangeDisableButton();
            }, () => {
                this.disabledReportButton = false;
                this.toastr.remove(this.inProgressReportToastId);
            });
        });
        if (this.modalRef) {
            this.modalRef.hide();
        }
        this.clearReportByDate();
        this.clearRunReport();
    }
    goToDownloadReports(downloadReportTemplate: TemplateRef<any>) {
        this.isDisabledReportButton = true;
        this.modalRef = this.modalService.show(downloadReportTemplate, { ignoreBackdropClick: true })
        this.selectedReportProjects = this.projects
            // tslint:disable-next-line: triple-equals
            .filter(e => (this.searchQuery == '') ? (e.selected == true) : e.selected == true && e.filtered == true);
    }
    private downloadFile(data: any, filename: string, type: any) {
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
        // this.toastr.remove(this.inProgressReportToastId);

        if (this.counter === this.selectedProjects.length) {
            this.toastr.remove(this.inProgressReportToastId);
        }
        if (this.logsCounter === this.selectedlogs.length) {
            this.toastr.remove(this.inProgressToastId);
        }
    }

    /**
     * reset the date range and search
     */
    resetFilters(): void {
        this.fromDate = this.toDate = this.minEndDate = undefined;
        this.searchQuery = '';
        this.loadProjects();
    }

    ngOnDestroy() {
        if (this.lastestRunProject) {
            this.lastestRunProject = undefined;
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.scrollEventSubscription) {
            this.scrollEventSubscription.unsubscribe();
        }
    }
}
