import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-modify-customer-account',
  templateUrl: './modify-customer-account.component.html',
  styleUrls: ['./modify-customer-account.component.css']
})
export class ModifyCustomerAccountComponent implements OnInit {
  packageTypes: string[] = [
    'Small',
    'Medium',
    'Large',
    'AddOn '
  ];
  updateCustomerForm = this.formBuilder.group({
    customerName: ['', Validators.required],
    subaccountName: ['', Validators.required],
    customerType: ['', Validators.required],
    purchaseDate: ['', Validators.required],
    packageType: ['', Validators.required],
    renewalDate: ['', Validators.required]
  });
  private previousFormValue: any;
  // flag
  isDataLoading: boolean = false;
  //  @Inject(MAT_DIALOG_DATA) public data: ModalData
  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    public dialogRef: MatDialogRef<ModifyCustomerAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data) {
      console.log('data', this.data);

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
    this.isDataLoading = true;
    const mergedCustomerObject = { ...this.data, ...this.updateCustomerForm.value };
    console.log('customerObject', mergedCustomerObject);
    this.customerService.updateCustomer(mergedCustomerObject).subscribe((res: any) => {
      this.isDataLoading = false;
      this.dialogRef.close(res);
    }, (err: any) => {
      this.isDataLoading = false;
      console.error('error while updating customer', err);
    });
  }
  /**
   * to check whether sumbit button can be disabled or not
   * @returns: true if the not updated and false otherwise 
   */
  disableSumbitBtn(): boolean {
    return JSON.stringify(this.updateCustomerForm.value) === JSON.stringify(this.previousFormValue.value);
  }
}
