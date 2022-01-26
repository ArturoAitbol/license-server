import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PhoneConfigurationService {
    private selectedPhone: any;
    private phonesForTemplate: any[];
    createNewPhone: EventEmitter<any>;
    phoneCreated: EventEmitter<any>;
    createPhoneList: EventEmitter<any>;
    editPhoneList: EventEmitter<any>;
    editNotifier: EventEmitter<any>;
    createPhoneListFromModal: EventEmitter<any>;
    addPhoneToList: EventEmitter<any>;
    removeFromPhoneList: EventEmitter<any>;
    phoneListCreated: EventEmitter<any>;
    closedBar: EventEmitter<any>;
    hideModal: EventEmitter<any>;
    phoneOperationsHide: EventEmitter<any>;
    hideConfModal: EventEmitter<any>;
    viewType: boolean;
    onChangeEventColor: EventEmitter<any>;
    phonesAtInventoryByList: EventEmitter<any>;
    userCreated: EventEmitter<any>;
    editUser: EventEmitter<any>;
    closeEditUserModal: EventEmitter<any>;
    editUserList: EventEmitter<any>;
    addUserToList: EventEmitter<any>;
    removeUserFromList: EventEmitter<any>;
    createUserListFromModal: EventEmitter<any>;
    inventoryData: EventEmitter<any>;
    constructor() {
        this.createNewPhone = new EventEmitter<any>();
        this.phoneCreated = new EventEmitter<any>();
        this.closedBar = new EventEmitter<any>();
        this.hideModal = new EventEmitter<any>();
        this.hideConfModal = new EventEmitter<any>();
        this.createPhoneListFromModal = new EventEmitter<any>();
        this.createPhoneList = new EventEmitter<any>();
        this.editPhoneList = new EventEmitter<any>();
        this.editNotifier = new EventEmitter<any>();
        this.addPhoneToList = new EventEmitter<any>();
        this.removeFromPhoneList = new EventEmitter<any>();
        this.phoneListCreated = new EventEmitter<any>();
        this.phoneOperationsHide = new EventEmitter<any>();
        this.onChangeEventColor = new EventEmitter<any>();
        this.phonesAtInventoryByList = new EventEmitter<any>();
        this.userCreated = new EventEmitter<any>();
        this.editUser = new EventEmitter<any>();
        this.closeEditUserModal = new EventEmitter<any>();
        this.editUserList = new EventEmitter<any>();
        this.addUserToList = new EventEmitter<any>();
        this.removeUserFromList = new EventEmitter<any>();
        this.createUserListFromModal = new EventEmitter<any>();
        this.inventoryData = new EventEmitter<any>();
    }

    setPhone(value: any) {
        this.selectedPhone = value;
    }

    setViewType(value: boolean) {
        this.viewType = value;
    }

    getViewType() {
        return this.viewType;
    }

    getPhone() {
        return this.selectedPhone;
    }

    /**
     * set selected phones list for template
     * @param list: any[]
     */
    setPhonesListForTemplate(list: any[]): void {
        this.phonesForTemplate = list;
    }

    /**
     * get selected phones list for template
     * @returns: any[]
     */
    getPhonesListForTemplate(): any[] {
        return this.phonesForTemplate;
    }
}
