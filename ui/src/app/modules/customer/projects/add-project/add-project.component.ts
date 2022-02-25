import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit {
  statusTypes: string[] = [
    'Open',
    'Close'
  ];

  addProjectForm = this.formBuilder.group({
    name: ['', Validators.required],
    number: ['', Validators.required],
    openDate: ['', Validators.required],
    closeDate: ['', Validators.required],
    status: ['', Validators.required]
  });
  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    public dialogRef: MatDialogRef<AddProjectComponent>
  ) {

  }

  ngOnInit() {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  submit() {
    const newProjectDetails = { ... this.addProjectForm.value };
    newProjectDetails.subaccountId = this.projectService.getSelectedSubAccount();
    this.projectService.createProject(newProjectDetails).subscribe((res: any) => {
      this.dialogRef.close(res);
    });
  }

}
