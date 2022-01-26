import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PhoneListService } from 'src/app/services/phone-list.service';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { UserListService } from 'src/app/services/user-list.service';

@Component({
    selector: 'app-associated-phones',
    templateUrl: './associated-phones.component.html',
    styleUrls: ['./associated-phones.component.css']
})
export class AssociatedPhonesComponent implements OnInit {
    private totalPortions: number;
    projectLists: any = [];
    currentProject: any;
    currentList: any;
    selectedRow: string;
    phoneColumns: any = [];
    callServerColumns: any = [];
    listColumns: any = [];
    displayDetails: boolean = false;
    displayServerDetails: boolean = false;
    isRequestCompleted: boolean;
    phoneListRequestCompleted: boolean;
    displayUserDetails: boolean = false;
    userColumns: any = [];
    constructor(
        private phoneListService: PhoneListService,
        private projectService: ProjectViewService,
        private userListService: UserListService,
        private toastr: ToastrService) {
        this.isRequestCompleted = false;
        this.phoneListRequestCompleted = false;
    }

    ngOnInit() {
        this.currentProject = this.projectService.getProject();
        this.selectedRow = null;
        this.currentList = { phones: [] };
        this.projectService.fetchProjectPhoneList(this.currentProject.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error loading phone List for project', 'Error');
                this.phoneListRequestCompleted = true;
            } else {
                let resourcesList = [];
                if (response.response.phoneLists) {
                    resourcesList = resourcesList.concat(response.response.phoneLists);
                }
                if (response.response.deviceUserLists) {
                    resourcesList = resourcesList.concat(response.response.deviceUserLists);
                }
                if (response.response.callServerLists) {
                    resourcesList = resourcesList.concat(response.response.callServerLists);
                }
                this.projectLists = resourcesList;
                if (this.projectLists.length > 0) {
                    this.setActiveStatus(false);
                    this.setCurrentList(this.projectLists[0]);
                }
                this.phoneListRequestCompleted = true;
            }
        }, () => {
            this.phoneListRequestCompleted = true;
        });
        this.initGridProperties();
        this.getWidthPortions();
    }

    setCurrentList(list: any) {
        this.currentList = { phones: [], servers: [], users: [] };
        this.setActiveStatus(false);
        if (list && list.callServerDto) {
            this.displayDetails = false;
            this.displayUserDetails = false;
            this.displayServerDetails = true;
            this.setCallServerList(list);
        } else if (list && list.phonePoolDto) {
            this.displayDetails = true;
            this.displayServerDetails = false;
            this.displayUserDetails = false;
            this.setPhoneList(list);
        } else if (list && list.deviceUserListDto) {
            this.displayDetails = false;
            this.displayServerDetails = false;
            this.displayUserDetails = true;
            this.setUserList(list);
        }
        list.active = true;
    }

    setCallServerList(list: any) {
        this.isRequestCompleted = false;
        this.currentList.name = list.callServerDto.name;
        this.currentList.servers = [list.callServerDto];
        this.isRequestCompleted = true;
    }

    setPhoneList(list: any) {
        this.isRequestCompleted = false;
        this.phoneListService.getPhoneListById(list.phonePoolDto.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error loading phone List for project', 'Error');
                this.isRequestCompleted = true;
            } else {
                this.currentList.name = response.response.phonePool.name;
                this.currentList.phones = response.response.phonePool.phones;
                this.isRequestCompleted = true;
            }
        }, () => {
            this.isRequestCompleted = true;
        });
    }

    setUserList(list: any) {
        this.isRequestCompleted = false;
        this.userListService.getUserListById(list.deviceUserListDto.id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error loading user List for project', 'Error');
                this.isRequestCompleted = true;
            } else {
                this.currentList.name = response.response.deviceUserList.name;
                this.currentList.users = response.response.deviceUserList.users;
                this.isRequestCompleted = true;
            }
        }, () => {
            this.isRequestCompleted = true;
        });
    }
    setActiveStatus(status: boolean) {
        this.projectLists.forEach((list: any) => {
            list.active = status;
        });
    }

    getColor(state: string) {
        if (state) {
            switch (state.toLowerCase()) {
                case 'available':
                    return '#0E8B18';
                case 'offline':
                    return '#CB3333';
            }
        }
    }

    closeModal() {
        this.projectService.cancelEdit.emit();
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    getWidthPortions() {
        this.totalPortions = 0;
        this.phoneColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    initGridProperties() {
        this.phoneColumns = [
            { field: 'name', header: 'Name', width: 15 },
            { field: 'mac', header: 'MAC', width: 15 },
            { field: 'ipAddress', header: 'IP Address', width: 15 },
            { field: 'user', header: 'User', width: 15 },
            { field: 'extension', header: 'Extension', width: 10 },
            { field: 'primaryDid', header: 'DID', width: 10 },
            { field: 'vendor', header: 'Vendor', width: 10 },
            { field: 'phoneState', header: 'State', width: 10 },
        ];

        this.listColumns = [
            { field: 'tagName', header: 'Variable Name', width: 50, suppressHide: true, suppressSort: true },
            { field: 'name', header: 'Resource List Name', width: 50, suppressHide: true, suppressSort: true }
        ];

        this.callServerColumns = [
            { field: 'name', header: 'Name', width: 25 },
            { field: 'vendor', header: 'Vendor', width: 25 },
            { field: 'model', header: 'Model', width: 25 },
            { field: 'ipAddress', header: 'IP Address', width: 25 },
        ];

        this.userColumns = [
            { field: 'userName', header: 'User Name', width: 25, suppressHide: true },
            { field: 'email', header: 'Email', width: 30, suppressHide: true },
            { field: 'did', header: 'DID', width: 25, suppressHide: true },
        ]
    }

}
