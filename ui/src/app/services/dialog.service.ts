import { Injectable, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { ConfirmDialogData } from '../model/confirm-dialog.model';
import { DeleteCustomerDialogData } from "../model/delete-customer-dialog.model";
import { DeleteCustomerModalComponent } from "../dialogs/delete-customer/delete-customer-modal.component";
import { AcceptComponent } from '../dialogs/accept/accept.component';
import { OptionalComponent } from '../dialogs/optional/optional.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  private dialogDataSubject = new BehaviorSubject<{ 
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
  }>({ 
    title: '', 
    description: '' ,
    subtitle_1: '',
    description_1: ' ',
    subtitle_2: '',
    description_2: ' ',
    subtitle_3: '',
    description_3: ' ',
    subtitle_4: '',
    description_4: ' ',
    subtitle_5: '',
    description_5: ' ',
    });
  dialogData$ = this.dialogDataSubject.asObservable();
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

  updateDialogData(title: string, description: string, 
    subtitle_1: string, description_1:string,
    subtitle_2: string, description_2:string,
    subtitle_3: string, description_3:string,
    subtitle_4: string, description_4:string,
    subtitle_5: string, description_5:string
    ): void {
    this.dialogDataSubject.next({ title, description, 
      subtitle_1, description_1, 
      subtitle_2, description_2, 
      subtitle_3, description_3, 
      subtitle_4, description_4, 
      subtitle_5, description_5
    });
  }
}
