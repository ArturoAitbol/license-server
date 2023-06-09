import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { License } from 'src/app/model/license.model';
import { CustomerService } from 'src/app/services/customer.service';
import { LicenseService } from 'src/app/services/license.service';
import { BundleService } from 'src/app/services/bundle.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { renewalDateValidator } from "src/app/helpers/renewal-date.validator";
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-add-license',
  templateUrl: './add-license.component.html',
  styleUrls: ['./add-license.component.css']
})
export class AddLicenseComponent implements OnInit, OnDestroy {
  types: any[] = [];
  selectedType: any;
  private currentCustomer: any;
  private customerSubaccountDetails;
  addLicenseForm = this.formBuilder.group({
    startDate: ['', Validators.required],
    description: ['', Validators.required],
    subscriptionType: ['', Validators.required],
    tokensPurchased: ['', Validators.required],
    deviceLimit: ['', Validators.required],
    renewalDate: ['', Validators.required]
  }, { validators: renewalDateValidator });
  isDataLoading = false;
  startDateMax: Date = null;
  renewalDateMin: Date = null;
  constructor(
    private formBuilder: FormBuilder,
    private customerSerivce: CustomerService,
    private licenseService: LicenseService,
    private bundleService: BundleService,
    private snackBarService: SnackBarService,
    private subaccountService: SubAccountService,
    public dialogRef: MatDialogRef<AddLicenseComponent>
  ) { }

  ngOnInit() {
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();
    this.customerSubaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.isDataLoading = true;
    this.bundleService.getBundleList().subscribe((res: any) => {
      if (res) this.types = res.bundles;
      this.isDataLoading = false;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  /**
   * add license
   */
  submit() {
    this.isDataLoading = true;
    const licenseObject: License | any = {
      subaccountId: this.customerSubaccountDetails.id,
      startDate: this.addLicenseForm.value.startDate,
      description: this.addLicenseForm.value.description,
      subscriptionType: this.addLicenseForm.value.subscriptionType,
      tokensPurchased: this.addLicenseForm.get("tokensPurchased").value,
      deviceLimit: this.addLicenseForm.get("deviceLimit").value,
      renewalDate: this.addLicenseForm.value.renewalDate
    };
    this.licenseService.createLicense(licenseObject).subscribe((res: any) => {
      if (!res.error) {
        this.snackBarService.openSnackBar('Subscription added successfully!', '');
        this.isDataLoading = false;
        this.dialogRef.close(res);
      } else {
        this.snackBarService.openSnackBar(res.error, 'Error adding subscription!');
        this.isDataLoading = false;
      }
    });
  }

  onChangeType(bundleName: string) {
    if (bundleName) {
      this.selectedType = this.types.find((item) => item.bundleName === bundleName);
      this.addLicenseForm.patchValue({
        tokensPurchased: this.selectedType.defaultTokens,
        deviceLimit: this.selectedType.defaultDeviceAccessTokens,
      });
      if (this.selectedType.bundleName == "Custom" || this.selectedType.bundleName == "AddOn") {
        this.addLicenseForm.get('tokensPurchased').enable();
        this.addLicenseForm.get('deviceLimit').enable();
      } else {
        this.addLicenseForm.get('tokensPurchased').disable();
        this.addLicenseForm.get('deviceLimit').disable();
      }
    }
  }

  onStartDateChange(value) {
    const minDate = new Date(value);
    minDate.setDate(minDate.getDate() + 1);
    this.renewalDateMin = minDate;
  }

  onRenewalDateChange(value) {
    const maxDate = new Date(value);
    maxDate.setDate(maxDate.getDate() - 1);
    this.startDateMax = maxDate;
  }

  ngOnDestroy(): void {
    this.currentCustomer = null;
  }

}
