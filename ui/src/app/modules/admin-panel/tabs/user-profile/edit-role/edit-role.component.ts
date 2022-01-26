import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AdminPanelService} from '../../../../../services/admin-panel.service';
import {ToastrService} from 'ngx-toastr';
import {Role} from '../../../../../helpers/role';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {UserService} from '../../../../../services/user.service';

@Component({
    selector: 'app-edit-role',
    templateUrl: './edit-role.component.html',
    styleUrls: ['./edit-role.component.css']
})
export class EditRoleComponent implements OnInit {
    userProfileRole: any = {name: '', description: '', permissions: [], isAdmin: false, isUser: true};
    subscription: Subscription;
    deleteModal: BsModalRef;
    modalConfig: any = {backdrop: true, class: 'modal-dialog-centered modal-lg', ignoreBackdropClick: true};
    enabledPermissions: boolean;
    permissions: any;
    selectAll: boolean;
    userPermissions: any = [];
    selectedUserProfile: any = {};
    allPermissions: any = [{}];
    hierarchyList: any = [];
    selectedHierarchy: any = [];
    enabledPermissionCount: number;
    // tslint:disable-next-line: max-line-length
    hierarchyTitle = 'Credentials entered here will provide access to the corresponding hierarchy in Broadworks.If no credentials are provided, the credentials as provided in the Call Server configuration will be used as default';

    constructor(private adminPanelService: AdminPanelService,
                private modalService: BsModalService,
                private userService: UserService,
                private toastService: ToastrService) {
    }

    ngOnInit() {
        this.initPermissions();
        this.selectedUserProfile = this.adminPanelService.getUserProfile();
        this.fetchUserDetails();
        this.enabledPermissions = false;
        this.selectAll = false;
        this.enabledPermissionCount = 0;
    }

    /**
     * initiate user permission array/list
     */
    initPermissions() {
        // user permissions
        this.userPermissions = [
            {
                category: 'Management actions', actions: [
                    {value: 'ROLE_PHONE_EASYBUTTON', name: 'Troubleshooting', enabled: false},
                    {value: 'ROLE_PHONE_REBOOT', name: 'Reboot', enabled: false},
                    {value: 'ROLE_PHONE_SYNC', name: 'Sync', enabled: false},
                    {value: 'ROLE_PHONE_PACKETCAPTURE', name: 'Packet Capture', enabled: false},
                    {value: 'ROLE_PHONE_MOSSCORE', name: 'MOS Score', enabled: false},
                    {value: 'ROLE_PHONE_TIMELINE', name: 'Timeline', enabled: false},
                    {value: 'ROLE_PHONE_FIRMWAREUPGRADE', name: 'Firmware Upgrade', enabled: false},
                    {value: 'ROLE_PHONE_VDM', name: 'Visual Device Management', enabled: false},
                    {value: 'ROLE_PHONE_VIEWCONFIG', name: 'View config', enabled: false},
                    {value: 'ROLE_PHONE_COMPARECONFIG', name: 'Compare config', enabled: false}
                ]
            }, {
                category: 'License Management', actions: [
                    {value: 'ROLE_APP_LICENSEMANAGEMENT', name: 'License Management', enabled: false},
                    {value: 'ROLE_APP_BRANDING', name: 'Branding', enabled: false},
                    {value: 'ROLE_APP_EMAILCONFIGURATION', name: 'Email notification configuration', enabled: false}
                ]
            }
        ];

        this.allPermissions = [];
        /* push the all permission to single array */
        this.userPermissions.forEach(e1 => {
            e1.actions.forEach(e2 => {
                this.allPermissions.push(e2);
            });
        });
    }

    /**
     * check whether all permission are enabled or not
     */
    checkSelectAllPermissions() {
        return this.selectAll = this.allPermissions.filter((e: any) => e.enabled === true).length === 13;
    }

    /**
     * trigger event to close the modal
     */
    cancelForm() {
        this.adminPanelService.cancelForm.emit();
    }

    /**
     * fetch the user details by service call
     */
    fetchUserDetails(): void {
        this.userService.getParticularUserProfile(this.selectedUserProfile).subscribe((response: any) => {
            this.userProfileRole = response.response.userProfile;
            if (this.userProfileRole.permissions.includes(Role[1])) {
                this.userProfileRole.isAdmin = true;
                this.userProfileRole.isUser = false;
            } else {
                this.userProfileRole.isUser = true;
                this.userProfileRole.isAdmin = false;
                this.showPermissions();
            }
        });
    }

    /**
     * perform permission array related stuff
     */
    showPermissions() {
        this.initPermissions();
        this.mapPermissions();
        this.checkSelectAllPermissions();
    }

    // not using this method any more
    verify(permission: any) {
        let response = false;
        if (permission.permissions[1].enabled || permission.permissions[2].enabled) {
            permission.permissions[3].enabled = true;
            response = true;
        }
        return response;
    }

    /**
     * on select user
     */
    onSelectUser(): void {
        if (this.userProfileRole.isUser) {
            this.userProfileRole.isAdmin = false;
        }
    }

    /**
     * on select admin
     */
    onSelectAdmin(): void {
        if (this.userProfileRole.isAdmin) {
            this.userProfileRole.isUser = false;
        }
    }

    /**
     * to select or unselect permissions
     */
    onSelectAll(): void {
        this.userPermissions.forEach(category => {
            category.actions.forEach(e => {
                e.enabled = this.selectAll;
            });
        });
    }

    /**
     * map user permissions
     */
    mapPermissions() {
        this.userProfileRole.permissions.forEach((userRole: any) => {
            this.userPermissions.forEach(e1 => {
                e1.actions.forEach(e2 => {
                    // tslint:disable-next-line:triple-equals
                    if (userRole == e2.value) {
                        e2.enabled = true;
                    }
                });
            });
        });
    }

    /**
     * update user role details
     * @param type: string
     */
    editUserRole(type: string): void {
        if (type === 'no') {
            if (this.deleteModal) {
                this.deleteModal.hide();
            }
        } else {
            if (this.deleteModal) {
                this.deleteModal.hide();
            }
            // service call
            this.userProfileRole.permissions = [];
            if (this.userProfileRole['isAdmin']) {
                this.userProfileRole.permissions.push(Role[1]);
            } else if (this.userProfileRole['isUser']) {
                this.userProfileRole.permissions.push(Role[2]);
                this.userPermissions.forEach((permission: any) => {
                    permission.actions.forEach((e: any, index: number) => {
                        if (e.enabled && !this.userProfileRole.permissions.includes(e.value)) {
                            this.userProfileRole.permissions.push(e.value);
                        }
                    });
                });
            }
            const userProfileDetails = this.userProfileRole;
            delete userProfileDetails['isAdmin'];
            delete userProfileDetails['isUser'];
            this.userService.updateUserProfile(userProfileDetails).subscribe((response: any) => {
                if (!response.success) {
                    this.toastService.error(response.message, 'Error');
                } else {
                    this.toastService.success(response.message, 'Success');
                    this.adminPanelService.cancelForm.emit();
                }
            });
        }
    }

    /**
     * on change permission
     */
    onChangePermissions(item?: any): void {
        this.enabledPermissionCount = 0;
        // tslint:disable-next-line:triple-equals no-shadowed-variable
        this.allPermissions.forEach((e: any, index: number) => {
            if (e.enabled) {
                this.enabledPermissionCount++;
            }
        });
        this.selectAll = (this.enabledPermissionCount === 13);
    }

    /**
     * display warning template on click update user role
     * @param template: any
     */
    onUpdateUserRole(template: any): void {
        this.deleteModal = this.modalService.show(template, {
            backdrop: true,
            class: 'modal-dialog-centered',
            ignoreBackdropClick: true
        });

    }
}
