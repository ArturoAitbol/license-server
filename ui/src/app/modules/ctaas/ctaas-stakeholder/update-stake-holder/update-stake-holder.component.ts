import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Report } from 'src/app/helpers/report';
import { Constants } from 'src/app/helpers/constants';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StakeHolderService } from 'src/app/services/stake-holder.service';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';

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
  toggleStatus = true;
  phoneNumberRequiredComplement = "";
  emailNotifications: boolean;
  mappedNotificationsList: string[] = [];
  CountryISO = CountryISO;
  SearchCountryField = SearchCountryField;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries : CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  readonly type = 'TYPE:Detailed';
  readonly notifications = 'TYPE:Detailed,DAILY_REPORTS';
  readonly SUBACCOUNT_STAKEHOLDER_ROLE = Constants.SUBACCOUNT_STAKEHOLDER;
  readonly SUBACCOUNT_ADMIN_ROLE = Constants.SUBACCOUNT_ADMIN;
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
    let formObject: any = {
      name: ['', Validators.required],
      jobTitle: [''],
      companyName: [''],
      subaccountAdminEmail: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
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
    this.updateStakeholderForm = this.formBuilder.group(formObject);
    try {
      const { email } = this.data;
      this.data = { ...this.data, ...{ subaccountAdminEmail: email } };
      const { name, jobTitle, companyName, subaccountAdminEmail, phoneNumber, type, notifications, role } = this.data;
      if (notifications) {
        const mappedNotifications = notifications.split(',').map((e: string) => {
          const obj = this.reports.find((x: { label: string, value: string }) => x.label.toLowerCase() === e.toLowerCase());
          if (obj) {
            return obj.value;
          }
        });
        this.mappedNotificationsList = mappedNotifications;
      }
      this.emailNotifications = this.data.emailNotifications;
      const payload = { name, jobTitle, companyName, subaccountAdminEmail, phoneNumber, type, role };
      this.updateStakeholderForm.patchValue(payload);
      if (this.data.restrictRole)
        this.updateStakeholderForm.get('role').disable();
      this.previousFormValue = { ...payload };
    } catch (e) {
      console.error('some error | ', e);
    }
  }

  ngOnInit(): void {
    this.reports = this.getReports();
    this.initializeForm();
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
    }, (error) => {
      this.isDataLoading = false;
    });
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
   * prepare an object with update values only
   * @returns: any 
   */
  preparePayload(): any {
    let extraData = {
      ...this.updateStakeholderForm.value, 
      notifications: this.notifications, 
      type: this.type, 
      subaccountAdminEmail: this.data.email, 
      emailNotifications: this.emailNotifications
    };
    extraData.phoneNumber = this.updateStakeholderForm.get('phoneNumber').value ? this.updateStakeholderForm.get('phoneNumber').value.internationalNumber : '';
    if (this.previousFormValue.role === extraData.role) {
      delete extraData.role;
    }
    return extraData;
  }
  // /**
  //  * on change checkbox
  //  * @param event : any
  //  * @param item : any
  //  */
  // onChangeReportCheckbox(event: any, item: any): void {
  //   const { checked } = event;
  //   const { value: selectedItemValue } = item;
  //   const formArray: FormArray = this.updateStakeholderForm.get('notifications') as FormArray;
  //   /* Selected */
  //   if (checked) {
  //     // Add a new control in the arrayForm
  //     formArray.push(new FormControl(selectedItemValue));
  //   } else { /* unselected */
  //     // find the unselected element
  //     formArray.controls.forEach((ctrl: FormControl, index: number) => {
  //       if (ctrl.value == selectedItemValue) {
  //         // Remove the unselected element from the arrayForm
  //         formArray.removeAt(index);
  //         return;
  //       }
  //     });
  //   }
  // }

}
