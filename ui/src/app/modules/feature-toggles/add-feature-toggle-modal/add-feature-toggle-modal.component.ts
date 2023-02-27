import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { FeatureToggleService } from "../../../services/feature-toggle.service";
import { FeatureToggle } from "../../../model/feature-toggle.model";
import { SnackBarService } from "../../../services/snack-bar.service";
import { FeatureToggleMgmtService } from "../../../services/feature-toggle-mgmt.service";

@Component({
  selector: 'app-add-feature-toggle-modal',
  templateUrl: './add-feature-toggle-modal.component.html',
  styleUrls: ['./add-feature-toggle-modal.component.css']
})
export class AddFeatureToggleModalComponent {

  addFeatureToggleForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    status: [false, Validators.required],
  });

  constructor(private fb: FormBuilder,
              private featureToggleService: FeatureToggleMgmtService,
              private snackBarService: SnackBarService,
              public dialogRef: MatDialogRef<AddFeatureToggleModalComponent>) { }

  submit() {
    const formValue = this.addFeatureToggleForm.value;
    const featureToggle: FeatureToggle = {name: formValue.name, description: formValue.description, status: formValue.status};
    this.featureToggleService.createFeatureToggle(featureToggle).subscribe((res: any) => {
      if (!res?.error) {
        this.snackBarService.openSnackBar('Feature toggle created', '');
        this.dialogRef.close();
      } else {
        this.snackBarService.openSnackBar(res.error, 'Error while creating feature toggle!');
        this.dialogRef.close();
      }
    }, error => {
      console.error('Error while creating feature toggle: ',error);
      this.snackBarService.openSnackBar('Error while creating feature toggle!');
      this.dialogRef.close();
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

}
