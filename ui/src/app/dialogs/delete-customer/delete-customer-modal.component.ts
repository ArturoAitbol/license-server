import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeleteCustomerDialogData } from "../../model/delete-customer-dialog.model";

@Component({
  selector: 'app-confirm',
  templateUrl: './delete-customer-modal.component.html',
  styleUrls: ['./delete-customer-modal.component.css']
})
export class DeleteCustomerModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeleteCustomerDialogData
  ) { }



}
