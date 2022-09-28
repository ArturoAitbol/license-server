import { Component, Inject } from '@angular/core';
import { LicenseService } from "../../../../services/license.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: 'app-license-confirmation-modal',
  templateUrl: './license-confirmation-modal.component.html',
  styleUrls: ['./license-confirmation-modal.component.css']
})
export class LicenseConfirmationModalComponent {

  form = this.fb.group({
    license: [null, Validators.required],
  });

  constructor(
      private licenseService: LicenseService,
      private fb: FormBuilder,
      public dialogRef: MatDialogRef<LicenseConfirmationModalComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancel(): void {
    this.dialogRef.close();
  }

  submit() {
    this.dialogRef.close(this.form.get('license').value);
  }

}
