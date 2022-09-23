import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Constants } from 'src/app/helpers/constants';
import { CtaasTestSuiteService } from 'src/app/services/ctaas-test-suite.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-add-test-suite',
  templateUrl: './add-test-suite.component.html',
  styleUrls: ['./add-test-suite.component.css']
})
export class AddTestSuiteComponent implements OnInit {
  isDataLoading = false;
  addTestSuiteForm = this.formBuilder.group({
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

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddTestSuiteComponent>,
    private snackBarService: SnackBarService,
    private testSuiteService: CtaasTestSuiteService) {
  }

  ngOnInit(): void {
    this.currentCustomer = JSON.parse(localStorage.getItem(Constants.CURRENT_SUBACCOUNT));
  }

  addTestSuite(): void {
    this.isDataLoading = true;
    const suiteObject: any = {
      subaccountId: this.currentCustomer.id,
      name: this.addTestSuiteForm.value.name,
      deviceType: this.addTestSuiteForm.value.deviceType,
      totalExecutions: this.addTestSuiteForm.value.totalExecutions,
      nextExecution: this.addTestSuiteForm.value.nextExecution.format("YYYY-MM-DD"),
      frequency: this.addTestSuiteForm.value.frequency,
    };
    this.testSuiteService.createTestSuite(suiteObject).subscribe((res: any) => {
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

  /**
   * on cancel dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }

}
