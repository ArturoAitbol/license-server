import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
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
  missingDataFlag:boolean;
  selectedNotifications = new SelectionModel<INotification[]>(true, []);
  toggleStatus = true;
  phoneNumberRequiredComplement = "";
  emailNotifications: boolean;

  CountryISO = CountryISO;
  SearchCountryField = SearchCountryField;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries : CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ViewProfileComponent>,
    private snackBarService: SnackBarService,
    private userProfileService: UserProfileService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if(this.data.missing)
      this.missingDataFlag = this.data.missing;
    else
      this.missingDataFlag = false;
    this.isDataLoading = true;
    this.initializeFormDetails();
    this.fetchUserProfileDetails();
  }
  /**
   * initialize the Profile Form details and required list
   */
  initializeFormDetails(): void {
    let formObject: any = {
      name: ['', Validators.required],
      jobTitle: [''],
      companyName: [''],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phoneNumber: [''],
      role: ['']
    };
    if (this.data?.jobTitle && this.data?.jobTitle !== "")
      formObject.jobTitle.push(Validators.required);
    if (this.data?.companyName && this.data?.companyName !== "")
      formObject.companyName.push(Validators.required);
    if (this.data?.phoneNumber && this.data?.phoneNumber !== "") {
      this.phoneNumberRequiredComplement = " *";
      formObject.phoneNumber.push(Validators.required);
    }
    this.viewProfileForm = this.formBuilder.group(formObject);
  }
 
  /**
   * fetch user profile details and save it in local storage
   */
  fetchUserProfileDetails() {
    try {
      this.userProfileService.setSubaccountUserProfileDetails(this.data);
      this.isDataLoading = false;
      if(this.data){
        this.viewProfileForm.patchValue(this.data);
        this.emailNotifications = this.data.emailNotifications;
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
      let requestPayload = { ...this.viewProfileForm.value };
      delete requestPayload.type;
      if (requestPayload.phoneNumber)
        requestPayload.phoneNumber = requestPayload.phoneNumber.e164Number;
      else 
        requestPayload.phoneNumber = "";
      requestPayload.emailNotifications = this.emailNotifications;
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

  onChangeToggle(flag: boolean): void {
    this.toggleStatus = flag;
    if (flag) {
        this.emailNotifications = true;
    } else {
        this.emailNotifications = false;
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
