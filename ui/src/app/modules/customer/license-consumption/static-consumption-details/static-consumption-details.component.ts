import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UsageDetailService } from "../../../../services/usage-detail.service";

@Component({
  selector: 'app-static-consumption-details-modal',
  templateUrl: './static-consumption-details.component.html',
  styleUrls: ['./static-consumption-details.component.css']
})
export class StaticConsumptionDetailsComponent implements OnInit {
  isDataLoading = false;
  isAutomationPlatform = false;
  usageDetailsList: string[];

  constructor(
      private usageDetailService: UsageDetailService,
      private snackBarService: SnackBarService,
      public dialogRef: MatDialogRef<StaticConsumptionDetailsComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    if (this.data) {
      this.isAutomationPlatform = this.data.usageType === "AutomationPlatform";
      this.isDataLoading = true;
      this.usageDetailService.getUsageDetailsByConsumptionId(this.data.id).subscribe((res: any) => {
        this.usageDetailsList = res.usageDays;
        this.isDataLoading = false
      })
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  deleteUsageDetail(index: number) {
    this.isDataLoading = true;
    this.usageDetailService.deleteUsageDetails(this.usageDetailsList[index]).subscribe((res: any) => {
      if (!res?.error) {
        this.snackBarService.openSnackBar('Usage deleted', '');
        this.usageDetailsList.splice(index, 1)
      } else
        this.snackBarService.openSnackBar(res.error, 'Error while deleting usage detail!');
      this.isDataLoading = false;
    }, err => {
      this.snackBarService.openSnackBar('Error deleting usage detail!');
      console.error('Error while deleting usage detail', err);
      this.isDataLoading = false;
    });
  }
}
