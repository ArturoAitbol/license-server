import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { License } from 'src/app/model/license.model';
import { CustomerService } from 'src/app/services/customer.service';
import { LicenseService } from 'src/app/services/license.service';
import { BundleService } from 'src/app/services/bundle.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { renewalDateValidator } from "src/app/helpers/renewal-date.validator";

@Component({
  selector: 'app-add-license',
  templateUrl: './add-license.component.html',
  styleUrls: ['./add-license.component.css']
})
export class AddLicenseComponent implements OnInit, OnDestroy {
  types: any[] = [];
  selectedType: string;
  private currentCustomer: any;
  addLicenseForm = this.formBuilder.group({
    startDate: ['', Validators.required],
    packageType: ['', Validators.required],
    tokensPurchased: ['', Validators.required],
    deviceLimit: ['', Validators.required],
    renewalDate: ['', Validators.required]
  }, { validators: renewalDateValidator });
  startDateMax: Date = null;
  renewalDateMin: Date = null;
  constructor(
    private formBuilder: FormBuilder,
    private customerSerivce: CustomerService,
    private licenseService: LicenseService,
    private bundleService: BundleService,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<AddLicenseComponent>
  ) { }

  ngOnInit() {
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();
    this.bundleService.getBundleList().subscribe((res: any) => {
      if (res) this.types = res.bundles;
    });
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
      startDate: this.addLicenseForm.value.startDate,
      packageType: this.selectedType,
      tokensPurchased: this.addLicenseForm.get("tokensPurchased").value,
      deviceLimit: this.addLicenseForm.get("deviceLimit").value,
      renewalDate: this.addLicenseForm.value.renewalDate
    };
    this.licenseService.purchaseLicense(licenseObject).subscribe((res: any) => {
      if (!res.error) {
        this.snackBarService.openSnackBar('Package added successfully!', '');
        this.dialogRef.close(res);
      } else
        this.snackBarService.openSnackBar(res.error, 'Error adding package!');
    });
  }

  onChangeType(item: any) {
    if (item) {
      this.selectedType = item.name;
      this.addLicenseForm.patchValue({
        tokensPurchased: item.tokens,
        deviceLimit: item.deviceAccessTokens,
      });
      if (item.name == "Custom" || item.name == "AddOn") {
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
