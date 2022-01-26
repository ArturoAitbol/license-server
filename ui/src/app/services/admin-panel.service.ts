import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AdminPanelService {
    createNewUser: EventEmitter<any>;
    createdUser: EventEmitter<any>;
    userFromDashboard: EventEmitter<any>;
    changeView: EventEmitter<any>;
    editedUser: EventEmitter<any>;
    cancelForm: EventEmitter<any>;
    searchField: EventEmitter<any>;
    private selectedUser: any;
    private userRole: any;
    enableSearch: boolean = false;

    constructor() {
        this.createNewUser = new EventEmitter<any>();
        this.createdUser = new EventEmitter<any>();
        this.userFromDashboard = new EventEmitter<any>();
        this.changeView = new EventEmitter<any>();
        this.editedUser = new EventEmitter<any>();
        this.cancelForm = new EventEmitter<any>();
        this.searchField = new EventEmitter<any>();
    }

    /**
     * set selected user details
     * @param value: any
     */
    setUser(value: any) {
        this.selectedUser = value;
    }

    /**
     * get selected use details
     */
    getUser() {
        return this.selectedUser;
    }

    setEnableSearch(checkFlag: boolean) {

        this.enableSearch = checkFlag;
    }
    getEnableSearch() {
        return this.enableSearch;
    }
    /**
     * set selected user profile role
     * @param role: any
     */
    setUserProfile(role: any) {
        this.userRole = role;
    }

    /**
     * get selected user profile role
     */
    getUserProfile(): any {
        return this.userRole;
    }
}
