import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { AdminPanelService } from 'src/app/services/admin-panel.service';
import { Hierarchy } from '../../../../../model/hierarchy';
import { PhoneService } from '../../../../../services/phone.service';

@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit, OnDestroy {
    user: any = { hierarchy: null };
    userPermissions: any = [];
    roles: any = [];
    selectedRole: string = '';
    subscription: Subscription;
    enabledPermissions: boolean = false;
    permissions: any;
    originalUser: any;
    disabledButton: boolean = true;
    hierarchyList: any = [];
    parentDto: any = {};
    // selectedHierarchy: any = [];
    selectedHierarchyName: string;
    selectedHierarchy: any = { id: undefined, type: 'ROOT', name: 'System' };
    hierarchyBreadCrumbList: any = [{ id: undefined, type: 'ROOT', name: 'System' }];
    scrollType = 'left';
    scrollCountLeft: number;
    scrollCountRight: number;
    @ViewChild('panel', { static: false, read: ElementRef }) public panel: ElementRef<any>;
    count: number;
    showHierarchy: boolean = false;

    @ViewChild('userForm', { static: true }) userForm;
    // tslint:disable-next-line: max-line-length
    hierarchyTitle = 'Credentials entered here will provide access to the corresponding hierarchy in Broadworks.If no credentials are provided, the credentials as provided in the Call Server configuration will be used as default';
    bodyHeight: any = '200px';
    constructor(private userService: UserService,
        private toastService: ToastrService,
        private phoneService: PhoneService,
        private adminPanelService: AdminPanelService) {
    }

    ngOnInit() {
        this.user = this.adminPanelService.getUser();
        this.getUser();

        this.getUserProfileRoles();
        // this.getHierarchyList();

        this.originalUser = JSON.parse(JSON.stringify(this.adminPanelService.getUser()));
        this.subscription = this.adminPanelService.editedUser.subscribe((response: any) => {
            this.updateUser();
        });

        this.userForm.valueChanges.subscribe((val: any) => {
            // tslint:disable-next-line:max-line-length
            if (val.name !== this.originalUser.name || (val.username !== this.originalUser.email) || (val.admin !== this.originalUser.admin)) {
                this.disabledButton = false;
            } else {
                this.disabledButton = true;
            }
        });
    }

    /**
     * service call to fetch user details
     */
    getUser(): void {
        this.userService.getUserByUserId(this.user.id).subscribe((response: any) => {
            this.user = response.response.user;
            // check for root hierarchy
            this.parentDto = response.response.rootHierarchy;
            // check whether hierarchy exist or not
            if (this.user.hierarchy) {
                this.selectedHierarchy = this.user.hierarchy;
                // Display as System when name is parent
                this.selectedHierarchy.name = (this.selectedHierarchy.name === 'parent') ? 'System' : this.selectedHierarchy.name;
            }
            if (response.response.hierarchyChildren) {
                this.hierarchyBreadCrumbList = [];
                this.hierarchyBreadCrumbList.push(this.parentDto);
            }

            if (response.response.rootHierarchy) {
                this.hierarchyBreadCrumbList[0] = response.response.rootHierarchy;
                this.getHierarchyList(this.parentDto['id']);
            }
            this.selectedRole = (this.user['userProfile']) ? this.user['userProfile']['id'] : '';
        });
    }

    /**
     * trigger event to close the current modal
     */
    cancelForm() {
        this.adminPanelService.cancelForm.emit();
    }

    showPermissions() {
        this.initPermissions();
        this.mapPermissions();
        this.enabledPermissions = !this.enabledPermissions;
    }

    /**
     * update user details
     */
    updateUser() {
        const userProfileDetails = this.user;
        delete userProfileDetails['roles'];
        delete userProfileDetails['roleName'];
        delete userProfileDetails['hierarchyName'];
        this.selectedHierarchy.name = (this.selectedHierarchy.name === 'System') ? 'parent' : this.selectedHierarchy.name;
        userProfileDetails['userProfile'] = this.roles.filter(e => e.id === this.selectedRole)[0];
        this.user.hierarchy = (this.selectedHierarchy.type === 'ROOT') ? this.parentDto : this.selectedHierarchy;
        this.userService.update(userProfileDetails).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Error trying to edit user: ' + response.message, 'Error');
            } else {
                this.toastService.success('User Updated Successfully', 'Success');
                this.adminPanelService.createdUser.emit();
            }
        });
    }

    /**
     * fetch the user profile role details
     */
    getUserProfileRoles(): void {
        this.userService.getAllUserProfile().subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error(response.message, 'Error');
            } else {
                this.roles = response.response.userProfiles;
            }
        });
    }

    /**
     * get hierarchy list
     * @param hierarchyId: string
     */
    getHierarchyList(hierarchyId?: string): void {
        // this.phoneService.getPhonesAndHierarchy(hierarchyId).subscribe((response: any) => {
        this.userService.getHierarchyChildByParentId(hierarchyId).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Couldn\'t load phones: ' + response.response.message, 'Error');
            } else {
                if (response.response.children) {
                    // this.hierarchyList = response.response.hierarchyLevel;
                    this.hierarchyList = response.response.children;
                    //  add key with name and type as value
                    this.hierarchyList.forEach((element: any) => {
                        element.nameAndType = element.name + '[' + element.type + ']';
                    });
                    this.selectedHierarchyName = undefined;
                }
                // if (response.response.childrenresponse.parentDto) {
                //     this.parentDto = response.response.parentDto;
                //     // check for parent type
                //     if (this.parentDto['type'].toString().toUpperCase() !== 'ROOT' && this.count === 0) {
                //         this.hierarchyBreadCrumbList = [];
                //         this.hierarchyBreadCrumbList.push(this.parentDto);
                //         this.count++;
                //     }
                // }
                // this.hierarchyList = response.response.hierarchyLevel;
                //  add key with name and type as value
                // this.hierarchyList.forEach((element: any) => {
                //     element.nameAndType = element.name + '[' + element.type + ']';
                // });
                // this.selectedHierarchyName = undefined;
            }
        });
    }

    /**
     * on click previous button
     * @param type: string
     */
    public onPreviousSearchPosition(type: string): void {
        this.scrollType = type;
        this.onScroll();
    }

    /**
     * on click next button
     * @param type: string
     */
    public onNextSearchPosition(type: string): void {
        this.scrollType = type;
        this.onScroll();
    }

    /**
     * on scroll
     */
    onScroll(): void {
        if (this.scrollType === 'left') {
            this.panel.nativeElement.scrollLeft += 100;
            this.scrollType = '';
            this.scrollCountRight = this.panel.nativeElement.scrollLeft;
        } else if (this.scrollType === 'leftEnd') {
            this.panel.nativeElement.scrollLeft += 500;
            this.scrollCountRight = this.panel.nativeElement.scrollLeft;
        } else if (this.scrollType === 'right') {
            this.panel.nativeElement.scrollLeft -= 100;
            this.scrollType = '';
            this.scrollCountRight = this.panel.nativeElement.scrollLeft;
        } else if (this.scrollType === 'rightEnd') {
            this.panel.nativeElement.scrollLeft -= 500;
            this.scrollCountRight = this.panel.nativeElement.scrollLeft;
        }
    }

    /**
     * add item to hierarchy
     * @param data: Hierarchy => {id:string,type:string,name:string}
     * @return void
     */
    addHierarchyToList(data: Hierarchy): void {
        this.selectedHierarchy = data;
        this.hierarchyBreadCrumbList.push(data);
        setTimeout(() => {
            this.onNextSearchPosition('leftEnd');
        }, 100);
    }

    /**
     * on remove hierarchy
     * @return void
     */
    removeLevelFromHierarchyList(): void {
        const length = this.hierarchyBreadCrumbList.length;
        this.hierarchyBreadCrumbList.splice(length - 1, 1);
    }

    /**
     * fetch the select bread-crumb index and perform hierarchy
     * @param index: number
     * @return void
     */
    onBreadCrumbAction(index: number): void {
        if (index !== 0) {
            const data = this.hierarchyBreadCrumbList[index];
            this.selectedHierarchy = data;
            this.getHierarchyList(data.id);
            this.hierarchyBreadCrumbList.splice(index + 1);
        } else {
            this.hierarchyBreadCrumbList.splice(1);
            this.selectedHierarchy = this.parentDto;
            this.selectedHierarchy.name = (this.selectedHierarchy.name === 'parent') ? 'System' : this.selectedHierarchy.name;
            // this.getHierarchyList(undefined);
            this.getHierarchyList(this.selectedHierarchy['id']);
        }
    }

    /**
     * event is fired when hierarchy changed
     * @param event:any
     * @return void
     */
    onChangeHierarchy(event: any): void {
        if (event) {
            this.addHierarchyToList(event);
            this.getHierarchyList(event.id);
        }
        if (!event) {
            this.removeLevelFromHierarchyList();
        }
    }

    /**
     * map user permissions
     */
    mapPermissions() {
        this.user.roles.forEach((userRole: any) => {
            this.userPermissions.forEach(e1 => {
                e1.actions.forEach(e2 => {
                    // tslint:disable-next-line:triple-equals
                    if (userRole == e2.value) {
                        e2.enabled = true;
                    }
                });
            });
        });
        this.user.roles.forEach((userRole: any) => {
        });
    }

    // not using this method anymore
    verify(permission: any) {
        this.disabledButton = false;
        let response = false;
        if (permission.permissions[1].enabled || permission.permissions[2].enabled) {
            permission.permissions[3].enabled = true;
            response = true;
        }
        return response;
    }
    onSelectRole(event:any){

    }
    resizeBody(option: string): void {
        if (option === 'open') {
            this.bodyHeight = (document.getElementById('modalBody').offsetHeight + 150).toString() + 'px';
        } else {
            this.bodyHeight = 'auto';
        }
    }
    /**
     * initiate user permissions
     */
    initPermissions() {
        // user permissions
        this.userPermissions = [
            {
                category: 'Management actions', actions: [
                    { value: 'ROLE_PHONE_EASYBUTTON', name: 'Troubleshooting', enabled: false },
                    { value: 'ROLE_PHONE_REBOOT', name: 'Reboot', enabled: false },
                    { value: 'ROLE_PHONE_SYNC', name: 'Sync', enabled: false },
                    { value: 'ROLE_PHONE_PACKETCAPTURE', name: 'Packet Capture', enabled: false },
                    { value: 'ROLE_PHONE_MOSSCORE', name: 'MOS Score', enabled: false },
                    { value: 'ROLE_PHONE_TIMELINE', name: 'Timeline', enabled: false },
                    { value: 'ROLE_PHONE_FIRMWAREUPGRADE', name: 'Firmware Upgrade', enabled: false },
                    { value: 'ROLE_PHONE_VDM', name: 'Visual Device Management', enabled: false },
                    { value: 'ROLE_PHONE_VIEWCONFIG', name: 'View config', enabled: false },
                    { value: 'ROLE_PHONE_COMPARECONFIG', name: 'Compare config', enabled: false }
                ]
            }, {
                category: 'License Management', actions: [
                    { value: 'ROLE_APP_LICENSEMANAGEMENT', name: 'License Management', enabled: false },
                    { value: 'ROLE_APP_BRANDING', name: 'Branding', enabled: false },
                    { value: 'ROLE_APP_EMAILCONFIGURATION', name: 'Email notification configuration', enabled: false }
                ]
            }
        ];
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
