import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  oldPassword = '';
  newPassword = '';

  constructor(private toastr: ToastrService,
    private userService: UserService,
    private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

  closeModal() {
    this.userService.closeModal.emit();
  }

  changePassword() {
    const passObject = { oldPassword: this.oldPassword, newPassword: this.newPassword };
    this.userService.changePassword(passObject).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Error trying to change password: ' + response.message, 'Error');
      } else {
        this.closeModal();
        this.toastr.success('Password changed successfully', 'Success');
        this.authenticationService.closeSession.emit();
      }
    });
  }
}
