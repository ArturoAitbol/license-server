import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FeatureToggle } from "../../../model/feature-toggle.model";
import { CustomerService } from "../../../services/customer.service";
import { SubAccountService } from "../../../services/sub-account.service";
import { forkJoin, Observable } from "rxjs";
import { FeatureToggleMgmtService } from "../../../services/feature-toggle-mgmt.service";
import { SnackBarService } from "../../../services/snack-bar.service";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: 'app-add-feature-toggle-exception-modal',
  templateUrl: './add-feature-toggle-exception-modal.component.html',
  styleUrls: ['./add-feature-toggle-exception-modal.component.css']
})
export class AddFeatureToggleExceptionModalComponent implements OnInit {

  addFeatureToggleExceptionForm = this.fb.group({
    subaccount: ['', this.requireMatch],
    status: [false, Validators.required],
  });
  isDataLoading = true;

  subaccounts = [];
  filteredSubaccounts: Observable<any[]>;
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
    const exception = { featureToggleId : this.data.featureToggle.id, subaccountId: formValue.subaccount.id, status: formValue.status };
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

  displayFnProject(subaccount: any): string {
    return subaccount && subaccount.name ? subaccount.name : '';
  }

  private filterSubaccounts(value: string, support = false): any[] {
    const filterValue = value.toLowerCase();
    if (!support) {
      return this.subaccounts.filter(option => option.name.toLowerCase().includes(filterValue));
    } else {
      return this.subaccounts.filter(option => option.name.toLowerCase().includes(filterValue));
    }
  }

  private requireMatch(control: AbstractControl) {
    const selection: any = control.value;
    if (typeof selection === 'string') {
      return { incorrect: true };
    }
    return null;
  }

  private fetchSubaccounts() {
    const dataSubscriptions = [this.subAccountService.getSubAccountList(), this.customerService.getCustomerList()];
    this.subaccounts = [];
    forkJoin(dataSubscriptions).subscribe((res: any) => {
      res = res.reduce((current, next) => {
        return { ...current, ...next };
      }, {});
      console.log(res.customers)
      res.customers.forEach(customer => {
        res.subaccounts.forEach(subaccount => {
          if (subaccount.customerId === customer.id) {
            subaccount.name = customer.name + ' - ' + subaccount.name;
            this.subaccounts.push(subaccount);
          }
        });
      });
      this.filteredSubaccounts = this.addFeatureToggleExceptionForm.controls['subaccount'].valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value.name)),
          map(subaccountName => (subaccountName ? this.filterSubaccounts(subaccountName) : this.subaccounts.slice())),
      );
      this.isDataLoading = false;
    });
  }

}
