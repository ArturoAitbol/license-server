import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  private previousFormValue: any;

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
      email: [{ value: '', disabled: true }, [Validators.required]],
      mobilePhone: ['', Validators.required],
      notifications: new FormArray([])
    });
    this.updateStakeholderForm.patchValue(this.data);
    this.previousFormValue = { ...this.updateStakeholderForm };
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
      { name: "Reports each time a test suite runs", value: 'every_time' },
      { name: "Daily reports", value: 'daily_reports' },
      { name: "Weekly reports", value: 'weekly_reports' },
      { name: "Monthly Summaries", value: 'monthly_reports' },
      { name: "Event Notifications", value: 'event_notifications' }
    ];
  }


  onCancel(): void {
    this.dialogRef.close();
  }

  updateStakeholderDetails() {
    this.isDataLoading = true;
    this.stakeholderService.updateStakeholderDetails(this.preparePaylod()).subscribe((response: any) => {

    });
  }
  /**
   * prepare an object with update values only
   * @returns: any 
   */
  preparePaylod(): any {
    const { id } = this.data;
    const mergedProjectDetails: any = { id };
    for (const key in this.updateStakeholderForm.controls) {
      if (this.updateStakeholderForm.controls.hasOwnProperty(key)) {
        const fieldValue = this.updateStakeholderForm.get(key).value;
        const oldValue = this.previousFormValue.value[key];
        /* if value has changed */
        if (fieldValue != oldValue)
          mergedProjectDetails[key] = fieldValue;
      }
    }
    return mergedProjectDetails;
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

  // get reportsFormArray() {
  //   return this.updateStakeholderForm.controls.orders as FormArray;
  // }

}
