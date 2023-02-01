import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { Constants } from 'src/app/helpers/constants';
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
  private subaccountId: any;
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
    jobTitle: ['', Validators.required],
    subaccountAdminEmail: ['', [Validators.required, Validators.email]],
    companyName: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern(Constants.PHONE_NUMBER_PATTERN), Validators.minLength(10), Validators.maxLength(15)]]
  });

  reports: any =  [
    { label: "Daily Reports", value: Report.DAILY_REPORTS},
    { label: "Weekly Reports", value: Report.WEEKLY_REPORTS},
    { label: "Monthly Summaries", value: Report.MONTHLY_REPORTS}
  ];
  
  /**
   * fetch user profile details
   */
  private fetchUserProfileDetails(): void {
    const subaccountUserProfileDetails = this.subaccountService.getSelectedSubAccount();
    if (subaccountUserProfileDetails) {
      const { companyName } = subaccountUserProfileDetails;
      if (subaccountUserProfileDetails.id) {
        this.userprofileDetails = { subaccountId: subaccountUserProfileDetails.id };
      } else {
        this.userprofileDetails = subaccountUserProfileDetails;
      }
      // check for company name and set it to form if company name has value
      if (companyName) {
        this.addStakeholderForm.patchValue({ companyName });
      }
    }
  }

  ngOnInit(): void {
    this.fetchUserProfileDetails();
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
      const stakeholderDetails = { ... this.addStakeholderForm.value };
      let stakeholderNotificationsAndtype = {...stakeholderDetails, type: this.type, notifications: this.notifications}
      stakeholderNotificationsAndtype.subaccountId = subaccountId;
      if (stakeholderNotificationsAndtype.notifications.length > 0) {
        stakeholderNotificationsAndtype.notifications = stakeholderNotificationsAndtype.type + ',' + stakeholderNotificationsAndtype.notifications;
      }
      this.stakeholderService.createStakeholder(stakeholderNotificationsAndtype).subscribe((response: any) => {
        const { error } = response;
        if (error) {
          this.snackBarService.openSnackBar(response.error, 'Error adding stakeholder');
          this.dialogRef.close(response);
          this.isDataLoading = false;
        } else {
          this.isDataLoading = false;
          this.snackBarService.openSnackBar('Created Stakeholder successfully', '');
          this.onCancel('closed');
        }
      }, (err) => {
        this.isDataLoading = false;
        this.snackBarService.openSnackBar(err.error, 'Error adding stakeholder');
        this.onCancel('closed');
      });
    } catch (e) {
      console.error('error while creating stake holder | ', e);
    }
  }
}
