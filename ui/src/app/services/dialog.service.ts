import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { ConfirmDialogData } from '../model/confirm-dialog.model';
import { DeleteCustomerDialogData } from "../model/delete-customer-dialog.model";
import { DeleteCustomerModalComponent } from "../dialogs/delete-customer/delete-customer-modal.component";
import { AcceptComponent } from '../dialogs/accept/accept.component';
import { OptionalComponent } from '../dialogs/optional/optional.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  confirmDialog(data: ConfirmDialogData,width?:string): Observable<boolean> {
    return this.dialog
      .open(ConfirmComponent, {
        data,
        width: width || '400px',
        disableClose: true,
      })
      .afterClosed();
  }

  deleteCustomerDialog(data: DeleteCustomerDialogData): Observable<{confirm, deleteAllData}> {
      return  this.dialog.open(DeleteCustomerModalComponent, {
          data,
          width: '450px',
          disableClose: true,
      }).afterClosed();
  }

  acceptDialog(data: any): Observable<boolean>{
    return this.dialog.open(AcceptComponent, {
      data,
      width: '450px',
      disableClose: true,
    }).afterClosed();
  }

  optionalDialog(data: any): Observable<{confirm, download}>{
    return this.dialog.open(OptionalComponent, {
      data,
      width: '450px',
      disableClose: true,
    }).afterClosed();
  }
}
