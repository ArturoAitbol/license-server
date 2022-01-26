import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { FilterService } from 'src/app/services/filter.service';
import { DataTableService } from 'src/app/services/data-table.service';
import { ToastrService } from 'ngx-toastr';
import { MSTeamsUserService } from 'src/app/services/ms-teams-user.service';
import { Subscription } from 'rxjs';
import { Utility, PageNames } from 'src/app/helpers/Utility';
import { Role } from 'src/app/helpers/role';
import { MSTeamsUser } from 'src/app/model/ms-team-user';
import { EditUserComponent } from './user-operations/edit-user/edit-user.component';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { UserListService } from 'src/app/services/user-list.service';

@Component({
  selector: 'app-user-inventory',
  templateUrl: './user-inventory.component.html',
  styleUrls: ['./user-inventory.component.css']
})
export class UserInventoryComponent implements OnInit {
  @ViewChild('userInventoryListGrid', { static: false }) userListGrid: DataTableComponent;

  @Input() addToUserList: boolean = false;
  @Input() editUserList: boolean = false;
  @Input() searchQuery: string;
  @Output() searchQueryStatusChange: any = new EventEmitter<boolean>();
  users: MSTeamsUser[] = [];
  usersColumns: any = [];
  auxiliarUsers: MSTeamsUser[] = [];
  originallySelected: any = [];
  userLists: any = [];
  selectedList: string = '---Select---';
  private totalPortions: number;
  private currentPop: any;
  allListsChecked: any;
  selectedPhonesBar: boolean = false;
  markedLists: boolean = false;
  selectedListsBar: boolean = false;
  selectedListsQty: number = 0;
  modalRef: BsModalRef;
  editModalRef: BsModalRef;
  isRequestCompleted: boolean = false;
  filteredListsQty: number = 0;
  filterCount = -1;
  modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-md', ignoreBackdropClick: true };
  selectedUsersQty = 0;
  filteredUsersQty = 0;
  listUpdater: boolean = false;
  selectedUserList: any;
  selectedSubModelList: any = [];
  previouslySelectedUser: boolean = false;
  existedUserList: any = [];
  selectedAuxiliarUsers: any = [];
  tableHeight: string;
  // Subscription
  subscription: Subscription;
  scrollEventSubscription: Subscription;
  closedSidebarSubscription: Subscription;

  constructor(
    private phoneConfigurationService: PhoneConfigurationService,
    private modalService: BsModalService,
    private filterService: FilterService,
    private dataTableService: DataTableService,
    private toastr: ToastrService,
    private teamsUserService: MSTeamsUserService,
    private userListService: UserListService
  ) {
    this.tableHeight = Utility.getDataTableHeightByWidth(PageNames.UserInventory);
  }

  ngOnInit() {

    this.filterService.setFilterValue.subscribe((response: any) => {
      this.filterCount = response.count;
    });

    this.initGridProperties();
    this.getWidthPortions();
    this.loadAllMSTeamsUsers();
    this.loadAllUserLists();
    if (this.editUserList) {
      this.loadUsersToEdit();
    }
    //listen for data table scroll event
    this.scrollEventSubscription = this.dataTableService.scrollEvent.subscribe(() => {
      if (this.currentPop) {
        this.currentPop.hide();
      }
    });
    // Created user
    this.phoneConfigurationService.userCreated.subscribe(() => {
      this.loadAllMSTeamsUsers();
    });
    // Edit user
    this.phoneConfigurationService.editUser.subscribe(() => {
      if (this.editModalRef) {
        this.editModalRef.hide();
      }
      this.loadAllMSTeamsUsers();
    });
    // close edit user modal
    this.phoneConfigurationService.closeEditUserModal.subscribe(() => {
      if (this.editModalRef) {
        this.editModalRef.hide();
      }
    });
    // close sidebar
    this.closedSidebarSubscription = this.phoneConfigurationService.closedBar.subscribe((response: any) => {
      this.resetParameters();
      this.loadAllMSTeamsUsers();
    });

  }
  /**
   * get width of the column
   * @param column: any 
   */
  getColumnWidth(column: any) {
    return (column.width * 100 / this.totalPortions) + '%';
  }
  /**
   * initialize table columns width 
   */
  getWidthPortions() {
    this.totalPortions = 0;
    this.usersColumns.forEach((column: any) => {
      if (!column.hidden) {
        this.totalPortions += column.width;
      }
    });
  }
  /**
   * initialize the table header properties
   */
  initGridProperties() {
    this.usersColumns = [
      { field: '_', header: '', width: 4, suppressHide: true, suppressSort: true },
      { field: 'userName', header: 'User Name', width: 25, suppressHide: true },
      { field: 'email', header: 'Email', width: 30, suppressHide: true },
      { field: 'did', header: 'DID', width: 25, suppressHide: true },
      { field: '_', header: '', width: 10, suppressHide: true, suppressSort: true }
    ];
  }
  /**
   * load all users list
   */
  loadAllMSTeamsUsers(): void {
    this.isRequestCompleted = false;
    this.teamsUserService.getAllUsers().subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Couldn\'t load users: ' + response.response.message, 'Error');
        this.isRequestCompleted = true;
      } else {
        this.users = response.response.users;
        if (!this.editUserList) {
          this.allListsChecked = this.markedLists = false;
          this.users.forEach(list => list.selected = false);
        } else {
          // tslint:disable-next-line:triple-equals
          this.markedLists = this.allListsChecked = this.users.every((item: any) => item.selected == true);
        }
        setTimeout(() => {
          this.users = Utility.sortListInDescendingOrder(this.users, 'lastUpdatedDate_ts', true);
        }, 0);
      }
      this.isRequestCompleted = true;
    }, (error: any) => {
      this.isRequestCompleted = true;
      this.toastr.error('Couldn\'t load users: ' + error, 'Error');
    });
  }

  loadUsersToEdit(): void {
    this.isRequestCompleted = false;
    this.teamsUserService.getAllUsers().subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Couldn\'t load users: ' + response.response.message, 'Error');
        this.isRequestCompleted = true;
        this.phoneConfigurationService.inventoryData.emit({ hasData: false });
      } else {
        this.isRequestCompleted = true;
        const selectedUserListDetails: any = this.userListService.getList();
        this.users = response.response.users;
        this.allListsChecked = this.markedLists = false;
        this.users.forEach(list => list.selected = false);
        this.users = Utility.sortListInDescendingOrder(this.users, 'lastUpdatedDate_ts', true);
        this.phoneConfigurationService.inventoryData.emit({ hasData: true });
        this.users.forEach((user: any) => {
          selectedUserListDetails.users.forEach((existingUser: any) => {
            // tslint:disable-next-line:triple-equals
            if (user.id == existingUser.id) {
              user.selected = true;
              this.selectedForListEdition(user);
            }
          });
        });
        this.allListsChecked = this.markedLists = this.users.every((user: any) => user.selected == true);
      }
    }, (error: any) => {
      this.isRequestCompleted = true;
      this.phoneConfigurationService.inventoryData.emit({ hasData: false });
      this.toastr.error('Couldn\'t load users: ' + error, 'Error');
    });
  }

  selectAllUsers() {
    if (!this.addToUserList && !this.editUserList) {
      this.selectedPhonesBar = this.allListsChecked;
    }

    this.users.forEach((user: any) => {
      user.selected = this.allListsChecked;
      if (user.filtered) {
        user.selected = this.allListsChecked;
      }
      if (this.addToUserList) {
        this.selectedForListAddition(user);
      }
      if (this.editUserList) {
        this.selectedForListEdition(user);
      }
    });

    this.updateFilteredPhonesCounter();
    this.updateSelectedPhonesCounter();
  }

  toggleVisibility() {
    this.markedLists = true;
    for (var i = 0; i < this.users.length; i++) {
      if (!this.users[i].selected) {
        this.markedLists = false;
        break;
      }
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
    if (this.users.length > 0) {
      // tslint:disable-next-line: triple-equals
      this.allListsChecked = this.markedLists = this.users.every((item: any) => item.selected == true);
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
    this.users.forEach((user: any) => {
      if (user.selected) {
        this.selectedListsQty++;
      }
    });
  }

  updateFilteredListsCounter() {
    this.filteredListsQty = 0;
    this.users.forEach((user: any) => {
      if (user.filtered) {
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
  getPlacement(item: any) {
    if (this.filterCount !== -1 && this.users.indexOf(item) >= this.filterCount) {
      return 'top';
    }
    if (this.users.indexOf(item) >= (this.users.length - 2)) {
      return 'top';
    }
    return 'bottom';
  }

  userEnabled(role: string) {
    const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
    if (currentPermissions.includes(role) || currentPermissions.includes(Role[1])) {
      return true;
    }
    return false;
  }
  /**
   * enable delete button based on condition
   */
  enableDeleteButton() {
    const isAnyUserSelected = this.users.some((user: any) => user.selected == true);
    const response: boolean = (isAnyUserSelected) ? false : true;
    return response;
  }
  /**
   * edit user
   * @param user: any 
   */
  editUser(user: MSTeamsUser) {
    if (Utility.userEnabled(Role[2])) {
      this.teamsUserService.setUserDetailsForEdit({ ...user });
      this.editModalRef = this.modalService.show(EditUserComponent, this.modalConfig);
    } else {
      this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
    }
  }
  /**
   * delete particular user
   * @param list: MSTeamsUser 
   */
  deleteUser(user: MSTeamsUser) {
    if (Utility.userEnabled(Role[2])) {
      this.teamsUserService.deleteUser(user.id).subscribe((response: any) => {
        if (!response.success) {
          this.toastr.error('Error trying to delete the user: ' + response.response.message, 'Error');
        } else {
          this.resetParameters();
          this.toastr.success('User deleted successfully', 'Success');
          this.loadAllMSTeamsUsers();
        }
      }, (error: any) => {
        this.toastr.error('Error trying to delete the user: ' + error, 'Error');
      });
    } else {
      this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
    }
  }
  resetParameters() {
    this.selectedListsBar = false;
    this.searchQuery = '';
    this.searchQueryStatusChange.emit('');
    // this.loadAllMSTeamsUsers();

    this.addToUserList = false;
    this.editUserList = false;
    this.allListsChecked = false;
    this.markedLists = false;
    this.selectedPhonesBar = false;
    this.selectedUsersQty = 0;
    this.searchQuery = '';
  }

  resetView() {
    this.allListsChecked = this.markedLists = false;
    this.loadAllMSTeamsUsers();
  }

  deleteConfirmation(template: any) {
    // if (this.allListsChecked) {
    this.modalRef = this.modalService.show(template, { backdrop: true, class: 'modal-dialog-centered', ignoreBackdropClick: true });
  }

  /**
   * service call to delete selected users
   */
  deleteSelectedLists() {
    if (Utility.userEnabled(Role[2])) {
      // tslint:disable-next-line: max-line-length triple-equals
      const toDelete = this.users.filter((item: any) => (this.searchQuery == '') ? (item.selected == true) : item.selected == true && item.filtered == true).map((item: any) => item.id);
      if (toDelete.length > 1) {
        this.teamsUserService.deleteMultipleUsers(toDelete).subscribe((response: any) => {
          if (!response.success) {
            // tslint:disable-next-line:max-line-length
            this.toastr.error('Error trying to delete the users: \nMessage:' + response.response.message + '\nFailed to delete: ' + response.response.failedTestCases, 'Error');
          } else {
            this.resetParameters();
            this.resetView();
            this.toastr.success('Users deleted successfully', 'Success');
          }
        }, (error: any) => {
          this.toastr.error('Error trying to delete the users: ' + error, 'Error');
        });
      } else {
        this.teamsUserService.deleteUser(toDelete[0]).subscribe((response: any) => {
          if (!response.success) {
            this.toastr.error('Error trying to delete the user: ' + response.response.message, 'Error');
          } else {
            this.resetParameters();
            this.resetView();
            this.toastr.success('User deleted successfully', 'Success');
          }
        }, (error: any) => {
          this.toastr.error('Error trying to delete the user: ' + error, 'Error');
        });
      }
    } else {
      this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
    }
  }
  /**
    * to close the modal
    */
  hideModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }


  selectedForListAddition(user: any) {
    if (this.addToUserList && user.selected) {
      this.phoneConfigurationService.addUserToList.emit(user);
    }
    if (this.addToUserList && !user.selected) {
      this.phoneConfigurationService.removeUserFromList.emit(user);
    }
  }

  selectedForListEdition(user: any) {
    if (this.editUserList && user.selected) {
      this.phoneConfigurationService.addUserToList.emit(user);
    }
    if (this.editUserList && !user.selected) {
      this.phoneConfigurationService.removeUserFromList.emit(user);
    }
  }


  checkIfAllPhonesSelected() {
    this.updateSelectedPhonesCounter();
    this.updateFilteredPhonesCounter();
    // tslint:disable-next-line:triple-equals
    if (this.selectedUsersQty == this.filteredUsersQty && this.selectedUsersQty > 0) {
      this.allListsChecked = true;
    } else {
      this.allListsChecked = false;
    }
    if (this.users.length > 0) {
      // tslint:disable-next-line: triple-equals
      this.allListsChecked = this.users.every((item: any) => item.selected == true);
    }

    if (this.selectedUsersQty > 0) {
      this.selectedPhonesBar = true;
    } else {
      this.selectedPhonesBar = false;
    }
  }

  updateSelectedPhonesCounter() {
    this.selectedUsersQty = 0;
    this.users.forEach((user: any) => {
      if (user.selected) {
        this.selectedUsersQty++;
      }
    });
  }

  updateFilteredPhonesCounter() {
    this.filteredUsersQty = 0;
    this.users.forEach((user: any) => {
      if (user.filtered) {
        this.filteredUsersQty++;
      }
    });
    if (this.userListGrid) {
      // tslint:disable-next-line:triple-equals
      if (this.filteredUsersQty < 14 && this.filteredUsersQty != 0) {
        this.userListGrid.rowQty = this.filteredUsersQty;
      } else {
        this.userListGrid.rowQty = 100;
      }
    }
  }

  enableAddToListButton() {
    const isUserSelected = this.users.some((user: any) => user.selected == true);
    return (isUserSelected && !this.addToUserList && !this.editUserList) ? false : true;
  }


  configureBeforeAdding() {
    this.selectedList = '---Select---';
    if (this.searchQuery != '') {
      // tslint:disable-next-line: max-line-length triple-equals
      const selectedPhones = this.users.filter((test: any) => (this.searchQuery == '') ? (test.selected == true) : test.selected == true && test.filtered == true).map((test: any) => test);
      // tslint:disable-next-line: max-line-length triple-equals
      const unSelectedPhones = this.users.filter((test: any) => (this.searchQuery == '') ? (test.selected == true) : test.filtered == false).map((test: any) => {
        test.selected = false;
        return test;
      });
      this.auxiliarUsers = JSON.parse(JSON.stringify(selectedPhones.concat(unSelectedPhones)));
    } else {
      this.auxiliarUsers = JSON.parse(JSON.stringify(this.users));
    }
    this.originallySelected = JSON.parse(JSON.stringify(this.auxiliarUsers.filter((user: any) => user.selected === true)));
    this.loadAllUserLists();
  }

  addToExistingList(template: TemplateRef<any>) {
    if (Utility.userEnabled(Role[2])) {
      this.configureBeforeAdding();
      this.modalRef = this.modalService.show(template, this.modalConfig);
    } else {
      this.toastr.warning('User doesn\'t have permissions to execute this action', 'Warning');
    }
  }

  closeAndReset(): void {
    this.allListsChecked = false;
    this.markedLists = false;
    if (this.modalRef) {
      this.modalRef.hide();
      this.modalRef = undefined;
    }
    this.selectedSubModelList = [];
    this.users.forEach((user: any) => { user.selected = false; });
  }

  selectMatchedPhones() {
    this.checkPhonesByValue(false);
    this.selectOriginalPhones();
    this.selectCurrentListPhones();
    this.listUpdater = true;
  }

  selectOriginalPhones() {
    this.originallySelected.forEach((selectedPhone: any) => {
      this.auxiliarUsers.forEach((existingPhone: any) => {
        if (existingPhone.id === selectedPhone.id) {
          existingPhone.selected = true;
        }
      });
    });
  }

  selectCurrentListPhones() {
    this.selectedUserList.users.forEach((selectedPhone: any) => {
      this.auxiliarUsers.forEach((existingPhone: any) => {
        if (existingPhone.id === selectedPhone.id) {
          existingPhone.selected = true;
        }
      });
    });
  }

  checkPhonesByValue(value: boolean) {
    this.auxiliarUsers.forEach((user: any) => {
      user.selected = value;
    });
  }
  enableListCreation() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    if (this.previouslySelectedUser) {
      // uncheck all the phones in auxiliar list
      this.auxiliarUsers.forEach((user: any) => {
        user.selected = false;
      });
      // check the selected phones in auxiliar list
      this.originallySelected.forEach((item: any) => {
        this.auxiliarUsers.forEach((element: any) => {
          if (element.id == item.id) { element.selected = true; }
        });
      });
      this.previouslySelectedUser = false;
    }
    // check if selectedAuxiliarPhones has any items
    this.selectedAuxiliarUsers.forEach((item: any) => {
      this.auxiliarUsers.forEach((element: any) => {
        if (element.id == item.id) { element.selected = true; }
      });
    });
    const selectedUsers = this.auxiliarUsers.filter((user: any) => user.selected === true);
    this.users = this.auxiliarUsers;
    this.selectedAuxiliarUsers = [];
    this.phoneConfigurationService.createUserListFromModal.emit(selectedUsers);
  }
  onChangeAuxiliarPhones(user: any): void {
    if (user.selected) {
      this.selectedAuxiliarUsers.push(user);
    } else if (!user.selected) {
      const index = this.selectedAuxiliarUsers.findIndex((e: any) => e.id == user.id);
      this.selectedAuxiliarUsers.splice(index, 1);
    }
  }

  changedList(listId: any) {
    // tslint:disable-next-line:triple-equals
    if (listId != 'newList') {
      this.previouslySelectedUser = true;
      // tslint:disable-next-line:triple-equals
      if (listId != '---Select---') {
        this.userListService.getUserListById(listId).subscribe((response: any) => {
          if (!response.success) {
            this.toastr.error('Couldn\'t retrieve information for selected List: ' + response.response.message, 'Error');
          } else {
            this.selectedUserList = response.response.deviceUserList;
            this.existedUserList = this.selectedUserList['users']
            this.selectMatchedPhones();
          }
        });
      } else {
        this.toastr.warning('Please select a valid User List', 'Warning');
      }
    } else {
      this.enableListCreation();
    }
  }
  updateUserList(): void {
    const selectedUsers: any = [];
    this.auxiliarUsers.forEach((user: any) => {
      if (user.selected) {
        selectedUsers.push(user);
      }
    });

    this.existedUserList.forEach((element: any) => {
      // check whether the phone exist in the selectedPhoneList or not
      const index = selectedUsers.findIndex((e: any) => e.id === element.id);
      // add to selectedPhoneList list if that phone is not in the list
      if (index == -1) {
        selectedUsers.push(element);
      }
    });

    this.selectedUserList.users = selectedUsers;

    this.userListService.updateUsersList(this.selectedUserList).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Error trying to update User List: ' + response.response.message, 'Error');
      } else {
        this.toastr.success('User List updated successfully', 'Success');
        this.closeAndReset();
        this.loadAllMSTeamsUsers();
      }
    }, () => {
      this.closeAndReset();
      this.loadAllMSTeamsUsers();
    });
  }

  /**
   * load all user pools list
   */
  loadAllUserLists() {
    this.userListService.getUsersLists().subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Couldn\'t load user lists: ' + response.response.message, 'Error');
      } else {
        this.userLists = response.response.deviceUserLists;
      }
    });
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe;
    }
    if (this.scrollEventSubscription) {
      this.scrollEventSubscription.unsubscribe();
    }
    if (this.closedSidebarSubscription) {
      this.closedSidebarSubscription.unsubscribe();
    }

  }
}
