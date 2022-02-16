import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modify-customer-account',
  templateUrl: './modify-customer-account.component.html',
  styleUrls: ['./modify-customer-account.component.css']
})
export class ModifyCustomerAccountComponent implements OnInit {
  updateCustomerForm = this.formBuilder.group({
    customerAccounts: ['', Validators.required],
    customerSubAccounts: ['', Validators.required],
    purchaseDate: ['', Validators.required],
    packageType: ['', Validators.required],
    renewalDate: ['', Validators.required]
  });
  private previousFormValue: any;
  //  @Inject(MAT_DIALOG_DATA) public data: ModalData
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ModifyCustomerAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data) {
      this.updateCustomerForm.patchValue(this.data);
      this.previousFormValue = { ...this.updateCustomerForm };
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
    return JSON.stringify(this.updateCustomerForm.value) === JSON.stringify(this.previousFormValue.value);
  }
}
