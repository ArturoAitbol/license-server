import { Component, OnInit } from '@angular/core';
import { BsModalRef} from 'ngx-bootstrap';
import { MSTeamsUser } from 'src/app/model/ms-team-user';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { ToastrService } from 'ngx-toastr';
import { MSTeamsUserService } from 'src/app/services/ms-teams-user.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {

  userRef: BsModalRef;
  modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-sm', ignoreBackdropClick: true };
  userDetails: MSTeamsUser = new MSTeamsUser();
  isRequestCompleted: boolean;

  constructor(
    private phoneConfigurationService: PhoneConfigurationService,
    private toastService: ToastrService,
    private teamsUserService: MSTeamsUserService) { }

  ngOnInit() {
    this.isRequestCompleted = false;
    this.getUserDetails();
  }
  /**
   * get user details
   */
  getUserDetails(): void {
    this.userDetails = this.teamsUserService.getUserDetails();
  }

  updateUser(): void {
    this.isRequestCompleted = false;
    this.teamsUserService.updateUser(this.userDetails).subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error('Error while updating user details: ' + response.response.message, 'Error');
        this.isRequestCompleted = true;
      } else {
        this.toastService.success('User details updated successfully', 'Success');
        this.phoneConfigurationService.editUser.emit();
      }
      this.isRequestCompleted = true;
    }, () => { this.isRequestCompleted = true; });
  }
  /**
    * to close the modal
    */
  hideModal() {
    this.phoneConfigurationService.closeEditUserModal.emit();
  }

}
