import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { CustomerService } from 'src/app/services/customer.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CustomerAdminEmailService } from "../../../services/customer-admin-email.service";
import { Observable } from "rxjs";
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-admin-emails-modal',
  templateUrl: './admin-emails.component.html',
  styleUrls: ['./admin-emails.component.css']
})
export class AdminEmailsComponent implements OnInit {

  adminEmailsForm: any = this.formBuilder.group({
    name: ['', Validators.required],
    emails: this.formBuilder.array([])
  });

  private previousFormValue: any;
  isDataLoading = false;
  adminEmails: string[];

  constructor(
      private formBuilder: FormBuilder,
      private customerService: CustomerService,
      private customerAdminEmailService: CustomerAdminEmailService,
      private snackBarService: SnackBarService,
      public dialogRef: MatDialogRef<AdminEmailsComponent>,
      private dialogService: DialogService,
      @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.adminEmailsForm.controls.name.disable();
    if (this.data) {
      this.isDataLoading = true;
      this.adminEmailsForm.patchValue(this.data);
      this.previousFormValue = {...this.adminEmailsForm};
      this.customerService.getCustomerById(this.data.id).subscribe(res => {
        this.adminEmails = res.customers[0]?.adminEmails;
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
      const requestsArray: Observable<any>[] = this.emailForms.value.map(value => this.customerAdminEmailService.createAdminEmail({
        customerAdminEmail: value.email,
        customerId: this.data.id
      }))
      forkJoin(requestsArray).subscribe((res: any) => {
          this.isDataLoading = false;
          this.snackBarService.openSnackBar('Customer admin emails edited successfully! ', '');
          this.dialogRef.close(false);
      }, err => {
        this.isDataLoading = false;
        this.dialogRef.close(false);
        console.error('error while editing administrator emails', err);
      });
    } else {
      this.isDataLoading = false;
      this.dialogRef.close();
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
      if(confirmed) {
        this.customerAdminEmailService.deleteAdminEmail(this.adminEmails[index]).subscribe((res: any) => {
          if (!res?.error) {
            this.snackBarService.openSnackBar('Customer administrator email deleted', '');
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
