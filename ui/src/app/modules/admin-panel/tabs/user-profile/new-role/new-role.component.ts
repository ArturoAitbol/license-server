import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {AdminPanelService} from '../../../../../services/admin-panel.service';
import {Subscription} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {UserService} from '../../../../../services/user.service';
import {Role} from '../../../../../helpers/role';

@Component({
    selector: 'app-new-role',
    templateUrl: './new-role.component.html',
    styleUrls: ['./new-role.component.css'],
    encapsulation: ViewEncapsulation.Emulated,
})
export class NewRoleComponent implements OnInit {
    userProfileRole: any = {permissions: [], defaultProfile: false, userCount: 0};
    subscription: Subscription;
    enabledPermissions: boolean;
    permissions: any;
    selectAll: boolean;
    userPermissions: any = [];
    enabledPermissionCount: number;
    allPermissions: any = [];

    hierarchyList: any = [];
    selectedHierarchy: any = [];
    // tslint:disable-next-line: max-line-length
    hierarchyTitle = 'Credentials entered here will provide access to the corresponding hierarchy in Broadworks.If no credentials are provided, the credentials as provided in the Call Server configuration will be used as default';

    constructor(private adminPanelService: AdminPanelService,
                private userService: UserService,
                private toastService: ToastrService) {
    }

    ngOnInit() {
        this.enabledPermissions = false;
        this.selectAll = false;
        this.userProfileRole.isAdmin = true;
        this.userProfileRole.isUser = false;
        this.initPermissions();

    }

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
        /* push the all permission to single array */
        this.userPermissions.forEach(e1 => {
            e1.actions.forEach(e2 => {
                this.allPermissions.push(e2);
            });
        });

    }

    cancelForm() {
        this.adminPanelService.cancelForm.emit();
    }

    showPermissions() {
        this.enabledPermissions = !this.enabledPermissions;
    }

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

    onSelectAll(): void {
        this.userPermissions.forEach(category => {
            category.actions.forEach(e => {
                e.enabled = this.selectAll;
            });
        });
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
     * service call
     * create new role
     */
    createNewRole(): void {
        this.userProfileRole['permissions'] = [];
        if (this.userProfileRole.isAdmin) {
            this.userProfileRole['permissions'].push(Role[1]);
        } else if (this.userProfileRole.isUser) {
            this.userProfileRole['permissions'].push(Role[2]);
            this.userPermissions.forEach((permission: any) => {
                permission.actions.forEach(e => {
                    if (e.enabled) {
                        this.userProfileRole.permissions.push(e.value);
                    }
                });
            });
        }
        const userProfileDetails = this.userProfileRole;
        delete userProfileDetails.isAdmin;
        delete userProfileDetails.isUser;
        this.userService.createUserProfile(userProfileDetails).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error(response.message, 'Error');
            } else {
                this.toastService.success(response.message, 'Success');
                this.adminPanelService.cancelForm.emit();
            }
        });
    }
}
