import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { tekVizionServices } from 'src/app/helpers/tekvizion-services';
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
    testCustomer: [false, Validators.required]
  });
  types: string[] = [
    'MSP',
    'Reseller',
  ];
  services: any = [
    { name: tekVizionServices.SpotLight, value: "UCaaS Continuous Testing", used: false },
    { name: tekVizionServices.tekTokenConstumption, value: "tekToken Consumption", used: true }
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

  setChecked(value: boolean, index: number) {
    this.services[index].used = value
  }

  getServices(): any {
    let actualServices = ""
    for (let i = 0; i < this.services.length; i++) {
      if (this.services[i].used) {
        actualServices = actualServices + this.services[i].name + ',';
      }
    }
    actualServices = actualServices.slice(0, -1);
    return actualServices;
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
      subaccountAdminEmail: this.addCustomerForm.value.subaccountAdminEmail,
      test: this.addCustomerForm.value.testCustomer.toString()
    };
    this.customerService.createCustomer(customerObject).subscribe((resp: any) => {
      if (!resp.error) {
        const subaccountDetails: any = {
          customerId: resp.id,
          subaccountName: this.addCustomerForm.value.subaccountName,
          subaccountAdminEmail: this.addCustomerForm.value.subaccountAdminEmail,
        }
        const services = this.getServices();
        subaccountDetails.services = services
        this.snackBarService.openSnackBar('Customer added successfully!', '');
        this.createSubAccount(subaccountDetails);
      } else {
        this.snackBarService.openSnackBar(resp.error, 'Error adding customer!');
        this.isDataLoading = false;
      }
    }, err => {
      this.isDataLoading = false;
      this.snackBarService.openSnackBar(err.error, 'Error adding customer!');
      console.error('error while adding a new customer', err);
    });
  }

  createSubAccount(subaccountDetails: any) {
    this.subaccountService.createSubAccount(subaccountDetails).subscribe((res: any) => {
      if (!res.error)
        this.snackBarService.openSnackBar('Subaccount added successfully!', '');
      else
        this.snackBarService.openSnackBar(res.error, 'Error adding subaccount!');
      this.dialogRef.close(res);
      this.isDataLoading = false;
    }, err => {
      this.isDataLoading = false;
      this.snackBarService.openSnackBar(err.error, 'Error adding subaccount!');
      console.error('error while adding subbacount', err);
      this.dialogRef.close();
    });
  }

}
