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
      phoneNumber: ['', [Validators.required, Validators.pattern(Constants.PHONE_NUMBER_PATTERN), Validators.minLength(10), Validators.maxLength(15)]],
      type: ['', Validators.required],
      notifications: this.formBuilder.array([])
    });
    this.reports = this.getReports();
  }
  /**
   * get reports
   * @returns: any[]
   */
  getReports(): INotification[] {
    return [
      { id: 1, label: "Daily Reports", value: Report.DAILY_REPORTS },
      { id: 2, label: "Weekly Reports", value: Report.WEEKLY_REPORTS },
      { id: 3, label: "Monthly Summaries", value: Report.MONTHLY_REPORTS }
    ];
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
        let mappedNotifications: any[] = [];
        if (userProfile) {
          const { notifications } = userProfile;
          if (notifications && notifications.includes(',')) { // check if we have notifications details in the user profile object
            const splittedNotifications = notifications.split(',');
            mappedNotifications = splittedNotifications.map((e: string) => {
              const obj = this.reports.find((x: { label: string, value: string }) => x.value.toLowerCase() === e.toLowerCase());
              if (obj) {
                return obj;
              }
            }).filter(e => e !== undefined && e !== null);
            userProfile.type = splittedNotifications[0];
            this.selectedNotifications = new SelectionModel<INotification[]>(true, [...mappedNotifications]);
            userProfile.notifications = null;
          } else {
            userProfile.type = notifications;
            userProfile.notifications = [];
          }
          this.viewProfileForm.patchValue(userProfile);
        }
      }
    } catch (error) {
      console.error('Error while fetching user profile details | ', error);
    }
  }
  /**
   * set selected notifications
   * @param item: item: INotification[] 
   * @param event: Event 
   */
  setNotifications(item: INotification | any, event?: Event): void {
    if (event)
      event.preventDefault();
    this.selectedNotifications.toggle(item);
  }
  /**
   * get selected notifications list
   * @returns: INotification[] 
   */
  getSelectedNotifications(): INotification[] | any[] {
    return this.selectedNotifications.selected;
  }
  /**
   * update User Profile Details
   */
  updateProfile(): void {
    try {
      this.isUpdatedClicked = true;
      const requestPayload = { ...this.viewProfileForm.value };
      let { type } = requestPayload;
      const mappedNotifications = [...this.getSelectedNotifications()].map(e => e.value).filter(e => e !== false);
      requestPayload.notifications = type + ((mappedNotifications.length === 0) ? '' : ',' + mappedNotifications.toString());
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
