import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { FilterService } from 'src/app/services/filter.service';
import { DataTableService } from 'src/app/services/data-table.service';
import { ToastrService } from 'ngx-toastr';
import { Role } from 'src/app/helpers/role';
import { Utility, PageNames } from 'src/app/helpers/Utility';
import { UserListService } from 'src/app/services/user-list.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @Input() searchQuery: string;
  @Output() searchQueryStatusChange: any = new EventEmitter<boolean>();
  userLists: any = [];
  userListsColumns: any = [];
  allListsChecked: any;
  markedLists: boolean = false;
  selectedListsBar: boolean = false;
  selectedListsQty: number = 0;
  modalRef: BsModalRef;
  filteredListsQty: number = 0;
  filterCount = -1;
  private totalPortions: number;
  private currentPop: any;
  isRequestCompleted: boolean = false;
  tableHeight: string;
  //subscription  
  subscription: Subscription;
  scrollEventSubscription: Subscription;
  constructor(
    private phoneConfigurationService: PhoneConfigurationService,
    private modalService: BsModalService,
    private filterService: FilterService,
    private cdRef: ChangeDetectorRef,
    private dataTableService: DataTableService,
    private toastr: ToastrService,
    private usersListService: UserListService
  ) {
    this.tableHeight = Utility.getDataTableHeightByWidth(PageNames.UserInventory);
  }

  ngOnInit() {
    this.loadAllUsersLists();
    // this.phoneConfigurationService.phoneListCreated.subscribe((response: any) => {
    //   this.loadAllPhoneLists();
    // })
    this.filterService.setFilterValue.subscribe((response: any) => {
      this.filterCount = response.count;
    });
    // this.usersListService.listOperationsHide.subscribe((response: any) => {
    //   if (this.modalRef) {
    //     this.modalRef.hide();
    //   }
    //   this.loadAllUsersLists();
    // });

    this.initGridProperties();
    this.getWidthPortions();

    //listen for data table scroll event
    this.scrollEventSubscription = this.dataTableService.scrollEvent.subscribe(() => {
      if (this.currentPop) {
        this.currentPop.hide();
      }
    });

  }

  ngAfterViewChecked() {
    this.checkIfAllListsSelected();
    this.checkChanges();
  }

  checkChanges() {
    this.cdRef.detectChanges();
  }
  /**
   * load all users list
   */
  loadAllUsersLists() {
    this.isRequestCompleted = false;
    this.subscription = this.usersListService.getUsersLists().subscribe((response: any) => {
      if (!response.success) {
        this.isRequestCompleted = true;
        this.toastr.error('Couldn\'t load user lists: ' + response.response.message, 'Error');
      } else {
        this.userLists = response.response.deviceUserLists;
        this.userLists.forEach((list: any) => {
          list.selected = false;
        });
        this.userLists = Utility.sortListInDescendingOrder(this.userLists, 'lastUpdatedDate', true);
      }
      this.isRequestCompleted = true;
    }, () => {
      this.isRequestCompleted = true;
    });
  }


  getColumnWidth(column: any) {
    return (column.width * 100 / this.totalPortions) + '%';
  }

  getWidthPortions() {
    this.totalPortions = 0;
    this.userListsColumns.forEach((column: any) => {
      if (!column.hidden) {
        this.totalPortions += column.width;
      }
    });
  }

  initGridProperties() {
    this.userListsColumns = [
      { field: '_', header: '', width: 3, suppressHide: true, suppressSort: true },
      { field: 'name', header: 'Name', width: 32, suppressHide: true },
      { field: 'description', header: 'Description', width: 40, suppressHide: true },
      { field: 'usersCount', header: 'Users', width: 15, suppressHide: true },
      { field: '_', header: '', width: 10, suppressHide: true, suppressSort: true }
    ];
  }

  selectAllLists() {
    this.userLists.forEach((userList: any) => {
      userList.selected = this.allListsChecked;
      if (userList.filtered) {
        userList.selected = this.allListsChecked;
      }
    });

    this.updateFilteredListsCounter();
    this.updateSelectedListsCounter();
  }

  toggleVisibility() {
    this.markedLists = true;
    for (var i = 0; i < this.userLists.length; i++) {
      if (!this.userLists[i].selected) {
        this.markedLists = false;
        break;
      }
    }
  }

  // viewListDetails(list: any) {
  //   this.usersListService.setList(list);
  //   this.modalRef = this.modalService.show(ListDetailsComponent, {
  //     backdrop: true,
  //     class: 'modal-dialog-centered modal-xl',
  //     ignoreBackdropClick: true
  //   });
  // }
  /**
   * edit user list
   * @param id: any 
   */
  editList(id: string) {
    if (Utility.userEnabled(Role[2])) {
      this.usersListService.getUserListById(id).subscribe((response: any) => {
        if (!response.success) {
          this.toastr.error('Error while fetching user list: ' + response.message, 'Error');
        } else {
          this.usersListService.setList(response.response.deviceUserList);
          this.phoneConfigurationService.editUserList.emit();
        }
      });
    } else {
      this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
    }
  }

  getPlacement(item: any) {
    if (this.filterCount !== -1 && this.userLists.indexOf(item) >= this.filterCount) {
      return 'top';
    }
    if (this.userLists.indexOf(item) >= (this.userLists.length - 2)) {
      return 'top';
    }
    return 'bottom';
  }

  resetParameters() {
    this.selectedListsBar = false;
    this.searchQuery = '';
    this.searchQueryStatusChange.emit('');
    this.loadAllUsersLists();
  }

  resetView() {
    this.allListsChecked = this.markedLists = false;
    this.loadAllUsersLists();
  }

  deleteConfirmation(template: any) {
    this.modalRef = this.modalService.show(template, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
  }

  /**
   * service call to delete select user list
   */
  deleteSelectedLists() {
    if (Utility.userEnabled(Role[2])) {
      // tslint:disable-next-line: max-line-length triple-equals
      const toDelete = this.userLists.filter((item: any) => (this.searchQuery == '') ? (item.selected == true) : item.selected == true && item.filtered == true).map((item: any) => item.id);
      if (toDelete.length > 1) {
        this.usersListService.deleteMultipleLists(toDelete).subscribe((response: any) => {
          if (!response.success) {
            // tslint:disable-next-line:max-line-length
            this.toastr.error('Error trying to delete List: \nMessage:' + response.response.message + '\nFailed to delete: ' + response.response.failedTestCases, 'Error');
          } else {
            this.resetParameters();
            this.toastr.success('User Lists deleted successfully', 'Success');
          }
        });
      } else {
        this.usersListService.deleteUserList(toDelete[0]).subscribe((response: any) => {
          if (!response.success) {
            this.toastr.error('Error trying to delete the list: ' + response.response.message, 'Error');
          } else {
            this.resetParameters();
            this.toastr.success('User List deleted successfully', 'Success');
          }
        });
      }
    } else {
      this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
    }
  }

  deleteList(list: any) {
    if (Utility.userEnabled(Role[2])) {
      this.usersListService.deleteUserList(list.id).subscribe((response: any) => {
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
    if (this.userLists.length > 0) {
      // tslint:disable-next-line: triple-equals
      this.allListsChecked = this.userLists.every((item: any) => item.selected == true);
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
    this.userLists.forEach((userList: any) => {
      if (userList.selected) {
        this.selectedListsQty++;
      }
    });
  }

  updateFilteredListsCounter() {
    this.filteredListsQty = 0;
    this.userLists.forEach((userList: any) => {
      if (userList.filtered) {
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

  // showListPhones(id: string) {
  //   this.phoneConfigurationService.phonesAtInventoryByList.emit(id);
  // }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe;
    }
    if (this.scrollEventSubscription) {
      this.scrollEventSubscription.unsubscribe();
    }
  }
}
