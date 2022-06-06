import { Component, OnInit } from '@angular/core';
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
export class AddCustomerAccountModalComponent implements OnInit {
  addCustomerForm = this.formBuilder.group({
    customerName: ['', Validators.required],
    subAccountName: ['Default', Validators.required],
    customerType: ['', Validators.required],
    adminEmail: ['', [Validators.required, Validators.email]],
    subaccountAdminEmail: ['', [Validators.required, Validators.email]],
  });
  types: string[] = [
    'MSP',
    'Reseller',
  ];
  isDataLoading: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddCustomerAccountModalComponent>,
    private snackBarService: SnackBarService,
    private customerService: CustomerService,
    private subaccountService: SubAccountService
  ) { }

  ngOnInit() {
  }
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
      name: this.addCustomerForm.value.customerName,
      customerType: this.addCustomerForm.value.customerType,
      adminEmails: [this.addCustomerForm.value.adminEmail]
    };
    this.customerService.createCustomer(customerObject).subscribe((resp: any) => {
      if (!resp.error) {
        const subaccountDetails: any = {
          customerId: resp.id,
          name: this.addCustomerForm.value.subAccountName,
          subaccountAdminEmails: [this.addCustomerForm.value.subaccountAdminEmail],
        }
        this.subaccountService.createSubAccount(subaccountDetails).subscribe((res: any) => {
          if (!res.error) {
            this.isDataLoading = false;
            this.snackBarService.openSnackBar('Customer and subaccount added successfully!', '');
            this.dialogRef.close(res);
          } else
            this.snackBarService.openSnackBar(res.error, 'Error adding subaccount!');
        });
      } else
        this.snackBarService.openSnackBar(resp.error, 'Error adding customer!');
    });
  }

}
