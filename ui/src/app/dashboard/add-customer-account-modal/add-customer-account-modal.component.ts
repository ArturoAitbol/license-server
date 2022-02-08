import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-customer-account-modal',
  templateUrl: './add-customer-account-modal.component.html',
  styleUrls: ['./add-customer-account-modal.component.css']
})
export class AddCustomerAccountModalComponent implements OnInit {
  //  @Inject(MAT_DIALOG_DATA) public data: ModalData
  constructor(
    public dialogRef: MatDialogRef<AddCustomerAccountModalComponent>) { }

  ngOnInit() {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
