import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modify-license-consumption-details',
  templateUrl: './modify-license-consumption-details.component.html',
  styleUrls: ['./modify-license-consumption-details.component.css']
})
export class ModifyLicenseConsumptionDetailsComponent implements OnInit {
  updateForm = this.formBuilder.group({
    consumptionDate: ['', Validators.required],
    vendor: ['', Validators.required],
    model: ['', Validators.required],
    version: ['', Validators.required],
    type: ['', Validators.required],
    consumption: ['', Validators.required],
    tokensUsed: ['', Validators.required]
  });
  private previousFormValue: any;
  //  @Inject(MAT_DIALOG_DATA) public data: ModalData
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ModifyLicenseConsumptionDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data) {
      this.updateForm.patchValue(this.data);
      this.previousFormValue = { ...this.updateForm };
    }
  }
  /**
   * to cancel the opened dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * to submit the form
   */
  submit() {
    this.dialogRef.close();
  }
  /**
   * to check whether sumbit button can be disabled or not
   * @returns: true if the not updated and false otherwise 
   */
  disableSumbitBtn(): boolean {
    return JSON.stringify(this.updateForm.value) === JSON.stringify(this.previousFormValue.value);
  }

}
