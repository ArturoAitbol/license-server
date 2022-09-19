import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AddStakeHolderComponent } from '../add-stake-holder/add-stake-holder.component';

@Component({
  selector: 'app-update-stake-holder',
  templateUrl: './update-stake-holder.component.html',
  styleUrls: ['./update-stake-holder.component.css']
})
export class UpdateStakeHolderComponent implements OnInit {

  reports: any = [];
  isDataLoading = false;
  addStakeholderForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<AddStakeHolderComponent>
  ) { }

  initializeForm(): void {
    this.addStakeholderForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
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
      { name: 'Daily Reports', completed: false },
      { name: 'Weekly Reports', completed: false },
      { name: 'Monthly Reports', completed: false },
    ];
  }


  onCancel(): void {
    this.dialogRef.close();
  }

  submit() {
    this.isDataLoading = true;
  }
  onChangeReportCheckbox(): void {
    this.reports.forEach(() => this.reportsFormArray.push(new FormControl(false)));
  }

  get reportsFormArray() {
    return this.addStakeholderForm.controls.orders as FormArray;
  }

}
