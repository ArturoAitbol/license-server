import {Component, OnInit} from '@angular/core';
import {AdminPanelService} from 'src/app/services/admin-panel.service';
import {BsModalService} from 'ngx-bootstrap';
import {UserService} from 'src/app/services/user.service';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-view-users',
    templateUrl: './view-users.component.html',
    styleUrls: ['./view-users.component.css']
})
export class ViewUsersComponent implements OnInit {

    userColumns: any = [];
    users: any = [];
    selectedProfile: any = {};
    totalPortions: number;

    constructor(private modalService: BsModalService,
                private userService: UserService,
                private toastr: ToastrService,
                private adminPanelService: AdminPanelService) {
    }

    ngOnInit() {
        this.initGridProperties();
        this.getWidthPortions();
        // get the selected user-profile
        this.selectedProfile = this.adminPanelService.getUserProfile();
        // service call to fetch the all users by profileId
        this.fetchAllUsersByProfile();
    }

    /**
     * to initialize the columns
     */
    initGridProperties() {
        this.userColumns = [
            {field: 'name', header: 'Name', width: 25, suppressHide: true},
            {field: 'email', header: 'Email', width: 25, suppressHide: true},
            {field: 'role', header: 'Role', width: 25, suppressHide: true},
            {field: 'hierarchy', header: 'Hierarchy', width: 25, suppressHide: true}
        ];
    }

    /**
     * list all the users with profileId
     */
    fetchAllUsersByProfile(): void {
        this.userService.getAllUsersByProfileId(this.selectedProfile.id).subscribe((response: any) => {
            this.users = response.response.users;
        });
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    /**
     * calculate the width portions based on columns
     */
    getWidthPortions() {
        this.totalPortions = 0;
        this.userColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    /**
     * close the modal
     */
    hideModal() {
        this.adminPanelService.cancelForm.emit();
    }
}
