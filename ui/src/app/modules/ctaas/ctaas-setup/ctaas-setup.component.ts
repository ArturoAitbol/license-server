import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators } from "@angular/forms";
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
import { forkJoin, Observable } from 'rxjs';
import { CtaasSupportEmailService } from 'src/app/services/ctaas-support-email.service';

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

  supportEmailsForm: any = this.fb.group({
    emails: this.fb.array([])
  });

  supportEmails: string[];

  constructor(
    private ctaasSetupService: CtaasSetupService,
    private fb: FormBuilder,
    private snackBarService: SnackBarService,
    private subaccountService: SubAccountService,
    private licenseService: LicenseService,
    private ctaasSupportEmailService: CtaasSupportEmailService,
    private dialogService: DialogService,
    private featureToggleService: FeatureToggleService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.fetchSetupInfo();
  }


  submit() {
    this.dialogService.confirmDialog({
      title: 'Confirm action',
      message: 'Are your sure you want to update the UCaaS Continuous Testing Setup Details?',
      confirmCaption: 'Update',
      cancelCaption: 'Cancel',
    }).subscribe((confirmed) => {
      if (confirmed) {
        if (this.setupForm.value.status != null && this.setupForm.value.status === 'SETUP_READY') {
          let selectedLicenseId;
          this.isDataLoading = true;
          this.licenseService.getLicenseList(this.subaccountDetails.id).subscribe(async (licenseList: any) => {
            const activeLicenses = licenseList.licenses.filter(license => license.status === 'Active');
  
            if (activeLicenses.length === 0) {
              this.snackBarService.openSnackBar("No active subscriptions found", "Error selecting a subscription");
              this.cancelEdit();
              this.isDataLoading = false;
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
    });
  }

  maintenanceToggle(action: string) {
    if (this.featureToggleService.isFeatureEnabled('maintenanceMode')) {
      if (action === 'enable') {
        this.dialogService.confirmDialog({
          title: 'Confirm Maintenance Mode',
          message: 'Enabling this mode triggers an email notification to the customer, and a corresponding alert will be displayed on both the dashboard and mobile app.',
          confirmCaption: 'Confirm',
          cancelCaption: 'Cancel',
        }).subscribe((confirmed) => {
          if (confirmed) {
            this.updateMaintenanceMode(true);
          }
        });
      } else if (action === 'disable'){
        this.dialogService.confirmDialog({
          title: 'Disable Maintenance Mode',
          message: 'Before you disable the maintenance mode, please make sure that everything is operational and running smoothly.',
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
        this.snackBarService.openSnackBar('UCaaS Continuous Testing Setup edited successfully!', '');
      } else {
        this.snackBarService.openSnackBar(res.error, 'Error updating UCaaS Continuous Testing Setup!');
      }
      this.fetchSetupInfo();
      this.isDataLoading = false;
    });
  }

  cancelEdit() {
    this.setupForm.patchValue(this.originalCtaasSetupDetails);
  }

  private fetchSetupInfo() {
    this.isDataLoading = true;
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountDetails.id).pipe(map(res => res.ctaasSetups.length > 0 ? res.ctaasSetups[0] : null)).subscribe(res => {
      if (res != null) {
        this.originalCtaasSetupDetails = res;
        this.setupForm.patchValue(res);
        this.ctaasSetupId = res.id;
        this.supportEmails = res.supportEmails;
        if (this.setupForm.value.status === 'SETUP_READY') this.setupForm.get('status').disable();
      } else {
        this.snackBarService.openSnackBar("No initial setup found", 'Error getting UCaaS Continuous Testing Setup!');
      }
      this.isDataLoading = false;
    })
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

  deleteExistingEmail(index: number) {
    this.dialogService.confirmDialog({
      title: 'Confirm action',
      message: 'Are your sure you want to delete the email '+this.supportEmails[index] + '?',
      confirmCaption: 'Delete email',
      cancelCaption: 'Cancel',
    }).subscribe((confirmed) => {
      if(confirmed){
        this.isDataLoading = true; 
        this.ctaasSupportEmailService.deleteSupportEmail(this.supportEmails[index]).subscribe((res: any) => {
          this.snackBarService.openSnackBar('Support email deleted');
          this.supportEmails.splice(index, 1)
          this.isDataLoading = false;
        }, err => {
          this.snackBarService.openSnackBar(err.error, 'Error while deleting support email!');
          console.error('Error while deleting support email', err);
          this.isDataLoading = false;
        });
      }
    });
  }

  addSupportEmails() {
    if (this.emailForms.length > 0) {
      this.isDataLoading = true;
      const requestsArray: Observable<any>[] = this.emailForms.value.map(value => this.ctaasSupportEmailService.createSupportEmail({
        supportEmail: value.email,
        ctaasSetupId: this.ctaasSetupId,
      }));
      forkJoin(requestsArray).subscribe((res: any) => {
        this.snackBarService.openSnackBar('Support emails added successfully!');
        this.clearNewSupportEmails();
        this.fetchSetupInfo();
        this.isDataLoading = false;
      }, err => {
        this.isDataLoading = false;
        this.snackBarService.openSnackBar(err.error, 'Error while adding support email!');
        console.error('error while adding support email', err);
      });
    }
  }

  get emailForms() {
    return this.supportEmailsForm.controls["emails"] as FormArray;
  }

  addEmailForm() {
    const emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.validateUniqueEmail.bind(this)]],
    });
    this.emailForms.push(emailForm);
  }

  deleteEmailForm(index: number) {
    this.emailForms.removeAt(index);
  }

  clearNewSupportEmails(){
    this.emailForms.clear();
  }

  validateUniqueEmail(control: AbstractControl) {
    const i = this.supportEmails.findIndex(email=>email===control.value);
    if(i!==-1)
      return { repeatedEmail: true };
    return null
  }
}
