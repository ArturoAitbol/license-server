import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { AdminPanelService } from 'src/app/services/admin-panel.service';
import { PhoneService } from '../../../../../services/phone.service';
import { Hierarchy } from '../../../../../model/hierarchy';

@Component({
    selector: 'app-new-user',
    templateUrl: './new-user.component.html',
    styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit, OnDestroy {
    user: any = { hierarchy: null };
    subscription: Subscription;
    enabledPermissions: boolean;
    permissions: any;
    userPermissions: any = [];
    roles: any = [];
    selectedRole: string = undefined;
    hierarchyList: any = [];
    parentDto: any = {};
    // selectedHierarchy: any = [];
    selectedHierarchyName: string;
    selectedHierarchy: any = { id: undefined, type: 'ROOT', name: 'System' };
    // tslint:disable-next-line: max-line-length
    hierarchyTitle = 'Credentials entered here will provide access to the corresponding hierarchy in Broadworks.If no credentials are provided, the credentials as provided in the Call Server configuration will be used as default';
    hierarchyBreadCrumbList: any = [{ id: undefined, type: 'ROOT', name: 'System' }];
    scrollType = 'left';
    scrollCountLeft: number;
    scrollCountRight: number;
    @ViewChild('panel', { static: false, read: ElementRef }) public panel: ElementRef<any>;
    count: number;
    showHierarchy: boolean = false;
    bodyHeight: any = '200px';
    constructor(private userService: UserService,
        private toastService: ToastrService,
        private phoneService: PhoneService,
        private adminPanelService: AdminPanelService) {
    }

    ngOnInit() {
        // this.enabledPermissions = false;
        // this.user.isAdmin = true;
        // this.user.isUser = false;
        // this.initPermissions();
        this.getUserProfileRoles();
        // this.getHierarchyList();
        this.getHierarchyDetails();
        this.subscription = this.adminPanelService.createNewUser.subscribe((response: any) => {
            this.createUser();
        });
    }

    /**
     * create user
     */
    createUser(): void {
        this.user.userProfile = this.roles.filter(e => e.id === this.selectedRole)[0];
        // set back the name to "parent" when type is ROOT
        this.selectedHierarchy.name = (this.selectedHierarchy.name === 'System') ? 'parent' : this.selectedHierarchy.name;
        this.user.hierarchy = (this.selectedHierarchy.type === 'ROOT') ? this.parentDto : this.selectedHierarchy;
        this.userService.register(this.user).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Error trying to create user: ' + response.message, 'Error');
            } else {
                this.toastService.success('User created successfully', 'Success');
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

    getHierarchyDetails(): void {
        this.userService.getHierarchyForNewUser().subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Couldn\'t load phones: ' + response.response.message, 'Error');
            } else {
                if (response.response.root) {
                    this.selectedHierarchy = this.parentDto = response.response.root;
                    // set the name to "System" whereas name is "parent"
                    this.selectedHierarchy.name = (this.selectedHierarchy.name === 'parent') ? 'System' : this.selectedHierarchy.name;
                    // check for parent type
                    this.hierarchyBreadCrumbList = [];
                    this.hierarchyBreadCrumbList.push(this.parentDto);
                    this.count++;
                }
                this.hierarchyList = response.response.children;
                //  add key with name and type as value
                this.hierarchyList.forEach((element: any) => {
                    element.nameAndType = element.name + '[' + element.type + ']';
                });
                this.selectedHierarchyName = undefined;
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
                // if (response.response.parentDto) {
                //     this.parentDto = response.response.parentDto;
                //     // check for parent type
                //     if (this.parentDto['type'].toString().toUpperCase() !== 'ROOT' && this.count === 0) {
                //         this.hierarchyBreadCrumbList = [];
                //         this.hierarchyBreadCrumbList.push(this.parentDto);
                //         this.count++;
                //     }
                // }
                // this.hierarchyList = response.response.hierarchyLevel;
                // //  add key with name and type as value
                // this.hierarchyList.forEach((element: any) => {
                //     element.nameAndType = element.name + '[' + element.type + ']';
                // });
                // this.selectedHierarchyName = undefined;
                if (response.response.children) {
                    // this.hierarchyList = response.response.hierarchyLevel;
                    this.hierarchyList = response.response.children;
                    //  add key with name and type as value
                    this.hierarchyList.forEach((element: any) => {
                        element.nameAndType = element.name + '[' + element.type + ']';
                    });
                    this.selectedHierarchyName = undefined;
                }
            }
        });
    }

    /**
     * on select user
     */
    onSelectUser(): void {
        if (this.user.isUser) {
            this.user.isAdmin = false;
        }
    }

    /**
     * on select admin
     */
    onSelectAdmin(): void {
        if (this.user.isAdmin) {
            this.user.isUser = false;
        }
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
            this.scrollCountLeft = this.panel.nativeElement.scrollLeft;
        } else if (this.scrollType === 'rightEnd') {
            this.panel.nativeElement.scrollLeft -= 500;
            this.scrollCountLeft = this.panel.nativeElement.scrollLeft;
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
            this.getHierarchyList(this.selectedHierarchy['id']);
        }
    }

    // onSelectHierarchy(): void {
    //     this.showHierarchy = !this.showHierarchy;
    // }

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

    cancelForm() {
        this.adminPanelService.cancelForm.emit();
    }

    showPermissions() {
        this.enabledPermissions = !this.enabledPermissions;
    }
    onSelectRole(event:any){

    }
    resizeBody(option: string): void {
        if (option === 'open') {
            this.bodyHeight = (document.getElementById('modalBody').offsetHeight + 250).toString() + 'px';
        } else {
            this.bodyHeight = 'auto';
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
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
     * initiate permissions
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
}
