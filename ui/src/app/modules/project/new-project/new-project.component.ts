import { Component, OnDestroy, OnInit } from '@angular/core';
import { TestPlan } from 'src/app/model/test-plan';
import { TestPlansService } from 'src/app/services/test-plans.service';
import { Project } from 'src/app/model/project';
import { PhoneListService } from 'src/app/services/phone-list.service';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ProvisioningService } from 'src/app/services/provisioning.service';
import { Utility } from '../../../helpers/Utility';
import { Router } from '@angular/router';
import { UserListService } from 'src/app/services/user-list.service';

@Component({
    selector: 'app-new-project',
    templateUrl: './new-project.component.html',
    styleUrls: ['./new-project.component.css']
})
export class NewProjectComponent implements OnInit, OnDestroy {

    planOption: any;
    checkPhonePoolCount: boolean;
    checkServerPoolCount: boolean;
    selectedTestPlan: boolean = false;
    testPlans: TestPlan[];
    project: Project = new Project();
    subscription: Subscription;
    allPhoneLists: any = [];
    requiredPools: any = [];
    selectedPools: any = [];

    allServers: any = [];
    requiredServers: any = [];
    selectedServers: any = [];
    allVendors: any = [];
    allModels: any = [];

    bodyHeight: any = '200px';

    // user pool
    allUserLists: any = [];
    requiredUserPools: any = [];
    selectedUserPools: any = [];
    checkUserPoolCount: boolean;

    constructor(private testPlanService: TestPlansService,
        private phoneListService: PhoneListService,
        private projectService: ProjectViewService,
        private toastr: ToastrService,
        private provisioningService: ProvisioningService,
        private userListSerivce: UserListService,
        private router: Router) {
    }

    loadTestPlans(): void {
        this.testPlanService.getTestPlans().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to load test plans: ' + response.response.message, 'Error');
            } else {
                this.testPlans = response.response.testPlans;
                this.testPlans = Utility.sortByLastModifiedDateInDescOrder(this.testPlans);
            }
        });
    }

    ngOnInit() {
        this.checkPhonePoolCount = this.checkServerPoolCount = false;
        this.loadTestPlans();
        this.subscription = this.projectService.createNewProject.subscribe((response: any) => {
            this.createProject();
        });
    }

    /**
     * to create a new project
     */
    createProject(): void {
        this.project.testPlan = this.mapPlan();
        this.project.projectPhonePools = this.mapPools();
        this.project.projectCallServers = this.mapServers();
        this.project.projectDeviceUserLists = this.mapUsers();
        this.projectService.createProject(this.project).subscribe((response: any) => {
            if (!response.success) {
                if (response.response.message.includes('updateOldPhones')) {
                    let toastCustom = this.toastr.error('Error trying to create project: Phones require update .Please Click on the <strong><a routerLink="/phoneConfiguration">link</a></strong> for more details'
                        , 'Error', { enableHtml: true });
                    toastCustom.onTap.subscribe((response) => {
                        localStorage.setItem('needToUpdatePhones', 'true');
                        this.router.navigate(['/phoneConfiguration']);

                        this.projectService.createdProject.emit();
                    });
                } else
                    this.toastr.error('Error trying to create a new project: ' + response.response.message, 'Error');
            } else {
                this.project.id = response.response.id;
                this.toastr.success('Project created successfully', 'Success');
                this.projectService.createdProject.emit();
            }
        });
    }

    /**
     * to hide the modal
     */
    hideModal(): void {
        this.projectService.cancelEdit.emit();
    }

    /**
     * to resize the ng-select modal
     */
    resizeBody(option: string): void {
        if (option === 'open') {
            this.bodyHeight = (document.getElementById('modalBody').offsetHeight + 250).toString() + 'px';
        } else {
            this.bodyHeight = 'auto';
        }
    }

    /**
     * to map the selected phone pools and for respective required phone pool
     */
    mapPools() {
        const responseList: any = [];
        for (var i = 0; i < this.selectedPools.length; i++) {
            if (this.selectedPools[i]['id']) {
                responseList.push({ tagName: this.requiredPools[i].name, phonePoolDto: this.selectedPools[i] });
            }
        }
        return responseList;
    }

    /**
     * to map the selected server pools and for respective required server pool
     */
    mapServers() {
        const responseList: any = [];
        if (this.requiredServers.length > 0) {
            for (var i = 0; i < this.selectedServers.length; i++) {
                if (this.selectedServers[i]['id']) {
                    responseList.push({ tagName: this.requiredServers[i].name, callServerDto: this.selectedServers[i] });
                }
            }
        }
        return responseList;
    }
    /**
     * to map the selected user pools and for respective required user pool
     */
    mapUsers() {
        const responseList: any = [];
        for (var i = 0; i < this.selectedUserPools.length; i++) {
            if (this.selectedUserPools[i]['id']) {
                responseList.push({ tagName: this.requiredUserPools[i].name, deviceUserListDto: this.selectedUserPools[i] });
            }
        }
        return responseList;
    }

    /**
     * get test plan details
     */
    mapPlan() {
        let selectedPlan: any;
        this.testPlans.forEach((testPlan: any) => {
            if (testPlan.id === this.planOption) {
                selectedPlan = testPlan;
            }
        });
        return selectedPlan;
    }

    /**
     * service call to fetch the test plan pools
     */
    loadResourcesForPlan(plan: any): void {
        // tslint:disable-next-line: triple-equals
        if (plan != undefined) {
            this.planOption = plan.id;
            this.testPlanService.getRequiredResources(plan.id).subscribe(async (response: any) => {
                if (!response.success) {
                    this.toastr.error('Error acquiring servers: ' + response.response.message, 'Error');
                } else {
                    this.requiredPools = response.response.testPlan.requiredPools;
                    this.checkPhonePoolCount = (this.requiredPools.length > 0) ? true : false;
                    this.requiredServers = response.response.testPlan.requiredCallServers;
                    this.checkServerPoolCount = (this.requiredServers.length > 0) ? true : false;
                    this.requiredUserPools = response.response.testPlan.requiredDeviceUserLists;
                    this.checkUserPoolCount = (this.requiredUserPools.length > 0) ? true : false;
                    await this.loadExistingPhonePools();
                    await this.loadExistingServers();
                    await this.loadExistingUserPools();
                }
            });
        } else {
            this.selectedTestPlan = undefined;
            this.selectedPools = this.selectedServers = this.allPhoneLists = this.allServers = [];
            this.planOption = undefined;
        }
    }

    /**
     * service call to load existing servers
     */
    loadExistingServers(): void {
        this.requiredServers.forEach((server: any) => {
            this.provisioningService.getFilteredServers(server.vendor, server.model).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error trying to load filtered servers for server ' + server.name, 'Error');
                } else {
                    Utility.sortByLastModifiedDateInDescOrder(response.response.callServers);
                    this.allServers.push(response.response.callServers);
                }
            });
        });
    }

    /**
     * service call to load existing phone pools
     */
    loadExistingPhonePools(): void {
        this.phoneListService.getPhoneLists().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to load available phone pools: ' + response.response.message, 'Error');
            } else {
                this.allPhoneLists = response.response.phonePools;
                this.allPhoneLists = Utility.sortByLastModifiedDateInDescOrder(this.allPhoneLists);
                this.selectedTestPlan = true;
            }
        });
    }
    /**
     * service call to load existing user pools
     */
    loadExistingUserPools(): void {
        this.userListSerivce.getUsersLists().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to load available user pools: ' + response.response.message, 'Error');
            } else {
                this.allUserLists = response.response.deviceUserLists;
                this.allUserLists = Utility.sortListInDescendingOrder(this.allUserLists, 'lastUpdatedDate', true);
                this.selectedTestPlan = true;
            }
        });
    }

    /**
     * add selected phone pool to selectedPools array
     */
    addSelectedPhonePool(index: any, selectedPool: any): void {
        if (selectedPool) {
            this.allPhoneLists.forEach((phoneList: any) => {
                // tslint:disable-next-line: triple-equals
                if (phoneList.id == selectedPool.id) {
                    this.selectedPools[index] = phoneList;
                }
            });
        } else {
            this.selectedPools[index] = { id: null };
        }
        this.checkPhonePoolCount = !(this.requiredPools.length === this.selectedPools.filter(e => e.id != null).length);
    }

    /**
     * add selected server pool to selectedServer array
     */
    addSelectedServer(index: any, selectedServer: any): void {
        if (selectedServer) {
            this.allServers[index].forEach((server: any) => {
                // tslint:disable-next-line: triple-equals
                if (server.id == selectedServer.id) {
                    this.selectedServers[index] = server;
                }
            });
        } else {
            this.selectedServers[index] = { id: null };
        }
        this.checkServerPoolCount = !(this.requiredServers.length === this.selectedServers.filter(e => e.id != null).length);
    }
    /**
     * add selected user pool to selectedUserPools array
     */
    addSelectedUserPool(index: any, selectedUserList: any): void {
        if (selectedUserList) {
            this.allUserLists.forEach((userList: any) => {
                // tslint:disable-next-line: triple-equals
                if (userList.id == selectedUserList.id) {
                    this.selectedUserPools[index] = userList;
                }
            });
        } else {
            this.selectedUserPools[index] = { id: null };
        }
        this.checkUserPoolCount = !(this.requiredUserPools.length === this.selectedUserPools.filter(e => e.id != null).length);
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
