import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Report } from 'src/app/helpers/report';
import { Constants } from 'src/app/helpers/constants';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StakeHolderService } from 'src/app/services/stake-holder.service';

@Component({
  selector: 'app-update-stake-holder',
  templateUrl: './update-stake-holder.component.html',
  styleUrls: ['./update-stake-holder.component.css']
})
export class UpdateStakeHolderComponent implements OnInit {

  reports: any = [];
  isDataLoading = false;
  updateStakeholderForm: FormGroup;
  previousFormValue: any;
  notificationsList: any;
  mappedNotificationsList: string[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private snackBarService: SnackBarService,
    private stakeholderService: StakeHolderService,
    public dialogRef: MatDialogRef<UpdateStakeHolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  /**
   * initialize update stake holder form
   */
  initializeForm(): void {
    this.updateStakeholderForm = this.formBuilder.group({
      name: ['', Validators.required],
      jobTitle: ['', Validators.required],
      companyName: [{ value: '' }, Validators.required],
      subaccountAdminEmail: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(Constants.PHONE_NUMBER_PATTERN), Validators.minLength(10), Validators.maxLength(15)]],
      type: ['', Validators.required],
      notifications: new FormArray([])
    });
    try {
      const { mobilePhone, email } = this.data;
      this.data = { ...this.data, ...{ subaccountAdminEmail: email } };
      const { name, jobTitle, companyName, subaccountAdminEmail, phoneNumber, type, notifications } = this.data;
      if (notifications) {
        const mappedNotifications = notifications.split(',').map(e => {
          const obj = this.reports.find(x => x.label === e);
          if (obj) {
            return obj.value;
          }
        });
        this.mappedNotificationsList = mappedNotifications;
      }
      const payload = { name, jobTitle, companyName, subaccountAdminEmail, phoneNumber, type };
      this.updateStakeholderForm.patchValue(payload);
      this.previousFormValue = { ...this.updateStakeholderForm };
    } catch (e) {
      console.error('some error | ', e);
    }
  }
  /**
   * initialize checkboxes
   */
  private initializeCheckboxes() {
    this.reports.map((e: { label: string, value: string }) => {
      const control = new FormControl(this.mappedNotificationsList.includes(e.value));
      (this.updateStakeholderForm.controls.notifications as FormArray).push(control);
    });
  }

  ngOnInit(): void {
    this.reports = this.getReports();
    this.initializeForm();
    this.initializeCheckboxes();
  }
  /**
   * get reports
   * @returns: any[]
   */
  getReports(): any[] {
    return [
      { id: 1, label: "Daily Reports", value: Report.DAILY_REPORTS },
      { id: 2, label: "Weekly Reports", value: Report.WEEKLY_REPORTS },
      { id: 3, label: "Monthly Summaries", value: Report.MONTHLY_REPORTS }
    ];
  }
  /**
   * close opened dialog
   * @param type: string [optional] 
   */
  onCancel(type?: string): void {
    this.dialogRef.close(type);
  }
  /**
   * update stake holder details here
   */
  updateStakeholderDetails() {
    this.isDataLoading = true;
    this.stakeholderService.updateStakeholderDetails(this.preparePayload()).subscribe((response: any) => {
      if (response) {
        const { error } = response;
        if (error) {
          this.isDataLoading = false;
          this.snackBarService.openSnackBar(response.error, 'Error while updating stake holder');
          this.onCancel('closed');
        }
      } else {
        this.isDataLoading = false;
        this.snackBarService.openSnackBar('Updated stake holder details successfully', '');
        this.onCancel('closed');
      }
    });
  }
  /**
   * prepare an object with update values only
   * @returns: any 
   */
  preparePayload(): any {
    const selectedNotifications = this.updateStakeholderForm.value.notifications
      .map((v, i) => v ? this.reports[i].value : null)
      .filter(v => v !== null);
    this.updateStakeholderForm.get('subaccountAdminEmail').enable();
    if (selectedNotifications.length > 0) {
      this.updateStakeholderForm.value.notifications = 'TYPE:' + this.updateStakeholderForm.value.type + ',' + selectedNotifications.join(',');
    } else {
      this.updateStakeholderForm.value.notifications = 'TYPE:' + this.updateStakeholderForm.value.type;
    }
    return this.updateStakeholderForm.value;
  }
  /**
   * on change checkbox
   * @param event : any
   * @param item : any
   */
  onChangeReportCheckbox(event: any, item: any): void {
    const { checked } = event;
    const { value: selectedItemValue } = item;
    const formArray: FormArray = this.updateStakeholderForm.get('notifications') as FormArray;
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

}
