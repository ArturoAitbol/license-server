import { Component, OnDestroy, OnInit } from '@angular/core';
import { AddPhoneComponent } from './phone-inventory/phone-operations/add-phone/add-phone.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PhoneList } from 'src/app/model/phone-list';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { PhoneListService } from 'src/app/services/phone-list.service';
import { ToastrService } from 'ngx-toastr';
import { ImportPhonesComponent } from './phone-inventory/import-phones/import-phones.component';
import { LicenseService } from 'src/app/services/license-service.service';
import { Utility } from '../../helpers/Utility';
import { Role } from '../../helpers/role';
import { CreateUserComponent } from './user-inventory/user-operations/create-user/create-user.component';
import { UserList } from 'src/app/model/user-list';
import { UserListService } from 'src/app/services/user-list.service';

@Component({
    selector: 'app-phone-list',
    templateUrl: './phone-configuration.component.html',
    styleUrls: ['./phone-configuration.component.css']
})
export class PhoneConfigurationComponent implements OnInit, OnDestroy {
    modalRef: BsModalRef;
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-lg', ignoreBackdropClick: true };
    phoneInventory: boolean = true;
    phonesList: boolean = false;
    createList: boolean = false;
    phoneList: PhoneList = new PhoneList();
    addToPhoneList: boolean = false;
    editPhoneList: boolean = false;
    phonesAtInventoryByList: string = '';
    phoneConfigFilter: string = 'All';
    phoneListFilter: string = 'All';
    phoneLocationFilter: string = 'Location';
    searchQuery: string = '';
    license: any;
    enabledPhoneOps: boolean = true;
    initalPhoneListCount: number;
    initalPhoneListDescription: string;
    initialPhoneListName: string;
    availableModules: any;
    // user & user list
    usersInventory: boolean = false;
    usersList: boolean = false;
    createUserList: boolean = false;
    addToUserList: boolean = false;
    editUserList: boolean = false;
    usersAtInventoryByList: string = '';
    listType: string;
    userList: UserList = new UserList();
    initalUserListCount: number;
    initalUserListDescription: string;
    initialUserListName: string;
    disableUpdateButton: boolean = true;
    constructor(private modalService: BsModalService,
        private phoneConfigurationService: PhoneConfigurationService,
        private phoneListService: PhoneListService,
        private toastr: ToastrService,
        private licenseService: LicenseService,
        private userListService: UserListService) {
    }

    loadLicenseInfo(): void {
        this.licenseService.getLicenses().subscribe((response: any) => {
            this.availableModules = response.response.availableModules;
            // this.license = response.response.licenseInfo;

            // tslint:disable-next-line:triple-equals
            if (this.availableModules.includes('Cisco') && this.availableModules.length == 1) {
                this.enabledPhoneOps = false;
            }
        });
    }

    ngOnInit() {
        this.loadLicenseInfo();
        this.phoneConfigurationService.phoneCreated.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
        });

        this.phoneConfigurationService.hideModal.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
        });

        this.phoneConfigurationService.addPhoneToList.subscribe((response: any) => {
            this.addToList(response);
        });

        this.phoneConfigurationService.removeFromPhoneList.subscribe((response: any) => {
            this.removeFromList(response);
        });

        this.phoneConfigurationService.createPhoneList.subscribe((response: any) => {
            this.openNewListBar('phoneList');
        });
        // listen for phone/user inventory data status
        this.phoneConfigurationService.inventoryData.subscribe((res: { hasData: boolean }) => {
            this.disableUpdateButton = !res.hasData;
        });
        this.phoneConfigurationService.editPhoneList.subscribe((response: any) => {
            const existingPhoneList: PhoneList = this.phoneListService.getList();
            if (this.phoneList == null) {
                this.phoneList = new PhoneList();
            }
            this.phoneList.id = existingPhoneList.id;
            this.phoneList.name = this.initialPhoneListName = existingPhoneList.name;
            this.initalPhoneListDescription = this.phoneList.description = existingPhoneList.description;
            this.initalPhoneListCount = (existingPhoneList.phones) ? existingPhoneList.phones.length : 0;
            this.phoneList.phones = [];
            this.editPhoneList = true;
            this.openEditListBar('phoneList');
        });

        this.phoneConfigurationService.phonesAtInventoryByList.subscribe((id: any) => {
            this.phonesAtInventoryByList = id;
            this.phoneInventory = true;
            this.phonesList = false;
            this.searchQuery = '';
        });

        this.phoneConfigurationService.createPhoneListFromModal.subscribe((response: any) => {
            this.searchQuery = '';
            if (this.phoneList) {
                this.phoneList.phones = response;
            }
            this.openNewListBar('phoneList');
        });
        this.phoneConfigurationService.createUserListFromModal.subscribe((response: any) => {
            this.searchQuery = '';
            if (this.userList) {
                this.userList.users = response;
            }
            this.openNewListBar('userList');
        });
        // listen for selected user to add from the list
        this.phoneConfigurationService.addUserToList.subscribe((response: any) => {
            this.addUsersToUserList(response);
        });
        // listen for selected uesr to remove from the list
        this.phoneConfigurationService.removeUserFromList.subscribe((response: any) => {
            this.removeUserFromUserList(response);
        });
        // listen for edit user list
        this.phoneConfigurationService.editUserList.subscribe(() => {
            const existingUserList: UserList = this.userListService.getList();
            if (this.userList == null) {
                this.userList = new UserList();
            }
            this.userList.id = existingUserList.id;
            this.userList.name = this.initialUserListName = existingUserList.name;
            this.initalUserListDescription = this.userList.description = existingUserList.description;
            this.initalUserListCount = (existingUserList.users) ? existingUserList.users.length : 0;
            this.userList.users = [];
            this.openEditListBar('userList');
        });
    }

    addToList(phone: any): void {
        if (this.phoneList) {
            const index = this.phoneList.phones.indexOf(phone, 0);
            if (index < 0) {
                this.phoneList.phones.push(phone);
            }
        }
    }

    addUsersToUserList(user: any): void {
        if (this.userList) {
            const index = this.userList.users.indexOf(user, 0);
            if (index == -1) {
                this.userList.users.push(user);
            }
        }
    }
    removeFromList(phone: any): void {
        if (this.phoneList) {
            this.phoneList.phones.forEach((existingPhone: any, index) => {
                // tslint:disable-next-line:triple-equals
                if (existingPhone.id == phone.id) {
                    this.phoneList.phones.splice(index, 1);
                    this.initalPhoneListCount = -1;
                }
            });
        }
    }

    removeUserFromUserList(user: any): void {
        if (this.userList) {
            this.userList.users.forEach((existingPhone: any, index) => {
                // tslint:disable-next-line:triple-equals
                if (existingPhone.id == user.id) {
                    this.userList.users.splice(index, 1);
                    this.initalUserListCount = -1;
                }
            });
        }
    }

    updateQuery(event: any) {
        // tslint:disable-next-line: triple-equals
        if (this.searchQuery == 'New' && (event == 'hierarchy' || event == '')) {
            this.searchQuery = '';
            // tslint:disable-next-line: triple-equals
        } else if (this.searchQuery != '' && this.searchQuery != 'New' && event != 'hierarchy') {
            this.searchQuery = event;
        } else if (this.searchQuery == '' && event == 'New') {
            this.searchQuery = event;
        }
    }

    createNewPhone() {
        if (Utility.userEnabled(Role[2])) {
            this.modalRef = this.modalService.show(AddPhoneComponent, this.modalConfig);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    importPhones() {
        this.modalRef = this.modalService.show(ImportPhonesComponent, {
            backdrop: true,
            class: 'modal-dialog-centered modal-md',
            ignoreBackdropClick: true
        });
    }
    /**
     * create pool list
     */
    createPoolList() {
        if (this.listType === 'phoneList') {
            if (this.phoneList) {
                this.phoneList.phones.forEach(e => {
                    // tslint:disable-next-line:triple-equals
                    if (e.newPhone == 'Old') {
                        e.newPhone = false;
                        // tslint:disable-next-line:triple-equals
                    } else if (e.newPhone == 'New') {
                        e.newPhone = true;
                    }
                });
            }
            this.phoneListService.createPhoneList(this.phoneList).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Phone List couldn\'t be created: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success('Phone list created successfully', 'Success');
                    this.phoneList.id = response.response.id;
                    this.phoneInventory = false;
                    this.phonesList = true;
                    this.closeSideBar();
                }
            });
        } else if (this.listType === 'userList') {
            this.userListService.createUsersList(this.userList).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('User List couldn\'t be created: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success('User list created successfully', 'Success');
                    this.userList.id = response.response.id;
                    this.usersInventory = false;
                    this.usersList = true;
                    this.closeSideBar();
                }
            });
        }
    }
    /**
     * update pool list
     */
    updatePoolList() {
        if (this.listType === 'phoneList') {
            if (this.phoneList) {
                this.phoneList.phones.forEach(e => {
                    // tslint:disable-next-line:triple-equals
                    if (e.newPhone == 'Old') {
                        e.newPhone = false;
                        // tslint:disable-next-line:triple-equals
                    } else if (e.newPhone == 'New') {
                        e.newPhone = true;
                    }
                });
            }
            this.phoneListService.updatePhoneList(this.phoneList).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Phone List couldn\'t be updated: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success('Phone List updated successfully', 'Success');
                    this.closeSideBar();
                    this.phoneInventory = false;
                    this.phonesList = true;
                }
            });
        } else if (this.listType === 'userList') {
            this.userListService.updateUsersList(this.userList).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('User List couldn\'t be updated: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success('User list updated successfully', 'Success');
                    this.userList.id = response.response.id;
                    this.usersInventory = false;
                    this.usersList = true;
                    this.closeSideBar();
                }
            });
        }
    }

    /**
     * check for phone list
     */
    checkForPhoneListChanges(): boolean {
        if (this.initalPhoneListCount !== this.phoneList.phones.length ||
            this.initalPhoneListDescription !== this.phoneList.description ||
            this.initialPhoneListName !== this.phoneList.name) {
            return false;
        }
        return true;
    }
    /**
     * check for user list
     */
    checkForUserListChanges(): boolean {
        if (this.initalUserListCount !== this.userList.users.length ||
            this.initalUserListDescription !== this.userList.description ||
            this.initialUserListName !== this.userList.name) {
            return false;
        }
        return true;
    }
    checkForListChanges(): boolean {
        if (this.listType === 'phoneList') {
            return this.checkForPhoneListChanges();
        } else if (this.listType === 'userList') {
            return this.checkForUserListChanges();
        }
    }
    openNewListBar(key: string) {
        if (Utility.userEnabled(Role[2])) {
            switch (key) {
                case 'phoneList':
                    this.listType = 'phoneList';
                    this.createList = !this.createList;
                    this.phoneInventory = true;
                    this.addToPhoneList = true;
                    this.phonesList = false;
                    this.phonesAtInventoryByList = '';
                    break;
                case 'userList':
                    this.listType = 'userList';
                    this.createUserList = !this.createUserList;
                    this.phoneInventory = false;
                    this.addToPhoneList = false;
                    this.usersInventory = true;
                    this.usersList = false;
                    this.phonesList = false;
                    this.addToUserList = true;
                    this.editUserList = false;
                    this.usersAtInventoryByList = '';
                    break;
            }
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    openEditListBar(key: string) {
        if (Utility.userEnabled(Role[2])) {
            switch (key) {
                case 'phoneList':
                    this.listType = 'phoneList';
                    this.createList = !this.createList;
                    this.phoneInventory = true;
                    this.editPhoneList = true;
                    this.phonesList = false;
                    this.phonesAtInventoryByList = '';
                    break;
                case 'userList':
                    this.listType = 'userList';
                    this.createUserList = !this.createUserList;
                    this.usersInventory = true;
                    this.editUserList = true;
                    this.usersList = false;
                    this.usersAtInventoryByList = '';
                    break;
            }
            // this.createList = !this.createList;
            // this.phoneInventory = true;
            // this.editPhoneList = true;
            // this.phonesAtInventoryByList = '';

            // this.addToPhoneList = false;
            // this.editPhoneList = false;
            // this.phoneInventory = false;
            // this.addToUserList = false;
            // this.editUserList = true;

        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    closeSideBar() {
        // Phone list
        this.createList = false;
        this.editPhoneList = false;
        this.phoneList = new PhoneList();
        this.addToPhoneList = false;
        // User list
        this.createUserList = false;
        this.addToUserList = false;
        this.editUserList = false;
        this.userList = new UserList();
        this.phoneConfigurationService.closedBar.emit();
    }

    changeView(selected: string) {
        this.searchQuery = '';
        // if (selected === 'inventory') {
        //     this.phonesAtInventoryByList = '';
        //     this.phoneInventory = true;
        // } else {
        //     this.phoneInventory = false;
        // }
        switch (selected) {
            case 'inventory':
                this.phonesAtInventoryByList = '';
                this.phoneInventory = true;
                this.usersInventory = false;
                this.phonesList = false;
                this.usersList = false;
                break;
            case 'list':
                this.phoneInventory = false;
                this.phonesList = true;
                this.usersInventory = false;
                this.usersList = false;
                break;
            case 'user':
                this.phoneInventory = false;
                this.phonesList = false;
                this.usersInventory = true;
                this.usersList = false;
                break;
            case 'usersList':
                this.phoneInventory = false;
                this.phonesList = false;
                this.usersInventory = false;
                this.usersList = true;
                break;
            default:
                break;
        }
        this.closeSideBar();
    }

    changePhoneConfigFilter(filter: string) {
        this.phoneConfigFilter = filter;
    }

    changePhoneListFilter(filter: string) {
        this.phoneListFilter = filter;
    }

    changePhoneLocationFilter(filter: string) {
        this.phoneLocationFilter = filter;
    }

    userEnabled(role: string) {
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        if (currentPermissions.includes(role) || currentPermissions.includes(Role[1])) {
            return true;
        }
        return false;
    }
    /**
     * create user
     */
    createUser(): void {
        if (Utility.userEnabled(Role[2])) {
            this.modalRef = this.modalService.show(CreateUserComponent, this.modalConfig);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    create
    ngOnDestroy() {
        this.phoneList = null;
    }
}
