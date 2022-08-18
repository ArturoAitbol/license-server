import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-add-project',
  templateUrl: './modify-project.component.html',
  styleUrls: ['./modify-project.component.css']
})
export class ModifyProjectComponent implements OnInit {

  statusTypes: string[] = [
    'Open',
    'Closed'
  ];
  isDataLoading = false;
  private previousFormValue: any;
  
  updateProjectForm = this.formBuilder.group({
    projectName: ['', Validators.required],
    projectNumber: ['', Validators.required],
    openDate: ['', Validators.required],
    closeDate: ['', Validators.required],
    status: ['', Validators.required]
  });

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<ModifyProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data) {
      console.log("This.data: " + JSON.stringify(this.data))
      this.isDataLoading = true;
      this.updateProjectForm.patchValue(this.data);
      this.previousFormValue = { ...this.updateProjectForm };
      this.isDataLoading = false;
      if(this.data.status === 'Open')
        this.updateProjectForm.get('closeDate').disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  submit() {
    console.log("Submit called")
    this.isDataLoading = true;
    this.updateProjectForm.enable();
    this.projectService.updateProject(this.preparePayload()).subscribe((res: any) => {
      if (!res?.error) {
        this.snackBarService.openSnackBar('Project edited successfully!', '');
        this.dialogRef.close(true);
      } else {
        this.snackBarService.openSnackBar(res.error, 'Error updating project!');
        this.dialogRef.close(false);
      }
      this.isDataLoading = false;
    });
  }

  preparePayload(): any {
    let mergedProjectDetails: any = { id: this.data.id }
    for (let key in this.updateProjectForm.controls) {
      if (this.updateProjectForm.controls.hasOwnProperty(key)) {
        const fieldValue = this.updateProjectForm.get(key).value;
        const oldValue = this.previousFormValue.value[key];
        /* if value has changed */
        if (fieldValue != oldValue)
          mergedProjectDetails[key] = fieldValue;
      }
    };
    return mergedProjectDetails;
  }

  onChanginStatus(status: string){
    if(status === 'Open'){
      this.updateProjectForm.patchValue({closeDate : ''});
      this.updateProjectForm.get('closeDate').disable();
    }else{
      this.updateProjectForm.get('closeDate').enable();
    } 
  }

}
