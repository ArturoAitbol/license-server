import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { License } from 'src/app/model/license.model';
import { CustomerService } from 'src/app/services/customer.service';
import { LicenseService } from 'src/app/services/license.service';

@Component({
  selector: 'app-add-license',
  templateUrl: './add-license.component.html',
  styleUrls: ['./add-license.component.css']
})
export class AddLicenseComponent implements OnInit, OnDestroy {
  types: string[] = [
    'Small',
    'Medium',
    'Large',
    'AddOn '
  ];
  private currentCustomer: any;
  addLicenseForm = this.formBuilder.group({
    purchaseDate: ['', Validators.required],
    packageType: ['', Validators.required],
    tokensPurchased: ['', Validators.required],
    deviceLimit: ['', Validators.required],
    renewalDate: ['', Validators.required]
  });
  constructor(
    private formBuilder: FormBuilder,
    private customerSerivce: CustomerService,
    private licenseService: LicenseService,
    public dialogRef: MatDialogRef<AddLicenseComponent>
  ) {

  }

  ngOnInit() {
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();
    console.log(this.currentCustomer);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  /**
   * add license
   */
  submit() {
    const licenseObject: License | any = {
      subaccountId: this.currentCustomer.subaccountId,
      purchaseDate: this.addLicenseForm.value.purchaseDate,
      packageType: this.addLicenseForm.value.packageType,
      tokens: this.addLicenseForm.value.tokensPurchased,
      deviceAccessLimit: this.addLicenseForm.value.deviceLimit,
      renewalDate: this.addLicenseForm.value.renewalDate,
      status: "Active"
    };
    this.licenseService.purchaseLicense(licenseObject).subscribe((res: any) => {
      console.debug(res);
      this.dialogRef.close(res);
    });
  }

  ngOnDestroy(): void {
    this.currentCustomer = null;
  }

}
