import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Constants } from 'src/app/helpers/constants';
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
    const toLocation = this.data.to.city + ", " + this.data.to.state + ", " + this.data.to.country;
    const url = `${environment.BASE_URL}/#/spotlight/${Constants.SPOTLIGHT_DASHBOARD_PATH}?subaccountId=${this.selectedSubaccount.id}&location=${location}&toLocation=${toLocation}&date=${startDate}`;
    window.open(url);
  }
}
