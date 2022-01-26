import {Component, OnInit} from '@angular/core';
import {AdminPanelService} from 'src/app/services/admin-panel.service';
import {UserService} from 'src/app/services/user.service';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';

@Component({
    selector: 'dashboard-tab',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    userColumns: any;
    availableUsers: any;
    dbColumns: any;
    availableDbs: any;
    linkColumns: any;
    availableLinks: any;
    private totalPortions: number;
    private userPortions: number;

    constructor(private adminPanelService: AdminPanelService,
                private userService: UserService,
                private toastr: ToastrService,
                private router: Router) {
    }

    loadUsers() {
        this.userService.getAll().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to load users: ' + response.response.message, 'Error');
            } else {
                this.availableUsers = response.response.users;
            }
        });
    }

    ngOnInit() {
        this.loadUsers();
        this.initGridProperties();
        this.getUserWidthPortions();
    }

    newUser() {
        localStorage.setItem('newUser', 'true');
        this.adminPanelService.changeView.emit('users');
    }

    updateLicense() {
        localStorage.setItem('updateLicense', 'true');
        this.adminPanelService.changeView.emit('license');
    }

    initGridProperties() {
        this.userColumns = [
            {field: 'name', header: 'Name', width: 33, suppressHide: true},
            {field: 'email', header: 'Email', width: 33, suppressHide: true},
            {field: 'role', header: 'Role', width: 33, suppressHide: true},
        ];
        this.dbColumns = [
            {field: 'server', header: 'Server', width: 12.5, suppressHide: true},
            {field: 'hostname', header: 'Hostname', width: 12.5, suppressHide: true},
            {field: 'ipaddress', header: 'IP Address', width: 12.5, suppressHide: true},
            {field: 'directory', header: 'Directory', width: 12.5, suppressHide: true},
            {field: 'username', header: 'Password', width: 12.5, suppressHide: true},
            {field: 'connectivity', header: 'Connectivity', width: 12.5, suppressHide: true},
            {field: '_', header: '', width: 12.5, suppressHide: true}
        ];
        this.linkColumns = [
            {field: 'name', header: 'Name', width: 15, suppressHide: true},
            {field: 'site', header: 'Site', width: 15, suppressHide: true},
            {field: 'license', header: 'License', width: 15, suppressHide: true},
            {field: 'version', header: 'Version', width: 10, suppressHide: true},
            {field: 'registered', header: 'Registered', width: 10, suppressHide: true},
            {field: 'status', header: 'Status', width: 15, suppressHide: true},
            {field: '_', header: '', width: 20, suppressHide: true}
        ];
    }

    getUserWidthPortions() {
        this.userPortions = 0;
        this.userColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.userPortions += column.width;
            }
        });
    }

    getUsersColumnWidth(column: any) {
        return (column.width * 100 / this.userPortions) + '%';
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.userPortions) + "%";
    }
}
