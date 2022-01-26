import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { PhoneListService } from 'src/app/services/phone-list.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ListDetailsComponent } from './list-operations/list-details/list-details.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Utility, PageNames } from '../../../helpers/Utility';
import { FilterService } from '../../../services/filter.service';
import { Role } from '../../../helpers/role';
import { DataTableService } from 'src/app/services/data-table.service';

@Component({
    selector: 'phone-list',
    templateUrl: './phone-list.component.html',
    styleUrls: ['./phone-list.component.css']
})
export class PhoneListComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Input() searchQuery: string;
    @Output() searchQueryStatusChange: any = new EventEmitter<boolean>();
    phoneLists: any = [];
    phoneListsColumns: any = [];
    private totalPortions: number;
    allListsChecked: any;
    markedLists: boolean = false;
    selectedListsBar: boolean = false;
    selectedListsQty: number = 0;
    private currentPop: any;
    subscription: Subscription;
    scrollEventSubscription: Subscription;
    modalRef: BsModalRef;
    loadingLists: boolean = true;
    filteredListsQty: number = 0;
    filterCount = -1;
    tableHeight: string;
    isRequestCompleted: boolean;
    constructor(private phoneConfigurationService: PhoneConfigurationService,
        private modalService: BsModalService,
        private phoneListService: PhoneListService,
        private filterService: FilterService,
        private cdRef: ChangeDetectorRef,
        private dataTableService: DataTableService,
        private toastr: ToastrService) {
        this.tableHeight = Utility.getDataTableHeightByWidth(PageNames.PhoneList);
    }

    ngAfterViewChecked() {
        this.checkIfAllListsSelected();
        this.checkChanges();
    }

    checkChanges() {
        this.cdRef.detectChanges();
    }

    loadAllPhoneLists() {
        // this.loadingLists = true;
        this.isRequestCompleted = false;
        this.subscription = this.phoneListService.getPhoneLists().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Couldn\'t load phone lists: ' + response.response.message, 'Error');
            } else {
                this.phoneLists = response.response.phonePools;
                this.isRequestCompleted = true;
                this.phoneLists.forEach(list => {
                    list.selected = false;
                });
                this.phoneLists = Utility.sortByLastModifiedDateInDescOrder(this.phoneLists);
                // this.loadingLists = false;
            }
            // this.loadingLists = false;
        },() =>{ 
            // this.loadingLists = false;
                this.isRequestCompleted = true;});
    }

    ngOnInit() {
        this.loadAllPhoneLists();
        // this.phoneConfigurationService.phoneListCreated.subscribe((response: any) => {
        //   this.loadAllPhoneLists();
        // })
        this.filterService.setFilterValue.subscribe((response: any) => {
            this.filterCount = response.count;
        });
        this.phoneListService.listOperationsHide.subscribe((response: any) => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
            this.loadAllPhoneLists();
        });

        this.initGridProperties();
        this.getWidthPortions();

        //listen for data table scroll event
        this.scrollEventSubscription = this.dataTableService.scrollEvent.subscribe(() => {
            if (this.currentPop) {
                this.currentPop.hide();
            }
        });

    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    getWidthPortions() {
        this.totalPortions = 0;
        this.phoneListsColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    initGridProperties() {
        this.phoneListsColumns = [
            { field: '_', header: '', width: 3, suppressHide: true, suppressSort: true },
            { field: 'name', header: 'Name', width: 32, suppressHide: true },
            { field: 'description', header: 'Description', width: 40, suppressHide: true },             //, class: 'phoneListDescriptionFiled'
            { field: 'phonesCount', header: 'Phones', width: 15, suppressHide: true },
            { field: '_', header: '', width: 10, suppressHide: true, suppressSort: true }
        ];
    }

    selectAllLists() {
        this.phoneLists.forEach((phoneList: any) => {
            phoneList.selected = this.allListsChecked;
            if (phoneList.filtered) {
                phoneList.selected = this.allListsChecked;
            }
        });

        this.updateFilteredListsCounter();
        this.updateSelectedListsCounter();
    }

    toggleVisibility() {
        this.markedLists = true;
        for (var i = 0; i < this.phoneLists.length; i++) {
            if (!this.phoneLists[i].selected) {
                this.markedLists = false;
                break;
            }
        }
    }

    viewListDetails(list: any) {
        this.phoneListService.setList(list);
        this.modalRef = this.modalService.show(ListDetailsComponent, {
            backdrop: true,
            class: 'modal-dialog-centered modal-xl',
            ignoreBackdropClick: true
        });
    }

    editList(list: any) {
        if (Utility.userEnabled(Role[2])) {
            this.subscription = this.phoneListService.getPhoneListById(list.id).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error acquiring list: ' + response.message, 'Error');
                } else {
                    this.phoneListService.setList(response.response.phonePool);
                    this.phoneConfigurationService.editPhoneList.emit();
                }
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
        // this.modalRef = this.modalService.show(EditListComponent, { backdrop: true, class: 'modal-dialog-centered modal-lg' });
    }

    getPlacement(item: any) {
        if (this.filterCount !== -1 && this.phoneLists.indexOf(item) >= this.filterCount) {
            return 'top';
        }
        if (this.phoneLists.indexOf(item) >= (this.phoneLists.length - 2)) {
            return 'top';
        }
        return 'bottom';
    }

    resetParameters() {
        this.selectedListsBar = false;
        this.searchQuery = '';
        this.searchQueryStatusChange.emit('');
        this.loadAllPhoneLists();
    }

    resetView() {
        this.allListsChecked = this.markedLists = false;
        this.loadAllPhoneLists();
    }

    deleteConfirmation(template: any) {
        // if (this.allListsChecked) {
        this.modalRef = this.modalService.show(template, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
        // } else {
        //     this.deleteSelectedLists();
        // }
    }

    /**
     * service call to delete select phone list
     */
    deleteSelectedLists() {
        if (Utility.userEnabled(Role[2])) {
            // tslint:disable-next-line: max-line-length triple-equals
            const toDelete = this.phoneLists.filter((item: any) => (this.searchQuery == '') ? (item.selected == true) : item.selected == true && item.filtered == true).map((item: any) => item.id);
            if (toDelete.length > 1) {
                this.phoneListService.deleteMultipleLists(toDelete).subscribe((response: any) => {
                    if (!response.success) {
                        // tslint:disable-next-line:max-line-length
                        this.toastr.error('Error trying to delete List: \nMessage:' + response.response.message + '\nFailed to delete: ' + response.response.failedTestCases, 'Error');
                    } else {
                        this.resetParameters();
                        this.toastr.success('Phone Lists deleted successfully', 'Success');
                    }
                });
            } else {
                this.phoneListService.deletePhoneList(toDelete[0]).subscribe((response: any) => {
                    if (!response.success) {
                        this.toastr.error('Error trying to delete the list: ' + response.response.message, 'Error');
                    } else {
                        this.resetParameters();
                        this.toastr.success('Phone List deleted successfully', 'Success');
                    }
                });
            }
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    deleteList(list: any) {
        if (Utility.userEnabled(Role[2])) {
            this.phoneListService.deletePhoneList(list.id).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error trying to delete the list: ' + response.response.message, 'Error');
                } else {
                    this.resetParameters();
                    this.toastr.success('List deleted successfully', 'Success');
                }
            });
        } else {
            this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    checkIfAllListsSelected() {
        this.updateSelectedListsCounter();
        this.updateFilteredListsCounter();
        if (this.selectedListsQty == this.filteredListsQty && this.selectedListsQty > 0) {
            this.allListsChecked = true;
        } else {
            this.allListsChecked = false;
        }
        if (this.phoneLists.length > 0) {
            // tslint:disable-next-line: triple-equals
            this.allListsChecked = this.phoneLists.every((item: any) => item.selected == true);
        } else {
            this.allListsChecked = this.markedLists = false;
        }
        if (this.selectedListsQty > 0) {
            this.selectedListsBar = true;
        } else {
            this.selectedListsBar = false;
        }
    }

    updateSelectedListsCounter() {
        this.selectedListsQty = 0;
        this.phoneLists.forEach((phoneList: any) => {
            if (phoneList.selected) {
                this.selectedListsQty++;
            }
        });
    }

    updateFilteredListsCounter() {
        this.filteredListsQty = 0;
        this.phoneLists.forEach((phoneList: any) => {
            if (phoneList.filtered) {
                this.filteredListsQty++;
            }
        });
    }

    closeOldPop(popover: any) {
        if (this.currentPop && this.currentPop !== popover) {
            this.currentPop.hide();
        }
        this.currentPop = popover;
    }

    userEnabled(role: string) {
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        if (currentPermissions.includes(role) || currentPermissions.includes(Role[1])) {
            return true;
        }
        return false;
    }

    getDeleteStatus() {
        let response: boolean = true;
        if (this.selectedListsBar) {
            response = false;
        }
        return response;
    }

    showListPhones(id: string) {
        this.phoneConfigurationService.phonesAtInventoryByList.emit(id);
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe;
        }
        if (this.scrollEventSubscription) {
            this.scrollEventSubscription.unsubscribe();
        }
    }
}
