import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent {
  isDataLoading = false;
  readonly OPEN_STATUS = 'Open';

  addProjectForm = this.formBuilder.group({
    projectName: ['', Validators.required],
    projectNumber: ['', Validators.required],
    openDate: ['', Validators.required],
  });
  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<AddProjectComponent>
  ) {

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
