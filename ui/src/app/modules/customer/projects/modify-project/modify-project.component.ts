import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { License } from 'src/app/model/license.model';
import { LicenseService } from 'src/app/services/license.service';
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
  licenses: License[] = [];
  minDate: Date;
  maxDate: Date;
  minCloseDate: Date;
  maxCloseDate: Date;
  today: Date;
  
  updateProjectForm = this.formBuilder.group({
    projectName: ['', Validators.required],
    projectNumber: ['', Validators.required],
    licenseId: ['', Validators.required],
    openDate: ['', Validators.required],
    closeDate: ['', Validators.required],
    status: ['', Validators.required]
  });

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private liceseService: LicenseService,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<ModifyProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data) {
      this.isDataLoading = true;
      this.updateProjectForm.patchValue(this.data);
      this.previousFormValue = { ...this.updateProjectForm };
      if(this.data.status === 'Open')
        this.updateProjectForm.get('closeDate').disable();
      this.liceseService.getLicenseList(this.projectService.getSelectedSubAccount()).subscribe((res: any) => {
        if (!res.error && res.licenses.length > 0){
          this.licenses = res.licenses;
          let license = this.licenses.find(license => license.id === this.data.licenseId);
          this.today = new Date();
          this.today.setHours(0,0,0);
          this.setDateLimits(license,this.data.openDate); 
        }
        this.isDataLoading = false;
      }, err => {
        this.snackBarService.openSnackBar(err.error, 'Error requesting subscriptions!');
        console.error('error fetching subscriptions', err);
        this.isDataLoading = false;
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  submit() {
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
    const mergedProjectDetails: any = { id: this.data.id }
    for (const key in this.updateProjectForm.controls) {
      if (this.updateProjectForm.controls.hasOwnProperty(key)) {
        const fieldValue = this.updateProjectForm.get(key).value;
        const oldValue = this.previousFormValue.value[key];
        /* if value has changed */
        if (fieldValue != oldValue)
          mergedProjectDetails[key] = fieldValue;
      }
    }
    return mergedProjectDetails;
  }

  onChangingStatus(status: string){
    if(status === 'Open'){
      this.updateProjectForm.get('closeDate').disable();
    }else{
      this.updateProjectForm.get('closeDate').enable();
    } 
  }

  onChangingStartDate(value) : void{
    this.minCloseDate = new Date(value);
  }

  onLicenseChange(licenseId:String) :void {
    let selectedLicense = this.licenses.find(license => license.id === licenseId);
    if(selectedLicense!==null){
      this.updateProjectForm.get('openDate').setValue('');
      this.updateProjectForm.get('closeDate').setValue('');
      this.setDateLimits(selectedLicense);
    }
  }

  private setDateLimits(license: License, startDate?:String) :void {
    this.minDate = new Date(license.startDate + " 00:00:00");
    this.maxDate = new Date(license.renewalDate + " 00:00:00");
    this.minCloseDate = startDate ? new Date(startDate + " 00:00:00") : this.minDate;
    this.maxCloseDate = this.maxDate > this.today ? this.maxDate : this.today;
  }

}
