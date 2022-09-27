import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Constants } from 'src/app/helpers/constants';
import { Report } from 'src/app/helpers/report';
import { IUserProfile } from 'src/app/model/user-profile.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StakeHolderService } from 'src/app/services/stake-holder.service';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-add-stake-holder',
  templateUrl: './add-stake-holder.component.html',
  styleUrls: ['./add-stake-holder.component.css']
})
export class AddStakeHolderComponent implements OnInit {

  reports: any = [];
  isDataLoading = false;
  addStakeholderForm: FormGroup;
  userprofileDetails: IUserProfile;
  countryCode:any;

  constructor(
    private formBuilder: FormBuilder,
    private snackBarService: SnackBarService,
    private stakeholderService: StakeHolderService,
    private userprofileService: UserProfileService,
    public dialogRef: MatDialogRef<AddStakeHolderComponent>
  ) {
  }
  /**
   * initialize update stake holder form
   */
  initializeForm(): void {
    this.addStakeholderForm = this.formBuilder.group({
      name: ['', Validators.required],
      jobTitle: ['', Validators.required],
      subaccountAdminEmail: ['', [Validators.required, Validators.email]],
      companyName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      type: ['', Validators.required],
      notifications: new FormArray([])
    });
  }
  /**
   * fetch user profile details
   */
  private fetchUserProfileDetails(): void {
    const subaccountUserProfileDetails = JSON.parse(localStorage.getItem(Constants.SUBACCOUNT_USER_PROJECT));
    if (subaccountUserProfileDetails) {
      this.userprofileDetails = subaccountUserProfileDetails;
      const { companyName } = this.userprofileDetails;
      this.addStakeholderForm.patchValue({ companyName });
    }
  }

  ngOnInit(): void {
    this.reports = this.getReports();
    this.initializeForm();
    this.fetchUserProfileDetails();
  }
  /**
   * get reports
   * @returns: any[]
   */
  getReports(): any[] {
    return [
      { label: "Daily Reports", value: Report.DAILY_REPORTS },
      { label: "Weekly Reports", value: Report.WEEKLY_REPORTS },
      { label: "Monthly Summaries", value: Report.MONTHLY_REPORTS }
    ];
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
    this.isDataLoading = true;
    const { subaccountId } = this.userprofileDetails;
    const stakeholderDetails = { ... this.addStakeholderForm.value };
    stakeholderDetails.phoneNumber = this.countryCode + stakeholderDetails.phoneNumber
    const { type, notifications } = stakeholderDetails;
    stakeholderDetails.subaccountId = subaccountId;
    if (notifications.length > 0) {
      stakeholderDetails.notifications = type + ',' + notifications.join(',');
    }
    else {
      stakeholderDetails.notifications = type;
    }
    this.stakeholderService.createStakeholder(stakeholderDetails).subscribe((response: any) => {
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
  }

  /**
   * receive events when any change in reports checkboxes
   * @param event: any 
   * @param item: any 
   */
  onChangeReportCheckbox(event: any, item: any): void {
    const { checked } = event;
    const { value: selectedItemValue } = item;
    const formArray: FormArray = this.addStakeholderForm.get('notifications') as FormArray;
    /* Selected */
    if (checked) {
      // Add a new control in the arrayForm
      formArray.push(new FormControl(selectedItemValue));
    } else { /* unselected */
      // find the unselected element
      formArray.controls.forEach((ctrl: FormControl, index: number) => {
        if (ctrl.value == selectedItemValue) {
          // Remove the unselected element from the arrayForm
          formArray.removeAt(index);
          return;
        }
      });
    }
  }

  //Phone number validation
  telInputObject(event) {
    this.countryCode = "+" + event.s.dialCode + '-';
  }
  onCountryChange(event) {
    this.countryCode = "+" + event.dialCode + '-';
  }


}
