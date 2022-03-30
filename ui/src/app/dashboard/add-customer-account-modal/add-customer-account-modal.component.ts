import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-add-customer-account-modal',
  templateUrl: './add-customer-account-modal.component.html',
  styleUrls: ['./add-customer-account-modal.component.css']
})
export class AddCustomerAccountModalComponent implements OnInit {
  addCustomerForm = this.formBuilder.group({
    customerName: ['', Validators.required],
    subAccountName: ['', Validators.required],
    customerType: ['', Validators.required]
  });
  types: string[] = [
    'MSP',
    'Reseller',
  ];
  isDataLoading: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddCustomerAccountModalComponent>,
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
    console.info(this.addCustomerForm.value);
    const customerObject: any = {
      name: this.addCustomerForm.value.customerName,
      customerType: this.addCustomerForm.value.customerType
    };
    this.customerService.createCustomer(customerObject).toPromise().then((res: any) => {
      return res;
    }).then((resp: any) => {
      console.log(resp);
      const subaccountDetails: any = {
        customerId: resp.id,
        name: this.addCustomerForm.value.subAccountName,
      }
      this.subaccountService.createSubAccount(subaccountDetails).toPromise().then((res: any) => {
        this.isDataLoading = false;
        this.dialogRef.close(res);
      }).catch((err2: any) => {
        this.isDataLoading = false;
        console.error('Error while creating SubAccount', err2);
      });
    }).catch((err: any) => {
      this.isDataLoading = false;
      console.error('Error while creating Customer', err);
    });
  }

}
