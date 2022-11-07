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
   * initialize the Profile Form details
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
    })
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
   * on cancel dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }
  /**
   * fetch user profile details
   */
  fetchUserProfileDetails() {
    try {
      const subaccountDetails = this.userProfileService.getSubaccountUserProfileDetails();
      this.isDataLoading = false;
      this.reports = this.getReports();
      console.debug('res | ', subaccountDetails);
      let mappedNotifications = [];
      if (subaccountDetails) {
        const { notifications } = subaccountDetails;
        if (notifications && notifications.includes(',')) {
          const splittedNotifications = notifications.split(',');
          mappedNotifications = splittedNotifications.map((e: string) => {
            const obj = this.reports.find((x: { label: string, value: string }) => x.label.toLowerCase() === e.toLowerCase());
            if (obj) {
              return obj;
            }
          });
          subaccountDetails.type = splittedNotifications[0];
          subaccountDetails.notifications = mappedNotifications;
        } else {
          subaccountDetails.type = notifications;
          subaccountDetails.notifications = [];
        }
        this.viewProfileForm.patchValue(subaccountDetails);
      }
    } catch (error) {
      console.error(error);
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
    console.log('item | ', item);
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
      const requestPayload = { ...this.viewProfileForm.value };
      requestPayload.notifications = [...this.getSelectedNotifications()].map(e => e.value).filter(e => e !== false);
      console.log('updated profile details | ', requestPayload);
      this.userProfileService.updateUserProfile(requestPayload).subscribe((res: any) => {
        console.log('update user profile details | ', res);
      });
    } catch (e) {
      console.error('e ', e);
    }
  }

}
