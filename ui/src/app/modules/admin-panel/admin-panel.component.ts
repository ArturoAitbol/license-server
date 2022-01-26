import { Component, OnInit } from '@angular/core';
import { AdminPanelService } from 'src/app/services/admin-panel.service';
import { Role } from 'src/app/helpers/role';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
    availableTabs: any = [
        { id: 'servers', name: 'Call Servers', active: true, enableSearch: true },
        { id: 'relays', name: 'Relays', active: false, enableSearch: true },
        { id: 'users', name: 'Users', active: false, enableSearch: true },
        { id: 'userProfile', name: 'Role Management', active: false, enableSearch: false },
        { id: 'license', name: 'tekToken', active: false, enableSearch: false },
        { id: 'preferences', name: 'Preferences', active: false, enableSearch: false },
        { id: 'logs', name: 'Logs', active: false, enableSearch: false },
        { id: 'upload file', name:'Upload Files' , active:false , enableSearch: true }
    ];
    searchBar: boolean;
    searchQuery: string;
    _roleIsUser: boolean;
    tabs: any = [];

    constructor(private adminPanelService: AdminPanelService,
    ) {
    }

    ngOnInit() {
        // tslint:disable-next-line: triple-equals
        this.searchBar = this.availableTabs.some(e => e.enableSearch == true && e.active == true);
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        // tslint:disable-next-line: max-line-length
        if (currentPermissions.includes(Role[2]) && (currentPermissions.includes(Role[3]) || currentPermissions.includes(Role[4]) || currentPermissions.includes(Role[5]))) {
            const _enableSettingTab = currentPermissions.includes(Role[3]) || currentPermissions.includes(Role[4]);
            const _enableLicenseTab = currentPermissions.includes(Role[5]);
            this._roleIsUser = true;
            this.availableTabs.forEach(e => {
                // tslint:disable-next-line: triple-equals
                if (_enableLicenseTab && e.id == 'license') {
                    this.tabs.push(e);
                }
                // tslint:disable-next-line: triple-equals
                if (_enableSettingTab && e.id == 'preferences') {
                    this.tabs.push(e);
                }
            });
            this.tabs[0]['active'] = true;
            this.adminPanelService.changeView.subscribe((response: any) => {
                this.changeView(response);
            });
        } else {
            this.tabs = this.availableTabs;
            this._roleIsUser = false;
        }
        this.adminPanelService.searchField.subscribe(() => {
            this.showSearchBar(this.adminPanelService.getEnableSearch());
            // this.availableTabs.forEach(element => {
            //     if (element.id == 'license' && element.active) {
            //         element.enableSearch = this.adminPanelService.getEnableSearch();
            //     }
            // });
        });
    }
    changeView(option: string) {
        this.searchQuery = '';
        this.availableTabs.forEach((tab: any) => {
            if (tab.id === option) {
                tab.active = true;
            } else {
                tab.active = false;
            }
        });
    }

    showSearchBar(canSearch: boolean) {
        this.searchBar = canSearch;
    }
}
