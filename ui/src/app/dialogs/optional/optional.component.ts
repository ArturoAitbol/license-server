import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogData } from 'src/app/model/confirm-dialog.model';

@Component({
  selector: 'app-optional',
  templateUrl: './optional.component.html',
  styleUrls: ['./optional.component.css']
})
export class OptionalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { }
}
