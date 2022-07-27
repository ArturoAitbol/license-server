import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogData } from 'src/app/model/confirm-dialog.model';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { }


}
