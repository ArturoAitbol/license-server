import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AcceptDialogData } from 'src/app/model/accept-dialog.model';

@Component({
  selector: 'app-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.css']
})
export class AcceptComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: AcceptDialogData) { }

}
