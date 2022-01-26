import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataTableComponent } from '../../../../generics/data-table/data-table.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserService } from '../../../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { AdminPanelService } from '../../../../services/admin-panel.service';
import { NewRoleComponent } from './new-role/new-role.component';
import { EditRoleComponent } from './edit-role/edit-role.component';
import { ViewUsersComponent } from './view-users/view-users.component';
import { PageNames, Utility } from '../../../../helpers/Utility';
import { DataTableService } from 'src/app/services/data-table.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {

    @Input() searchQuery: string;
    @ViewChild('usersGrid', { static: true }) usersGrid: DataTableComponent;

    private currentPop: any;
    userProfileColumns: any = [];
    rolesData: any = [];
    rolesDetails: any = [];
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-lg', ignoreBackdropClick: true };
    modalRef: BsModalRef;
    deleteModal: BsModalRef;
    totalPortions: number;
    private _selectedItem: any;

    setDataTableHeight: string;
    isRequestCompleted: boolean;
    scrollEventSubscription: Subscription;

    constructor(private modalService: BsModalService,
        private userService: UserService,
        private toastService: ToastrService,
        private dataTableService: DataTableService,
        private adminPanelService: AdminPanelService) {
        this.isRequestCompleted = false;
    }

    ngOnInit() {
        this.setDataTableHeight = Utility.getDataTableHeight(PageNames.UserProfile);
        this.initGridProperties();
        this.getWidthPortions();
        this.fetchAllUserProfile();
        this.adminPanelService.cancelForm.subscribe(() => {
            if (this.modalRef) {
                this.modalRef.hide();
            }
            this.fetchAllUserProfile();
        });
        //listen for data table scroll event
        this.scrollEventSubscription = this.dataTableService.scrollEvent.subscribe(() => {
            if (this.currentPop) {
                this.currentPop.hide();
            }
        });

    }

    /**
     * user profile columns
     */
    initGridProperties() {
        this.userProfileColumns = [
            { field: 'name', header: 'Name', width: 25, suppressHide: true },
            { field: 'description', header: 'Description', width: 25, suppressHide: true },
            { field: 'userCount', header: ' Number of Users', width: 25, suppressHide: true },
            { field: '_', header: '', width: 25, suppressHide: true, suppressSort: true }
        ];
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    getWidthPortions() {
        this.totalPortions = 0;
        this.userProfileColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    fetchAllUserProfile(): void {
        this.isRequestCompleted = false;
        this.userService.getAllUserProfile().subscribe((response: any) => {
            this.rolesData = response.response.userProfiles;
            this.rolesData = Utility.sortByLastModifiedDateInDescOrder(this.rolesData);
            this.isRequestCompleted = true;
        }, () => {
            this.isRequestCompleted = true;
        });
    }

    createUserRole(): void {
        this.modalRef = this.modalService.show(NewRoleComponent, this.modalConfig);
    }

    editUserRole(item: any): void {
        this.adminPanelService.setUserProfile(item);
        this.modalRef = this.modalService.show(EditRoleComponent, this.modalConfig);
    }

    openDeleteModal(template: any, item: any): void {
        this._selectedItem = item;
        this.deleteModal = this.modalService.show(template, {
            backdrop: true,
            class: 'modal-dialog-centered',
            ignoreBackdropClick: true
        });
    }

    deleteUserRole(type: string): void {
        if (type === 'no') {
            this.deleteModal.hide();
        } else if (type === 'yes') {
            const userProfileDetails = this._selectedItem;
            delete userProfileDetails['isAdmin'];
            delete userProfileDetails['isUser'];
            //  service call
            this.userService.deleteUserProfile(userProfileDetails).subscribe((response: any) => {
                if (!response.success) {
                    this.toastService.error(response.message, 'Error');
                } else {
                    this.toastService.success(response.message, 'Success');
                    this.adminPanelService.cancelForm.emit();
                    this.deleteModal.hide();
                    this.fetchAllUserProfile();
                }
            });
        }
    }

    /**
     * view users  by selected profile
     * @param item: any
     */
    viewRoleDetails(item: any): void {
        if (item.userCount > 0) {
            this.adminPanelService.setUserProfile(item);
            this.modalRef = this.modalService.show(ViewUsersComponent, this.modalConfig);
        }
    }

    closeOldPop(popover: any) {
        if (this.currentPop && this.currentPop !== popover) {
            this.currentPop.hide();
        }
        this.currentPop = popover;
    }
    ngOnDestroy(): void {
        if (this.scrollEventSubscription) {
            this.scrollEventSubscription.unsubscribe();
        }
    }
}
