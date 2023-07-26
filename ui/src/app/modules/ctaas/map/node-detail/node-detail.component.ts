import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { Constants } from 'src/app/helpers/constants';
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
  originatedPassedCallsCrossRegion: number;
  terminatedPassedCallsCrossRegion: number;
  originatedFailedCallsCrossRegion: number;
  terminatedFailedCallsCrossRegion: number;
  totalPassedCalls: number;
  totalFailedCalls: number;
  totalSameRegionCalls: number;
  originatedCrossRegionTotalCalls: number;
  terminatedCrossRegionTotalCalls: number;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NodeDetailComponent>,
    private subaccountService: SubAccountService) { }

  ngOnInit(): void {
    this.selectedSubaccount = this.subaccountService.getSelectedSubAccount();
    this.originatedPassedCallsCrossRegion = this.data.callsOriginated.passed - this.data.callsOriginated.callsPassedToSameRegion;
    this.terminatedPassedCallsCrossRegion = this.data.callsTerminated.passed - this.data.callsTerminated.callsPassedToSameRegion;
    this.originatedFailedCallsCrossRegion = this.data.callsOriginated.failed - this.data.callsOriginated.callsFailedToSameRegion;
    this.terminatedFailedCallsCrossRegion = this.data.callsTerminated.failed - this.data.callsTerminated.callsFailedToSameRegion;
    this.originatedCrossRegionTotalCalls = this.originatedPassedCallsCrossRegion + this.originatedFailedCallsCrossRegion;
    this.terminatedCrossRegionTotalCalls = this.terminatedPassedCallsCrossRegion + this.terminatedFailedCallsCrossRegion;
    this.totalFailedCalls = this.originatedFailedCallsCrossRegion + this.terminatedFailedCallsCrossRegion + this.data.callsOriginated.callsFailedToSameRegion;
    this.totalPassedCalls = this.originatedPassedCallsCrossRegion + this.terminatedPassedCallsCrossRegion + this.data.callsOriginated.callsPassedToSameRegion;
    this.totalSameRegionCalls = this.data.callsTerminated.callsPassedToSameRegion + this.data.callsTerminated.callsFailedToSameRegion;
  }

  onCancel(type?: string): void {
    this.dialogRef.close(type);
  }

  openNativeDashboardWithSelectedData(){
    const startDate = moment.utc(this.data.date).format("YYYY-MM-DD HH:mm:ss");
    const location = this.data.region.city + ", " + this.data.region.state + ", " + this.data.region.country;
    const url = `${environment.BASE_URL}/#${Constants.SPOTLIGHT_DASHBOARD_PATH}?subaccountId=${this.selectedSubaccount.id}&location=${location}&date=${startDate}`;
    window.open(url);
  }
}
