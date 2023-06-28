import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-node-detail',
  templateUrl: './node-detail.component.html',
  styleUrls: ['./node-detail.component.css']
})
export class NodeDetailComponent implements OnInit {
  originatedCalls: any[] = [];
  terminatedCalls: any[] = [];
  selectedSubaccount: any;
  parsedPolqaData: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NodeDetailComponent>,
    private subaccountService: SubAccountService) { }

  ngOnInit(): void {
    this.selectedSubaccount = this.subaccountService.getSelectedSubAccount();
  }

  onCancel(type?: string): void {
    this.dialogRef.close(type);
  }

  openNaviteDashboardWithSelectedData(){
    const startDate = this.data.date.format("YYYY-MM-DD HH:mm:ss");
    const location = this.data.region.city + ", " + this.data.region.state + ", " + this.data.region.country;
    const url = `${environment.BASE_URL}/#/spotlight/spotlight-dashboard?subaccountId=${this.selectedSubaccount.id}&location=${location}&date=${startDate}`;
    window.open(url);
  }
}
