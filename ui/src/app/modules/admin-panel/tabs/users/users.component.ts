import { Component, DoCheck, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { NewUserComponent } from './new-user/new-user.component';
import { AdminPanelService } from 'src/app/services/admin-panel.service';
import { Subscription } from 'rxjs';
import { EditUserComponent } from './edit-user/edit-user.component';
import { Role } from '../../../../helpers/role';
import { PageNames, Utility } from '../../../../helpers/Utility';
import { DataTableService } from 'src/app/services/data-table.service';

@Component({
    selector: 'users-tab',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, DoCheck, OnDestroy {
    type: string;
    allUsersChecked: any;
    markedUsers: boolean;
    users: any = [];
    private usersBk: any = [];
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-md', ignoreBackdropClick: true };
    modalRef: BsModalRef;
    totalPortions: number;
    userColumns: any;
    checkForUserSelected: boolean;
    subscription: Subscription;
    scrollEventSubscription: Subscription;
    private _isUserLocked: boolean;
    private _isUserUnlocked: boolean;
    private selectedUsersQty: number;
    private filteredUsersQty: number;
    private currentPop: any;

    @ViewChild('usersGrid', { static: true }) usersGrid: DataTableComponent;
    @Input() searchQuery: string;
    setDataTableHeight: string;
    isRequestCompleted: boolean;
    constructor(private modalService: BsModalService,
        private userService: UserService,
        private toastr: ToastrService,
        private adminPanelService: AdminPanelService,
        private dataTableService: DataTableService) {
        this.isRequestCompleted = false;
    }

    loadUsers() {
        this.isRequestCompleted = false;
        this.userService.getAll().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to load users: ' + response.response.message, 'Error');
                this.isRequestCompleted = true;
            } else {
                this.markedUsers = this.allUsersChecked = false;
                this.users = response.response.users;
                this.users = Utility.sortByLastModifiedDateInDescOrder(this.users);
                this.users.forEach((user: any) => {
                    user.selected = false;
                    // user.role = this.transformRoles(user.roles);
                    // set user role
                    if (user.userProfile) {
                        user.roleName = user.userProfile.name;
                    } else {
                        user.roleName = '';
                    }
                    // set hierarchy
                    if (user.hierarchy) {
                        // tslint:disable-next-line: triple-equals
                        user.hierarchyName = (user.hierarchy.name == 'parent') ? 'System' : user.hierarchy.name;
                    } else {
                        user.hierarchyName = '';
                    }
                });
                this.usersBk = this.users;
                this.onChangeFilter(this.type);
                this.isRequestCompleted = true;
            }
        }, () => {
            this.isRequestCompleted = true;
        });
    }

    onChangeFilter(data: string): void {
        switch (data) {
            case 'all':
                this.users = this.usersBk;
                break;
            case 'locked':
                this.users = this.usersBk.filter(user => user.locked);
                break;
            case 'unlocked':
                this.users = this.usersBk.filter(user => !user.locked);
                break;
        }
    }

    transformRoles(items: any) {
        if (items.includes(Role[1])) {
            return 'ADMIN';
        }
        if (items.includes(Role[2])) {
            return 'USER';
        }
    }

    ngOnInit() {
        this.setDataTableHeight = Utility.getDataTableHeight(PageNames.Users);
        this.markedUsers = this.allUsersChecked = false;
        this.selectedUsersQty = this.filteredUsersQty = 0;
        this.type = 'all';
        this.initGridProperties();
        this.loadUsers();
        this.getWidthPortions();
        this.adminPanelService.createdUser.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
            this.loadUsers();
        });

        if (localStorage.getItem('newUser')) {
            localStorage.removeItem('newUser');
            this.createUser();
        }

        this.adminPanelService.cancelForm.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
        });
        //listen for data table scroll event
        this.scrollEventSubscription = this.dataTableService.scrollEvent.subscribe(() => {
            if (this.currentPop) {
                this.currentPop.hide();
            }
        });

    }

    ngDoCheck(): void {
        // tslint:disable-next-line: triple-equals
        this.checkForUserSelected = this.users.some(e => e.selected == true);
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    getWidthPortions() {
        this.totalPortions = 0;
        this.userColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    createUser() {
        let object: any;
        object = NewUserComponent;
        this.modalRef = this.modalService.show(object, this.modalConfig);
    }

    editUser(user: any) {
        this.adminPanelService.setUser(user);
        let object: any;
        object = EditUserComponent;
        this.modalRef = this.modalService.show(object, this.modalConfig);
    }

    isUserLockedController(): void {
        this._isUserLocked = false;
        let counter = 0;
        this.users.forEach((user: any) => {
            if (!user.locked) {
                counter++;
            }
        });
        if (counter > 0) {
            this._isUserLocked = true;
        }
    }

    isUserUnlockedController(): void {
        this._isUserUnlocked = false;
        let counter = 0;
        this.users.forEach((user: any) => {
            if (user.locked) {
                counter++;
            }
        });
        if (counter > 0) {
            this._isUserUnlocked = true;
        }
    }

    /**
     * check for whether all selected users contains locked or not
     * @returns boolean
     */
    checkIfUserLockedStatus(): boolean {
        return (this._isUserLocked) ? true : false;
    }

    checkIfUserUnlockedStatus(): boolean {
        return (this._isUserUnlocked) ? true : false;
    }

    lockOrUnlockSelectedUser(type: string): void {
        // tslint:disable-next-line: max-line-length
        const selectedUsers = this.users.filter(user => (this.searchQuery == '') ? user.selected == true : user.selected == true && user.filtered == true);
        selectedUsers.forEach((user: any) => {
            if (user.selected) {
                this.lockOrUnlockUser(user, type);
            }
        });
    }

    lockOrUnlockUser(user: any, type: string): void {
        if (type === '') {
            // tslint:disable-next-line: triple-equals
            type = (user.locked == true) ? 'Lock' : 'Unlock';
        }

        if (type === 'Lock') {
            if (!user.locked) {
                this.allUsersChecked = this.markedUsers = false;
                this.users.forEach((e: any) => {
                    if (user.id == e.id) {
                        e.selected = false;
                    }
                });
                this.onChangeFilter(this.type);
                this.toastr.error(user.name + ' is already unlocked', 'Error');
            } else {
                this.userService.unlockUser(user.id).subscribe((response: any) => {
                    if (!response.success) {
                        this.allUsersChecked = this.markedUsers = false;
                        this.toastr.error('Error trying to unlock user: ' + response.message, 'Error');
                    } else {
                        this.toastr.success(response.message, 'Success');
                        this.loadUsers();
                    }
                });
            }
        } else {
            if (user.locked) {
                this.allUsersChecked = this.markedUsers = false;
                this.users.forEach((e: any) => {
                    if (user.id == e.id) {
                        e.selected = false;
                    }
                });
                this.toastr.error(user.name + ' is already locked', 'Error');
            } else {
                this.userService.lockUser(user.id).subscribe((response: any) => {
                    if (!response.success) {
                        this.allUsersChecked = this.markedUsers = false;
                        this.toastr.error('Error trying to lock user: ' + response.message, 'Error');
                    } else {
                        this.toastr.success(response.message, 'Success');
                        this.loadUsers();
                    }
                });
            }
        }
    }

    deleteUser(user: any) {
        this.userService.deleteUser(user.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to delete user: ' + response.response.message, 'Error');
            } else {
                this.toastr.success('User deleted succesfully', 'Success');
                this.loadUsers();
            }
        });
    }

    resetPassword(userId: string) {
        this.userService.resetPassword(userId).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error while password reset: ' + response.message, 'Error');
            } else {
                this.toastr.success(response.message, 'Success');
            }
        });
    }

    initGridProperties() {
        this.userColumns = [
            { field: '_', header: '', width: 5, suppressHide: true, suppressSort: true },
            { field: '_', header: '', width: 3, suppressHide: true, suppressSort: true },
            { field: 'name', header: 'Name', width: 25, suppressHide: true },
            { field: 'email', header: 'Email', width: 25, suppressHide: true },
            { field: 'roleName', header: 'Role', width: 25, suppressHide: true },
            { field: 'hierarchyName', header: 'Hierarchy', width: 25, suppressHide: true },
            { field: '_', header: '', width: 25, suppressHide: true, suppressSort: true }
        ];
    }

    checkIfAllUsersSelected(): void {
        this.updateFilteredUsersCounter();
        this.updateSelectedUsersCounter();

        // tslint:disable-next-line: triple-equals
        if (this.selectedUsersQty == this.filteredUsersQty && this.filteredUsersQty > 0) {
            this.allUsersChecked = true;
        } else {
            this.allUsersChecked = false;
        }
        if (this.users.length > 0) {
            // tslint:disable-next-line: triple-equals
            this.allUsersChecked = this.users.every((item: any) => item.selected == true);
        } else {
            this.allUsersChecked = this.markedUsers = false;
        }
    }

    toggleVisibility(e?: any) {
        this.markedUsers = true;
        for (var i = 0; i < this.users.length; i++) {
            if (!this.users[i].selected) {
                this.markedUsers = false;
                break;
            }
        }
    }

    selectAllUsers() {
        this.users.forEach((user: any) => {
            user.selected = this.allUsersChecked;
            if (user.filtered) {
                user.selected = this.allUsersChecked;
            }
        });
        this.updateFilteredUsersCounter();
        this.updateSelectedUsersCounter();
    }

    updateFilteredUsersCounter() {
        this.filteredUsersQty = 0;
        this.users.forEach((phoneList: any) => {
            if (phoneList.filtered) {
                this.filteredUsersQty++;
            }
        });
    }

    updateSelectedUsersCounter() {
        this.selectedUsersQty = 0;
        this.users.forEach((user: any) => {
            if (user.selected) {
                this.selectedUsersQty++;
            }
        });
    }

    closeOldPop(popover: any) {
        if (this.currentPop && this.currentPop !== popover) {
            this.currentPop.hide();
        }
        this.currentPop = popover;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.scrollEventSubscription) {
            this.scrollEventSubscription.unsubscribe();
        }
    }
}
