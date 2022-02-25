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

  //  @Inject(MAT_DIALOG_DATA) public data: ModalData
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddCustomerAccountModalComponent>,
    private customerService: CustomerService,
    private subaccountService: SubAccountService
  ) { }

  ngOnInit() {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  addCustomer() {

    // TODO: Use EventEmitter with form value
    console.info(this.addCustomerForm.value);
    const customerObject: any = {
      customerName: this.addCustomerForm.value.customerName,
      customerType: this.addCustomerForm.value.customerType
    };
    this.customerService.createCustomer(customerObject).toPromise().then((res: any) => {
      return res;
    }).then((customerResponse: { customerId: string }) => {
      const subaccountDetails: any = {
        customerId: customerResponse.customerId,
        subaccountName: this.addCustomerForm.value.subAccountName,
      }
      this.subaccountService.createSubAccount(subaccountDetails).toPromise().then((res: any) => {
        this.dialogRef.close(res);
      })
    });
  }

}
