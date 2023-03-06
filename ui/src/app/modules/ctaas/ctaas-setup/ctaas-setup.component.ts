import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { CtaasSetupService } from "src/app/services/ctaas-setup.service";
import { SubAccountService } from "src/app/services/sub-account.service";
import { map } from "rxjs/operators";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { ICtaasSetup } from "src/app/model/ctaas-setup.model";
import { LicenseService } from "src/app/services/license.service";
import { MatDialog } from "@angular/material/dialog";
import { LicenseConfirmationModalComponent } from "./license-confirmation-modal/license-confirmation-modal.component";
import { DialogService } from "../../../services/dialog.service";
import { FeatureToggleService } from "../../../services/feature-toggle.service";

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
  private subaccountDetails: any;
  readonly statusOptions = {
    SETUP_READY: { label: 'READY' },
    SETUP_INPROGRESS: { label: 'IN PROGRESS' }
  };


  setupForm = this.fb.group({
    azureResourceGroup: [null, Validators.required],
    tapUrl: [null, Validators.required],
    status: ['SETUP_INPROGRESS', Validators.required],
    onBoardingComplete: [{ value: false, disabled: true }, Validators.required],
    maintenance: [{ value:false, disabled: true }, Validators.required]
  });

  constructor(
    private ctaasSetupService: CtaasSetupService,
    private fb: FormBuilder,
    private snackBarService: SnackBarService,
    private subaccountService: SubAccountService,
    private licenseService: LicenseService,
    private dialogService: DialogService,
    private featureToggleService: FeatureToggleService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.fetchSetupInfo();
    this.disableForm();
  }

  editForm() {
    this.setupForm.enable();
    this.setupForm.get('onBoardingComplete').disable();
    this.setupForm.get('maintenance').disable();
    if (this.setupForm.value.status === 'SETUP_READY') this.setupForm.get('status').disable();
    this.isEditing = true;
  }

  submit() {
    if (this.isEditing) {
      if (this.setupForm.value.status != null && this.setupForm.value.status === 'SETUP_READY') {
        let selectedLicenseId;
        this.isDataLoading = true;
        this.licenseService.getLicenseList(this.subaccountDetails.id).subscribe(async (licenseList: any) => {
          const activeLicenses = licenseList.licenses.filter(license => license.status === 'Active');

          if (activeLicenses.length === 0) {
            this.snackBarService.openSnackBar("No active subscriptions found", "Error selecting a subscription");
            return;
          }
          if (activeLicenses.length === 1) {
            selectedLicenseId = activeLicenses[0].id;
          } else {
            selectedLicenseId = await this.openDialog(activeLicenses)
          }
          const ctaasSetup = this.generateUpdateBody(selectedLicenseId);
          this.editSetup(ctaasSetup);
        });
      } else {
        const ctaasSetup = this.generateUpdateBody();
        this.editSetup(ctaasSetup);
      }
    }
  }

  maintenanceToggle(action: string) {
    if (this.featureToggleService.isFeatureEnabled('maintenanceMode')) {
      if (action === 'enable') {
        this.dialogService.confirmDialog({
          title: 'Confirm Maintenance Mode',
          message: 'If you enable this mode, some of the features in the implementation won\'t be available, are you sure you want to continue?',
          confirmCaption: 'Confirm',
          cancelCaption: 'Cancel',
        }).subscribe((confirmed) => {
          if (confirmed) {
            this.updateMaintenanceMode(true);
          }
        });
      } else if (action === 'disable'){
        this.dialogService.confirmDialog({
          title: 'Confirm Maintenance Mode',
          message: 'Are you sure you want to disable the maintenance mode?',
          confirmCaption: 'Confirm',
          cancelCaption: 'Cancel',
        }).subscribe((confirmed) => {
          if (confirmed) {
            this.updateMaintenanceMode(false);
          }
        });
      }
    }
  }

  private updateMaintenanceMode(maintenance: boolean) {
    this.isDataLoading = true;
    this.ctaasSetupService.updateCtaasSetupDetailsById(this.ctaasSetupId, {
      subaccountId: this.originalCtaasSetupDetails.subaccountId,
      maintenance: maintenance
    }).subscribe((res: any) => {
      if (!res?.error) {
        this.snackBarService.openSnackBar(maintenance ? 'Maintenance mode enabled successfully' : 'Maintenance mode disabled successfully', '');
        this.originalCtaasSetupDetails = { ...this.originalCtaasSetupDetails, maintenance: maintenance };
      } else {
        this.snackBarService.openSnackBar(res.error, maintenance ? 'Error while enabling maintenance mode' : 'Error while disabling maintenance mode');
      }
      this.fetchSetupInfo();
      this.isDataLoading = false;
    });
  }

  private editSetup(ctaasSetup: any) {
    this.isDataLoading = true;
    this.ctaasSetupService.updateCtaasSetupDetailsById(this.ctaasSetupId, ctaasSetup).subscribe((res: any) => {
      if (!res?.error) {
        this.snackBarService.openSnackBar('Spotlight Setup edited successfully!', '');
        this.isEditing = false;
      } else {
        this.snackBarService.openSnackBar(res.error, 'Error updating Spotlight Setup!');
      }
      this.disableForm();
      this.fetchSetupInfo();
      this.isDataLoading = false;
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.disableForm();
    this.setupForm.patchValue(this.originalCtaasSetupDetails);
  }

  private fetchSetupInfo() {
    this.isDataLoading = true;
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountDetails.id).pipe(map(res => res.ctaasSetups.length > 0 ? res.ctaasSetups[0] : null)).subscribe(res => {
      if (res != null) {
        this.originalCtaasSetupDetails = res;
        this.setupForm.patchValue(res);
        this.ctaasSetupId = res.id;
      } else {
        this.snackBarService.openSnackBar("No initial setup found", 'Error getting Spotlight Setup!');
      }
      this.isDataLoading = false;
    })
  }

  private disableForm() {
    this.setupForm.disable();
  }

  private generateUpdateBody(licenseId?: string) {
    const ctaasSetup = { ...this.setupForm.value };
    if (ctaasSetup.status === this.originalCtaasSetupDetails.status) delete ctaasSetup.status;
    ctaasSetup.subaccountId =  this.subaccountDetails.id;
    if (licenseId != null) ctaasSetup.licenseId = licenseId;
    return ctaasSetup;
  }

  // opens a popup when update is clicked
  openDialog(activeLicenses) {
    return this.dialog.open(LicenseConfirmationModalComponent, {
      width: 'auto',
      data: activeLicenses,
      disableClose: true
    }).afterClosed().toPromise();
  }

}
