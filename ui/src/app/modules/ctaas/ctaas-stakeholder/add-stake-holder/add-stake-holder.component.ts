import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StakeHolderService } from 'src/app/services/stake-holder.service';

@Component({
  selector: 'app-add-stake-holder',
  templateUrl: './add-stake-holder.component.html',
  styleUrls: ['./add-stake-holder.component.css']
})
export class AddStakeHolderComponent implements OnInit {

  reports: any = [];
  isDataLoading = false;
  addStakeholderForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private snackBarService: SnackBarService,
    private stakeholderService: StakeHolderService,
    public dialogRef: MatDialogRef<AddStakeHolderComponent>
  ) { }
  /**
   * initialize update stake holder form
   */
  initializeForm(): void {
    this.addStakeholderForm = this.formBuilder.group({
      name: ['', Validators.required],
      jobTitle: ['', Validators.required],
      email: ['', Validators.required],
      mobilePhone: ['', Validators.required],
      notifications: new FormArray([])
    });
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
  /**
   * on cancel dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }
  /**
   * on click Submit button
   */
  addStakeholder() {
    this.isDataLoading = true;
    console.log('addStakeholderForm | ', this.addStakeholderForm.value);
    const stakeholderDetails = { ... this.addStakeholderForm.value };
    this.stakeholderService.createStakeholder(stakeholderDetails).subscribe((response: any) => { });
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

  // get reportsFormArray() {
  //   return this.addStakeholderForm.controls.orders as FormArray;
  // }

}
