import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { MSTeamsUser } from 'src/app/model/ms-team-user';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { ToastrService } from 'ngx-toastr';
import { MSTeamsUserService } from 'src/app/services/ms-teams-user.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  userRef: BsModalRef;
  modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-sm', ignoreBackdropClick: true };
  newUser: MSTeamsUser = new MSTeamsUser();
  isRequestCompleted: boolean;
  constructor(
    private phoneConfigurationService: PhoneConfigurationService,
    private toastService: ToastrService,
    private teamsUserService: MSTeamsUserService) { }

  ngOnInit() {
    this.isRequestCompleted = false;
  }
  /**
   * create MSFT User
   */
  createUser(): void {
    this.isRequestCompleted = false;
    this.teamsUserService.createUser(this.newUser).subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error('Error while creating user: ' + response.response.message, 'Error');
        this.isRequestCompleted = true;
      } else {
        this.toastService.success('User created successfully', 'Success');
        this.phoneConfigurationService.userCreated.emit();
        this.hideModal();
      }
      this.isRequestCompleted = true;
    }, (error: any) => {
      this.isRequestCompleted = true;
      this.toastService.error('Error while creating user: ' + error, 'Error');
    });
  }
  /**
    * to close the modal
    */
  hideModal() {
    this.phoneConfigurationService.hideModal.emit();
  }

}
