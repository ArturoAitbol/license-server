import { Component, OnInit } from '@angular/core';
import { PhoneListService } from 'src/app/services/phone-list.service';
import { ToastrService } from 'ngx-toastr';
import { PhoneService } from 'src/app/services/phone.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.css']
})
export class EditListComponent implements OnInit {
  currentList: any = [];
  allAvailablePhones: any = [];
  subscription: Subscription;
  constructor(private phoneService: PhoneService,
    private phoneListService: PhoneListService,
    private toastr: ToastrService) { }


  loadAllPhones() {
    this.phoneService.getPhones().subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Couldn\'t load phones: ' + response.response.message, 'Error');
      } else {
        this.allAvailablePhones = response.response.phones;
        this.phoneListService.getPhoneListById(this.phoneListService.getList().id).subscribe((response: any) => {
          if (!response.success) {
            this.toastr.error('Error acquiring list: ' + response.message, 'Error');
          } else {
            this.currentList = response.response.phonePool;
            this.allAvailablePhones.forEach((availablePhone: any) => {
              this.currentList.phones.forEach((phone: any) => {
                if (availablePhone.id === phone.id) {
                  availablePhone.selected = true;
                }
              });
            });
          }
        });
      }
    });
  }

  ngOnInit() {
    this.loadAllPhones();
  }

  updatePhoneList() {
    this.currentList.phones = this.allAvailablePhones.filter(phone => phone.selected);
    this.phoneListService.updatePhoneList(this.currentList).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Phone List couldn\'t be updated: ' + response.response.message, 'Error');
      } else {
        this.toastr.success('Phone List updated successfully', 'Success');
        this.hideModal();
      }
    });
  }

  getMarkedPhones() {
    return this.allAvailablePhones.filter(phone => phone.selected).length;
  }

  hideModal() {
    this.phoneListService.listOperationsHide.emit();
  }
}
