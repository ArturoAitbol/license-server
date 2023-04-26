import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { Constants } from 'src/app/helpers/constants';
import { Report } from 'src/app/helpers/report';
import { IStakeholder } from 'src/app/model/stakeholder.model';
import { CallbackService } from 'src/app/services/callback.service';
import { DialogService } from 'src/app/services/dialog.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StakeHolderService } from 'src/app/services/stake-holder.service';
import { SubAccountService } from 'src/app/services/sub-account.service';

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
    private subaccountService: SubAccountService,
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
    this.callbackService.createCallback(userData).subscribe((res:any) => {
      if(!res.error){
          this.snackBarService.openSnackBar('Call request has been made!', '');
          this.dialogService.acceptDialog({
              title: 'Done!',
              message: 'Thanks for your request, one of our Spotlight experts will reach out to you shortly.',
              confirmCaption: 'Ok',
          });
      } else {
          this.snackBarService.openSnackBar('Error requesting call!', '');
      }
    });
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
    let subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.stakeholderService.getStakeholderList(subaccountDetails.id).subscribe( res => {
      this.stakeholdersData = res.stakeHolders;
      this.stakeholdersData.shift();
    });
  }
}
