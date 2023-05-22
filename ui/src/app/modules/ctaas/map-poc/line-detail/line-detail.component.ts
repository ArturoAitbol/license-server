import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-line-detail',
  templateUrl: './line-detail.component.html',
  styleUrls: ['./line-detail.component.css']
})
export class LineDetailComponent implements OnInit {

  selectedSubaccount: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LineDetailComponent>,
    private subaccountService: SubAccountService) { }

  ngOnInit(): void {
    this.selectedSubaccount = this.subaccountService.getSelectedSubAccount();
  }

  onCancel(type?: string): void {
    this.dialogRef.close(type);
  }

  openNaviteDashboardWithSelectedData(){
    const startDate = this.data.date;
    const location = this.data.from.city + ", " + this.data.from.state + ", " + this.data.from.country;
    const url = `${environment.BASE_URL}/#/spotlight/spotlight-dashboard?subaccountId=${this.selectedSubaccount.id}&location=${location}&date=${startDate}`;
    window.open(url);
  }
}
