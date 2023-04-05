import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MsalService } from '@azure/msal-angular';
import { Constants } from 'src/app/helpers/constants';
import { CallbackService } from 'src/app/services/callback.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {
  
  isDataLoading = false;
  missingUserProfileData: boolean = false;
  modalContent: any;
  @ViewChild('modalContent') modalCont ;
  
  callbackForm = this.fb.group({
    userNameControl: ['', Validators.required],
    userPhoneControl: ['', Validators.required],
    companyNameControl: ['', Validators.required],
    emailControl: ['', Validators.required],
    jobTitleControl: ['', Validators.required],
  });

  constructor(private fb: FormBuilder,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<CallbackComponent>,
    private callbackService: CallbackService,
    private msalService: MsalService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    const accountDetails = this.getAccountRoles();
    if(accountDetails.includes(Constants.SUBACCOUNT_STAKEHOLDER)) {
      if(!this.data.name || !this.data.companyName || !this.data.phoneNumber || !this.data.jobTitle) {
        this.missingUserProfileData =  true;
      }
    }
  }

  callbackFunction() {
      this.callbackService.createCallback(this.data).subscribe( (res:any) => {
        if(!res.error){
          this.snackBarService.openSnackBar('Callback has been made!', '');
          this.isDataLoading = false;
          this.dialogRef.close(res);
          this.dialogRef.afterClosed().subscribe(res => {
              this.openCustomDialog();
            });
        } else {
          this.snackBarService.openSnackBar('Error making callback!', '');
          this.isDataLoading = false;
        }
      });
  }

  onClose(): void {
    this.dialogRef.close('Cancel')
  }

  dialogClose() {
    this.dialog.closeAll();
  }

  openCustomDialog() {
    this.dialog.open(this.modalCont, {
      width: '450px',
    })
  }

  private getAccountRoles(): any {
    return this.msalService.instance.getActiveAccount().idTokenClaims.roles;
  }
}
