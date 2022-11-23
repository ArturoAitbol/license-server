import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Constants } from 'src/app/helpers/constants';
import { Report } from 'src/app/helpers/report';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserProfileService } from 'src/app/services/user-profile.service';

export interface INotification {
  id: number;
  label: string;
  value: string;
}

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.css']
})
export class ViewProfileComponent implements OnInit {
  viewProfileForm: FormGroup;
  isDataLoading = false;
  notifications: any = [];
  reports: any = [];
  isUpdatedClicked: boolean = false;
  selectedNotifications = new SelectionModel<INotification[]>(true, []);

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ViewProfileComponent>,
    private snackBarService: SnackBarService,
    private userProfileService: UserProfileService
  ) { }

  ngOnInit(): void {
    this.isDataLoading = true;
    this.initializeFormDetails();
    this.fetchUserProfileDetails();
  }
  /**
   * initialize the Profile Form details and required list
   */
  initializeFormDetails(): void {
    this.viewProfileForm = this.formBuilder.group({
      name: ['', Validators.required],
      jobTitle: ['', Validators.required],
      companyName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(Constants.PHONE_NUMBER_PATTERN), Validators.minLength(10), Validators.maxLength(15)]]
    });
  }
 
  /**
   * fetch user profile details and save it in local storage
   */
  async fetchUserProfileDetails(): Promise<void> {
    try {
      const res: any = await this.userProfileService.getUserProfileDetails().toPromise();
      if (res) {
        const { userProfile } = res;
        this.userProfileService.setSubaccountUserProfileDetails(userProfile);
        this.isDataLoading = false;
        //let mappedNotifications: any[] = [];
        if (userProfile) {
          this.viewProfileForm.patchValue(userProfile);
        }
      }
    } catch (error) {
      console.error('Error while fetching user profile details | ', error);
    }
  }

  /**
   * update User Profile Details
   */
  updateProfile(): void {
    try {
      this.isUpdatedClicked = true;
      const requestPayload = { ...this.viewProfileForm.value };
      let { type } = requestPayload;
      delete requestPayload.type;
      this.userProfileService.updateUserProfile(requestPayload)
        .toPromise()
        .then((response: any) => {
          this.isDataLoading = false;
          if (response?.error) {
            this.snackBarService.openSnackBar(response.error, 'Error updating profile details');
            this.onCancel('error');
          } else {
            this.snackBarService.openSnackBar('Updated Profile successfully', '');
            this.onCancel('closed');
          }
        });
    } catch (err) {
      this.snackBarService.openSnackBar(err.error, 'Error updating profile details');
      console.error('error while updating profile details', err);
      this.isDataLoading = false;
      this.onCancel('error');
    }
  }
  /**
   * close the open dialog 
   * @param type: string [optional] 
   */
  onCancel(type?: string): void {
    this.dialogRef.close(type);
  }

}
