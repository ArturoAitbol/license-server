import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
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
  originatedCrossRegion: any;
  terminatedCrossRegion: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NodeDetailComponent>,
    private subaccountService: SubAccountService) { }

  ngOnInit(): void {
    this.selectedSubaccount = this.subaccountService.getSelectedSubAccount();
    this.originatedCrossRegion = this.data.callsOriginated.total - this.data.callsOriginated.callsToSameRegion;
    this.terminatedCrossRegion = this.data.callsTerminated.total - this.data.callsTerminated.callsToSameRegion;
  }

  onCancel(type?: string): void {
    this.dialogRef.close(type);
  }

  openNaviteDashboardWithSelectedData(){
    const startDate = moment.utc(this.data.date).format("YYYY-MM-DD HH:mm:ss");
    const location = this.data.region.city + ", " + this.data.region.state + ", " + this.data.region.country;
    const url = `${environment.BASE_URL}/#/spotlight/spotlight-dashboard?subaccountId=${this.selectedSubaccount.id}&location=${location}&date=${startDate}`;
    window.open(url);
  }
}
