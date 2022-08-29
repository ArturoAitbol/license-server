import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { License } from 'src/app/model/license.model';
import { LicenseService } from 'src/app/services/license.service';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit {
  isDataLoading = false;
  readonly OPEN_STATUS = 'Open';
  licenses: License[] = [];

  addProjectForm = this.formBuilder.group({
    projectName: ['', Validators.required],
    projectNumber: ['', Validators.required],
    licenseId: ['', Validators.required],
    openDate: ['', Validators.required],
  });
  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private liceseService: LicenseService,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<AddProjectComponent>
  ) {

  }

  ngOnInit(): void {
    this.isDataLoading = true;
    this.liceseService.getLicenseList(this.projectService.getSelectedSubAccount()).subscribe((res: any) => {
      if (!res.error && res.licenses.length > 0)
        this.licenses = res.licenses;
      this.isDataLoading = false;
    }, err => {
      this.snackBarService.openSnackBar(err.error, 'Error requesting subscriptions!');
      console.error('error fetching subscriptions', err);
      this.isDataLoading = false;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  submit() {
    const newProjectDetails = { ... this.addProjectForm.value, status: this.OPEN_STATUS };
    newProjectDetails.subaccountId = this.projectService.getSelectedSubAccount();
    this.isDataLoading = true;
    this.projectService.createProject(newProjectDetails).subscribe((res: any) => {
      if (res && !res.error) {
        this.snackBarService.openSnackBar('Project added successfully!', '');
        this.dialogRef.close(res);
      } else
        this.snackBarService.openSnackBar(res.error, 'Error adding project!');
      this.isDataLoading = false;
    }, err => {
      this.snackBarService.openSnackBar(err.error, 'Error adding project!');
      console.error('error adding a new project', err);
      this.isDataLoading = false;
    });
  }

}
