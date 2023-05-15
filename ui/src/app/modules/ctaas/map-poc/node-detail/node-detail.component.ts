import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-node-detail',
  templateUrl: './node-detail.component.html',
  styleUrls: ['./node-detail.component.css']
})
export class NodeDetailComponent implements OnInit {
  originatedCalls: any[] = [];
  terminatedCalls: any[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NodeDetailComponent>) { }

  ngOnInit(): void {
    console.log(this.data)
  }

  onCancel(type?: string): void {
    this.dialogRef.close(type);
  }
}
