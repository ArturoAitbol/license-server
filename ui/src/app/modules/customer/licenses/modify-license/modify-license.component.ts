import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LicenseService } from 'src/app/services/license.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { BundleService } from 'src/app/services/bundle.service';
import { renewalDateValidator } from "src/app/helpers/renewal-date.validator";
import { ConsoleLogger } from '@angular/compiler-cli/private/localize';

@Component({
    selector: 'app-modify-license',
    templateUrl: './modify-license.component.html',
    styleUrls: ['./modify-license.component.css']
})
export class ModifyLicenseComponent implements OnInit {
    subscriptionTypes: any[];
    selectedType: any;
    updateCustomerForm: FormGroup = this.formBuilder.group({
        startDate: ['', Validators.required],
        description: ['', Validators.required],
        subscriptionType: ['', Validators.required],
        tokensPurchased: ['', Validators.required],
        deviceLimit: ['', Validators.required],
        renewalDate: ['', Validators.required]
    }, { validators: renewalDateValidator });
    private previousFormValue: any;
    // flag
    isDataLoading = false;
    //  @Inject(MAT_DIALOG_DATA) public data: ModalData
    renewalDateMin: Date = null;
    startDateMax: Date = null;
    constructor(
        private formBuilder: FormBuilder,
        private licenseService: LicenseService,
        private bundleService: BundleService,
        private snackBarService: SnackBarService,
        public dialogRef: MatDialogRef<ModifyLicenseComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        if (this.data) {
            this.isDataLoading = true;
            this.data.startDate = new Date (this.data.startDate + " 00:00:00");
            this.data.renewalDate = new Date (this.data.renewalDate + " 00:00:00");
            this.onStartDateChange(this.data.startDate);
            this.onRenewalDateChange(this.data.renewalDate);
            this.updateCustomerForm.patchValue(this.data);
            this.bundleService.getBundleList().subscribe((res: any) => {
                if (res) this.subscriptionTypes = res.bundles;
                this.onChangeType(this.data.subscriptionType);
                this.previousFormValue = { ...this.updateCustomerForm.getRawValue() };
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

    onChangeType(bundleName: string) {
        this.selectedType = this.subscriptionTypes.find(item => item.bundleName === bundleName)
        if (this.selectedType) {
            if (this.selectedType.bundleName !== "Custom") {
                this.updateCustomerForm.patchValue({
                    tokensPurchased: this.selectedType.defaultTokens,
                    deviceLimit: this.selectedType.defaultDeviceAccessTokens,
                });
            }
            if (this.selectedType.bundleName == "Custom" || this.selectedType.bundleName == "AddOn") {
                this.updateCustomerForm.get('tokensPurchased').enable();
                this.updateCustomerForm.get('deviceLimit').enable();
            } else {
                this.updateCustomerForm.get('tokensPurchased').disable();
                this.updateCustomerForm.get('deviceLimit').disable();
            }
            console.log("tokensPurchased", this.updateCustomerForm.get('tokensPurchased').value);
            console.log("deviceLimit", this.updateCustomerForm.get('deviceLimit').value);
        }
    }

    /**
     * to submit the form
     */
    submit() {
        this.isDataLoading = true;
        const mergedLicenseObject = { ... this.data, ...this.updateCustomerForm.value };
        const currentDate = new Date(); 
        currentDate.setHours(0,0,0,0);
        const newDate = new Date(mergedLicenseObject.renewalDate);
        mergedLicenseObject.status = newDate >= currentDate ? 'Active' : 'Expired';
        mergedLicenseObject.tokensPurchased = this.updateCustomerForm.get("tokensPurchased").value;
        mergedLicenseObject.deviceLimit = this.updateCustomerForm.get("deviceLimit").value;
        this.licenseService.updateLicenseDetails(mergedLicenseObject).subscribe((res: any) => {
            if (res && res.error)
                this.snackBarService.openSnackBar(res.error, 'Error updating subscription!');
            else {
                this.dialogRef.close(true);
                this.snackBarService.openSnackBar('Subscription edited successfully!', '');
            }
            this.isDataLoading = false;
        }, err => {
            this.isDataLoading = false;
            this.dialogRef.close(false);
            console.error('error while updating subscription information row', err);
        });
    }
    /**
     * to check whether sumbit button can be disabled or not
     * @returns: true if the not updated and false otherwise 
     */
    disableSumbitBtn(): boolean {
        return JSON.stringify(this.updateCustomerForm.getRawValue()) === JSON.stringify(this.previousFormValue);
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
}