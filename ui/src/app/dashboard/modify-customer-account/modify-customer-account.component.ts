import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { CustomerService } from 'src/app/services/customer.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-modify-customer-account',
  templateUrl: './modify-customer-account.component.html',
  styleUrls: ['./modify-customer-account.component.css']
})
export class ModifyCustomerAccountComponent implements OnInit {
  updateCustomerForm: any = this.formBuilder.group({
    name: ['', Validators.required],
    customerType: ['', Validators.required],
    subaccountName: [''],
    testCustomer: [{value:false,disabled:true}]
  });
  types: string[] = ['MSP', 'Reseller'];
  private previousFormValue: any;
  // flag
  isDataLoading = false;
  //  @Inject(MAT_DIALOG_DATA) public data: ModalData
  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private subaccountService: SubAccountService,
    private snackBarService: SnackBarService,
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
    this.isDataLoading = true;
    const mergedLicenseObject = { ...this.data, ...this.updateCustomerForm.value };
    console.log('mergedLicenseObject', mergedLicenseObject);
    const customer = {
      id: mergedLicenseObject.id,
      customerName: mergedLicenseObject.name,
      customerType: mergedLicenseObject.customerType
    };
    const requestsArray= [
      this.customerService.updateCustomer(customer)
    ];
    if (this.data.subaccountId){
      const subaccount = {
        id: mergedLicenseObject.subaccountId,
        subaccountName: mergedLicenseObject.subaccountName
      };
      requestsArray.push(this.subaccountService.updateSubAccount(subaccount)); 
    }
    forkJoin(requestsArray).subscribe((res: any) => {
      if (!res.error) {
        this.isDataLoading = false;
        this.snackBarService.openSnackBar('Customer and subaccount edited successfully!', '');
        this.dialogRef.close(res);
      } else
        this.snackBarService.openSnackBar(res.error, 'Error adding customer!');
    }, err => {
      this.isDataLoading = false;
      this.dialogRef.close(false);
      console.error('error while updating license information row', err);
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
