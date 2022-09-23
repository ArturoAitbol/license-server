import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CtaasTestSuiteService } from 'src/app/services/ctaas-test-suite.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-modify-test-suite',
  templateUrl: './modify-test-suite.component.html',
  styleUrls: ['./modify-test-suite.component.css']
})
export class ModifyTestSuiteComponent implements OnInit {

  isDataLoading = false;
  updateTestSuiteForm = this.formBuilder.group({
    id: ['', Validators.required],
    subaccountId: ['', Validators.required],
    name: ['', Validators.required],
    deviceType: ['Webex', Validators.required],
    totalExecutions: ['', Validators.required],
    nextExecution: ['', Validators.required],
    frequency: ['', Validators.required]
  });
  frequencies: string[] = [
    'Hourly',
    'Daily',
    'Weekly',
    'Monthly',
  ];
  currentCustomer: any;
  private previousFormValue: any;

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ModifyTestSuiteComponent>,
    private testSuiteService: CtaasTestSuiteService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if (this.data) {
      this.updateTestSuiteForm.patchValue(this.data);
      this.previousFormValue = { ...this.updateTestSuiteForm };
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  modifyTestSuite(): void {
    this.isDataLoading = true;
    const execution = typeof (this.updateTestSuiteForm.value.nextExecution) !== 'string' ? this.updateTestSuiteForm.value.nextExecution.format("YYYY-MM-DD") : this.updateTestSuiteForm.value.nextExecution;

    const suiteObject: any = {
      id: this.updateTestSuiteForm.value.id,
      subaccountId: this.updateTestSuiteForm.value.subaccountId,
      name: this.updateTestSuiteForm.value.name,
      deviceType: this.updateTestSuiteForm.value.deviceType,
      totalExecutions: this.updateTestSuiteForm.value.totalExecutions,
      nextExecution: execution,
      frequency: this.updateTestSuiteForm.value.frequency,
    };

    this.testSuiteService.updateTestSuite(suiteObject).subscribe((res: any) => {
      if (!res.error) {
        this.snackBarService.openSnackBar('Test Suite added successfully!', '');
        this.dialogRef.close(res);
      } else {
        this.snackBarService.openSnackBar(res.error, 'Error adding test suite!');
        this.dialogRef.close(res);
        this.isDataLoading = false;
      }
    }, err => {
      this.isDataLoading = false;
      this.snackBarService.openSnackBar(err.error, 'Error adding test suite!');
      console.error('Error while adding test suite', err);
    })
  }

  disableSumbitBtn(): boolean {
    return JSON.stringify(this.updateTestSuiteForm.value) === JSON.stringify(this.previousFormValue.value);
  }

}
