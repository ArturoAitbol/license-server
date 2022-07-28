import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-add-customer-account-modal',
  templateUrl: './add-customer-account-modal.component.html',
  styleUrls: ['./add-customer-account-modal.component.css']
})
export class AddCustomerAccountModalComponent {
  addCustomerForm = this.formBuilder.group({
    customerName: ['', Validators.required],
    subaccountName: ['Default', Validators.required],
    customerType: ['', Validators.required],
    adminEmail: ['', [Validators.required, Validators.email]],
    subaccountAdminEmail: ['', [Validators.required, Validators.email]],
    testCustomer: [false,Validators.required]
  });
  types: string[] = [
    'MSP',
    'Reseller',
  ];
  isDataLoading = false;
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddCustomerAccountModalComponent>,
    private snackBarService: SnackBarService,
    private customerService: CustomerService,
    private subaccountService: SubAccountService
  ) { }

  /**
   * on cancel dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }
  /**
   * on add customer account
   */
  addCustomer() {
    this.isDataLoading = true;
    const customerObject: any = {
      customerName: this.addCustomerForm.value.customerName,
      customerType: this.addCustomerForm.value.customerType,
      customerAdminEmail: this.addCustomerForm.value.adminEmail,
      test: this.addCustomerForm.value.testCustomer.toString()
    };
    this.customerService.createCustomer(customerObject).subscribe((resp: any) => {
      if (!resp.error) {
        const subaccountDetails: any = {
          customerId: resp.id,
          subaccountName: this.addCustomerForm.value.subaccountName,
          subaccountAdminEmail: this.addCustomerForm.value.subaccountAdminEmail,
        }
        this.snackBarService.openSnackBar('Customer added successfully!', '');
        this.subaccountService.createSubAccount(subaccountDetails).subscribe((res: any) => {
          if (!res.error)
            this.snackBarService.openSnackBar('Subaccount added successfully!', '');
          else
            this.snackBarService.openSnackBar(res.error, 'Error adding subaccount!');
          this.dialogRef.close(res);
          this.isDataLoading = false;
        },err =>{
          this.isDataLoading = false;
          this.snackBarService.openSnackBar(err.error, 'Error adding subaccount!');
          console.error('error while adding subbacount', err);
          this.dialogRef.close();
        });
      } else{
        this.snackBarService.openSnackBar(resp.error, 'Error adding customer!');
        this.isDataLoading = false;
      }
    }, err => {
      this.isDataLoading = false;
      this.snackBarService.openSnackBar(err.error, 'Error adding customer!');
      console.error('error while adding a new customer', err);
    });
  }

}
