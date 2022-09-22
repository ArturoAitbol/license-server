import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CtaasTestSuiteService } from 'src/app/services/ctaas-test-suite.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-add-test-suite',
  templateUrl: './add-test-suite.component.html',
  styleUrls: ['./add-test-suite.component.css']
})
export class AddTestSuiteComponent {
  isDataLoading = false;
  addTestSuiteForm = this.formBuilder.group({
    suiteName: ['', Validators.required],
    service: ['Webex', Validators.required],
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

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddTestSuiteComponent>,
    private snackBarService: SnackBarService,
    private testSuiteService: CtaasTestSuiteService) {
  }

  addTestSuite(): void {
    this.isDataLoading = true;
    const suiteObject: any = {
      suiteName: this.addTestSuiteForm.value.suiteName,
      service: this.addTestSuiteForm.value.service,
      totalExecutions: this.addTestSuiteForm.value.totalExecutions,
      nextExecution: this.addTestSuiteForm.value.nextExecution.format("YYYY-MM-DD"),
      frequency: this.addTestSuiteForm.value.frequency,
    };
    this.testSuiteService.createTestSuite(suiteObject).subscribe((res:any)=>{
      if (!res.error) {
      } else {
        this.snackBarService.openSnackBar(res.error, 'Error adding test suite!');
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
