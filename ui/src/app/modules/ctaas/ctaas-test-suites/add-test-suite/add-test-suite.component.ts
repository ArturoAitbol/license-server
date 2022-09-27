import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CtaasTestSuiteService } from 'src/app/services/ctaas-test-suite.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-add-test-suite',
  templateUrl: './add-test-suite.component.html',
  styleUrls: ['./add-test-suite.component.css']
})
export class AddTestSuiteComponent implements OnInit {
  isDataLoading = false;
  addTestSuiteForm = this.formBuilder.group({
    name: ['', Validators.required],
    deviceType: ['MS Teams', Validators.required],
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
    private subaccountService: SubAccountService,
    private testSuiteService: CtaasTestSuiteService) {
  }

  ngOnInit(): void {
    this.currentCustomer = this.subaccountService.getSelectedSubAccount();
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
