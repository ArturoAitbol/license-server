import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MsalService } from '@azure/msal-angular';
import { ViewProfileComponent } from 'src/app/generics/view-profile/view-profile.component';
import { Constants } from 'src/app/helpers/constants';
import { CallbackService } from 'src/app/services/callback.service';
import { DialogService } from 'src/app/services/dialog.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StakeHolderService } from 'src/app/services/stake-holder.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  stakeholdersListFlag: boolean = false;
  checked: boolean;
  option: string;
  checkBoxFlag: boolean = false;
  selectedStakeholder: any;
  stakeholdersCount = 0;
  stakeholdersData: any = [];
  stakeholdersDataBk: any = [];

  stakeholderForm = this.fb.group({
    stakeholderControl: [''],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private callbackService: CallbackService,
    private snackBarService: SnackBarService,
    private dialogService: DialogService,
    public dialog: MatDialog,
    private msalService: MsalService,
    private stakeholderService: StakeHolderService,
    private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.fecthStakeholders();
  }

  makeCallback(){
    if(this.option == 'myself')
      this.callbackFunction(this.data);
    else
      this.callbackFunction(this.selectedStakeholder);
  }


  callbackFunction(userData:any){
    if(userData.name && userData.jobTitle && userData.companyName && userData.phoneNumber){
      this.callbackService.createCallback(userData).subscribe((res:any) => {
        if(!res.error){
            this.snackBarService.openSnackBar('Call request has been made!', '');
            this.dialogService.acceptDialog({
                title: 'Done!',
                message: 'Thanks for your request, one of our UCaaS Continuous Testing experts will reach out to you shortly.',
                confirmCaption: 'Ok',
            });
        } else {
            this.snackBarService.openSnackBar('Error requesting call!', '');
        }
      });
    } else {
      this.openDialogForSpecificRole(userData)
    }
  }

  openDialogForSpecificRole(data: any) {
    const userRoles = this.getAccountRoles();
    if(this.option === 'myself' || userRoles.includes(Constants.SUBACCOUNT_ADMIN)) {
        this.dialog.open(ViewProfileComponent, {
        width: '450px',
        disableClose: true,
        data: {...data, missing:true}
      });
    } else {
      this.dialogService.acceptDialog({
        title: 'Incomplete personal information',
        message: 'Please contact your Subaccount Administrator or TekVizion to fill this user’s info.',
        confirmCaption: 'Ok',
      });
    }
  }

  private getAccountRoles(): any {
    return this.msalService.instance.getActiveAccount().idTokenClaims.roles;
  }

  radioChange(option: string) {
    if(option === 'stakeholders') {
      this.checked = false;
      this.stakeholdersListFlag = true;
      this.option = option;
    }
    else if (option === 'myself') {
      this.option = option;
      this.checked = true;
      this.stakeholdersListFlag = false
    }
  }

  onSelectedStakeholder(stakeholder:any){
    this.checkBoxFlag = true;
    this.selectedStakeholder = stakeholder;
  }
  
  fecthStakeholders() {
    this.stakeholderService.getStakeholderList(this.data.subaccountId).subscribe( res => {
      this.stakeholdersData = res.stakeHolders.filter(stakeholder => stakeholder.email !== this.data.email);
    });
  }
}
