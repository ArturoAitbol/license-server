import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { CustomerService } from 'src/app/services/customer.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { LicenseService } from 'src/app/services/license.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { BundleService } from 'src/app/services/bundle.service';

@Component({
  selector: 'app-modify-customer-account',
  templateUrl: './modify-customer-account.component.html',
  styleUrls: ['./modify-customer-account.component.css']
})
export class ModifyCustomerAccountComponent implements OnInit {
  packageTypes: any[];
  selectedType: any;
  updateCustomerForm: any = this.formBuilder.group({
    customerName: ['', Validators.required],
    subaccountName: ['', Validators.required],
    customerType: ['', Validators.required],
    startDate: ['', Validators.required],
    packageType: ['', Validators.required],
    tokensPurchased: ['', Validators.required],
    deviceLimit: ['', Validators.required],
    renewalDate: ['', Validators.required]
  });
  private previousFormValue: any;
  // flag
  isDataLoading: boolean = false;
  //  @Inject(MAT_DIALOG_DATA) public data: ModalData
  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private subAccountService: SubAccountService,
    private licenseService: LicenseService,
    private bundleService: BundleService,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<ModifyCustomerAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data) {
      this.isDataLoading = true;
      this.selectedType = this.data.packageType;
      this.updateCustomerForm.patchValue(this.data);
      this.previousFormValue = { ...this.updateCustomerForm };
      this.bundleService.getBundleList().subscribe((res: any) => {
        if (res) this.packageTypes = res.bundles;
        this.onChangeType(this.data.packageType);
        this.isDataLoading = false;
      });
    }
  }
  /**
   * to cancel the opened dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  onChangeType(newType: any){
    this.selectedType = this.packageTypes.find(item => item.name == newType)
    if (this.selectedType) {
      this.updateCustomerForm.patchValue({
        tokensPurchased: this.selectedType.tokens,
        deviceLimit: this.selectedType.deviceAccessTokens,
      });
      if (newType == "Custom" || newType == "AddOn") {
        this.updateCustomerForm.get('tokensPurchased').enable();
        this.updateCustomerForm.get('deviceLimit').enable();
      } else {
        this.updateCustomerForm.patchValue({
          tokensPurchased: this.selectedType.tokens,
          deviceLimit: this.selectedType.deviceAccessTokens,
        });
        this.updateCustomerForm.get('tokensPurchased').disable();
        this.updateCustomerForm.get('deviceLimit').disable();
      }
    }
  }

  /**
   * to submit the form
   */
  submit() {
    this.isDataLoading = true;
    const mergedLicenseObject = { ...this.data, ...this.updateCustomerForm.value };
    console.log('mergedLicenseObject', mergedLicenseObject);
    const customer = {
      id: mergedLicenseObject.customerId,
      name: mergedLicenseObject.customerName,
      customerType: mergedLicenseObject.customerType
    };
    const subAccount = {
      id: mergedLicenseObject.subaccountId,
      name: mergedLicenseObject.subaccountName
    };
    const requestsArray= [
      this.customerService.updateCustomer(customer),
      this.subAccountService.updateSubAccount(subAccount)
    ];
    if (mergedLicenseObject.id) {
      mergedLicenseObject.tokens = mergedLicenseObject.tokensPurchased;
      mergedLicenseObject.deviceAccessLimit = mergedLicenseObject.deviceLimit;
      requestsArray.push(this.licenseService.updateLicenseDetails(mergedLicenseObject));
    }
    forkJoin(requestsArray).subscribe((res: any) => {
      if (!res.error) {
        this.isDataLoading = false;
        this.snackBarService.openSnackBar('Customer and subaccount added successfully!', '');
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
