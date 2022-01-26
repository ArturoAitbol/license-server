import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TestPlansService } from 'src/app/services/test-plans.service';
import { PhoneListService } from 'src/app/services/phone-list.service';
import { ToastrService } from 'ngx-toastr';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { ProvisioningService } from 'src/app/services/provisioning.service';
import { Router } from '@angular/router';
import { UserListService } from 'src/app/services/user-list.service';
import { Utility } from 'src/app/helpers/Utility';

@Component({
    selector: 'app-edit-project',
    templateUrl: './edit-project.component.html',
    styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit, OnDestroy {
    project: any = {};
    subscription: Subscription;
    allPhoneLists: any[] = [];
    requiredPools: any[] = [];
    selectedPools: any[] = [];
    currentProjectPools: any = [];

    allServers: any[] = [];
    requiredServers: any[] = [];
    selectedServers: any[] = [];
    currentProjectServers: any[] = [];

    // user pool
    allUserLists: any = [];
    requiredUserPools: any = [];
    selectedUserPools: any = [];
    checkUserPoolCount: boolean;
    currentProjectUserPools: any = [];

    // flag
    hidePoolDetails: boolean;
    constructor(private phoneListService: PhoneListService,
        private projectService: ProjectViewService,
        private toastr: ToastrService,
        private testPlanService: TestPlansService,
        private provisioningService: ProvisioningService,
        private userListSerivce: UserListService,
        private router: Router) {
    }

    async ngOnInit() {
        this.hidePoolDetails = true;
        this.project = this.projectService.getProject();
        await this.loadRequiredResourcesForPlan(this.project.testPlanDto.id)
            .then(() => {
                this.projectService.getProjectById(this.project.id).subscribe((response: any) => {
                    if (!response.success) {
                        this.toastr.error('Cannot find project: ' + response.response.message);
                        this.hidePoolDetails = false;
                    } else {
                        // Phone pool
                        this.requiredPools.forEach(e => {
                            // tslint:disable-next-line:triple-equals
                            const phoneFilterItem = response.response.project.projectPhonePools.filter(item => item.tagName == e.name)[0];
                            if (phoneFilterItem) {
                                this.currentProjectPools.push(phoneFilterItem);
                                this.selectedPools.push(phoneFilterItem.phonePoolDto);
                            } else {
                                this.currentProjectPools.push({
                                    id: '',
                                    projectDto: null,
                                    phonePoolDto: {},
                                    tagName: '',
                                    vendor: null,
                                    modelNumber: null,
                                    subModelNumber: null,
                                    dut: false
                                });
                                this.selectedPools.push({ id: null });
                            }
                        });
                        // User pool
                        this.requiredUserPools.forEach((e: any) => {
                            // tslint:disable-next-line:triple-equals
                            const userFilterItem = response.response.project.projectDeviceUserLists.filter((item: any) => item.tagName == e.name)[0];
                            if (userFilterItem) {
                                this.currentProjectUserPools.push(userFilterItem);
                                this.selectedUserPools.push(userFilterItem.deviceUserListDto);
                            } else {
                                this.currentProjectUserPools.push({
                                    id: '',
                                    projectDto: null,
                                    deviceUserListDto: {},
                                    tagName: '',
                                    vendor: null,
                                    modelNumber: null,
                                    subModelNumber: null,
                                    dut: false
                                });
                                this.selectedUserPools.push({ id: null });
                            }
                        });
                        // Server pool
                        this.requiredServers.forEach(e => {
                            // tslint:disable-next-line:triple-equals
                            const callServerFilterItem = response.response.project.projectCallServers.filter(item => item.tagName == e.name)[0];
                            if (callServerFilterItem) {
                                this.currentProjectServers.push(callServerFilterItem);
                                this.selectedServers.push(callServerFilterItem.callServerDto);
                            } else {
                                this.currentProjectPools.push({
                                    id: '',
                                    projectDto: null,
                                    callServerDto: {},
                                    tagName: '',
                                    vendor: null,
                                    modelNumber: null
                                });
                                this.selectedServers.push({ id: null });
                            }
                        });
                        // response.response.project.projectPhonePools.forEach((pool: any) => {
                        //     this.currentProjectPools.push(pool);
                        //     this.selectedPools.push(pool.phonePoolDto);
                        // });

                        // response.response.project.projectCallServers.forEach((server: any) => {
                        //     this.currentProjectServers.push(server);
                        //     this.selectedServers.push(server.callServerDto);
                        // });

                        // this.mapExistingPhonePools();
                        // this.mapExistingCallServers();
                        setTimeout(() => {
                            this.hidePoolDetails = false;
                        }, 1000);
                    }
                }, () => {
                    this.hidePoolDetails = false;
                });
            }).catch(() => {
                this.hidePoolDetails = false;
            });

        this.subscription = this.projectService.editedProject.subscribe((response: any) => {
            this.updateProject();
        });
    }

    mapExistingPhonePools(): void {
        for (let i = 0; i < this.requiredPools.length; i++) {
            // tslint:disable-next-line:triple-equals
            if (this.currentProjectPools[i] == undefined) {
                this.currentProjectPools[i] = { phonePoolDto: { id: -1 } };
            }
        }
    }

    mapExistingCallServers(): void {
        for (let i = 0; i < this.requiredServers.length; i++) {
            // tslint:disable-next-line:triple-equals
            if (this.currentProjectServers[i] == undefined) {
                this.currentProjectServers[i] = { callServerDto: { id: -1 } };
            }
        }
    }

    updateProject(): void {
        this.project.projectPhonePools = this.mapPools();
        this.project.projectCallServers = this.mapServers();
        this.project.projectDeviceUserLists = this.mapUserPools();
        this.project.testPlan = this.project.testPlanDto;
        this.projectService.updateProject(this.project).subscribe((response: any) => {
            if (!response.success) {
                const message = response.response.message;
                if (message.toString().includes('User doesn\'t have permissions')) {
                    this.toastr.warning(message, 'Warning');
                } else if (response.response.message.includes('updateOldPhones')) {
                    let toastCustom = this.toastr.error('Error trying to update project: Phones require update .Please Click on the <strong><a routerLink="/phoneConfiguration">link</a></strong> for more details'
                        , 'Error', { enableHtml: true });
                    toastCustom.onTap.subscribe((response) => {
                        localStorage.setItem('needToUpdatePhones', 'true');
                        this.router.navigate(['/phoneConfiguration']);

                        this.projectService.createdProject.emit();
                    });
                } else {
                    this.toastr.error('Error trying to edit project: ' + response.response.message, 'Error');
                }
            } else {
                this.toastr.success('Project Updated Successfully', 'Success');
                this.projectService.createdProject.emit();
            }
        });
    }

    mapPools() {
        const responseList: any = [];
        for (let i = 0; i < this.selectedPools.length; i++) {
            // check for id is not null or undefined
            if (this.selectedPools[i]['id']) {
                responseList.push({ tagName: this.requiredPools[i].name, phonePoolDto: this.selectedPools[i] });
            }
        }
        return responseList;
    }

    mapServers() {
        const responseList: any = [];
        for (let i = 0; i < this.selectedServers.length; i++) {
            // check for id is not null or undefined
            if (this.selectedServers[i]['id']) {
                responseList.push({ tagName: this.requiredServers[i].name, callServerDto: this.selectedServers[i] });
            }
        }
        return responseList;
    }

    mapUserPools() {
        const responseList: any = [];
        for (let i = 0; i < this.selectedUserPools.length; i++) {
            // check for id is not null or undefined
            if (this.selectedUserPools[i]['id']) {
                responseList.push({ tagName: this.requiredUserPools[i].name, deviceUserListDto: this.selectedUserPools[i] });
            }
        }
        return responseList;
    }

    loadRequiredResourcesForPlan(id: string): Promise<any> {
        const promise = new Promise((resolve, reject) => {
            this.testPlanService.getRequiredResources(id).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error acquiring servers: ' + response.response.message, 'Error');
                    this.hidePoolDetails = false;
                    reject();
                } else {
                    this.requiredPools = response.response.testPlan.requiredPools;
                    this.requiredServers = response.response.testPlan.requiredCallServers;
                    this.requiredUserPools = response.response.testPlan.requiredDeviceUserLists;
                    this.loadExistingPhonePools();
                    this.loadExistingServers();
                    this.loadExistingUserPools();
                    resolve();
                }
            }, () => {
                this.hidePoolDetails = false;
                reject();
            });
        });
        return promise;
    }

    loadExistingServers(): void {
        this.requiredServers.forEach((server: any) => {
            this.provisioningService.getFilteredServers(server.vendor, server.model).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error trying to load filtered servers for server ' + server.name, 'Error');
                } else {
                    this.allServers.push(response.response.callServers);
                }
            });
        });
    }

    loadExistingPhonePools(): void {
        this.phoneListService.getPhoneLists().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to load available phone pools: ' + response.response.message, 'Error');
            } else {
                this.allPhoneLists = response.response.phonePools;
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
            }
        });
    }

    cancelAction(): void {
        this.projectService.cancelEdit.emit();
    }

    addSelectedPhonePool(index: any, listId: any) {
        this.project.name = this.project.name;
        this.allPhoneLists.forEach((phoneList: any) => {
            // tslint:disable-next-line:triple-equals
            if (phoneList.id == listId) {
                this.selectedPools[index] = phoneList;
            }
        });
    }

    addSelectedServer(index: any, serverId: any): void {
        this.allServers[index].forEach((server: any) => {
            // tslint:disable-next-line:triple-equals
            if (server.id == serverId) {
                this.selectedServers[index] = server;
            }
        });
    }

    /**
     * add selected user pool to selectedUserPools array
     */
    addSelectedUserPool(index: any, selectedUserListId: any): void {
        if (selectedUserListId) {
            this.allUserLists.forEach((userList: any) => {
                // tslint:disable-next-line: triple-equals
                if (userList.id == selectedUserListId) {
                    this.selectedUserPools[index] = userList;
                }
            });
        }
    }


    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
