import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  constructor(
  public dialogRef: MatDialogRef<DialogComponent>,@Inject(MAT_DIALOG_DATA) 
  public data: { 
    title: string; 
    description: string; 
    subtitle_1: string;
    description_1: string;
    subtitle_2: string;
    description_2: string;
    subtitle_3: string;
    description_3: string;
    subtitle_4: string;
    description_4: string;
    subtitle_5: string;
    description_5: string;
  }) { }

  ngOnInit(): void {
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }
}
