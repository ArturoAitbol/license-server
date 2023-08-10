import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  keysExceptTitle: string[];
  constructor(public dialogService: DialogService, public dialogRef: MatDialogRef<DialogComponent> ) { 
    this.keysExceptTitle = Object.keys(this.dialogService.dialogData).filter( key => key !== 'title' && key !== 'summary');
  }

  ngOnInit(): void {
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }
}
