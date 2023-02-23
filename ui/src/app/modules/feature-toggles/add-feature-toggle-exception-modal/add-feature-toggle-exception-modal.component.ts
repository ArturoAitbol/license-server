import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FeatureToggle } from "../../../model/feature-toggle.model";
import { CustomerService } from "../../../services/customer.service";
import { SubAccountService } from "../../../services/sub-account.service";
import { forkJoin } from "rxjs";
import { FeatureToggleMgmtService } from "../../../services/feature-toggle-mgmt.service";
import { SnackBarService } from "../../../services/snack-bar.service";

@Component({
  selector: 'app-add-feature-toggle-exception-modal',
  templateUrl: './add-feature-toggle-exception-modal.component.html',
  styleUrls: ['./add-feature-toggle-exception-modal.component.css']
})
export class AddFeatureToggleExceptionModalComponent implements OnInit {

  addFeatureToggleExceptionForm = this.fb.group({
    subaccount: ['', Validators.required],
    status: [false, Validators.required],
  });
  isDataLoading = true;

  subaccounts = [];
  constructor(private fb: FormBuilder,
              private customerService: CustomerService,
              private subAccountService: SubAccountService,
              private featureToggleService: FeatureToggleMgmtService,
              private snackBarService: SnackBarService,
              public dialogRef: MatDialogRef<AddFeatureToggleExceptionModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {featureToggle: FeatureToggle}) { }

  ngOnInit(): void {
    this.fetchSubaccounts();
  }

  submit() {
    const formValue = this.addFeatureToggleExceptionForm.value;
    const exception = { featureToggleId : this.data.featureToggle.id, subaccountId: formValue.subaccount, status: formValue.status };
    this.featureToggleService.createException(exception).subscribe((res: any) => {
      if (!res?.error) {
        this.snackBarService.openSnackBar('Feature toggle exception created', '');
        this.dialogRef.close();
      } else {
        this.snackBarService.openSnackBar(res.error, 'Error while creating feature toggle exception!');
        this.dialogRef.close();
      }
    }, error => {
      console.error('Error while creating feature toggle: ',error);
      this.snackBarService.openSnackBar('Error while creating feature toggle exception!');
      this.dialogRef.close();
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  private fetchSubaccounts() {
    const dataSubscriptions = [this.subAccountService.getSubAccountList(), this.customerService.getCustomerList()];
    forkJoin(dataSubscriptions).subscribe((res: any) => {
      res = res.reduce((current, next) => {
        return { ...current, ...next };
      }, {});
      console.log(res)
      res.customers.forEach(customer => {
        res.subaccounts.forEach(subaccount => {
          if (subaccount.customerId === customer.id) {
            subaccount.customerName = customer.name;
          }
        });
      });
      this.subaccounts = res.subaccounts;
      this.isDataLoading = false;
      console.log(this.subaccounts)
    });
  }

}
