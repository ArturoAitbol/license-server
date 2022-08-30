import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-about-modal',
  templateUrl: './about-modal.component.html',
  styleUrls: ['./about-modal.component.css']
})
export class AboutModalComponent {

  constructor(public dialogRef: MatDialogRef<AboutModalComponent>,) { }


  /**
   * Close modal
   */

  onClose(): void {
    this.dialogRef.close();
  }
}
