import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { CtaasSetupService } from "../../../services/ctaas-setup.service";
import { SubAccountService } from "../../../services/sub-account.service";
import { map } from "rxjs/operators";
import { SnackBarService } from "../../../services/snack-bar.service";
import { ICtaasSetup } from "../../../model/ctaas-setup.model";
import { LicenseService } from "../../../services/license.service";
import { MatDialog } from "@angular/material/dialog";
import { SubaccountAdminEmailsComponent } from "../../../dashboard/subaccount-admin-emails-modal/subaccount-admin-emails.component";
import { LicenseConfirmationModalComponent } from "./license-confirmation-modal/license-confirmation-modal.component";

@Component({
  selector: 'app-ctaas-setup',
  templateUrl: './ctaas-setup.component.html',
  styleUrls: ['./ctaas-setup.component.css']
})
export class CtaasSetupComponent implements OnInit {

  ctaasSetupId: string;
  originalCtaasSetupDetails: ICtaasSetup;
  isDataLoading = false;
  isEditing = false;

  readonly statusOptions = {
    SETUP_READY: { label: 'READY'},
    SETUP_INPROGRESS: { label: 'IN PROGRESS'}
  };


  setupForm = this.fb.group({
    azureResourceGroup: [null, Validators.required],
    tapUrl: [null, Validators.required],
    status: ['SETUP_INPROGRESS', Validators.required],
    onBoardingComplete: [{ value: false, disabled: true }, Validators.required],
    powerbiWorkspaceId: [null],
    powerbiReportId: [null],
  });

  constructor(
      private ctaasSetupService: CtaasSetupService,
      private fb: FormBuilder,
      private snackBarService: SnackBarService,
      private subaccountService: SubAccountService,
      private licenseService: LicenseService,
      public dialog: MatDialog) { }

  ngOnInit(): void {
    this.fetchSetupInfo();
    this.disableForm();
  }

  editForm() {
    this.setupForm.enable();
    this.setupForm.get('onBoardingComplete').disable();
    if (this.setupForm.value.status ===  'SETUP_READY') this.setupForm.get('status').disable();
    this.isEditing = true;
  }

  submit() {
    if (this.isEditing) {
      if (this.setupForm.value.status != null) {
        let selectedLicenseId;
        this.isDataLoading = true;
        this.licenseService.getLicenseList(this.subaccountService.getSelectedSubAccount().id).subscribe(async (licenseList: any) => {
          this.isDataLoading = false;
          const activeLicenses = licenseList.licenses.filter(license => license.status === 'Active');
          if (activeLicenses.length === 0) {
            this.snackBarService.openSnackBar("No active licenses found", "Error selecting a license");
          }
          if (activeLicenses.length === 1) {
            selectedLicenseId = activeLicenses[0].id;
          } else {
            selectedLicenseId = await this.dialog.open(LicenseConfirmationModalComponent, {
              width: 'auto',
              data: activeLicenses,
              disableClose: true
            }).afterClosed().toPromise();
          }
          const ctaasSetup = this.generateUpdateBody(selectedLicenseId);
          this.ctaasSetupService.updateCtaasSetupDetailsById(this.ctaasSetupId, ctaasSetup).subscribe((res: any) => {
            if (!res?.error) {
              this.snackBarService.openSnackBar('Ctaas Setup edited successfully!', '');
              this.isEditing = false;
              this.originalCtaasSetupDetails = { ...this.originalCtaasSetupDetails, ...this.setupForm.value };
              this.disableForm();
            } else {
              this.snackBarService.openSnackBar(res.error, 'Error updating Ctaas Setup!');
            }
          });
        });
      } else {
        const ctaasSetup = this.generateUpdateBody();
        this.ctaasSetupService.updateCtaasSetupDetailsById(this.ctaasSetupId, ctaasSetup).subscribe((res: any) => {
          if (!res?.error) {
            this.snackBarService.openSnackBar('Ctaas Setup edited successfully!', '');
            this.isEditing = false;
            this.originalCtaasSetupDetails = { ...this.originalCtaasSetupDetails, ...this.setupForm.value };
            this.disableForm();
          } else {
            this.snackBarService.openSnackBar(res.error, 'Error updating Ctaas Setup!');
          }
        });
      }
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.disableForm();
    this.setupForm.patchValue(this.originalCtaasSetupDetails);
  }

  private fetchSetupInfo() {
    this.isDataLoading = true;
    const currentSubaccountDetails = this.subaccountService.getSelectedSubAccount();
    const { id } = currentSubaccountDetails;
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(id).pipe(map(res => res.ctaasSetups[0])).subscribe(res => {
      this.originalCtaasSetupDetails = res;
      res.onBoardingComplete = res.onBoardingComplete === 't';
      this.setupForm.patchValue(res);
      this.ctaasSetupId = res.id;
      this.isDataLoading = false;
    })
  }

  private disableForm() {
    this.setupForm.disable();
  }

  private generateUpdateBody(licenseId?: string) {
    const ctaasSetup = { ...this.setupForm.value };
    if (ctaasSetup.status === this.originalCtaasSetupDetails.status) delete ctaasSetup.status;
    ctaasSetup.subaccountId = this.subaccountService.getSelectedSubAccount().id;
    if (licenseId != null) ctaasSetup.licenseId = licenseId;
    return ctaasSetup;
  }

}
