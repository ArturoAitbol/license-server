import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { PhoneService } from 'src/app/services/phone.service';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { interval, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PhoneListService } from 'src/app/services/phone-list.service';
import { PhoneOptionsService } from 'src/app/services/phone-options.service';
import { PhoneTimelineComponent } from './phone-operations/phone-timeline/phone-timeline.component';
import { PhoneDetailsComponent } from './phone-operations/phone-details/phone-details.component';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { Firmware } from 'src/app/model/firmware';
import { EditPhoneComponent } from './phone-operations/edit-phone/edit-phone.component';
import { DataTableService } from 'src/app/services/data-table.service';
import { TroubleshootingComponent } from './phone-operations/troubleshooting/troubleshooting.component';
import { Router } from '@angular/router';
import { FilterService } from '../../../services/filter.service';
import { Utility, PageNames } from '../../../helpers/Utility';
import { Role } from '../../../helpers/role';
import { Hierarchy } from '../../../model/hierarchy';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from '../../../services/util.service';
import { Constants } from 'src/app/model/constant';
import { Phone } from 'src/app/model/phone';
@Component({
    selector: 'phone-inventory',
    templateUrl: './phone-inventory.component.html',
    styleUrls: ['./phone-inventory.component.css'],
    changeDetection: ChangeDetectionStrategy.Default
})

export class PhoneInventoryComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Input() addToPhoneList = false;
    @Input() editPhoneList = false;
    @Input() phonesAtInventoryByList = '';
    @Input() searchQuery: string;
    @Output() searchQueryStatusChange: any = new EventEmitter<boolean>();

    @ViewChild('phoneListGrid', { static: false }) phoneListGrid: DataTableComponent;

    private currentPop: any;
    private totalPortions: number;
    modalRef: BsModalRef;
    upgradeModal: BsModalRef;
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-md', ignoreBackdropClick: true };
    phoneInventoryColumns: any = [];
    selectedList = '---Select---';
    selectedPhoneList: any;
    selectedSubModelList: any = [];
    phones: any = [];
    newPhonesCounter: number;
    phoneLists: any = [];
    phonesBk: any = [];
    _phonesBk: any = [];
    allPhonesChecked = false;
    markedPhones = false;
    selectedPhonesBar = false;
    selectedPhonesQty = 0;
    filteredPhonesQty = 0;
    listUpdater = false;
    licensedVendores: any = [];
    auxiliarPhones: any = [];
    originallySelected: any = [];
    isMPPSelected = false;
    mppCounter = 0;
    originalData: any;
    firmwareUpgradeList: Firmware[] = [];
    firmwareColumnList: any[] = [];
    selectedPhoneFirmwareDetails: any = {};
    _isModalOpen: boolean;
    _isCisco: boolean;
    newFiltered = false;
    isPolySelected: boolean;
    polyCounter: number;
    filtering = false;
    loadingPhones = true;
    serverTime: any;
    filterCount = -1;
    hierarchyList: any = [];
    selectedHierarchy: any = undefined;
    selectedHierarchyName: string;
    parentHierarchy: any = {};
    selectedHierarchyObj: any = {};
    hierarchyBreadCrumbList: any = [];
    scrollType = 'left';
    scrollCountLeft: number;
    scrollCountRight: number;
    @ViewChild('panel', { static: false, read: ElementRef }) public panel: ElementRef<any>;
    count: number;
    private _isLinkStatusUp: boolean;
    nameListPhones: string = '';
    selectedModel: string;
    uncheckableRadioModel: string;
    _isManagedList: boolean;
    _isSideBarOpened: boolean;
    isRequestCompleted: boolean;

    // relay
    relaysList: any = [];
    selectedPhonesForRelay: any = [];
    selectedOprId: string = null;
    updatedPhones: any;
    waitingForUpdate: boolean = false;
    waitingForUpdateCounter: number;
    state: any;
    showingWaitingfForUpdatePhones: boolean = false;
    showPhonesByList: boolean = false;
    previouslySelectedPhone: boolean = false;
    existedPhoneList: any = [];
    selectedAuxiliarPhones: any = [];
    tableHeight: string;
    selectedPhonesListToMark: any = [];
    // Subscriptions
    subscription: Subscription;
    listSubscription: Subscription;
    scrollEventSubscription: Subscription;
    closedSidebarSubscription: Subscription;

    constructor(private phoneService: PhoneService,
        private phoneConfigurationService: PhoneConfigurationService,
        private modalService: BsModalService,
        private toastr: ToastrService,
        private phoneListService: PhoneListService,
        private userService: UserService,
        private phoneOptionsService: PhoneOptionsService,
        private filterService: FilterService,
        private cdRef: ChangeDetectorRef,
        private dataTableService: DataTableService,
        private router: Router,
        private utilService: UtilService) {
        this.tableHeight = Utility.getDataTableHeightByWidth(PageNames.PhoneInventory);
    }
    ngAfterViewInit() {
        if (this.editPhoneList || this.addToPhoneList) {
            this.tableHeight = '30vh';
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
            // this.scrollCountRight = this.panel.nativeElement.scrollLeft;
        } else if (this.scrollType === 'leftEnd') {
            this.panel.nativeElement.scrollLeft += 500;
            // this.scrollCountRight = this.panel.nativeElement.scrollLeft;
        } else if (this.scrollType === 'right') {
            this.panel.nativeElement.scrollLeft -= 100;
            this.scrollType = '';
            // this.scrollCountRight = this.panel.nativeElement.scrollLeft;
        } else if (this.scrollType === 'rightEnd') {
            this.panel.nativeElement.scrollLeft -= 500;
            // this.scrollCountRight = this.panel.nativeElement.scrollLeft;
        }
    }

    checkAllHidden() {
        let response = false;
        let counter = 0;
        this.phoneInventoryColumns.forEach((column: any) => {
            if (!column.hidden) {
                counter++;
            }
        });
        // tslint:disable-next-line:triple-equals
        response = counter == this.phoneInventoryColumns.length;
        return response;
    }

    /**
     * to change the view respectively
     * @param type: string
     */
    onChangeView(type: string): void {
        if (this.showingWaitingfForUpdatePhones) {
            this.waitingForUpdate = false;
            this.showingWaitingfForUpdatePhones = false;
            if (!this.showPhonesByList) {
                this.loadAllPhones(this.selectedHierarchyObj['id']);
            }
        }
        this.uncheckableRadioModel = (type === 'managed') ? 'Managed' : 'Unmanaged';
        this._isManagedList = (type === 'managed');

        if (this._isManagedList) {
            this.phones = this._phonesBk.filter((e: any) => e.callServerManaged);
        } else {
            this.phones = this._phonesBk.filter((e: any) => !e.callServerManaged || e.callServerPartiallyManaged);
        }

        // un select all phones when it is not edit list
        if (!this.editPhoneList) {
            // reset the select all
            this.allPhonesChecked = this.markedPhones = false;
            this.phones = this.phones.map(phone => {
                phone.selected = false;
                return phone;
            });
            this.selectedPhonesListToMark.forEach((e1: Phone | any) => {
                this.phones.forEach((e2: Phone | any) => {
                    if (e1.id == e2.id) {
                        e2.selected = true;
                    }
                });
            });
            // tslint:disable-next-line:triple-equals
            this.markedPhones = this.allPhonesChecked = this.phones.every((item: any) => item.selected == true);

        } else {
            this.selectedPhonesListToMark.forEach((e1: Phone | any) => {
                this.phones.forEach((e2: Phone | any) => {
                    if (e1.id == e2.id) {
                        e2.selected = true;
                    }
                });
            });
            // tslint:disable-next-line:triple-equals
            this.markedPhones = this.allPhonesChecked = this.phones.every((item: any) => item.selected == true);
        }

        this.filterData();
    }

    /**
     * load the phones
     * @param hierarchyId: string
     */
    loadAllPhones(hierarchyId?: string): void {
        // this.loadingPhones = true;
        this.isRequestCompleted = false;
        this.newPhonesCounter = 0;
        // this.phoneService.getPhones().subscribe((response: any) => {
        this.phoneService.getPhonesAndHierarchy(hierarchyId).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Couldn\'t load phones: ' + response.response.message, 'Error');
            } else {
                if (response.oprs) {
                    this.phoneOptionsService.setRelayList = response.oprs;
                    this.relaysList = response.oprs;
                }
                this._isLinkStatusUp = response.linkStatus;
                this.serverTime = response.serverTime;
                this.phones = response.response.phones;
                this.licensedVendores = response.licensedVendors;
                this.isRequestCompleted = true;
                if (response.response.parentDto) {
                    const parentDto = response.response.parentDto;
                    // check for parent type
                    if (parentDto['type'].toString().toUpperCase() !== 'ROOT' && this.count === 0) {
                        this.hierarchyBreadCrumbList = [];
                        this.hierarchyBreadCrumbList.push(parentDto);
                        this.count++;
                    }
                }
                this.phoneOptionsService.setLicenseVendoresOptions(this.licensedVendores);
                // this.phones.reverse();
                this.hierarchyList = response.response.hierarchyLevel;
                //  add key with name and type as value
                this.hierarchyList.forEach((element: any) => {
                    element.nameAndType = element.name + '[' + element.type + ']';
                });
                this.selectedHierarchyName = undefined;
                this.phones.forEach((phone: any) => {
                    if (phone.oprDto) {
                        phone.relayName = phone.oprDto.name;
                    }
                    phone.selected = false;
                    if (phone.newPhone) {
                        this.newPhonesCounter++;
                        phone.newPhone = 'New';
                    } else {
                        phone.newPhone = 'Old';
                    }
                    // Append OS and firmware if Vendor is Cisco and submodel is Webex
                    // if (phone.vendor.toString().toLowerCase() === 'cisco' &&
                    //     phone.subModel && phone.subModel.toLowerCase() === Constants.Webex.toLowerCase() &&
                    //     phone.os) {
                    //     phone.firmwareVersion = phone.os + '-' + phone.firmwareVersion;
                    // }
                });
                this.waitingForUpdateCounter = response.response.waitingForUpdate;
                // sort the phones based on last connection
                setTimeout(() => {
                    this._phonesBk = this.phones = Utility.sortListInDescendingOrder(this.phones, 'lastConnection_ts', false);
                    this.originalData = JSON.parse(JSON.stringify(this.phones));
                    this.onChangeView(this.uncheckableRadioModel.toString().toLowerCase());
                }, 100);
                // this.loadingPhones = false;
            }
            // this.loadingPhones = false;
        }, () => { this.isRequestCompleted = true; });
    }

    // load phones by List
    loadPhonesByList() {
        this.isRequestCompleted = false;
        this.showPhonesByList = true;
        this.newPhonesCounter = 0;
        this.phoneListService.getPhoneListById(this.phonesAtInventoryByList).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Couldn\'t load phones: ' + response.response.message, 'Error');
            } else {
                this._isLinkStatusUp = response.linkStatus;
                this._phonesBk = this.phones = response.response.phonePool.phones;
                this.waitingForUpdateCounter = response.response.waitingForUpdate;
                this.isRequestCompleted = true;
                this.phones.forEach((phone: any) => {
                    if (phone.oprDto) {
                        phone.relayName = phone.oprDto.name;
                    }
                    phone.selected = false;
                    if (phone.newPhone) {
                        this.newPhonesCounter++;
                        phone.newPhone = 'New';
                    } else {
                        phone.newPhone = 'Old';
                    }
                });
                this.nameListPhones = response.response.phonePool.name;
                this.onChangeView(this.uncheckableRadioModel.toString().toLowerCase());
            }
            this.loadingPhones = false;
        }, () => { this.isRequestCompleted = true; });
    }

    /**
     * load phones for editing phone pools
     * @param hierarchyId: any
     */
    loadPhonesToEdit(hierarchyId: any): void {
        const phoneList = this.phoneListService.getList();
        this.loadingPhones = true;
        this.newPhonesCounter = 0;
        this.isRequestCompleted = false;
        // this.phoneService.getPhones().subscribe((response: any) => {
        this.phoneService.getPhonesAndHierarchy(hierarchyId).subscribe((response: any) => {
            if (!response.success) {
                this.isRequestCompleted = true;
                this.toastr.error('Couldn\'t load phones: ' + response.response.message, 'Error');
                this.phoneConfigurationService.inventoryData.emit({ hasData: false });
            } else {
                this.isRequestCompleted = true;
                this.phoneConfigurationService.inventoryData.emit({ hasData: true });
                this.serverTime = response.serverTime;
                this._isLinkStatusUp = response.linkStatus;
                if (response.response.parentDto) {
                    const parentDto = response.response.parentDto;
                    // check for parent type
                    if (parentDto['type'].toString().toUpperCase() !== 'ROOT' && this.count === 0) {
                        this.hierarchyBreadCrumbList = [];
                        this.hierarchyBreadCrumbList.push(parentDto);
                        this.count++;
                    }
                }
                this.phones = response.response.phones;
                // this.phones.reverse();
                this.hierarchyList = response.response.hierarchyLevel;
                //  add key with name and type as value
                this.hierarchyList.forEach((element: any) => {
                    element.nameAndType = element.name + '[' + element.type + ']';
                });
                this.selectedHierarchyName = undefined;
                this.phones.forEach((phone: any) => {
                    if (phone.oprDto) {
                        phone.relayName = phone.oprDto.name;
                    }
                    phone.selected = false;
                    if (phone.newPhone) {
                        this.newPhonesCounter++;
                        phone.newPhone = 'New';
                    } else {
                        phone.newPhone = 'Old';
                    }
                });
                this.phones.forEach((phone: any) => {
                    phoneList.phones.forEach((existingPhone: any) => {
                        // tslint:disable-next-line:triple-equals
                        if (phone.id == existingPhone.id) {
                            phone.selected = true;
                            this.selectedForListEdition(phone);
                        }
                    });
                });
                this.waitingForUpdateCounter = response.response.waitingForUpdate;
            }
            this.loadingPhones = false;
            setTimeout(() => {
                this._phonesBk = this.phones;
                this.onChangeView(this.uncheckableRadioModel.toString().toLowerCase());
            }, 100);
        }, () => {
            this.loadingPhones = false;
            this.isRequestCompleted = true;
            this.phoneConfigurationService.inventoryData.emit({ hasData: false });
        });
    }

    /**
     * load all phone pools list
     */
    loadAllPhoneLists() {
        this.phoneListService.getPhoneLists().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Couldn\'t load phone lists: ' + response.response.message, 'Error');
            } else {
                this.phoneLists = response.response.phonePools;
            }
        });
    }

    /**
     * reboot the selected phones
     */
    rebootMultiplePhones() {
        const ids: any = [];
        // tslint:disable-next-line: triple-equals max-line-length
        const selectedPhones = this.phones.filter((item: any) => (this.searchQuery == '') ? item.selected == true : item.selected == true && item.filtered == true);
        selectedPhones.forEach((phone: any) => ids.push(phone.id));
        this.phoneService.rebootMultiplePhones(ids).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to reboot selected phones: ' + response.response.message, 'Error');
            } else {
                this.toastr.success('Starting selected phone(s) reboot', 'Success');
                this.setAllPhonesState(false);
            }
            this.modalRef = undefined;
        });
    }

    ngAfterViewChecked() {
        this.checkIfAllPhonesSelected();
        this.checkChanges();
    }

    checkChanges() {
        this.cdRef.detectChanges();
    }

    ngOnInit() {
        this.waitingForUpdate = JSON.parse(localStorage.getItem('needToUpdatePhones'));
        this.uncheckableRadioModel = 'Managed';
        this.count = 0;
        this.scrollCountLeft = 0;
        this.scrollCountRight = 0;
        this._isModalOpen = false;
        this._isCisco = true;
        this._isLinkStatusUp = false;
        localStorage.removeItem('sortCol');
        this._isSideBarOpened = JSON.parse(localStorage.getItem('user-toggle-preference'));
        this.getLoggedInUserHierarchyDetails();
        if (this.waitingForUpdate) {
            this.waitingForUpdate = false;
            this.filterUpdateNewPhones('click');
        }
        if (this.editPhoneList) {
            this.loadPhonesToEdit(this.selectedHierarchy);
            // tslint:disable-next-line:triple-equals
        } else if (this.phonesAtInventoryByList != '') {
            this.loadPhonesByList();
        } else if (!this.waitingForUpdate) {
            this.loadAllPhones(this.selectedHierarchyObj['id']);
        }
        this.loadAllPhoneLists();
        this.initFirmwareColumns();
        this.phoneConfigurationService.phoneCreated.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
            if (!this.waitingForUpdate)
                this.loadAllPhones(this.selectedHierarchyObj['id']);
        });
        this.filterService.setFilterValue.subscribe((response: any) => {
            this.filterCount = response.count;
        });
        this.dataTableService.updateWidth.subscribe((response: any) => {
            this.getWidthPortions();
        });

        this.closedSidebarSubscription = this.phoneConfigurationService.closedBar.subscribe((response: any) => {
            this.tableHeight = Utility.getDataTableHeightByWidth(PageNames.PhoneInventory);
            this.resetParameters();
            if (!this.waitingForUpdate) {
                this.loadAllPhones(this.selectedHierarchyObj['id']);
            }
            this.dataTableService.updateTableHeight.emit(this.tableHeight);
        });
        this.initGridProperties();
        this.getWidthPortions();

        this.phoneConfigurationService.phoneOperationsHide.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
                this.modalRef = undefined;
            }
        });

        this.subscription = interval(10000).subscribe(() => {
            // && !this.loadingPhones
            // tslint:disable-next-line:max-line-length triple-equals
            if (!this.addToPhoneList && this.modalRef == undefined && !this.filtering && !this.newFiltered && !this.editPhoneList && (this.phonesAtInventoryByList == '')) {
                this.checkAvailableUpdate();
            }
        });

        this.dataTableService.refresh.subscribe((response: any) => {
            this.checkChanges();
        });

        // listen for sidebar
        this.utilService.changedBarState.subscribe((response: any) => {
            this._isSideBarOpened = response;
        });
        //listen for data table scroll event
        this.scrollEventSubscription = this.dataTableService.scrollEvent.subscribe(() => {
            if (this.currentPop) {
                this.currentPop.hide();
            }
        });
    }
    /**
     * check for phone updates
     */
    checkAvailableUpdate() {
        if (this.serverTime) {
            this.phoneService.getUpdateStatus(this.serverTime).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error on phone refresh service', 'Error');
                } else {
                    this._isLinkStatusUp = response.linkStatus;
                    if (response.response.changesAvalable) {
                        this.refreshView();
                    }
                }
            });
        }
    }

    /**
     * fetch the logged-in user hierarchy details
     */
    getLoggedInUserHierarchyDetails(): void {
        this.userService.getHierarchyForNewUser().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error fetching hierarchy details', 'Error');
            } else {
                if (response.response.root) {
                    this.hierarchyBreadCrumbList[0] = this.selectedHierarchyObj = this.parentHierarchy = response.response.root;
                }
            }
        });
    }

    filterNewPhones() {
        this.newFiltered = !this.newFiltered;
        if (this.newFiltered) {
            if (this.showingWaitingfForUpdatePhones) {
                this.phoneService.getPhonesAndHierarchy(this.selectedHierarchyObj['id']).subscribe((response: any) => {
                    if (!response.success) {
                        this.showingWaitingfForUpdatePhones = false;
                        this.waitingForUpdate = false;
                        this.toastr.error('Couldn\'t load phones: ' + response.response.message, 'Error');
                    } else {
                        this.phones = response.response.phones;
                        this.phones.forEach((phone: any) => {
                            if (phone.oprDto) {
                                phone.relayName = phone.oprDto.name;
                            }
                            phone.selected = false;
                            if (phone.newPhone) {
                                //this.newPhonesCounter++;
                                phone.newPhone = 'New';
                            } else {
                                phone.newPhone = 'Old';
                            }
                        });
                        this.searchQueryStatusChange.emit('New');
                        this.phoneService.updateNewStatus().subscribe((response: any) => { });
                        this.showingWaitingfForUpdatePhones = false;
                        this.waitingForUpdate = false;
                    }
                });
            } else {
                this.searchQueryStatusChange.emit('New');
                this.phoneService.updateNewStatus().subscribe((response: any) => { });
            }
        } else {
            this.waitingForUpdate = true;
            this.searchQueryStatusChange.emit('');
            this.loadAllPhones(this.selectedHierarchyObj['id']);
        }
    }

    refreshView() {
        this.phonesBk = JSON.parse(JSON.stringify(this.phones));
        // this.phonesBk = JSON.parse(JSON.stringify(this._phonesBk));
        // this.reloadAllPhones();
        if (!this.waitingForUpdate) {
            this.reloadAllPhones();
        }
    }

    reloadAllPhones() {
        this.newPhonesCounter = 0;
        this.phoneService.getPhonesAndHierarchy(this.selectedHierarchyObj['id']).subscribe((response: any) => {
            // this.phoneService.getPhones().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Couldn\'t load phones: ' + response.response.message, 'Error');
            } else {
                this._isLinkStatusUp = response.linkStatus;
                this.serverTime = response.serverTime;
                this.phones = response.response.phones;
                this.hierarchyList = response.response.hierarchyLevel;
                //  add key with name and type as value
                this.hierarchyList.forEach((element: any) => {
                    element.nameAndType = element.name + '[' + element.type + ']';
                });
                this.selectedHierarchyName = undefined;
                this.phones.forEach(phone => {
                    if (phone.oprDto) {
                        phone.relayName = phone.oprDto.name;
                    }
                    if (phone.newPhone) {
                        this.newPhonesCounter++;
                        phone.newPhone = 'New';
                    } else {
                        phone.newPhone = 'Old';
                    }
                });
                // this.phones.reverse();
                this.phonesBk.forEach((bkPhone) => {
                    this.phones.forEach(phone => {
                        if (bkPhone.id === phone.id) {
                            phone.selected = bkPhone.selected;
                        }
                    });
                });
                this.waitingForUpdateCounter = response.response.waitingForUpdate;
                this._phonesBk = this.phones = Utility.sortListInDescendingOrder(this.phones, 'lastConnection_ts', false);
                this.originalData = JSON.parse(JSON.stringify(this.phones));
                setTimeout((val) => {
                    this.onChangeView(this.uncheckableRadioModel.toString().toLowerCase());
                    this.sortAfterReload();
                }, 1);
            }
        });
    }

    sortAfterReload() {
        const sortCol = JSON.parse(localStorage.getItem('sortCol'));
        if (sortCol !== null) {
            this.phoneListGrid.sortField = '';
            this.phoneListGrid.sortType = '';
            // tslint:disable-next-line:triple-equals
            if (sortCol.sortType == 'asc') {
                document.getElementById(sortCol.elementId).click();
            }
            document.getElementById(sortCol.elementId).click();
            // tslint:disable-next-line:triple-equals
            if (sortCol.sortType == 'desc') {
                document.getElementById(sortCol.elementId).click();
            }
            // tslint:disable-next-line:triple-equals
            if (sortCol.sortType == '') {
                this.phones.reverse();
            }
        }
        this.filterData();
    }

    filterData() {
        this._isManagedList = (this.uncheckableRadioModel.toString().toLowerCase() === 'managed');
        if (this._isManagedList) {
            this.phones = this._phonesBk.filter((e: any) => e.callServerManaged);
        } else {
            this.phones = this._phonesBk.filter((e: any) => !e.callServerManaged || e.callServerPartiallyManaged);
        }
        // this.phones = this.originalData;
        let filterCount = 0;
        this.phoneInventoryColumns.forEach((column: any) => {
            if (column.filter) {
                filterCount++;
                const modifiedPhonesList: Phone[] = [...this.phones];
                modifiedPhonesList.forEach((phone: Phone) => {
                    if (phone.firmwareUpgradeStatus && phone.firmwareUpgradeStatus.toLowerCase() === 'completed') {
                        phone.firmwareUpgradeStatus = 'success';
                    }
                    if (phone.vendor && phone.vendor.toLowerCase() === Constants.Polycom.toLowerCase()) {
                        phone.vendor = 'poly';
                    }
                });
                const filter = { key: column.field, value: column.filter.toUpperCase() };
                this.phones = modifiedPhonesList.filter((item: Phone) => {
                    // tslint:disable-next-line:triple-equals
                    if (item[filter.key] != undefined) {
                        if (filter.key === 'phoneState' && (item.vendor.toLowerCase() === 'polycom' || item.vendor.toLowerCase() === 'poly' || item.vendor.toLowerCase() === 'yealink' || item.vendor.toLowerCase() === 'grandstream')) {
                            item['phoneState'] = 'N/A';
                        }
                        if (filter.key === 'primaryBsRegistrationStatus') {
                            item['primaryBsRegistrationStatus'] = (item['primaryBsRegistrationStatus'] == 'Registered') ? 'Registered' : 'N/A';
                        }
                        return item[filter.key].toUpperCase().indexOf(filter.value) > -1;
                    }
                });
            }
        });
        this.filtering = filterCount > 0;
    }

    resetParameters() {
        this.addToPhoneList = false;
        this.editPhoneList = false;
        this.allPhonesChecked = false;
        this.markedPhones = false;
        this.selectedPhonesBar = false;
        this.selectedPhonesQty = 0;
        this.searchQuery = '';
        this.phonesAtInventoryByList = '';
    }

    selectedForListAddition(phone: any) {
        if (this.addToPhoneList && phone.selected) {
            this.selectedPhonesListToMark.push(phone);
            this.phoneConfigurationService.addPhoneToList.emit(phone);
        }
        if (this.addToPhoneList && !phone.selected) {
            const index = this.selectedPhonesListToMark.findIndex((e: any) => e.id == phone.id);
            if (index != -1) {
                this.selectedPhonesListToMark.splice(index, 1);
            }
            this.phoneConfigurationService.removeFromPhoneList.emit(phone);
        }
    }

    selectedForListEdition(phone: any) {
        if (this.selectedAuxiliarPhones.length > 0) {
            this.selectedPhonesListToMark = this.selectedPhonesListToMark.concat(this.selectedAuxiliarPhones);
        }
        if (this.editPhoneList && phone.selected) {
            this.selectedPhonesListToMark.push(phone);
            this.phoneConfigurationService.addPhoneToList.emit(phone);
        }
        if (this.editPhoneList && !phone.selected) {
            const index = this.selectedPhonesListToMark.findIndex((e: any) => e.id == phone.id);
            if (index != -1) {
                this.selectedPhonesListToMark.splice(index, 1);
            }
            this.phoneConfigurationService.removeFromPhoneList.emit(phone);
        }
    }

    deletePhone(phone: any) {
        if (Utility.userEnabled(Role[2])) {
            this.phoneService.deletePhone(phone.id).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error trying to delete phone: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success('Phone deleted successfully', 'Success');
                    this.loadAllPhones(this.selectedHierarchyObj['id']);
                    this.modalRef = undefined;
                }
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    changedList(listId: any) {
        // tslint:disable-next-line:triple-equals
        if (listId != 'newList') {
            this.previouslySelectedPhone = true;
            // tslint:disable-next-line:triple-equals
            if (listId != '---Select---') {
                this.listSubscription = this.phoneListService.getPhoneListById(listId).subscribe((response: any) => {
                    if (!response.success) {
                        this.toastr.error('Couldn\'t retrieve information for selected List: ' + response.response.message, 'Error');
                    } else {
                        this.selectedPhoneList = response.response.phonePool;
                        this.existedPhoneList = this.selectedPhoneList['phones']
                        this.selectMatchedPhones();
                    }
                });
            } else {
                this.toastr.warning('Please select a valid Phone List', 'Warning');
            }
        } else {
            this.enableListCreation();
        }
    }

    selectMatchedPhones() {
        this.checkPhonesByValue(false);
        this.selectOriginalPhones();
        this.selectCurrentListPhones();
        this.listUpdater = true;
    }

    selectOriginalPhones() {
        this.originallySelected.forEach((selectedPhone: any) => {
            this.auxiliarPhones.forEach((existingPhone: any) => {
                if (existingPhone.id === selectedPhone.id) {
                    existingPhone.selected = true;
                }
            });
        });
    }

    selectCurrentListPhones() {
        this.selectedPhoneList.phones.forEach((selectedPhone: any) => {
            this.auxiliarPhones.forEach((existingPhone: any) => {
                if (existingPhone.id === selectedPhone.id) {
                    existingPhone.selected = true;
                }
            });
        });
    }

    checkPhonesByValue(value: boolean) {
        this.auxiliarPhones.forEach((phone: any) => {
            phone.selected = value;
        });
    }

    enableListCreation() {
        if (this.modalRef) {
            this.modalRef.hide();
        }
        if (this.previouslySelectedPhone) {
            // uncheck all the phones in auxiliar list
            this.auxiliarPhones.forEach((phone: any) => {
                phone.selected = false;
            });
            // check the selected phones in auxiliar list
            this.originallySelected.forEach((item: any) => {
                this.auxiliarPhones.forEach((element: any) => {
                    if (element.id == item.id) { element.selected = true; }
                });
            });
            this.previouslySelectedPhone = false;
        }
        // check if selectedAuxiliarPhones has any items
        this.selectedAuxiliarPhones.forEach((item: any) => {
            this.auxiliarPhones.forEach((element: any) => {
                if (element.id == item.id) { element.selected = true; }
            });
        });
        let selectedPhones = this.auxiliarPhones.filter((phone: any) => phone.selected === true);
        this.phones = this.auxiliarPhones;
        this.selectedAuxiliarPhones = [];
        this.selectedPhonesListToMark = selectedPhones;
        this.phoneConfigurationService.createPhoneListFromModal.emit(selectedPhones);
    }
    onChangeAuxiliarPhones(phone: any): void {
        if (phone.selected) {
            this.selectedAuxiliarPhones.push(phone);
        } else if (!phone.selected) {
            const index = this.selectedAuxiliarPhones.findIndex((e: any) => e.id == phone.id);
            this.selectedAuxiliarPhones.splice(index, 1);
        }
    }
    updatePhoneList() {
        const selectedPhones: any = [];
        this.auxiliarPhones.forEach((phone: any) => {
            if (phone.newPhone = 'New') {
                phone.newPhone = true;
            } else {
                phone.newPhone = false;
            }
            if (phone.selected) {
                selectedPhones.push(phone);
            }
        });
        this.existedPhoneList.forEach((element: any) => {
            // check whether the phone exist in the selectedPhoneList or not
            const index = selectedPhones.findIndex((e: any) => e.id === element.id);
            // add to selectedPhoneList list if that phone is not in the list
            if (index == -1) {
                selectedPhones.push(element);
            }
        });
        this.selectedPhoneList.phones = selectedPhones;
        this.phoneListService.updatePhoneList(this.selectedPhoneList).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to update Phone List: ' + response.response.message, 'Error');
            } else {
                this.toastr.success('Phone List updated successfully', 'Success');
            }
            this.resetView();
            this.loadAllPhones(this.selectedHierarchyObj['id']);
        });
    }

    getDeleteStatus() {
        let response = true;
        // get selected phones
        const selectedPhones = this.phones.filter((phone: any) => (this.searchQuery == '') ? phone.selected == true : phone.selected == true && phone.filtered == true);
        // check if any  phone with Availabe status
        const isPhoneAvailable: boolean = selectedPhones.some((phone: Phone) => phone.model && phone.model.toLowerCase() === 'mpp' && phone.phoneState && phone.phoneState.toLowerCase() === 'available')
        if (this.selectedPhonesBar && !this.addToPhoneList && !this.editPhoneList && !isPhoneAvailable) {
            response = false;
        }
        return response;
    }

    getAddStatus() {
        let response = true;
        if (this.selectedPhonesBar && !this.addToPhoneList && !this.editPhoneList) {
            response = false;
        }
        return response;
    }

    getFirmwareUpdateStatus() {
        let response = true;
        const phonesAreNotOffline = this.getPhonesAreNotOffline();
        if (this.selectedPhonesBar && !this.addToPhoneList && !this.editPhoneList && phonesAreNotOffline) {
            if (this._isCisco && !this.isPolySelected) {
                response = false;
            }
        }
        return response;
    }

    getRebootStatus() {
        let response = true;
        const phonesAreNotOffline = this.getPhonesAreNotOffline();
        if (this.selectedPhonesBar && !this.addToPhoneList && !this.editPhoneList && phonesAreNotOffline) {
            if (this._isCisco && !this.isPolySelected) {
                response = false;
            }
        }
        return response;
    }

    /**
     * check whether phone is offline or not
     */
    getPhonesAreNotOffline(): boolean {
        let response = true;
        // tslint:disable-next-line: triple-equals max-line-length
        const selectedPhones = this.phones.filter((phone: any) => (this.searchQuery == '') ? phone.selected == true : phone.selected == true && phone.filtered == true);
        selectedPhones.forEach(selectedPhone => {
            // tslint:disable-next-line:triple-equals
            if (selectedPhone.phoneState.toLowerCase() == 'offline') {
                return response = false;
            }
        });
        return response;
    }

    /**
     * should allow only CISCO & same model phones which are in available status
     */
    checkTemplateStatus(): boolean {
        let response = true;
        const phoneAvailableStatus = this.getPhonesAreNotOffline();
        const sameModelPhone = this.checkForSameMppModelPhones();
        // tslint:disable-next-line: max-line-length
        if (this.selectedPhonesBar && phoneAvailableStatus && this._isCisco && !this.isPolySelected && sameModelPhone) {
            response = false;
        }
        return response;
    }

    /**
     * set the selected phone list for template
     */
    setPhonesList(): void {
        if (Utility.userEnabled('ROLE_PHONE_VDM')) {
            // tslint:disable-next-line: triple-equals max-line-length
            const selectedPhones = this.phones.filter((item: any) => (this.searchQuery == '') ? item.selected == true : item.selected == true && item.filtered == true);
            this.phoneConfigurationService.setPhonesListForTemplate(selectedPhones);
            localStorage.setItem('current-phone-template', JSON.stringify(selectedPhones));
            localStorage.setItem('server-time', this.serverTime);
            this.router.navigate(['/phoneConfiguration/' + this.selectedModel + '/template']);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * set the selected phone list for relay
     */
    setSelectedPhonesForRelay(templateRef: any): void {
        // tslint:disable-next-line: triple-equals max-line-length
        this.selectedPhonesForRelay = [...this.phones.filter(e => e.vendor != 'Cisco')];
        this.modalRef = this.modalService.show(templateRef, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
    }

    /**
     * check whether relay and atleast one phone is selected returns true; else false
     * @returns: boolean
     */
    checkForRelay(): boolean {
        // tslint:disable-next-line: triple-equals
        return (this.selectedOprId == null || !(this.selectedPhonesForRelay.some(e => e.selected == true)));
    }

    /**
     * add selected phones to relay
     */
    addPhonesToRelay(): void {
        // tslint:disable-next-line: triple-equals
        const phoneIds = this.selectedPhonesForRelay.filter(e => e.selected == true).map(e => e.id);
        const data = { phoneIds: phoneIds, relayId: this.selectedOprId };
        this.phoneService.addMultiplePhonesToRelay(data).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to add the phones to relay: ' + response.response.message, 'Error');
            } else {
                const message = ((phoneIds.length > 1) ? 'Phones ' : 'Phone ') + 'added to relay successfully';
                this.toastr.success(message, 'Success');
                this.loadAllPhones(this.selectedHierarchyObj['id']);
                this.selectedOprId = null;
                this.selectedPhonesForRelay = [];
            }
        });
    }

    checkForSameMppModelPhones(): boolean {
        this.polyPhoneController();
        let response = false;
        let model: string;
        // tslint:disable-next-line: max-line-length triple-equals
        const selectedPhones = this.phones.filter((phone: any) => (this.searchQuery == '') ? (phone.selected == true && phone.model == 'MPP') : (phone.selected == true && phone.filtered == true && phone.model == 'MPP'));
        if (selectedPhones.length > 0) {
            response = true;
            this.selectedModel = model = (selectedPhones[0]['subModel']) ? selectedPhones[0]['subModel'] : '';
        }
        if (selectedPhones.length > 1) {
            response = true;
            selectedPhones.forEach((phone: any) => {
                if (phone.subModel != model) {
                    response = false;
                } else {
                    this.selectedModel = model = (phone['subModel']) ? phone['subModel'] : '';
                }
            });
        }
        return response;
    }

    resetView() {
        this.searchQueryStatusChange.emit('');
        this.selectedList = '---Select---';
        this.selectedPhoneList = {};
        if (this.modalRef) {
            this.modalRef.hide();
        }
        if (this.upgradeModal) {
            this.upgradeModal.hide();
        }
    }

    resetPhoneDetails(): void {
        this.allPhonesChecked = this.markedPhones = false;
        this.selectedPhoneList = {};
        if (this.modalRef) {
            this.modalRef.hide();
        }

    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    getWidthPortions() {
        this.totalPortions = 0;
        this.phoneInventoryColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    setAllPhonesState(state: boolean) {
        this.phones.forEach((phone: any) => {
            phone.selected = state;
        });
    }

    getPlacement(item: any) {
        if (this.filterCount !== -1 && this.phones.indexOf(item) >= this.filterCount) {
            return 'top';
        }
        if (this.phones.indexOf(item) >= (this.phones.length - 2)) {
            return 'top';
        }
        return 'bottom';
    }

    initGridProperties() {
        this.phoneInventoryColumns = [
            { field: '_', header: '', width: 3, suppressHide: true, suppressSort: true },
            { field: 'name', header: 'Name', width: 10, suppressHide: false, filter: '' },
            { field: 'macAddress', header: 'MAC', width: 10, suppressHide: false, filter: '' },
            { field: 'ipAddress', header: 'IP Address', width: 10, suppressHide: false, filter: '' },
            { field: 'relayName', header: 'Relay Name', width: 10, suppressHide: false, filter: '', hidden: false },
            { field: 'primaryUser', header: 'BroadSoft User (Primary)', width: 12, suppressHide: false, filter: '' },
            { field: 'primaryExtension', header: 'Extension', width: 7, suppressHide: false, filter: '' },
            { field: 'primaryDid', header: 'DID', width: 10, suppressHide: false, filter: '' },
            { field: 'vendor', header: 'Vendor', width: 10, suppressHide: false, filter: '' },
            { field: 'subModel', header: 'Model', width: 10, suppressHide: false, filter: '' },
            { field: 'firmwareVersion', header: 'Firmware Version', width: 12, suppressHide: false, filter: '' },
            { field: 'phoneState', header: 'Connection', width: 10, suppressHide: false, filter: '' },
            { field: 'serialNumber', header: 'Serial Number', width: 10, suppressHide: false, filter: '' },
            { field: 'firmwareUpgradeStatus', header: 'Firmware Upgrade', width: 10, suppressHide: false, filter: '' },
            { field: 'createDate_tsString', header: 'First Connected', width: 10, suppressHide: false, filter: '', hidden: true },
            { field: 'lastUpdatedDate_tsString', header: 'Last Connected', width: 10, suppressHide: false, filter: '', hidden: true },
            {
                field: 'primaryBsRegistrationStatus',
                header: 'BS Registration Status',
                width: 12,
                suppressHide: false,
                filter: '',
                hidden: true
            },
            { field: '_', header: '', width: 5, suppressHide: true, suppressSort: true }
        ];
    }

    initFirmwareColumns(): void {
        this.firmwareColumnList = [
            { field: 'firmwareUpgradeStatus', header: 'Status', width: 13, suppressHide: false, filter: '' },
            { field: 'firmwareUpgradeStart_tsString', header: 'Start Date', width: 13, suppressHide: false, filter: '' },
            { field: 'firmwareUpgradeEnd_tsString', header: 'End Date', width: 13, suppressHide: false, filter: '' },
            { field: 'oldFirmware', header: 'Old Firmware', width: 13, suppressHide: false, filter: '' },
            { field: 'newFirmware', header: 'New Firmware', width: 13, suppressHide: false, filter: '' },
            { field: 'upgradeLocation', header: 'Firmware Url', width: 13, suppressHide: false, filter: '' }
        ];
    }

    selectAllPhones() {
        if (!this.addToPhoneList && !this.editPhoneList) {
            this.selectedPhonesBar = this.allPhonesChecked;
        }
        this.phones.forEach((phone: any) => {
            if (this.searchQuery == '') {
                phone.selected = this.allPhonesChecked;
            } else if (phone.filtered) {
                phone.selected = this.allPhonesChecked;
            } else {
                phone.selected = this.allPhonesChecked;
            }
            if (this.addToPhoneList) {
                this.selectedForListAddition(phone);
            }
            if (this.editPhoneList) {
                this.selectedForListEdition(phone);
            }
        });

        this.updateFilteredPhonesCounter();
        this.updateSelectedPhonesCounter();
    }

    updateSelectedPhonesCounter() {
        this.selectedPhonesQty = 0;
        this.phones.forEach((phone: any) => {
            if (phone.selected) {
                this.selectedPhonesQty++;
            }
        });
    }

    updateFilteredPhonesCounter() {
        this.filteredPhonesQty = 0;
        this.phones.forEach((phone: any) => {
            if (phone.filtered) {
                this.filteredPhonesQty++;
            }
        });
        if (this.phoneListGrid) {
            // tslint:disable-next-line:triple-equals
            if (this.filteredPhonesQty < 14 && this.filteredPhonesQty != 0) {
                this.phoneListGrid.rowQty = this.filteredPhonesQty;
            } else {
                this.phoneListGrid.rowQty = 100;
            }
        }
    }

    deleteConfirmation(template: any) {
        this.modalRef = this.modalService.show(template, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
    }

    /**
     * reboot confirmation modal
     * @param template: any
     */
    rebootConfirmation(template: any) {
        if (Utility.userEnabled('ROLE_PHONE_REBOOT')) {
            this.modalRef = this.modalService.show(template, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * service call to delete selected phones
     */
    deleteSelectedPhones(): void {
        if (Utility.userEnabled(Role[2])) {
            // tslint:disable-next-line: max-line-length triple-equals
            const toDelete = this.phones.filter((test: any) => (this.searchQuery == '') ? (test.selected == true) : test.selected == true && test.filtered == true)
                .map((test: any) => test.id);

            if (toDelete.length > 1) {
                this.phoneService.deleteMultiplePhones(toDelete).subscribe((response: any) => {
                    if (!response.success) {
                        this.toastr.error('Error trying to delete phones: \nMessage:' + response.response.message, 'Error');
                    } else {
                        this.loadAllPhones(this.selectedHierarchyObj['id']);
                        this.toastr.success('Phone deleted successfully', 'Success');
                        this.modalRef = undefined;
                    }
                });
            } else {
                this.phoneService.deletePhone(toDelete[0]).subscribe((response: any) => {
                    if (!response.success) {
                        this.toastr.error('Error trying to delete the phone: ' + response.response.message, 'Error');
                    } else {
                        this.loadAllPhones(this.selectedHierarchyObj['id']);
                        this.toastr.success('Phone deleted successfully', 'Success');
                        this.modalRef = undefined;
                    }
                });
            }
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     *on change firmware status
     * @param value:string
     */
    changePhoneFirmwareStatus(value: string): string {
        // tslint:disable-next-line:no-console
        switch (value) {
            case 'COMPLETED':
                return 'Success';
            case 'REBOOTING':
                // tslint:disable-next-line:no-console
                return 'Rebooting';
            case 'INPROGRESS':
                return 'In Progress';
            case 'INITIATED':
                return 'Initiated';
            case 'FAILED':
                return 'Failed';
            case null:
                // tslint:disable-next-line:no-console
                return '';
        }
    }

    getColor(state: string) {
        if (state) {
            switch (state.toLowerCase()) {
                case 'success':
                case 'available':
                case 'completed':
                case 'registered':
                    return '#0E8B18';
                case 'offline':
                case 'failed':
                case 'unregistered':
                    return '#CB3333';
                case 'initiated':
                case 'inprogress':
                case 'unavailable':
                case 'rebooting':
                    return '#7694B7';
            }
        }
    }

    /**
     *
     * @param item: any
     */
    onChangeCheckBox(item: any): void {
        // tslint:disable-next-line:triple-equals
        this._isCisco = this.phones.some(phone => phone.selected && phone.vendor == 'Cisco');
    }

    checkIfAllPhonesSelected() {
        this.updateSelectedPhonesCounter();
        this.updateFilteredPhonesCounter();
        // tslint:disable-next-line:triple-equals
        if (this.selectedPhonesQty == this.filteredPhonesQty && this.selectedPhonesQty > 0) {
            this.markedPhones = this.allPhonesChecked = true;
        } else {
            this.markedPhones = this.allPhonesChecked = false;
        }
        if (this.phones.length > 0) {
            // tslint:disable-next-line: triple-equals
            this.markedPhones = this.allPhonesChecked = this.phones.every((item: any) => item.selected == true);
        }

        if (this.selectedPhonesQty > 0) {
            this.selectedPhonesBar = true;
        } else {
            this.selectedPhonesBar = false;
        }
    }

    toggleVisibility() {
        this.markedPhones = true;
        for (const phone of this.phones) {
            if (!phone.selected) {
                this.markedPhones = false;
                break;
            }
        }
    }

    mppPhoneController() {
        this.isMPPSelected = false;
        this.mppCounter = 0;
        // tslint:disable-next-line: triple-equals max-line-length
        const selectedPhones = this.phones.filter((phone: any) => (this.searchQuery == '') ? (phone.selected == true) : (phone.selected == true && phone.filtered == true));
        selectedPhones.forEach((phone: any) => {
            if (phone.model == 'MPP') {
                this.mppCounter++;
            }
        });
        if (this.mppCounter > 0) {
            this.isMPPSelected = true;
        }
    }

    /**
     * hide firmware upgrade button when selected phone contains non-cisco vendors
     */
    polyPhoneController() {
        this.isPolySelected = false;
        this.polyCounter = 0;
        // tslint:disable-next-line: triple-equals max-line-length
        const selectedPhones = this.phones.filter((phone: any) => (this.searchQuery == '') ? (phone.selected == true) : (phone.selected == true && phone.filtered == true));
        selectedPhones.forEach((phone: any) => {
            if (phone.vendor != 'Cisco') {
                this.polyCounter++;
            }
        });
        if (this.polyCounter > 0) {
            this.isPolySelected = true;
        }
    }

    configureBeforeAdding() {
        this.selectedList = '---Select---';
        if (this.searchQuery != '') {
            // tslint:disable-next-line: max-line-length triple-equals
            const selectedPhones = this.phones.filter((test: any) => (this.searchQuery == '') ? (test.selected == true) : test.selected == true && test.filtered == true).map((test: any) => test);
            // tslint:disable-next-line: max-line-length triple-equals
            const unSelectedPhones = this.phones.filter((test: any) => (this.searchQuery == '') ? (test.selected == true) : test.filtered == false).map((test: any) => {
                test.selected = false;
                return test;
            });
            this.auxiliarPhones = JSON.parse(JSON.stringify(selectedPhones.concat(unSelectedPhones)));
        } else {
            this.auxiliarPhones = JSON.parse(JSON.stringify(this.phones));
        }
        this.originallySelected = JSON.parse(JSON.stringify(this.auxiliarPhones.filter(phone => phone.selected === true)));
        this.loadAllPhoneLists();
    }

    addToExistingList(template: TemplateRef<any>) {
        if (Utility.userEnabled(Role[2])) {
            this.configureBeforeAdding();
            this.modalRef = this.modalService.show(template, this.modalConfig);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * to upgrade the phone firmware
     */
    upgradeFirmware(): void {
        // tslint:disable-next-line: max-line-length triple-equals
        const toUpgradeFirmware = this.phones.filter((test: any) => (this.searchQuery == '') ? (test.selected == true) : test.selected == true && test.filtered == true);

        // const toUpgradeFirmware = this.phones.filter(function (test: any) {
        //     // tslint:disable-next-line:triple-equals
        //     return test.selected == true;
        // });

        const ids: any = [];
        if (toUpgradeFirmware.length > 0) {
            toUpgradeFirmware.forEach((item: any) => {
                ids.push(item.id);
            });
        }
        for (let index = 0; index < this.firmwareUpgradeList.length; index++) {
            this.firmwareUpgradeList[index].model = this.selectedSubModelList[index];
        }
        this.phoneService.firmwareUpdate(ids, this.firmwareUpgradeList).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to delete phones: \nMessage:' + response.response.message, 'Error');
            } else {
                this.toastr.success(response.response.message + '', 'Success');
            }
            this.toUncheckAllSelectedPhone();
            this.loadAllPhones(this.selectedHierarchyObj['id']);
        });
    }

    /**
     * to uncheck the selected phones & close the respective modal
     */
    toUncheckAllSelectedPhone(): void {
        this.allPhonesChecked = false;
        this.markedPhones = false;
        if (this.modalRef) {
            this.modalRef.hide();
            this.modalRef = undefined;
        }

        if (this.upgradeModal) {
            this.upgradeModal.hide();
            this.upgradeModal = undefined;
        }
        this.selectedSubModelList = [];
        this.phones.forEach(phone => {
            phone.selected = false;
        });
    }

    /**
     * modal that displays the selected phone details for firmware-upgrade
     * @param template: TemplateRef<any>
     */
    addToUpgradeFirmware(template: TemplateRef<any>): void {
        if (Utility.userEnabled('ROLE_PHONE_FIRMWAREUPGRADE')) {
            this.selectedSubModelList = [];
            this.firmwareUpgradeList = [];
            // tslint:disable-next-line: triple-equals max-line-length
            const selectedPhones = this.phones.filter((phone: any) => (this.searchQuery == '') ? (phone.selected == true) : (phone.selected == true && phone.filtered == true));
            selectedPhones.forEach((item: any) => {
                // tslint:disable-next-line:triple-equals
                if (item.vendor == 'Cisco') {
                    if (!this.selectedSubModelList.includes(item.subModel)) {
                        this.selectedSubModelList.push(item.subModel);
                    }
                }
            });
            for (let index = 0; index < this.selectedSubModelList.length; index++) {
                this.firmwareUpgradeList.push({ upgradeLocation: '', retryInterval: '3600', model: '' });
            }
            this.upgradeModal = this.modalService.show(template, this.modalConfig);
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    viewPhoneTimeLine(phone: any) {
        if (Utility.userEnabled('ROLE_PHONE_TIMELINE')) {
            this.phoneConfigurationService.setPhone(phone);
            this.modalRef = this.modalService.show(PhoneTimelineComponent, {
                backdrop: true,
                class: 'modal-dialog-centered modal-xl',
                ignoreBackdropClick: true
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    editPhone(phone: any) {
        if (Utility.userEnabled(Role[2])) {
            this.phoneConfigurationService.setPhone(phone);
            this.modalRef = this.modalService.show(EditPhoneComponent, {
                backdrop: true,
                class: 'modal-dialog-centered modal-xl',
                ignoreBackdropClick: true
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    viewPhoneDetails(phone: any) {
        this.phoneConfigurationService.setPhone(phone);
        this.modalRef = this.modalService.show(PhoneDetailsComponent, {
            backdrop: true,
            class: 'modal-dialog-centered modal-xl',
            ignoreBackdropClick: true
        });
    }

    phoneTroubleshooting(phone: any) {
        if (Utility.userEnabled('ROLE_PHONE_EASYBUTTON')) {
            this.phoneConfigurationService.setPhone(phone);
            this.modalRef = this.modalService.show(TroubleshootingComponent, {
                backdrop: true,
                class: 'modal-dialog-centered modal-lg',
                ignoreBackdropClick: true
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    userEnabled(role: string) {
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        if (currentPermissions.includes(role) || currentPermissions.includes(Role[1])) {
            return true;
        }
        return false;
    }

    closeOldPop(popover: any) {
        if (this.currentPop && this.currentPop !== popover) {
            this.currentPop.hide();
        }
        this.currentPop = popover;
    }

    inProcess(data: any): void {
        this.toastr.error(`Firmware upgrade is ${data.firmwareUpgradeStatus}`);
    }


    /**
     * display the firmware details
     */
    onClickFirmwareDetails(template: TemplateRef<any>, item: any): void {
        this.selectedPhoneFirmwareDetails = item;
        this._isModalOpen = true;
        // if reason exist, we that array
        if (item.failureReason !== '' && item.failureReason !== null && item.hasOwnProperty('failureReason')) {
            // tslint:disable-next-line:triple-equals
            if (this.firmwareColumnList[1]['field'] != 'failureReason' && this._isModalOpen) {
                this.firmwareColumnList.splice(1, 0, {
                    field: 'failureReason',
                    header: 'Reason',
                    width: 13,
                    suppressHide: false,
                    filter: ''
                });
            }
            // tslint:disable-next-line:triple-equals
        } else if (this.firmwareColumnList[1]['field'] == 'failureReason') {
            this.initFirmwareColumns();
        }
        // if firmware upgrade status is notnull then display the pop-up
        if (item.firmwareUpgradeStatus !== null) {
            this.upgradeModal = this.modalService.show(template, {
                backdrop: true,
                class: 'modal-dialog-centered modal-lg',
                ignoreBackdropClick: true
            });
        }
    }

    /**
     * navigate to visual device management page
     * @param phone: any
     */
    visualDeviceManagement(phone?: any) {
        // display error message when link is down
        if (!this._isLinkStatusUp) {
            this.toastr.error(Utility.LINK_IS_DOWN_MSG, 'Error');
        } else {
            if (Utility.userEnabled('ROLE_PHONE_VDM')) {
                let model = phone.subModel.split('-');
                model = model[1];
                localStorage.setItem('current-model-phone', model);
                localStorage.setItem('server-time', this.serverTime);
                this.router.navigate(['/phoneConfiguration/' + phone.id + '/vdm']);
            } else {
                this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
            }
        }
    }

    /**
     * add item to hierarchy
     * @param data: Hierarchy => {id:string,type:string,name:string}
     * @return void
     */
    addHierarchyToList(data: Hierarchy): void {
        this.hierarchyBreadCrumbList.push(data);
        this.searchQueryStatusChange.emit('hierarchy');
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
        this.markedPhones = this.allPhonesChecked = false;
        this.searchQueryStatusChange.emit('hierarchy');
        if (index !== 0) {
            const data = this.hierarchyBreadCrumbList[index];
            this.selectedHierarchyObj = data;
            this.loadAllPhones(this.selectedHierarchyObj['id']);
            this.hierarchyBreadCrumbList.splice(index + 1);
        } else {
            // this.hierarchyBreadCrumbList.splice(1);
            this.hierarchyBreadCrumbList = [];
            this.hierarchyBreadCrumbList[0] = this.parentHierarchy;
            this.selectedHierarchyObj = this.parentHierarchy;
            this.loadAllPhones(this.selectedHierarchyObj['id']);
        }
    }

    /**
     * event is fired when hierarchy changed
     * @param event:any
     * @return void
     */
    onChangeHierarchy(event: any): void {
        this.markedPhones = this.allPhonesChecked = false;
        if (event) {
            this.addHierarchyToList(event);
            this.selectedHierarchyObj = event;
            this.loadAllPhones(this.selectedHierarchyObj['id']);
        }
        if (!event) {
            this.removeLevelFromHierarchyList();
        }
    }

    /**
     * show all phone list
     */
    showAllPhones(): void {
        this.phonesAtInventoryByList = '';
        this.nameListPhones = '';
        this.parentHierarchy = this.selectedHierarchyObj = {};
        this.ngOnInit();
        this.resetParameters();
    }

    /**
      * on change relay
      */
    onChangeRelay(item: any): void {
        if (!item) {
            this.selectedOprId = null;
        }
    }
    /**
     * code for waiting for update phones
     */
    filterUpdateNewPhones(type?: string) {
        if (this.newFiltered && !this.waitingForUpdate) {
            this.newFiltered = false;
            this.searchQueryStatusChange.emit('');
        }
        if (type === 'click')
            this.waitingForUpdate = !this.waitingForUpdate;
        this.loadingPhones = true;
        if (this.waitingForUpdate) {
            if (this.showPhonesByList) {
                this.phoneListService.getPhonesWaitingForUpdateByPhoneList(this.phonesAtInventoryByList).subscribe((response: any) => {
                    if (!response.success) {
                        this.toastr.error('Error :' + response.response.message, 'Error');
                    } else {
                        this.phones = response.response.phones;
                        //this.newPhonesCounter = response.response.newPhonesCounter;
                        this.phones.forEach((phone: any) => {
                            if (phone.oprDto) {
                                phone.relayName = phone.oprDto.name;
                            }
                            phone.selected = false;
                            if (phone.newPhone) {
                                this.newPhonesCounter++;
                                phone.newPhone = 'New';
                            } else {
                                phone.newPhone = 'Old';
                            }
                        });
                    }
                    if (type !== 'click')
                        this.waitingForUpdate = !this.waitingForUpdate;
                    this.showingWaitingfForUpdatePhones = true;
                    this.loadingPhones = false;
                    localStorage.setItem('needToUpdatePhones', 'false');
                });
            } else {
                this.phoneService.updateForWaitingNewStatus().subscribe((response: any) => {
                    if (!response.success) {
                        this.toastr.error('Error :' + response.response.message, 'Error');
                    } else {
                        this.phones = response.response.phones;
                        this.newPhonesCounter = response.response.newPhonesCounter;
                        this.phones.forEach((phone: any) => {
                            if (phone.oprDto) {
                                phone.relayName = phone.oprDto.name;
                            }
                            phone.selected = false;
                            if (phone.newPhone) {
                                phone.newPhone = 'New';
                            } else {
                                phone.newPhone = 'Old';
                            }
                        });
                    }
                    if (type !== 'click')
                        this.waitingForUpdate = !this.waitingForUpdate;
                    this.showingWaitingfForUpdatePhones = true;
                    this.loadingPhones = false;
                    localStorage.setItem('needToUpdatePhones', 'false');
                });
            }
        } else {
            this.showingWaitingfForUpdatePhones = false;
            this.searchQueryStatusChange.emit('');
            if (this.showPhonesByList) {
                this.loadPhonesByList();
            } else {
                this.loadAllPhones(this.selectedHierarchyObj['id']);
            }
        }
    }

    ngOnDestroy(): void {
        this.selectedPhonesListToMark = [];
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.listSubscription) {
            this.listSubscription.unsubscribe();
        }
        if (this.scrollEventSubscription) {
            this.scrollEventSubscription.unsubscribe();
        }
        if (this.closedSidebarSubscription) {
            this.closedSidebarSubscription.unsubscribe();
        }
        if (this.cdRef) {
            this.cdRef.detach();
        }
    }
}
