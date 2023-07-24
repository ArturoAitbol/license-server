import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { Report } from 'src/app/helpers/report';
import { IUserProfile } from 'src/app/model/user-profile.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StakeHolderService } from 'src/app/services/stake-holder.service';
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-add-stake-holder',
  templateUrl: './add-stake-holder.component.html',
  styleUrls: ['./add-stake-holder.component.css']
})
export class AddStakeHolderComponent implements OnInit {

  isDataLoading = false;
  userprofileDetails: IUserProfile;
  CountryISO = CountryISO;
  SearchCountryField = SearchCountryField;
  PhoneNumberFormat = PhoneNumberFormat;
  emailNotifications: boolean = true;
  toggleStatus = true;
  preferredCountries : CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  constructor(
    private formBuilder: FormBuilder,
    private snackBarService: SnackBarService,
    private stakeholderService: StakeHolderService,
    public dialogRef: MatDialogRef<AddStakeHolderComponent>,
    private subaccountService: SubAccountService) {}
    readonly type = 'TYPE:Detailed';
    readonly notifications = 'DAILY_REPORTS';
  /**
   * initialize update stake holder form
   */
  addStakeholderForm = this.formBuilder.group({
    name: ['', Validators.required],
    jobTitle: [''],
    subaccountAdminEmail: ['', [Validators.required, Validators.email]],
    companyName: [''],
    phoneNumber: ['']
  });

  
  /**
   * fetch user profile details
   */
  private fetchUserProfileDetails(): void {
    const subaccountUserProfileDetails = this.subaccountService.getSelectedSubAccount();
    if (subaccountUserProfileDetails) {
      const { companyName } = subaccountUserProfileDetails;
      const { customerName } = subaccountUserProfileDetails;
      if (subaccountUserProfileDetails.id) {
        this.userprofileDetails = { subaccountId: subaccountUserProfileDetails.id };
      } else {
        this.userprofileDetails = subaccountUserProfileDetails;
      }
      // check for company name and set it to form if company name has value
      if (companyName) {
        this.addStakeholderForm.patchValue({ companyName });
      } else {
        if(customerName)
          this.addStakeholderForm.patchValue({ companyName: customerName });
      }
    }
  }

  ngOnInit(): void {
    this.fetchUserProfileDetails();
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
  /**
   * on click Submit button
   */
  addStakeholder() {
    try {
      this.isDataLoading = true;
      const { subaccountId } = this.userprofileDetails;
      let stakeholderDetails = { ... this.addStakeholderForm.value };
      if (stakeholderDetails.phoneNumber && stakeholderDetails.phoneNumber !== '')
        stakeholderDetails.phoneNumber = stakeholderDetails.phoneNumber.e164Number;
      let stakeholderNotificationsAndtype = {...stakeholderDetails, type: this.type, notifications: this.notifications, emailNotifications: this.emailNotifications};
      stakeholderNotificationsAndtype.subaccountId = subaccountId;
      if (stakeholderNotificationsAndtype.notifications.length > 0) {
        stakeholderNotificationsAndtype.notifications = stakeholderNotificationsAndtype.type + ',' + stakeholderNotificationsAndtype.notifications;
      }
      this.stakeholderService.createStakeholder(stakeholderNotificationsAndtype).subscribe((response: any) => {
        const { error } = response;
        if (error) {
          this.snackBarService.openSnackBar(response.error, 'Error adding stakeholder');
          this.isDataLoading = false;
        } else {
          this.snackBarService.openSnackBar('Created Stakeholder successfully', '');
          this.isDataLoading = false;
          this.onCancel('closed');
        }
      }, (err) => {
        this.snackBarService.openSnackBar(err.error, 'Error adding stakeholder');
        this.isDataLoading = false;
        this.onCancel('closed');
      });
    } catch (e) {
      console.error('error while creating stakeholder | ', e);
      this.isDataLoading = false;
      this.onCancel('closed');
    }
  }
}
