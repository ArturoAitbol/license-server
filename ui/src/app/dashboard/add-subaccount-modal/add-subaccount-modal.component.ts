import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-add-subaccount-modal',
  templateUrl: './add-subaccount-modal.component.html',
  styleUrls: ['./add-subaccount-modal.component.css']
})
export class AddSubaccountModalComponent implements OnInit {
  addSubaccountForm = this.formBuilder.group({
    customer: ['', Validators.required],
    subaccountName: ['', Validators.required]
  });
  isDataLoading: boolean = false;
  customers: any[];
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddSubaccountModalComponent>,
    private snackBarService: SnackBarService,
    private customerService: CustomerService,
    private subaccountService: SubAccountService
  ) { }

  ngOnInit() {
    this.customerService.getCustomerList().subscribe((res: any) => {
      this.customers = res.customers;
    });
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
  addSubaccount() {
    this.isDataLoading = true;
    const subaccountDetails: any = {
      name: this.addSubaccountForm.value.subaccountName,
      customerId: this.addSubaccountForm.value.customer
    };
    this.subaccountService.createSubAccount(subaccountDetails).subscribe((res: any) => {
      if (!res.error) {
        this.isDataLoading = false;
        this.snackBarService.openSnackBar('Subaccount added successfully!', '');
        this.dialogRef.close(res);
      } else
        this.snackBarService.openSnackBar(res.error, 'Error adding subaccount!');
    });
  }

}