import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-customer-account-modal',
  templateUrl: './add-customer-account-modal.component.html',
  styleUrls: ['./add-customer-account-modal.component.css']
})
export class AddCustomerAccountModalComponent implements OnInit {
  addCustomerForm = this.formBuilder.group({
    customerName: ['', Validators.required],
    subAccountName: ['', Validators.required]
  });
  //  @Inject(MAT_DIALOG_DATA) public data: ModalData
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddCustomerAccountModalComponent>) { }

  ngOnInit() {
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  submit() {
    this.dialogRef.close();
    // TODO: Use EventEmitter with form value
    console.info(this.addCustomerForm.value);
  }


}
