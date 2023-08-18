import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Observable } from "rxjs";
import { SubaccountAdminEmailService } from 'src/app/services/subaccount-admin-email.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-subaccount-admin-emails-modal',
  templateUrl: './subaccount-admin-emails.component.html',
  styleUrls: ['./subaccount-admin-emails.component.css']
})
export class SubaccountAdminEmailsComponent implements OnInit {

  adminEmailsForm: any = this.formBuilder.group({
    subaccountName: ['', Validators.required],
    emails: this.formBuilder.array([])
  });

  private previousFormValue: any;
  isDataLoading = false;
  adminEmails: string[];

  constructor(
      private formBuilder: FormBuilder,
      private subaccountAdminEmailService: SubaccountAdminEmailService,
      private subaccountService: SubAccountService,
      private snackBarService: SnackBarService,
      public dialogRef: MatDialogRef<SubaccountAdminEmailsComponent>,
      private dialogService: DialogService,
      @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.adminEmailsForm.controls.subaccountName.disable();
    if (this.data) {
      this.isDataLoading = true;
      this.adminEmailsForm.patchValue(this.data);
      this.previousFormValue = {...this.adminEmailsForm};
      this.subaccountService.getSubAccountDetails(this.data.subaccountId).subscribe((res: any) => {
        this.adminEmails = res.subaccounts[0]?.subaccountAdminEmails;
        this.isDataLoading = false
      });
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
        subaccountId: this.data.subaccountId,
      }));
      forkJoin(requestsArray).subscribe((res: any) => {
        const responseErrors = res.filter(response => response !== null);
        if (responseErrors.length === 0) {
          this.isDataLoading = false;
          this.snackBarService.openSnackBar('Subaccount admin emails edited successfully! ', '');
          this.dialogRef.close(true);
        } else {
          responseErrors.forEach((response) => {
            this.snackBarService.openSnackBar(response.error, 'Error while editing administrator emails!');
          });
        }
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
    this.dialogService.confirmDialog({
      title: 'Confirm action',
      message: 'Are your sure you want to delete '+this.adminEmails[index] + '?',
      confirmCaption: 'Delete account',
      cancelCaption: 'Cancel',
    }).subscribe((confirmed) => {
      if(confirmed){
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
      } else {
        this.isDataLoading = false;
      }
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
