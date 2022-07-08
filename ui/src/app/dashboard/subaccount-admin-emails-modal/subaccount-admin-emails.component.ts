import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Observable } from "rxjs";
import { SubaccountAdminEmailService } from "../../services/subaccount-admin-email.service";

@Component({
  selector: 'app-subaccount-admin-emails-modal',
  templateUrl: './subaccount-admin-emails.component.html',
  styleUrls: ['./subaccount-admin-emails.component.css']
})
export class SubaccountAdminEmailsComponent implements OnInit {

  adminEmailsForm: any = this.formBuilder.group({
    name: ['', Validators.required],
    emails: this.formBuilder.array([])
  });

  private previousFormValue: any;
  isDataLoading: boolean = false;
  adminEmails: string[];

  constructor(
      private formBuilder: FormBuilder,
      private subaccountAdminEmailService: SubaccountAdminEmailService,
      private subAccountService: SubAccountService,
      private snackBarService: SnackBarService,
      public dialogRef: MatDialogRef<SubaccountAdminEmailsComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.adminEmailsForm.controls.name.disable();
    if (this.data) {
      this.isDataLoading = true;
      this.adminEmailsForm.patchValue(this.data);
      this.previousFormValue = {...this.adminEmailsForm};
      this.subAccountService.getSubAccountDetails(this.data.id).subscribe((res: any) => {
        this.adminEmails = res.subaccounts[0]?.subaccountAdminEmails;
        this.isDataLoading = false
      })
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  submit() {
    this.isDataLoading = true;
    if (this.emailForms.length > 0) {
      const requestsArray: Observable<any>[] = this.emailForms.value.map(value => this.subaccountAdminEmailService.createAdminEmail({
        subaccountAdminEmail: value.email,
        subaccountId: this.data.id,
      }))
      forkJoin(requestsArray).subscribe((res: any) => {
        if (!res.error) {
          this.isDataLoading = false;
          this.snackBarService.openSnackBar('Customer admin emails edited successfully!', '');
          this.dialogRef.close(true);
        } else
          this.snackBarService.openSnackBar(res.error, 'Error while editing administrator emails!');
      }, err => {
        this.isDataLoading = false;
        this.dialogRef.close(false);
        console.error('error while editing administrator emails', err);
      });
    } else {
      this.isDataLoading = false;
      this.dialogRef.close(true);
    }
  }

  deleteExistingEmail(index: number) {
    this.isDataLoading = true;
    this.subaccountAdminEmailService.deleteAdminEmail(this.adminEmails[index]).subscribe((res: any) => {
      if (!res?.error) {
        this.snackBarService.openSnackBar('Subaccount administrator email deleted', '');
        this.adminEmails.splice(index, 1)
      } else
        this.snackBarService.openSnackBar(res.error, 'Error while deleting administrator email!');
      this.isDataLoading = false;
    }, err => {
      this.snackBarService.openSnackBar('Error deleting administrator email!');
      console.error('Error while deleting administrator email', err);
      this.isDataLoading = false;
    });
  }

  get emailForms() {
    return this.adminEmailsForm.controls["emails"] as FormArray;
  }

  addEmailForm() {
    const emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.emailForms.push(emailForm);
  }

  deleteEmailForm(lessonIndex: number) {
    this.emailForms.removeAt(lessonIndex);
  }
}
