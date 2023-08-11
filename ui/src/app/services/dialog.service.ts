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

interface DialogData {
  title: string;
  summary: string;
  sections: {
    name?: string;
    elements: {
      subtitle: string;
      descriptions: string[];
      description?: string;
    }[];
  }[];
}
@Injectable({
  providedIn: 'root'
})
export class DialogService {

  private _showHelpButton: boolean = false;

  dialogData: DialogData = {
    title: "",
    summary: "",
    sections: [],
  };

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

  clearDialogData(){
    const dialogData: DialogData = {
      title: "",
      summary: "",
      sections: [],
    };
    this.dialogData = this.transformToDialogData(dialogData);
  }
  updateDialogData(data: DialogData): void {
    this.dialogData = data;
  }

  public transformToDialogData(data: any): DialogData {
    const transformedSections = data.sections.map((section: any) => {
      const transformedElements = section.elements.map((element: any) => {
        return {
          subtitle: element.subtitle || '',
          descriptions: element.descriptions || [],
          description: element.description || '',
        };
      });
        return {
        name: section.name,
        elements: transformedElements,
      };
    });
      return {
      title: data.title || '',
      summary: data.summary || '',
      sections: transformedSections,
    };
  }

  get showHelpButton(): boolean {
    return this._showHelpButton;
  }

  set showHelpButton(value: boolean) {
    this._showHelpButton = value;
  }
}
